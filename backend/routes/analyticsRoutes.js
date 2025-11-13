import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getCommitteeAnalytics } from '../controllers/complaintController.js';

const router = express.Router();

// Public to authenticated users; committeeType is provided by frontend (string)
router.get('/:committeeType', protect, getCommitteeAnalytics);

export default router;
