import express from 'express';
import { getNotifications, markNotificationRead, markAllRead } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// GET /api/notifications
router.get('/', getNotifications);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', markNotificationRead);

// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', markAllRead);

export default router;
