// controllers/complaintController.js
import path from "path";
import { spawn } from "child_process";
import Complaint from "../models/Complaint.js";

// ESM-safe __dirname
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root = .../Sprint_1/backend -> go two levels up to reach repo root
const projectRoot = path.resolve(__dirname, "../../");
// If you kept the typo in the filename, replace the next line's filename accordingly.
const PY_SCRIPT = path.join(projectRoot, "AI-LLM", "categorization_and_priority_set.py");

const PYTHON_CMD = process.env.PYTHON_PATH || (process.platform === "win32" ? "py" : "python");

export async function createComplaint(req, res) {
  try {
    const { title, body } = req.body;

    // 1) If same title already exists → pass it as a prefix so Python can mark duplicate_of
    const existing = await Complaint.findOne({ title: new RegExp(`^${title}$`, "i") }).lean();
    const prefix = existing ? { [existing.title]: String(existing._id) } : {};

    // 2) Call the Python classifier
    const args = [
      PY_SCRIPT,
      "--title", title,
      "--body", body || "",
      "--meta-json", JSON.stringify({ source: "web", user: req.user?._id || null }),
      "--prefix-json", JSON.stringify(prefix),
    ];

    const py = spawn(PYTHON_CMD, args, { env: process.env });

    let stdout = "", stderr = "";
    py.stdout.on("data", d => (stdout += d.toString()));
    py.stderr.on("data", d => (stderr += d.toString()));

    py.on("close", async (code) => {
      let ai = null;
      try { ai = JSON.parse(stdout || "{}"); } catch {}

      if (code !== 0 || !ai) {
        console.error("AI pipeline error:", code, stderr);
        ai = { committee: "Academic", priority: "Medium", version: "fallback" };
      }

      // 3) If duplicate → count as upvote on original
      if (ai.duplicate_of) {
        await Complaint.updateOne({ _id: ai.duplicate_of }, { $inc: { upvotes: 1 } });
      }

      // 4) Save complaint with AI fields
      const doc = await Complaint.create({
        title,
        body,
        ai: {
          committee: ai.committee,
          priority: ai.priority,
          confidence: ai.confidence,
          rationale: ai.rationale,
          actions: ai.actions,
          duplicate_of: ai.duplicate_of || null,
          fingerprint: ai.fingerprint,
          version: ai.version,
          generated_at: ai.generated_at ? new Date(ai.generated_at) : new Date(),
        },
      });

      return res.status(201).json({ ok: true, complaint: doc });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Failed to create complaint" });
  }
}
