import Complaint from '../models/Complaint.js';
import { classifyComplaint } from '../utils/aiRouting.js';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

/**
 * Submit a new complaint
 * POST /api/complaints
 */
export const submitComplaint = async (req, res) => {
  try {
    const { title, description, location, type } = req.body;
    const userId = req.user._id; // From auth middleware

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        message: 'Title and description are required',
      });
    }

    // Call AI routing to classify and prioritize
    let aiResult;
    try {
      aiResult = await classifyComplaint(title, description);
    } catch (error) {
      console.error('AI Routing Error:', error);
      // Use fallback classification
      aiResult = {
        committee: 'Academic',
        priority: 'Medium',
      };
    }

    // Handle file uploads if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'complaints');
      await mkdir(uploadsDir, { recursive: true });

      // Save files
      for (const file of req.files) {
        const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadsDir, fileName);
        await writeFile(filePath, file.buffer);
        attachments.push(`uploads/complaints/${fileName}`);
      }
    }

    // Create complaint in database
    const complaint = await Complaint.create({
      userId,
      title: title.trim(),
      description: description.trim(),
      location: location?.trim() || '',
      category: aiResult.committee,
      priority: aiResult.priority,
      type: type === 'Personal' ? 'personal' : 'general',
      attachments,
      status: 'pending',
    });

    // Return success response with committee information
    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: {
        _id: complaint._id,
        title: complaint.title,
        category: complaint.category,
        priority: complaint.priority,
        status: complaint.status,
        createdAt: complaint.createdAt,
      },
      routing: {
        committee: complaint.category,
        priority: complaint.priority,
      },
    });
  } catch (error) {
    console.error('Submit Complaint Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to submit complaint',
    });
  }
};

/**
 * Get complaint statistics for the logged-in student
 * GET /api/complaints/my-complaints/stats
 */
export const getMyComplaintsStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get counts by status
    const [total, pending, inProgress, resolved, rejected] = await Promise.all([
      Complaint.countDocuments({ userId }),
      Complaint.countDocuments({ userId, status: 'pending' }),
      Complaint.countDocuments({ userId, status: 'in-progress' }),
      Complaint.countDocuments({ userId, status: 'resolved' }),
      Complaint.countDocuments({ userId, status: 'rejected' }),
    ]);

    res.status(200).json({
      total,
      pending,
      inProgress,
      resolved,
      rejected,
    });
  } catch (error) {
    console.error('Get My Complaints Stats Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to fetch complaint statistics',
    });
  }
};

/**
 * Get all complaints for the logged-in user
 * GET /api/complaints/my-complaints
 */
export const getMyComplaints = async (req, res) => {
  try {
    const userId = req.user._id;
    const complaints = await Complaint.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      complaints,
    });
  } catch (error) {
    console.error('Get My Complaints Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to fetch complaints',
    });
  }
};

/**
 * Helper function to update priority based on upvote count
 */
const updatePriorityBasedOnUpvotes = async (complaint) => {
  const upvoteCount = complaint.upvotes?.length || 0;
  let newPriority = complaint.priority;

  // Priority thresholds based on upvotes
  // High: 10+ upvotes
  // Medium: 5-9 upvotes
  // Low: 0-4 upvotes
  if (upvoteCount >= 10) {
    newPriority = 'High';
  } else if (upvoteCount >= 5) {
    newPriority = 'Medium';
  } else {
    newPriority = 'Low';
  }

  // Only update if priority changed
  if (newPriority !== complaint.priority) {
    complaint.priority = newPriority;
    await complaint.save();
  }

  return newPriority;
};

/**
 * Get all public complaints (visible to everyone)
 * GET /api/complaints/public
 */
export const getPublicComplaints = async (req, res) => {
  try {
    const userId = req.user?._id; // Get current user ID if authenticated
    
    // Get all complaints where type is 'general' (public)
    // We'll sort by upvote count after fetching
    const complaints = await Complaint.find({ type: 'general' })
      .populate('userId', 'name email')
      .select('-__v -description'); // Don't expose full description in list view
    
    // Sort by upvote count (descending), then by creation date
    complaints.sort((a, b) => {
      const aUpvotes = a.upvotes?.length || 0;
      const bUpvotes = b.upvotes?.length || 0;
      if (bUpvotes !== aUpvotes) {
        return bUpvotes - aUpvotes; // Most upvoted first
      }
      return new Date(b.createdAt) - new Date(a.createdAt); // Newest first if same upvotes
    });

    // Format complaints to hide user identity if anonymous
    const formattedComplaints = complaints.map((complaint) => {
      const complaintObj = complaint.toObject();
      
      // If anonymous, hide user details
      if (complaint.isAnonymous) {
        complaintObj.userId = {
          name: 'Anonymous',
          email: null,
        };
      }
      
      // Add upvote count and whether current user has upvoted
      complaintObj.upvoteCount = complaint.upvotes?.length || 0;
      complaintObj.hasUpvoted = userId 
        ? complaint.upvotes?.some((id) => id.toString() === userId.toString()) 
        : false;
      
      return complaintObj;
    });

    res.status(200).json({
      complaints: formattedComplaints,
    });
  } catch (error) {
    console.error('Get Public Complaints Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to fetch public complaints',
    });
  }
};

