#!/usr/bin/env python3
"""
FINAL DAIICT Complaint Classifier — Optimized for Gemini-2.5-Flash

Key Behaviors:
- ICC overrides (harassment / assault / ragging / sexual / human safety)
- Animal / wildlife threats ALWAYS → Admin
- Hostel vs Mess disambiguation (corridor/wing → Hostel; food/hygiene → Mess)
- Staff-behavior routed to staff’s committee
- LLM used only when confidence ≥ 0.95
- If no committee fits → Admin
"""

import os, re, json, argparse, sys
from datetime import datetime
from collections import Counter
from dotenv import load_dotenv
load_dotenv()

# ---------------- Committees & rules ----------------
CATEGORY_RULES = {
    "Hostel Management": [
        "hostel","block","wing","corridor","room","dorm","bathroom","washroom",
        "geyser","water","leak","plumbing","toilet","flush","sink","drain",
        "clean","cleaning","garbage","trash","bin","dustbin","janitor",
        "bed","door","window","fan","light","electric","electrical","washing machine",
        "warden","hostel staff","a-wing","b-wing","c-wing","d-wing","e-wing","f-wing",
        "g-wing","h-wing","i-wing","j-wing","k-wing","l-wing","m-wing","n-wing",
        "p-wing","r-wing"
    ],

    "Cafeteria Management": [
        "mess","canteen","food","meal","dining","kitchen","stale",
        "worms","cockroach","insect","taste","rotten","vendor","owner",
        "staff","mess staff","billing","table","stall",
        "honeyone","padma kamal","pkc","ashapura","shinestar","non-veg"
    ],

    "Tech-Support": [
        "projector","wifi","internet","portal","login","password","printer",
        "server","software","computer","lab pc","audio","speaker","microphone",
        "screen","smartboard","network","it","technical","app","website","lt-2","lt-1",
        "lt-3"
    ],

    "Sports": [
        "ground","gym","stadium","cricket","badminton","basketball","football",
        "tennis","court","field","equipment","coach","concours","tournament",
        "practice","table tennis","volleyball" 
    ],

    "Academic": [
        "exam","assignment","marks","grade","timetable","syllabus","lecture",
        "professor","faculty","class","lab","tutorial","result"
    ],

    "Internal Complaints": [
        "harassment","ragging","bullying","assault","discrimination",
        "abuse","threat","sexual","molest","rape","stalking","violence",
        "inappropriate","misconduct","forced","humiliate","molested","offensive"
    ],

    "Annual Fest": [
        "synapse","i.fest","ifest","festival","annual","event","volunteer",
        "sponsor","show","stage"
    ],

    "Cultural": [
        "Cultural","cultural","dance","music","drama","arts","performance","navratri","tarang",
        "loud","celebration","function","program","event"
    ],

    "Student Placement": [
        "placement","internship","company","drive","resume","interview","offer",
        "placement cell","career","drive"
    ],

    "Admin": [
        "admin","general","other","misc","parking","streetlight","construction",
        "noise","library","cooler","water cooler","monkey","dog","stray","animal",
        "snake","wildlife","attack","security","threat","police",
        "robbery","steal","theft"
    ]
}

# Priority rules
PRIORITY_RULES = {
    "High": [
        "water","electrocute","fire","gas","medical","harassment","assault",
        "ragging","emergency","injury","poison","contaminated","unsafe",
        "sexual","rape","stab","weapon","collapse"
    ],

    "Medium": [
        "wifi","printer","projector","assignment","grade","portal","login",
        "maintenance","repair","cleaning","lighting","air conditioning"
    ],

    "Low": ["event","cultural","sports","suggestion","query","feedback"]
}

SPAM_PHRASES = [
    "test complaint","sample complaint","dummy complaint",
    "ignore this","testing only","lorem ipsum"
]

def _norm(s: str) -> str:
    return re.sub(r"\s+"," ",(s or "").strip().lower())

def _contains_word(text: str, word: str) -> bool:
    return re.search(r"\b"+re.escape(word.lower())+r"\b", text) is not None

def _tokenize(text: str):
    return re.findall(r"\b[a-zA-Z0-9']{2,}\b", _norm(text))

def _match_scores(text: str, rules: dict) -> dict:
    scores = {}
    for key, keywords in rules.items():
        count = sum(1 for kw in keywords if _contains_word(text, kw))
        if count > 0:
            scores[key] = count
    return scores

# Safety / ICC override
def _is_internal_complaint(text: str) -> bool:
    for kw in CATEGORY_RULES["Internal Complaints"]:
        if _contains_word(text, kw):
            return True
    return False

# Spam detection
def _detect_spam(title: str, body: str) -> str | None:
    text = _norm(title + " " + body)
    # Strong spam phrases are rejected outright
    if any(p in text for p in SPAM_PHRASES):
        return "sample"

    # Extremely short complaints are not rejected, but routed to Admin (fallback)
    if len(_tokenize(text)) < 3:
        return "short"

    return None

# Mess disambiguation
def _disambiguate_mess(title: str, body: str) -> str | None:
    text = _norm(title + " " + body)

    if "mess" not in text and "canteen" not in text:
        return None

    # If human-safety → ICC
    if _is_internal_complaint(text):
        return "Internal Complaints"

    # Animal / wildlife or security issues in the mess/canteen should escalate to Admin
    ADMIN_WORDS = [
        "monkey","monkeys","dog","dogs","stray","animal","animals",
        "attack","attacking","menace","biting","aggressive","security",
        "unsafe","threat","police","robbery","steal","theft","fire","gas",
        "medical","injury","accident"
    ]
    if any(_contains_word(text, w) for w in ADMIN_WORDS):
        return "Admin"

    # Staff behavior → Cafeteria
    staff_words = ["owner","vendor","cook","mess staff"]
    if any(_contains_word(text, w) for w in staff_words):
        return "Cafeteria Management"

    # Food issues → Cafeteria
    food_ind = ["food","worms","insect","cockroach","stale","rotten","taste"]
    if any(_contains_word(text, w) for w in food_ind):
        return "Cafeteria Management"

    # Hostel-area "mess" (garbage/corridor) → Hostel
    hostel_ind = ["corridor","wing","trash","garbage","bin","passage","staircase"]
    if any(_contains_word(text, w) for w in hostel_ind):
        return "Hostel Management"

    # Default mess → Cafeteria
    return "Cafeteria Management"

