import express from "express";
import { classifyWithRules, analyzeComplaint } from "../services/complaintClassifier.js";

const router = express.Router();

router.post("/classify", async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Title and description required" });
  }

  try {
    const result = await analyzeComplaint(title, body);
    return res.json(result);
  } catch (error) {
    console.error("Complaint classification failed", error);
    const fallback = classifyWithRules(title, body);
    return res.json(fallback);
  }
});

export default router;
