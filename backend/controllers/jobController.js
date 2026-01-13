import Job from '../models/Job.js';
import Department from '../models/Department.js';
import Analytics from '../models/Analytics.js';
import { companyConfig } from '../config/company.js';

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const { 
      search, 
      location, 
      type, 
      category, 
      department,
      experienceLevel,
      workArrangement,
      page = 1, 
      limit = 20 
    } = req.query;

    // Build query
    const query = { isActive: true, status: 'open' };

    // For public/candidates, hide internal-only jobs
    if (!req.user || req.user.role === 'candidate') {
      query.internalOnly = false;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (department) {
      query.department = department;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (workArrangement) {
      query['locationDetails.workArrangement'] = workArrangement;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get jobs
    const jobs = await Job.find(query)
      .populate('department', 'name code color')
      .populate('hiringManager', 'name')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    // Add company info to each job
    const jobsWithCompany = jobs.map(job => ({
      ...job.toObject(),
      company: companyConfig.name,
      companyLogo: companyConfig.logo
    }));

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: jobsWithCompany
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single job by ID or slug
// @route   GET /api/jobs/:id
// @access  Public
export const getJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      isActive: true
    })
      .populate('postedBy', 'name email')
      .populate('department', 'name code description color')
      .populate('hiringManager', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check internal-only access
    if (job.internalOnly && (!req.user || req.user.role === 'candidate')) {
      return res.status(403).json({
        success: false,
        message: 'This is an internal position'
      });
    }

    // Track analytics (async, don't wait)
    Analytics.trackEvent({
      eventType: 'view',
      job: job._id,
      department: job.department?._id || null,
      user: req.user ? req.user.id : null,
      sessionId: req.sessionID || req.ip,
      device: {
        userAgent: req.headers['user-agent']
      },
      referrer: {
        url: req.headers.referer || req.headers.referrer
      }
    }).catch(err => console.error('Analytics error:', err));

    // Increment views
    job.views += 1;
    await job.save();

    // Add company info
    const jobData = {
      ...job.toObject(),
      company: companyConfig.name,
      companyLogo: companyConfig.logo,
      companyWebsite: companyConfig.website
    };

    res.status(200).json({
      success: true,
      data: jobData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Recruiter/HR/Admin)
export const createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      description,
      location,
      type,
      category,
      experienceLevel,
      skills,
      requirements,
      responsibilities,
      benefits,
      salaryDetails,
      positions,
      internalOnly,
      referralBonus,
      hiringManager
    } = req.body;

    // Validate department exists
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department'
      });
    }

    // Helper function for known city coordinates (fallback)
    const getCityCoordinates = (location) => {
      const cityCoords = {
        'manila': [120.9842, 14.5995],
        'quezon city': [121.0437, 14.6760],
        'calamba': [121.1655, 14.2118],
        'cebu': [123.8854, 10.3157],
        'davao': [125.6125, 7.0731],
        'makati': [121.0244, 14.5547],
        'taguig': [121.0509, 14.5176],
        'pasig': [121.0851, 14.5764],
        'san francisco': [-122.4194, 37.7749],
        'new york': [-74.0060, 40.7128],
        'austin': [-97.7431, 30.2672],
        'london': [-0.1276, 51.5074]
      };
      
      const normalized = location.toLowerCase().trim();
      return cityCoords[normalized] || null;
    };

    // Prepare locationDetails with proper GeoJSON structure
    const workArrangement = req.body.locationType || 'onsite';
    let locationDetails;

    // Only add GeoJSON structure for non-remote jobs
    if (workArrangement !== 'remote') {
      const coordinates = getCityCoordinates(location);
      if (coordinates) {
        locationDetails = {
          type: 'Point',
          coordinates: coordinates,
          workArrangement: workArrangement
        };
      } else {
        locationDetails = {
          workArrangement: workArrangement
        };
      }
    } else {
      locationDetails = {
        workArrangement: 'remote'
      };
    }

    // Generate slug from title
    const slug = `${title}`
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    // Determine initial status based on approval workflow
    const requiresApproval = companyConfig.approvalWorkflow.requireJobApproval;
    const initialStatus = requiresApproval ? 'pending_approval' : 'open';

    // Prepare job data
    const jobData = {
      title,
      department,
      hiringManager: hiringManager || req.user.id,
      description,
      location,
      locationDetails,
      type,
      category,
      experienceLevel,
      skills,
      requirements,
      responsibilities,
      benefits: benefits || companyConfig.benefits,
      salaryDetails,
      positions: positions || 1,
      internalOnly: internalOnly || false,
      referralBonus: referralBonus || companyConfig.careerPage.referralBonusDefault,
      postedBy: req.user.id,
      slug: `${slug}-${Date.now()}`,
      status: req.body.status === 'draft' ? 'draft' : initialStatus
    };

    // Add approval info if submitted
    if (jobData.status === 'pending_approval') {
      jobData.approvalInfo = {
        submittedAt: new Date(),
        submittedBy: req.user.id
      };
    }

    const job = await Job.create(jobData);

    // Populate for response
    await job.populate([
      { path: 'department', select: 'name code' },
      { path: 'hiringManager', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: jobData.status === 'draft' 
        ? 'Job saved as draft' 
        : requiresApproval 
          ? 'Job submitted for approval'
          : 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating job'
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer/Admin - Own jobs only)
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Make sure user is job owner or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer/Admin - Own jobs only)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Make sure user is job owner or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve a job posting
// @route   PUT /api/jobs/:id/approve
// @access  Private (Hiring Manager/HR/Admin)
export const approveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Job is not pending approval'
      });
    }

    job.status = 'open';
    job.approvalInfo.approvedAt = new Date();
    job.approvalInfo.approvedBy = req.user.id;
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job approved and published',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject a job posting
// @route   PUT /api/jobs/:id/reject
// @access  Private (Hiring Manager/HR/Admin)
export const rejectJob = async (req, res) => {
  try {
    const { reason } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Job is not pending approval'
      });
    }

    job.status = 'cancelled';
    job.approvalInfo.rejectedAt = new Date();
    job.approvalInfo.rejectedBy = req.user.id;
    job.approvalInfo.rejectionReason = reason || 'No reason provided';
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job rejected',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get jobs pending approval
// @route   GET /api/jobs/pending-approval
// @access  Private (HR/Admin)
export const getPendingJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const query = { status: 'pending_approval' };

    // Hiring managers can only see their department's jobs
    if (req.user.role === 'hiring_manager' && req.user.department) {
      query.department = req.user.department;
    }

    const jobs = await Job.find(query)
      .populate('department', 'name code')
      .populate('postedBy', 'name email')
      .populate('approvalInfo.submittedBy', 'name')
      .sort({ 'approvalInfo.submittedAt': 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get jobs by department
// @route   GET /api/jobs/by-department/:departmentId
// @access  Public
export const getJobsByDepartment = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const query = { 
      department: req.params.departmentId,
      status: 'open',
      isActive: true
    };

    // Hide internal jobs for non-staff
    if (!req.user || req.user.role === 'candidate') {
      query.internalOnly = false;
    }

    const jobs = await Job.find(query)
      .populate('department', 'name code color')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    // Add company info
    const jobsWithCompany = jobs.map(job => ({
      ...job.toObject(),
      company: companyConfig.name,
      companyLogo: companyConfig.logo
    }));

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: jobsWithCompany
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
