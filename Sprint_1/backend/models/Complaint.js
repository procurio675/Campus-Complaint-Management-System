import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, default: "" },
    upvotes: { type: Number, default: 0 },

    ai: {
      committee: String,
      priority: { type: String, enum: ["Low", "Medium", "High"] },
      confidence: Number,
      rationale: String,
      actions: [String],
      duplicate_of: { type: String, default: null }, // complaint_id string
      fingerprint: String,
      version: String,
      generated_at: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", ComplaintSchema);
