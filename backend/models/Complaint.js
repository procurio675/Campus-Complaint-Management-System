const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        // Auto-routed by Gemini
        type: String,
        enum: ['Hostel Management Committee', 'Cafeteria Management Committee', 'Academic Committee', 'Gender Cell', 'Anti-Ragging Committee', 'Sports Committee', 'Administration department'],
        required: true,
    },
    priority: {
        // Auto-routed by Gemini
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    room: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'rejected'],
        default: 'pending',
    },
    response: {
        type: String,
        default: '',
    },
    // --- NEW FIELDS ADDED BELOW ---
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    type: {
        // 'general' complaints are public and upvotable
        type: String,
        enum: ['general', 'personal'],
        default: 'general',
    },
    upvotes: {
        // Array of user IDs who have upvoted this complaint
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
    attachments: {
        // Array to store local file paths (from Multer) or cloud storage URLs
        type: [String],
        default: [],
    }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);

