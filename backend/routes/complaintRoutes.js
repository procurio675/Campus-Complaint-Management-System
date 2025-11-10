import express from 'express';
import multer from 'multer';
import { protect } from '../middlewares/authMiddleware.js';
import {
  submitComplaint,
  getMyComplaints,
  getMyComplaintsStats,
  getPublicComplaints,
  getAssignedComplaints,
  getAssignedComplaintsStats,
  getComplaint,
} from '../controllers/complaintController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
  fileFilter: (req, file, cb) => {
    // Allow only images and PDFs
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, or PDF files are allowed'), false);
    }
  },
});

// Protected routes - require authentication
router.post(
  '/',
  protect,
  upload.array('attachments', 3),
  submitComplaint
);

router.get('/my-complaints/stats', protect, getMyComplaintsStats); // Stats for student dashboard
router.get('/my-complaints', protect, getMyComplaints);
router.get('/public', protect, getPublicComplaints); // Public complaints (still requires auth)
router.get('/assigned/stats', protect, getAssignedComplaintsStats); // Stats for committee dashboard
router.get('/assigned', protect, getAssignedComplaints); // Assigned complaints for committee
router.get('/:id', protect, getComplaint);

export default router;