/**
 * Get complaint statistics for the logged-in committee
 * GET /api/complaints/assigned/stats
 */
export const getAssignedComplaintsStats = async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user is a committee member
    if (user.role !== 'committee') {
      return res.status(403).json({
        message: 'Only committee members can access assigned complaints stats',
      });
    }

    // Map committee types to complaint categories
    const committeeCategoryMap = {
      'Hostel': 'Hostel Management',
      'Canteen': 'Cafeteria',
      'Tech Committee': 'Tech-Support',
      'Sports': 'Sports',
      'Disciplinary Action': 'Internal Complaints',
      'Maintenance': 'Hostel Management',
    };

    const category = committeeCategoryMap[user.committeeType];
    
    if (!category) {
      return res.status(200).json({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0,
      });
    }

    // Get counts by status
    const [total, pending, inProgress, resolved, rejected] = await Promise.all([
      Complaint.countDocuments({ category }),
      Complaint.countDocuments({ category, status: 'pending' }),
      Complaint.countDocuments({ category, status: 'in-progress' }),
      Complaint.countDocuments({ category, status: 'resolved' }),
      Complaint.countDocuments({ category, status: 'rejected' }),
    ]);

    res.status(200).json({
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      category,
    });
  } catch (error) {
    console.error('Get Assigned Complaints Stats Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to fetch complaint statistics',
    });
  }
};

/**
 * Get complaints assigned to the logged-in committee
 * GET /api/complaints/assigned
 */
export const getAssignedComplaints = async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user is a committee member
    if (user.role !== 'committee') {
      return res.status(403).json({
        message: 'Only committee members can access assigned complaints',
      });
    }

    // Map committee types to complaint categories
    const committeeCategoryMap = {
      'Hostel': 'Hostel Management',
      'Canteen': 'Cafeteria',
      'Tech Committee': 'Tech-Support',
      'Sports': 'Sports',
      'Disciplinary Action': 'Internal Complaints',
      'Maintenance': 'Hostel Management', // Maintenance can handle hostel issues
    };

    const category = committeeCategoryMap[user.committeeType];
    
    if (!category) {
      return res.status(200).json({
        complaints: [],
        message: `No category mapping found for committee type: ${user.committeeType}`,
      });
    }

    // Find complaints assigned to this committee's category
    const complaints = await Complaint.find({ category })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .select('-__v');

    // Format complaints to hide user identity if anonymous
    const formattedComplaints = complaints.map((complaint) => {
      const complaintObj = complaint.toObject();
      
      // If anonymous, hide user details
      if (complaint.isAnonymous) {
        complaintObj.userId = {
          name: 'Anonymous',
          email: null,
        };
      }
      
      return complaintObj;
    });

    res.status(200).json({
      complaints: formattedComplaints,
      committeeType: user.committeeType,
      category,
    });
  } catch (error) {
    console.error('Get Assigned Complaints Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to fetch assigned complaints',
    });
  }
};

/**
 * Upvote a public complaint
 * POST /api/complaints/:id/upvote
 */
export const upvoteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the complaint
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found',
      });
    }

    // Only allow upvoting public complaints
    if (complaint.type !== 'general') {
      return res.status(403).json({
        message: 'Only public complaints can be upvoted',
      });
    }

    // Check if user has already upvoted (compare as strings)
    const hasUpvoted = complaint.upvotes?.some(
      (upvoteId) => upvoteId.toString() === userId.toString()
    );

    if (hasUpvoted) {
      // Remove upvote (toggle off)
      complaint.upvotes = complaint.upvotes.filter(
        (upvoteId) => upvoteId.toString() !== userId.toString()
      );
    } else {
      // Add upvote
      if (!complaint.upvotes) {
        complaint.upvotes = [];
      }
      // Check if user ID is not already in the array
      if (!complaint.upvotes.some((id) => id.toString() === userId.toString())) {
        complaint.upvotes.push(userId);
      }
    }

    await complaint.save();

    // Update priority based on upvote count
    const newPriority = await updatePriorityBasedOnUpvotes(complaint);

    res.status(200).json({
      message: hasUpvoted ? 'Upvote removed' : 'Complaint upvoted successfully',
      upvoteCount: complaint.upvotes.length,
      hasUpvoted: !hasUpvoted,
      priority: newPriority,
    });
  } catch (error) {
    console.error('Upvote Complaint Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to upvote complaint',
    });
  }
};

/**
 * Get a single complaint by ID
 * GET /api/complaints/:id
 */
export const getComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const complaint = await Complaint.findOne({ _id: id, userId })
      .populate('userId', 'name email')
      .select('-__v');

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found',
      });
    }

    res.status(200).json({
      complaint,
    });
  } catch (error) {
    console.error('Get Complaint Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to fetch complaint',
    });
  }
};

