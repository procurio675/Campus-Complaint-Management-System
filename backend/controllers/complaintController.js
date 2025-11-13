import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import { classifyComplaint } from '../utils/aiRouting.js';
import { sendStatusUpdateEmail } from '../utils/emailService.js';

/**
 * Create a new complaint
 * POST /api/complaints/create
 */
export const createComplaint = async (req, res) => {
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

    // Cloudinary provides the asset URL on the path property; secure_url is a fallback.
    const attachments = (req.files || [])
      .map((file) => file.path || file.secure_url)
      .filter(Boolean);

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
    console.error('Create Complaint Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to submit complaint',
    });
  }
};

// Backward compatibility: reuse the same implementation under the old name used by legacy routes.
export const submitComplaint = createComplaint;

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
    // Note: We will sort in-memory by upvotes (desc) then by creation date (desc)
    const complaints = await Complaint.find({ category })
      .populate('userId', 'name email')
      .select('-__v');
    
    // Sort by upvote count (descending), then by createdAt (newest first)
    complaints.sort((a, b) => {
      const aUpvotes = a.upvotes?.length || 0;
      const bUpvotes = b.upvotes?.length || 0;
      if (bUpvotes !== aUpvotes) {
        return bUpvotes - aUpvotes;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Format complaints to hide user identity if anonymous
    const formattedComplaints = complaints.map((complaint) => {
      const complaintObj = complaint.toObject();
      // Include upvoteCount for UI convenience
      complaintObj.upvoteCount = complaint.upvotes?.length || 0;
      
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
 * Get analytics for a given committee type (by param)
 * GET /api/committee-analytics/:committeeType
 */
export const getCommitteeAnalytics = async (req, res) => {
  try {
    const { committeeType } = req.params;

    // Map committee types to complaint categories (reuse mapping)
    const committeeCategoryMap = {
      'Hostel': 'Hostel Management',
      'Canteen': 'Cafeteria',
      'Tech Committee': 'Tech-Support',
      'Sports': 'Sports',
      'Disciplinary Action': 'Internal Complaints',
      'Maintenance': 'Hostel Management',
    };

    // Allow some common alternate keys (e.g. 'Tech' vs 'Tech Committee').
    // If we don't have a mapping, fall back to using the committeeType string
    // as the category name — this makes the endpoint more tolerant to values
    // coming from the frontend or seed data.
    const category = committeeCategoryMap[committeeType] || committeeType;

    if (!category) {
      return res.status(200).json({
        total: 0,
        resolved: 0,
        avgResolutionTimeDays: 0,
        resolutionRate: 0,
        category: null,
        committeeType,
      });
    }

    // Fetch complaints for this category
    const complaints = await Complaint.find({ category }).select('createdAt status statusHistory updatedAt');

    const total = complaints.length;

    // Compute resolved count and resolution times
    let resolved = 0;
    let totalResolutionDays = 0;

    for (const c of complaints) {
      // Determine if resolved
      const hasResolvedStatus = c.status === 'resolved' || (c.statusHistory && c.statusHistory.some(s => s.status === 'resolved'));
      if (hasResolvedStatus) {
        resolved += 1;

        // Find resolvedAt from statusHistory if available (first occurrence)
        let resolvedAt = null;
        if (c.statusHistory && c.statusHistory.length) {
          const resolvedEntry = c.statusHistory.find(s => s.status === 'resolved');
          if (resolvedEntry && resolvedEntry.updatedAt) resolvedAt = resolvedEntry.updatedAt;
        }

        // Fallback to updatedAt (mongoose timestamps) if resolvedAt not found
        if (!resolvedAt) {
          // use c.updatedAt if present; createdAt and updatedAt exist because timestamps: true
          resolvedAt = c.updatedAt || null;
        }

        if (resolvedAt) {
          const created = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt);
          const resolvedDate = resolvedAt instanceof Date ? resolvedAt : new Date(resolvedAt);
          const diffMs = resolvedDate - created;
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (!isNaN(diffDays) && diffDays >= 0) totalResolutionDays += diffDays;
        }
      }
    }

    const avgResolutionTimeDays = resolved > 0 ? +(totalResolutionDays / resolved).toFixed(2) : 0;
    const resolutionRate = total > 0 ? +((resolved / total) * 100).toFixed(2) : 0;

    // Compute month-to-date counts (complaints created this month, complaints resolved this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyTotal = await Complaint.countDocuments({
      category,
      createdAt: { $gte: startOfMonth },
    });

    // For monthlyResolved we consider complaints that have a statusHistory entry
    // with status 'resolved' and updatedAt in this month OR have status 'resolved'
    // and updatedAt in this month (fallback)
    const monthlyResolved = await Complaint.countDocuments({
      category,
      $or: [
        { statusHistory: { $elemMatch: { status: 'resolved', updatedAt: { $gte: startOfMonth } } } },
        { status: 'resolved', updatedAt: { $gte: startOfMonth } },
      ],
    });

    res.status(200).json({
      total,
      resolved,
      monthlyTotal,
      monthlyResolved,
      avgResolutionTimeDays,
      resolutionRate,
      category,
      committeeType,
    });
  } catch (error) {
    console.error('Get Committee Analytics Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch committee analytics' });
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

/**
 * Get all complaints (Admin only)
 * GET /api/complaints/all
 */
export const getAllComplaints = async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        message: 'Only admins can access all complaints',
      });
    }

    // Fetch all complaints with user details
    const complaints = await Complaint.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('statusHistory.updatedBy', 'name email')
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
      total: formattedComplaints.length,
    });
  } catch (error) {
    console.error('Get All Complaints Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to fetch all complaints',
    });
  }
};

