from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableBranch
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv

load_dotenv()

model = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.0,
    api_key=os.getenv("GEMINI_API_KEY")
)

classification_template = ChatPromptTemplate.from_messages([
    ("system", 
     "You are an assistant that classifies campus complaints. "
     "Return ONLY valid JSON with two keys: 'committee' and 'priority'. "
     "Committees: Hostel Management, Cafeteria, Tech-Support, Sports, Academic, Internal Complaints, Annual Fest, Cultural, Student Placement. "
     "Priorities: High, Medium, Low. "
     "Do not include explanations or extra text."),
    ("human", 
     "Classify the following complaint into one committee and one priority:\n\nComplaint: {text}\n\nOutput strictly as JSON:")
])

branches = RunnableBranch(
    (lambda x: "classify" in x["task"].lower(), classification_template | model | StrOutputParser()),
    classification_template | model | StrOutputParser()
)

def classify_complaint(complaint_text: str):
    return branches.invoke({"task": "classify", "text": complaint_text})

if __name__ == "__main__":
    samples = [
        "There is no water in the hostel since morning.",
        "Fan in my room is not working, but I can survive.",
        "Placement portal is not responding to login.",
        "Sports ground lights are not functioning during practice."
    ]

    for s in samples:
        result = classify_complaint(s)
        print("Complaint:", s)
        print("Classification:", result)
        print("-" * 50)
