import express from 'express';
import { loginUser, getUserProfile,forgotPassword, resetPassword} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// PUBLIC ROUTE
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// PROTECTED ROUTE
router.get('/profile', protect, getUserProfile);

export default router;