/**
 * Update complaint status with description (Admin and Committee)
 * PATCH /api/complaints/:id/status
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;
    const user = req.user;

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: pending, in-progress, resolved, rejected',
      });
    }

    // Validate description
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        message: 'Description is required when updating status',
      });
    }

    // Check if user is admin or committee
    if (user.role !== 'admin' && user.role !== 'committee') {
      return res.status(403).json({
        message: 'Only admins and committee members can update complaint status',
      });
    }

    // Find the complaint
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found',
      });
    }

    // If committee, verify they have access to this complaint's category
    if (user.role === 'committee') {
      const committeeCategoryMap = {
        'Hostel': 'Hostel Management',
        'Canteen': 'Cafeteria',
        'Tech Committee': 'Tech-Support',
        'Sports': 'Sports',
        'Disciplinary Action': 'Internal Complaints',
        'Maintenance': 'Hostel Management',
      };

      const allowedCategory = committeeCategoryMap[user.committeeType];
      
      if (complaint.category !== allowedCategory) {
        return res.status(403).json({
          message: 'You do not have permission to update this complaint',
        });
      }
    }

    // Update status and track previous status
    const previousStatus = complaint.status;
    complaint.status = status;

    // Add to status history
    complaint.statusHistory.push({
      status: status,
      description: description.trim(),
      updatedBy: user._id,
      updatedAt: new Date(),
    });

    await complaint.save();

    // Populate the updated complaint
    await complaint.populate('userId', 'name email');
    await complaint.populate('statusHistory.updatedBy', 'name email');

    // If the status actually changed, create a notification and send an email
    if (previousStatus !== status) {
      try {
        const message = `Your complaint \"${complaint.title}\" status was updated to ${status}.`;
        await Notification.create({
          user: complaint.userId._id || complaint.userId,
          complaint: complaint._id,
          type: 'status_update',
          message,
          data: { status, description: description.trim() },
        });

        if (complaint.userId && complaint.userId.email) {
          sendStatusUpdateEmail(complaint.userId.email, complaint.title, status, description.trim())
            .catch((err) => console.error('Failed to send status update email:', err));
        }
      } catch (notifyErr) {
        console.error('Failed to create/send notification:', notifyErr);
      }
    }

    res.status(200).json({
      message: 'Complaint status updated successfully',
      complaint: complaint.toObject(),
    });
  } catch (error) {
    console.error('Update Complaint Status Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to update complaint status',
    });
  }
};

