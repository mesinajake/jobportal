import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Analytics from '../models/Analytics.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Submit job application (Job Seekers only)
// @route   POST /api/applications
// @access  Private (jobseeker)
router.post('/', protect, authorize('jobseeker'), async (req, res) => {
  try {
    const { jobId, coverLetter, resumeUrl } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId).populate('companyRef');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
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
      company: job.companyRef?._id || null,
      coverLetter,
      resume: resumeUrl,
      resumeDetails: {
        url: resumeUrl,
        uploadedAt: new Date()
      }
    });

    // Update job application count
    job.applications += 1;
    await job.save();

    // Update company stats
    if (job.companyRef) {
      await Company.findByIdAndUpdate(job.companyRef, {
        $inc: { 'stats.totalApplications': 1 }
      });
    }

    // Track analytics
    Analytics.trackEvent({
      eventType: 'apply',
      job: jobId,
      company: job.companyRef?._id || null,
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

// @desc    Get user's applications (Job Seekers only)
// @route   GET /api/applications/my-applications
// @access  Private (jobseeker)
router.get('/my-applications', protect, authorize('jobseeker'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('job', 'title company location salary type')
      .populate('company', 'name logo')
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

// @desc    Get applications for employer's jobs (Employers only)
// @route   GET /api/applications/received
// @access  Private (employer)
router.get('/received', protect, authorize('employer'), async (req, res) => {
  try {
    const { status, jobId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get employer's company
    const company = await Company.findOne({ owner: req.user.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    // Build query
    const query = { company: company._id };
    if (status) {
      query.status = status;
    }
    if (jobId) {
      query.job = jobId;
    }

    const applications = await Application.find(query)
      .populate('user', 'name email skills bio resume')
      .populate('job', 'title location salary type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    // Get stats
    const stats = await Application.aggregate([
      { $match: { company: company._id } },
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

// @desc    Update application status (Employers only)
// @route   PUT /api/applications/:id/status
// @access  Private (employer)
router.put('/:id/status', protect, authorize('employer'), async (req, res) => {
  try {
    const { status, note } = req.body;

    const application = await Application.findById(req.params.id).populate('company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify employer owns the company
    if (application.company.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update status using method
    await application.updateStatus(status, req.user.id, note);

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

// @desc    Withdraw application (Job Seekers only)
// @route   PUT /api/applications/:id/withdraw
// @access  Private (jobseeker)
router.put('/:id/withdraw', protect, authorize('jobseeker'), async (req, res) => {
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
// @access  Private (owner or employer)
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email skills bio resume')
      .populate('job', 'title company location salary type requirements')
      .populate('company', 'name logo website');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    const isOwner = application.user._id.toString() === req.user.id;
    const isEmployer = application.company && 
                       application.company.owner.toString() === req.user.id;

    if (!isOwner && !isEmployer && req.user.role !== 'admin') {
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
