import express from 'express';
import {  getUserProfile,loginUser, forgotPassword, resetPassword, changePassword } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// PUBLIC ROUTE
router.post('/login', loginUser);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// PROTECTED ROUTE
router.get('/profile', protect, getUserProfile);

export default router;
