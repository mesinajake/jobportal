import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Analytics from '../models/Analytics.js';
import { protect } from '../middleware/auth.js';
import { requirePermission, requireRole, isStaff } from '../middleware/roleAccess.js';

const router = express.Router();

// @desc    Submit job application (Candidates only)
// @route   POST /api/applications
// @access  Private (candidate)
router.post('/', protect, requireRole('candidate'), async (req, res) => {
  try {
    const { jobId, coverLetter, resumeUrl, referralNote } = req.body;

    // Check if job exists and is open
    const job = await Job.findById(jobId).populate('department');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This position is no longer accepting applications'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      user: req.user.id,
      job: jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Create application
    const application = await Application.create({
      user: req.user.id,
      job: jobId,
      department: job.department?._id,
      coverLetter,
      resume: resumeUrl || req.user.resume,
      resumeDetails: {
        url: resumeUrl || req.user.resume,
        uploadedAt: new Date()
      },
      referralNote,
      currentStage: 'applied'
    });

    // Update job application count
    job.applications = (job.applications || 0) + 1;
    await job.save();

    // Track analytics
    Analytics.trackEvent({
      eventType: 'apply',
      job: jobId,
      user: req.user.id
    }).catch(err => console.error('Analytics error:', err));

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get user's applications (Candidates only)
// @route   GET /api/applications/my-applications
// @access  Private (candidate)
router.get('/my-applications', protect, requireRole('candidate'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('job', 'title location employmentType workArrangement salaryRange')
      .populate('department', 'name color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      count: applications.length,
      total,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get applications for staff (Recruiters, Hiring Managers, HR, Admin)
// @route   GET /api/applications/received
// @access  Private (staff)
router.get('/received', protect, requirePermission('view_applications'), async (req, res) => {
  try {
    const { status, jobId, departmentId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (jobId) query.job = jobId;
    if (departmentId) query.department = departmentId;

    // If hiring manager, only show their department's applications
    if (req.user.role === 'hiring_manager' && req.user.department) {
      query.department = req.user.department;
    }

    const applications = await Application.find(query)
      .populate('user', 'name email skills bio resume')
      .populate('job', 'title location employmentType')
      .populate('department', 'name color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    // Get stats
    const stats = await Application.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      count: applications.length,
      total,
      data: applications,
      stats: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update application status (Staff only)
// @route   PUT /api/applications/:id/status
// @access  Private (staff with manage_applications permission)
router.put('/:id/status', protect, requirePermission('manage_applications'), async (req, res) => {
  try {
    const { status, note } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('department');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // For hiring managers, verify they have access to this department
    if (req.user.role === 'hiring_manager' && req.user.department) {
      if (application.department?._id.toString() !== req.user.department.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update applications from other departments'
        });
      }
    }

    // Update status
    const previousStatus = application.status;
    application.status = status;
    application.currentStage = status;
    
    // Add to status history if the method exists
    if (application.statusHistory) {
      application.statusHistory.push({
        status,
        changedBy: req.user.id,
        note,
        changedAt: new Date()
      });
    }

    // Handle rejection
    if (status === 'rejected') {
      application.rejectedAt = new Date();
      application.rejectedBy = req.user.id;
      application.rejectionReason = note;
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Withdraw application (Candidates only)
// @route   PUT /api/applications/:id/withdraw
// @access  Private (candidate)
router.put('/:id/withdraw', protect, requireRole('candidate'), async (req, res) => {
  try {
    const { reason } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status === 'withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'Application already withdrawn'
      });
    }

    application.status = 'withdrawn';
    application.withdrawnAt = new Date();
    application.withdrawnReason = reason;
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private (owner or staff)
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email skills bio resume')
      .populate('job', 'title location employmentType requirements responsibilities')
      .populate('department', 'name color');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    const isOwner = application.user._id.toString() === req.user.id;
    const staffMember = isStaff(req.user.role);

    if (!isOwner && !staffMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
