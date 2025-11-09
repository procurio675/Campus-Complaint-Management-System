import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the backend/.env file (mirrors the behaviour that existed in the Python script)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const CATEGORY_RULES = {
  "Hostel Management": [
    "water",
    "electric",
    "electricity",
    "maintenance",
    "clean",
    "washroom",
    "bathroom",
    "room",
    "wifi",
    "warden",
    "hostel",
  ],
  Cafeteria: ["food", "canteen", "mess", "meal", "dining", "hygiene"],
  "Tech-Support": [
    "login",
    "portal",
    "wifi",
    "internet",
    "printer",
    "server",
    "software",
    "website",
    "network",
  ],
  Sports: ["ground", "stadium", "equipment", "tournament", "coach", "sports"],
  Academic: [
    "exam",
    "lecture",
    "faculty",
    "course",
    "attendance",
    "assignment",
    "grade",
    "marks",
    "timetable",
  ],
  "Internal Complaints": [
    "harassment",
    "ragging",
    "bullying",
    "assault",
    "discrimination",
    "misconduct",
  ],
  "Annual Fest": ["event", "fest", "annual", "volunteer", "sponsor", "celebration"],
  Cultural: ["dance", "music", "drama", "club", "competition", "cultural"],
  "Student Placement": [
    "internship",
    "placement",
    "company",
    "drive",
    "resume",
    "job",
    "offer",
  ],
};

const PRIORITY_RULES = {
  High: [
    "water",
    "electricity",
    "electrocute",
    "fire",
    "gas",
    "medical",
    "harassment",
    "assault",
    "ragging",
    "emergency",
  ],
  Medium: [
    "wifi",
    "printer",
    "assignment",
    "grades",
    "cleaning",
    "software",
    "portal",
    "login",
  ],
  Low: ["event", "cultural", "sports", "food", "festival", "mess"],
};

const DEFAULT_COMMITTEE = "Academic";
const DEFAULT_PRIORITY = "Medium";
const ALLOWED_PRIORITIES = ["High", "Medium", "Low"];
const ALLOWED_COMMITTEES = Object.keys(CATEGORY_RULES);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const norm = (value = "") => value.trim().toLowerCase().replace(/\s+/g, " ");

const ruleCommittee = (title, body) => {
  const text = norm(`${title} ${body}`);
  for (const [committee, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return committee;
    }
  }
  return null;
};

const rulePriority = (title, body) => {
  const text = norm(`${title} ${body}`);
  for (const [priority, keywords] of Object.entries(PRIORITY_RULES)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return priority;
    }
  }
  return null;
};

export const classifyWithRules = (title, body) => ({
  committee: ruleCommittee(title, body) || DEFAULT_COMMITTEE,
  priority: rulePriority(title, body) || DEFAULT_PRIORITY,
});

let geminiModelPromise = null;

const ensureGeminiModel = async () => {
  if (!GEMINI_API_KEY) {
    return null;
  }

  if (!geminiModelPromise) {
    geminiModelPromise = (async () => {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const client = new GoogleGenerativeAI(GEMINI_API_KEY);
      return client.getGenerativeModel({ model: GEMINI_MODEL });
    })();
  }

  try {
    return await geminiModelPromise;
  } catch (error) {
    console.error("Failed to initialise Gemini model", error);
    geminiModelPromise = null;
    return null;
  }
};

const buildPrompt = (title, body) => {
  const categoryHints = JSON.stringify(CATEGORY_RULES, null, 2);
  const priorityHints = JSON.stringify(PRIORITY_RULES, null, 2);

  return [
    "You classify campus complaints.",
    `Return ONLY valid JSON with keys \"committee\" and \"priority\".`,
    `Allowed committees: ${JSON.stringify(ALLOWED_COMMITTEES)}`,
    "Allowed priorities: High, Medium, Low.",
    "Use these hints (non-binding):",
    `Committee rules: ${categoryHints}`,
    `Priority rules: ${priorityHints}`,
    "Complaint Title:",
    title || "",
    "Complaint Body:",
    body || "",
  ].join("\n");
};

const parseGeminiResponse = (rawOutput) => {
  if (!rawOutput) return null;

  const text = rawOutput.trim();
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    const committee = ALLOWED_COMMITTEES.includes(parsed.committee)
      ? parsed.committee
      : DEFAULT_COMMITTEE;
    const priority = ALLOWED_PRIORITIES.includes(parsed.priority)
      ? parsed.priority
      : DEFAULT_PRIORITY;

    return { committee, priority };
  } catch (error) {
    console.error("Gemini output was not valid JSON", { rawOutput, error });
    return null;
  }
};

const classifyWithGemini = async (title, body) => {
  const model = await ensureGeminiModel();
  if (!model) return null;

  try {
    const prompt = buildPrompt(title, body);
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });
    const rawOutput = result?.response?.text?.();
    return parseGeminiResponse(rawOutput);
  } catch (error) {
    console.error("Gemini classification failed", error);
    return null;
  }
};

export const analyzeComplaint = async (title, body) => {
  const fallback = classifyWithRules(title, body);

  try {
    const llmResult = await classifyWithGemini(title, body);
    return llmResult || fallback;
  } catch (error) {
    console.error("Complaint analysis encountered an error", error);
    return fallback;
  }
};

export default analyzeComplaint;

