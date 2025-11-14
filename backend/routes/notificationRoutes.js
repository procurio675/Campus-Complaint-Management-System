import express from 'express';
import { getNotifications, markNotificationRead, markAllRead, deleteNotification } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/mark-all-read', markAllRead);
router.delete('/:id', deleteNotification);

export default router;
