import express from 'express';
import { loginUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// PUBLIC ROUTE
router.post('/login', loginUser);

// PROTECTED ROUTE
router.get('/profile', protect, getUserProfile);

export default router;
