import PDFDocument from "pdfkit";
import Complaint from "../models/Complaint.js";
import { resolveCommitteeCategory } from "./complaintController.js";

function date30DaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
}

export const generateMonthlyCommitteeReport = async (req, res) => {
  try {
    const { committeeType } = req.query;
    if (!committeeType) {
      return res.status(400).json({ message: "committeeType is required" });
    }

    // IMPORTANT: Map committee name → complaint category (Hostel → Hostel Management)
    const category = resolveCommitteeCategory(committeeType);

    if (!category) {
      return res.status(200).json({ message: "Invalid committee type" });
    }

    const fromDate = date30DaysAgo();

    // Fetch complaints USING THE SAME LOGIC AS Assigned Complaints Page
    const complaints = await Complaint.find({
      category,
      createdAt: { $gte: fromDate },
    }).lean();

    // Compute analytics
    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    const pending = complaints.filter((c) => c.status === "pending").length;
    const inProgress = complaints.filter((c) => c.status === "in-progress").length;

    const high = complaints.filter((c) => c.priority === "High").length;
    const medium = complaints.filter((c) => c.priority === "Medium").length;
    const low = complaints.filter((c) => c.priority === "Low").length;

    // Start PDF
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Report.pdf");

    doc.pipe(res);

    doc.fontSize(20).text("Committee Monthly Analytics Report", { underline: true });
    doc.moveDown();
    doc.fontSize(14).text(`Committee: ${committeeType}`);
    doc.text(`Category Mapped To: ${category}`);
    doc.text(`Report Range: Last 30 Days`);
    doc.text(`Created on: ${new Date().toLocaleString()}`);

    doc.moveDown().fontSize(16).text("Summary:");
    doc.fontSize(13).text(`Total Complaints: ${total}`);
    doc.text(`Resolved: ${resolved}`);
    doc.text(`Pending: ${pending}`);
    doc.text(`In Progress: ${inProgress}`);

    doc.moveDown().fontSize(16).text("Priority Breakdown:");
    doc.fontSize(13).text(`High: ${high}`);
    doc.text(`Medium: ${medium}`);
    doc.text(`Low: ${low}`);

    doc.moveDown().fontSize(16).text("Recent Complaints:");

    complaints.slice(0, 10).forEach((c, idx) => {
      doc.fontSize(12).text(
        `${idx + 1}. ${c.title}  [${c.priority}]  (${c.status})`
      );
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};
