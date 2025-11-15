import express from "express";
import { generateMonthlyCommitteeReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/committee-monthly", generateMonthlyCommitteeReport);

export default router;
