import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// repo root = .../Sprint_1/backend -> go two levels up
const repoRoot = path.resolve(__dirname, "../../");
const PYTHON = process.env.PYTHON_PATH || "python"; // or a full path to .venv\Scripts\python.exe
const SCRIPT = path.join(repoRoot, "AI-LLM", "categorization_and_priority_set.py");

router.post("/classify", async (req, res) => {
  const { title = "", body = "" } = req.body || {};

  const py = spawn(PYTHON, [SCRIPT, "--title", title, "--body", body], {
    env: process.env,
  });

  let out = "", err = "";
  py.stdout.on("data", d => (out += d.toString()));
  py.stderr.on("data", d => (err += d.toString()));
  py.on("close", (code) => {
    try {
      const json = JSON.parse(out.trim()); // expects {"committee":"...","priority":"..."}
      return res.json({ ok: true, ...json });
    } catch (e) {
      return res.status(500).json({ ok: false, error: "LLM JSON parse failed", detail: out, stderr: err, code });
    }
  });
});

export default router;
