#!/usr/bin/env python3
"""
Campus Complaint classifier (LangChain + Gemini 2.5-Flash) — MINIMAL JSON OUTPUT

STDOUT: {"committee":"<...>","priority":"High|Medium|Low"}
Also saves same JSON to ./out/complaint_<timestamp>.json

Usage (PowerShell):
  python .\AI-LLM\categorization_and_priority_set.py ^
    --title "No water in hostel" ^
    --body "G-block bathroom taps are dry since morning"

.env must contain:
  GOOGLE_API_KEY=your_key    (or GEMINI_API_KEY)
  GEMINI_MODEL=gemini-2.5-flash  (optional)
"""

import os, re, json, argparse, sys
from datetime import datetime
from typing import Optional, Literal
from collections import Counter
from dotenv import load_dotenv
load_dotenv()

# ---------------- Category & Priority Rules (guardrails + fallback) ----------------
CATEGORY_RULES = {
    "Hostel Management": [
        "water", "electric", "electricity", "maintenance", "repair", "clean", "washroom",
        "bathroom", "sink", "room", "leak", "warden", "hostel", "residence", "dorm", "mess room",
        "ceiling", "fan", "lift", "elevator", "plumbing", "sewage", "drain", "clog", "clogging"
    ],
    "Cafeteria": [
        "food", "canteen", "mess", "meal", "dining", "hygiene", "kitchen", "cafeteria",
        "snack", "lunch", "dinner", "cook", "insect", "worm", "spoiled", "stale", "contamination"
    ],
    "Tech-Support": [
        "login", "portal", "wifi", "internet", "printer", "server", "software", "website",
        "network", "system", "computer", "projector", "speaker", "audio", "microphone",
        "screen", "smartboard", "lab pc", "technical", "app", "digital", "it support"
    ],
    "Sports": [
        "ground", "stadium", "equipment", "tournament", "coach", "sports", "practice",
        "gym", "fitness", "playground", "game"
    ],
    "Academic": [
        "exam", "lecture", "faculty", "course", "attendance", "assignment", "grade",
        "marks", "timetable", "syllabus", "class", "professor", "teacher", "seminar",
        "tutorial", "workshop", "laboratory", "lab session"
    ],
    "Internal Complaints": [
        "harassment", "ragging", "bullying", "assault", "discrimination", "misconduct",
        "abuse", "violence", "threat", "safety incident"
    ],
    "Annual Fest": [
        "event", "fest", "annual", "volunteer", "sponsor", "celebration", "gala",
        "festival", "show", "stage"
    ],
    "Cultural": [
        "dance", "music", "drama", "club", "competition", "cultural", "performance",
        "arts", "theatre"
    ],
    "Student Placement": [
        "internship", "placement", "company", "drive", "resume", "job", "offer", "recruiter",
        "career", "interview", "aptitude"
    ]
}

PRIORITY_RULES = {
    "High": [
        "water", "electricity", "electrocute", "fire", "gas", "medical", "harassment",
        "assault", "ragging", "emergency", "injury", "accident", "collapse", "poison",
        "spoiled food", "contaminated", "insect", "worm", "unsafe", "security", "short circuit",
        "leak", "flood", "broken glass", "violence"
    ],
    "Medium": [
        "wifi", "printer", "assignment", "grades", "cleaning", "software", "portal",
        "login", "speaker", "audio", "projector", "equipment not working", "network",
        "maintenance", "air conditioning", "lighting"
    ],
    "Low": [
        "event", "cultural", "sports", "festival", "mess", "schedule change", "noise",
        "crowd", "minor"
    ]
}

SPAM_PHRASES = [
    "sample complaint", "test complaint", "dummy complaint", "ignore this", "testing only",
    "just to mess", "lorem ipsum"
]

