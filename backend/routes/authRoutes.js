import express from 'express';
import {  getUserProfile,loginUser, forgotPassword, resetPassword, changePassword, registerStudent, registerCommittee, deleteUser } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// PUBLIC ROUTE
router.post('/login', loginUser);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// PROTECTED ROUTE
router.get('/profile', protect, getUserProfile);
// Admin-only account creation endpoints (used by CreateAccountPage frontend)
router.post('/register-student', protect, registerStudent);
router.post('/register-committee', protect, registerCommittee);
// Admin-only delete user endpoint
router.delete('/delete-user', protect, deleteUser);

export default router;