# ---------------- LLM Setup ----------------
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI

class LLMOut(BaseModel):
    valid: bool
    committee: str | None
    priority: str | None
    reason: str | None
    confidence: float | None

parser = JsonOutputParser(pydantic_object=LLMOut)

API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL","gemini-2.5-flash")

llm = ChatGoogleGenerativeAI(
    model=MODEL_NAME,
    temperature=0.12,
    google_api_key=API_KEY
)

SYSTEM_PROMPT = (
    "You are DAIICT's complaint routing assistant. "
    "Return ONLY JSON: {\"valid\":bool,\"committee\":string|null,"
    "\"priority\":\"High|Medium|Low\"|null,\"reason\":string|null,"
    "\"confidence\":float|null}. "
    "Choose EXACTLY one committee. If unsure, set valid=false. "
    "Confidence must be 0.0–1.0. Return no extra text."
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("user",
     "Complaint Title: {title}\n"
     "Complaint Body: {body}\n"
     "Return JSON only. {format}")
]).partial(format=parser.get_format_instructions())

chain = prompt | llm | parser

# ---------------- Committee decision rules ----------------
def _rule_committee(title: str, body: str) -> str:
    text = _norm(title + " " + body)

    # 1. ICC override
    if _is_internal_complaint(text):
        return "Internal Complaints"

    # 2. Animal / Wildlife override → ADMIN
    ANIMAL_WORDS = [
        "monkey","monkeys","dog","dogs","stray","animal","animals",
        "snake","snakes","wildlife","aggressive","attack","attacking",
        "biting","menace","harming","threat","creature"
    ]
    if any(_contains_word(text, w) for w in ANIMAL_WORDS):
        return "Admin"

    # 3. Mess disambiguation
    mess = _disambiguate_mess(title, body)
    if mess:
        return mess

    # 4. Rule-based scoring
    scores = _match_scores(text, CATEGORY_RULES)
    # If no scoring matches, fallback to Admin (strict fallback)
    if not scores:
        return "Admin"

    # If scores exist, determine if the top score is decisive. If ambiguous or weak, route to Admin.
    sorted_scores = sorted(scores.items(), key=lambda t: (t[1], len(CATEGORY_RULES.get(t[0], []))), reverse=True)
    top_key, top_count = sorted_scores[0]
    second_count = sorted_scores[1][1] if len(sorted_scores) > 1 else 0

    # Ambiguity rules:
    # - If top_count is 1 (very weak signal) -> Admin
    # - If top and second are tied -> Admin
    if top_count < 2 or top_count == second_count:
        return "Admin"

    # Otherwise choose best-scoring committee
    return top_key

def _rule_priority(title: str, body: str) -> str:
    text = _norm(title + " " + body)
    for level in ("High","Medium","Low"):
        if any(_contains_word(text, w) for w in PRIORITY_RULES[level]):
            return level
    return "Medium"

# ---------------- Ensemble Logic ----------------
def _ensemble(title: str, body: str, llm_out: dict):
    text = _norm(title + " " + body)

    # ICC always wins
    if _is_internal_complaint(text):
        return "Internal Complaints","High"

    # LLM override only when VERY confident
    llm_conf = float(llm_out.get("confidence") or 0.0)
    llm_comm = llm_out.get("committee")
    llm_prio = llm_out.get("priority")

    # Raise override threshold to 0.98 to avoid erroneous LLM overrides
    if llm_comm and llm_conf >= 0.98 and llm_comm in CATEGORY_RULES:
        return llm_comm, llm_prio or "Medium"

    # Otherwise deterministic rules
    committee = _rule_committee(title, body)
    priority = _rule_priority(title, body)
    return committee, priority

# ---------------- Main ----------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--title", required=True)
    ap.add_argument("--body", default="")
    args = ap.parse_args()

    spam = _detect_spam(args.title, args.body)
    # Reject explicit sample/test spam
    if spam == 'sample':
        print(json.dumps({"status":"invalid","message":"Test/sample complaint detected."},ensure_ascii=False))
        return

    # If too short, we do not reject — route to Admin (safer fallback)
    if spam == 'short':
        committee, priority = 'Admin', 'Medium'
        out = {"status":"valid","committee":committee,"priority":priority}
        print(json.dumps(out, ensure_ascii=False))
        os.makedirs("out",exist_ok=True)
        path = f"out/complaint_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(path,"w",encoding="utf-8") as f:
            json.dump(out,f,indent=2,ensure_ascii=False)
        return

    try:
        res = chain.invoke({"title":args.title,"body":args.body})
        llm_out = dict(res)
    except:
        llm_out = {"valid":True,"committee":None,"priority":None,"confidence":0}

    committee, priority = _ensemble(args.title, args.body, llm_out)

    out = {
        "status":"valid",
        "committee":committee,
        "priority":priority
    }

    print(json.dumps(out, ensure_ascii=False))

    os.makedirs("out",exist_ok=True)
    path = f"out/complaint_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(path,"w",encoding="utf-8") as f:
        json.dump(out,f,indent=2,ensure_ascii=False)

if __name__ == "__main__":
    main()