ENGLISH_WORDS = {
    "the","be","to","of","and","a","in","that","have","it","for","not","on","with","as",
    "you","do","this","but","his","by","from","they","we","say","her","she","or","an",
    "will","my","one","all","would","there","their","what","so","up","out","if","about",
    "who","get","which","go","me","when","make","can","like","time","no","just","him",
    "know","take","people","into","year","your","good","some","could","them","see",
    "other","than","then","now","look","only","come","its","over","think","also","back",
    "after","use","two","how","our","work","first","well","way","even","new","want",
    "because","any","these","give","day","most","us","student","staff","teacher",
    "class","classroom","lecture","problem","issue","repair","broken","crowded","queue",
    "dirty","clean","messy","mess","canteen","food","meal","dining","snack","drink",
    "water","washroom","toilet","restroom","bathroom","hostel","room","bed","door",
    "window","electric","electricity","power","light","fan","ac","air","conditioner",
    "projector","screen","speaker","microphone","wifi","network","internet","computer",
    "laptop","system","printer","server","lab","laboratory","ground","sports","coach",
    "equipment","ball","game","field","library","book","noise","smell","spoiled","insect",
    "worm","dirty","hygiene","queue","slow","late","delay","maintenance","support",
    "request","urgent","help","needed","need","available","supply","service","staff",
    "management","committee","students","people","crowd","safety","security","harassment",
    "fight","emergency","medical","injury","doctor","nurse","clinic","vehicle","parking",
    "bus","transport","canteen","kitchen","cook","taste","quality","fresh","stale",
    "rotten","sick","health","problem","complaint","resolve","action","status","update",
    "announcement","notice","schedule","timetable","exam","assignment","marks","grade",
    "result","portal","login","password","access","account","submit","submission",
    "deadline","late","closed","open","available","unavailable","bag","phone","stolen",
    "lost","found","maintenance","plumber","electrician","technician","broken","damage",
    "leak","flood","waterproof","rain","ceiling","floor","stairs","lift","elevator",
    "crowded","queue","line","waiting","long","time","delay","slow","service","support"
}

def _normalize_token(token: str) -> str:
    token = token.lower()
    for suffix in ("ing", "ed", "es", "s"):
        if len(token) > 4 and token.endswith(suffix):
            token = token[: -len(suffix)]
            break
    return token

def _build_context_words() -> set[str]:
    base_context = {
        "issue", "problem", "broken", "not", "work", "stuck", "delay", "dirty",
        "leak", "repair", "urgent", "support", "request", "student", "staff",
        "classroom", "lecture", "complaint", "food", "water", "wifi", "speaker",
        "canteen", "maintenance", "crowd", "floor", "damage", "noise", "power",
        "network", "equipment", "server", "hall", "hostel", "bathroom", "hygiene",
        "mess", "spoiled", "insect", "worm", "smell", "dirty", "garbage", "dust",
        "electric", "light", "fan", "ac", "projector", "audio", "microphone"
    }

    def extract_words(phrases):
        words = set()
        for phrase in phrases:
            parts = re.findall(r"[a-zA-Z]{3,}", phrase.lower())
            for part in parts:
                words.add(_normalize_token(part))
        return words

    context_words = set(_normalize_token(word) for word in base_context)
    for rule_set in (CATEGORY_RULES, PRIORITY_RULES):
        for word_list in rule_set.values():
            context_words.update(extract_words(word_list))

    return context_words

CONTEXT_WORDS = _build_context_words()

def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())

def _match_scores(text: str, rules: dict) -> dict:
    scores = {}
    for key, keywords in rules.items():
        count = sum(1 for kw in keywords if kw in text)
        if count > 0:
            scores[key] = count
    return scores

def _rule_committee(title: str, body: str) -> Optional[str]:
    text = _norm(title + " " + body)
    scores = _match_scores(text, CATEGORY_RULES)
    if not scores:
        return None
    return max(scores.items(), key=lambda item: (item[1], len(item[0])))[0]

def _rule_priority(title: str, body: str) -> Optional[str]:
    text = _norm(title + " " + body)
    # Prioritize higher severity if any keyword matches
    for level in ("High", "Medium", "Low"):
        kws = PRIORITY_RULES[level]
        if any(k in text for k in kws):
            return level
    return None

CONTEXT_WORDS = {
    "issue", "problem", "broken", "not", "working", "stuck", "delayed", "dirty",
    "leaking", "repair", "urgent", "support", "request", "students", "staff",
    "classroom", "lecture", "complaint", "food", "water", "wifi", "speaker",
    "canteen", "maintenance", "crowded", "floor", "damage"
}.union(*map(set, CATEGORY_RULES.values()))

