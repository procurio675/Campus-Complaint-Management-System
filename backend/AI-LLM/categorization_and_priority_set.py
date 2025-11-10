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
from dotenv import load_dotenv
load_dotenv()

# ---------------- Category & Priority Rules (guardrails + fallback) ----------------
CATEGORY_RULES = {
    "Hostel Management": ["water", "electric", "electricity", "maintenance", "clean", "washroom",
                          "bathroom", "room", "wifi", "warden", "hostel"],
    "Cafeteria": ["food", "canteen", "mess", "meal", "dining", "hygiene"],
    "Tech-Support": ["login", "portal", "wifi", "internet", "printer", "server", "software", "website", "network"],
    "Sports": ["ground", "stadium", "equipment", "tournament", "coach", "sports"],
    "Academic": ["exam", "lecture", "faculty", "course", "attendance", "assignment", "grade", "marks", "timetable"],
    "Internal Complaints": ["harassment", "ragging", "bullying", "assault", "discrimination", "misconduct"],
    "Annual Fest": ["event", "fest", "annual", "volunteer", "sponsor", "celebration"],
    "Cultural": ["dance", "music", "drama", "club", "competition", "cultural"],
    "Student Placement": ["internship", "placement", "company", "drive", "resume", "job", "offer"]
}

PRIORITY_RULES = {
    "High":   ["water", "electricity", "electrocute", "fire", "gas", "medical", "harassment", "assault", "ragging", "emergency"],
    "Medium": ["wifi", "printer", "assignment", "grades", "cleaning", "software", "portal", "login"],
    "Low":    ["event", "cultural", "sports", "food", "festival", "mess"]
}

def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())

def _rule_committee(title: str, body: str) -> Optional[str]:
    text = _norm(title + " " + body)
    for committee, kws in CATEGORY_RULES.items():
        if any(k in text for k in kws):
            return committee
    return None

def _rule_priority(title: str, body: str) -> Optional[str]:
    text = _norm(title + " " + body)
    for level, kws in PRIORITY_RULES.items():
        if any(k in text for k in kws):
            return level
    return None

# ---------------- LangChain + Gemini (minimal schema) ----------------
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI

class MiniClassification(BaseModel):
    committee: str = Field(..., description="Exact committee name from the allowed list.")
    priority: Literal["High", "Medium", "Low"]

parser = JsonOutputParser(pydantic_object=MiniClassification)

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("Missing GOOGLE_API_KEY / GEMINI_API_KEY in environment.")

llm = ChatGoogleGenerativeAI(model=MODEL_NAME, temperature=0.2, google_api_key=API_KEY)

SYSTEM_PROMPT = (
    "You classify campus complaints. "
    "You MUST return ONLY valid JSON matching the schema (committee, priority). "
    "Committees:\n"
    + json.dumps(list(CATEGORY_RULES.keys()), indent=2) +
    "\nPriorities: High, Medium, Low.\n"
    "Never include explanations, rationale, confidence, or extra fields. Only JSON."
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human",
     "Complaint Title: {title}\nComplaint Body: {body}\n\n"
     "Follow these hints (non-binding):\n"
     "Committee rules:\n{category_rules}\nPriority rules:\n{priority_rules}\n\n"
     "Return STRICT JSON with only these keys: committee, priority.\n"
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

    rule_comm = _rule_committee(args.title, args.body) or "Academic"
    rule_prio = _rule_priority(args.title, args.body) or "Medium"

    try:
        res = chain.invoke({"title": args.title, "body": args.body})
        committee = res.get("committee") or rule_comm
        priority  = res.get("priority")  or rule_prio
    except Exception:
        committee, priority = rule_comm, rule_prio

    out = {"committee": committee, "priority": priority}

    #Print clean JSON to console
    print(json.dumps(out, ensure_ascii=False))

    #Save JSON file automatically
    os.makedirs("out", exist_ok=True)
    file_path = f"out/complaint_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=4, ensure_ascii=False)

    print(f"\n✅ JSON saved to {file_path}", file=sys.stderr)

if __name__ == "__main__":
    main()

