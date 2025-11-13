import Notification from '../models/Notification.js';

/**
 * Get notifications for logged-in user
 * GET /api/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('complaint', 'title status')
      .lean();

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch notifications' });
  }
};

/**
 * Mark a single notification as read
 * PATCH /api/notifications/:id/read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, user: userId });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ message: error.message || 'Failed to mark notification' });
  }
};

/**
 * Mark all notifications as read for user
 * PATCH /api/notifications/mark-all-read
 */
export const markAllRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark All Notifications Read Error:', error);
    res.status(500).json({ message: error.message || 'Failed to mark notifications' });
  }
};