def _detect_spam(title: str, body: str) -> Optional[str]:
    text = _norm(title + " " + body)
    tokens = re.findall(r"\b\w+\b", text)

    if not text or len(text) < 10:
        return "Complaint is too short to understand. Please add more detail."

    if any(phrase in text for phrase in SPAM_PHRASES):
        return "Complaint appears to be a sample/test submission. Please file a real issue."

    if tokens:
        counts = Counter(tokens)
        most_common_word, freq = counts.most_common(1)[0]
        if freq >= 3 and freq / max(len(tokens), 1) >= 0.6:
            return f"Complaint repeats '{most_common_word}' too many times. Please describe the issue clearly."

    if len(tokens) < 3:
        return "Complaint needs more detail. Please add a clearer description of the issue."

    if len(tokens) <= 4 and len(set(tokens)) <= 2:
        return "Complaint description is too repetitive. Please provide more details."

    contextual_words = 0
    distinct_contextual = set()
    for token in tokens:
        if len(token) < 3:
            continue
        canonical = _normalize_token(token)
        if canonical in CONTEXT_WORDS or token in CONTEXT_WORDS:
            contextual_words += 1
            distinct_contextual.add(canonical)

    meaningful_tokens = contextual_words
    distinct_meaningful = set(distinct_contextual)

    for token in tokens:
        if len(token) < 3:
            continue
        canonical = _normalize_token(token)
        if canonical in ENGLISH_WORDS and canonical not in distinct_contextual:
            meaningful_tokens += 1
            distinct_meaningful.add(canonical)

    if contextual_words == 0:
        return "Complaint lacks recognizable issue details. Please explain the problem in plain words."

    meaningful_ratio = meaningful_tokens / len(tokens) if tokens else 0
    if len(tokens) >= 10:
        if meaningful_tokens < 3 or meaningful_ratio < 0.3:
            return "Complaint does not include enough meaningful details. Please describe the problem clearly."
    elif meaningful_tokens < 4 or meaningful_ratio < 0.5:
        return "Complaint does not include enough meaningful details. Please describe the problem clearly."

    if len(tokens) >= 10:
        if len(distinct_meaningful) < 3:
            return "Complaint repeats the same words. Add more detail about the issue."
    elif len(distinct_meaningful) < 3:
        return "Complaint repeats the same words. Add more detail about the issue."

    return None

# ---------------- LangChain + Gemini (minimal schema) ----------------
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI

class MiniClassification(BaseModel):
    valid: bool = Field(..., description="False if the complaint is spam, nonsense, or lacks a real issue.")
    committee: Optional[str] = Field(
        None, description="Exact committee name from the allowed list (only when valid)."
    )
    priority: Optional[Literal["High", "Medium", "Low"]] = Field(
        None, description="Priority level (only when valid)."
    )
    reason: Optional[str] = Field(
        None, description="Short explanation when valid is false."
    )

parser = JsonOutputParser(pydantic_object=MiniClassification)

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("Missing GOOGLE_API_KEY / GEMINI_API_KEY in environment.")

llm = ChatGoogleGenerativeAI(model=MODEL_NAME, temperature=0.2, google_api_key=API_KEY)

SYSTEM_PROMPT = (
    "You are the routing engine for the Campus Complaint Management System. "
    "Analyze each complaint carefully and output ONLY valid JSON that matches the schema "
    "{{valid:boolean, committee?:string, priority?:High|Medium|Low, reason?:string}}. "
    "If the text is spam, empty, nonsense, or lacks a clear issue, set valid=false with a short reason. "
    "When valid=true you MUST pick exactly one committee from this list:\n"
    + json.dumps(list(CATEGORY_RULES.keys()), indent=2) +
    "\nSelect the committee that will actually handle the described problem. "
    "Base your decision on the meaning of the complaint, not just keyword counts. "
    "Use the following guidelines:\n"
    "- Hostel Management: issues with hostels, dorm rooms, sinks, bathrooms, toilets, drains, plumbing, leaks, electricity, maintenance of residential areas. NEVER send these to Academic.\n"
    "- Cafeteria: food quality, hygiene, staff behaviour in canteen/mess.\n"
    "- Tech-Support: connectivity, portals, software, lab equipment, classroom devices.\n"
    "- Sports: grounds, coaches, equipment, tournaments.\n"
    "- Academic: classes, faculty, exams, marks, timetable, lecture halls.\n"
    "- Internal Complaints: misconduct, harassment, safety, disciplinary matters.\n"
    "- Annual Fest / Cultural / Student Placement: use when the complaint clearly targets those domains.\n"
    "Priorities map to severity: High (safety risk, major outage, health hazard), "
    "Medium (service disruption affecting operations), Low (inconvenience or informational request).\n"
    "Do not include explanations beyond the JSON object."
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human",
     "Complaint Title: {title}\nComplaint Body: {body}\n\n"
     "Follow these hints (non-binding):\n"
     "Committee rules:\n{category_rules}\nPriority rules:\n{priority_rules}\n\n"
     "Examples:\n"
     "1) {{\"title\": \"Water clogging in hostel bathroom\", \"body\": \"Bathroom drain on 3rd floor hostel is clogged for two days\"}} -> {{\"committee\":\"Hostel Management\",\"priority\":\"High\"}}\n"
     "2) {{\"title\": \"Insects in mess food\", \"body\": \"Found worms in today’s lunch at the canteen\"}} -> {{\"committee\":\"Cafeteria\",\"priority\":\"High\"}}\n"
     "3) {{\"title\": \"Projector not working\", \"body\": \"The projector in LT-2 keeps shutting off\"}} -> {{\"committee\":\"Tech-Support\",\"priority\":\"Medium\"}}\n"
     "4) {{\"title\": \"Professor absent\", \"body\": \"Machine Learning lecture cancelled repeatedly without notice\"}} -> {{\"committee\":\"Academic\",\"priority\":\"Medium\"}}\n"
     "\n"
     "Return STRICT JSON with only these keys: valid, committee, priority, reason.\n"
     "{format_instructions}")
]).partial(
    category_rules=json.dumps(CATEGORY_RULES, indent=2),
    priority_rules=json.dumps(PRIORITY_RULES, indent=2),
    format_instructions=parser.get_format_instructions()
)

chain = prompt | llm | parser  # returns {"committee": "...", "priority": "..."}

# ---------------- Main ----------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--title", required=True)
    ap.add_argument("--body", default="")
    args = ap.parse_args()

    spam_reason = _detect_spam(args.title, args.body)
    if spam_reason:
        out = {"status": "invalid", "message": spam_reason}
        print(json.dumps(out, ensure_ascii=False))
        return

    text_norm = _norm(args.title + " " + args.body)
    rule_comm = _rule_committee(args.title, args.body)
    rule_prio = _rule_priority(args.title, args.body) or "Medium"
    rule_scores = _match_scores(text_norm, CATEGORY_RULES)
    top_rule_score = max(rule_scores.values()) if rule_scores else 0

    try:
        res = chain.invoke({"title": args.title, "body": args.body})
        valid = bool(res.get("valid"))
        reason = res.get("reason")
        committee = res.get("committee") or rule_comm
        priority  = res.get("priority")  or rule_prio

        # Override LLM when rule-based signals are strong
        if rule_comm and rule_comm != "Academic":
            # If LLM says Academic but rule has >=2 keyword hits, trust the rule
            if committee == "Academic" and top_rule_score >= 2:
                committee = rule_comm
            # If LLM picks a different committee but rule has very strong evidence (>=3 hits), prefer rule
            elif committee != rule_comm and top_rule_score >= 3:
                committee = rule_comm
        # Ensure priority respects rule-based severity when LLM is lower
        if priority != "High" and rule_prio == "High":
            priority = "High"
    except Exception as exc:
        print(f"LLM classification failed: {exc}", file=sys.stderr)
        valid = True
        reason = None
        committee, priority = rule_comm, rule_prio

    if not valid:
        out = {"status": "invalid", "message": reason or "Complaint flagged as spam or invalid."}
        print(json.dumps(out, ensure_ascii=False))
        return

    final_committee = committee or rule_comm or "Academic"
    final_priority = priority or rule_prio or "Medium"

    out = {"status": "valid", "committee": final_committee, "priority": final_priority}

    print(json.dumps(out, ensure_ascii=False))

    os.makedirs("out", exist_ok=True)
    file_path = f"out/complaint_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=4, ensure_ascii=False)

    print(f"\n✅ JSON saved to {file_path}", file=sys.stderr)

if __name__ == "__main__":
    main()

