import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Analytics from '../models/Analytics.js';
import { fetchExternalJobs } from '../services/jobApiService.js';

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const { search, location, type, category, page = 1, limit = 20, includeExternal = 'false' } = req.query;

    // Build query
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
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

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get internal jobs
    const internalJobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    let allJobs = internalJobs;

    // Optionally fetch external jobs
    if (includeExternal === 'true') {
      try {
        const externalJobs = await fetchExternalJobs({ search, location, page });
        allJobs = [...internalJobs, ...externalJobs];
      } catch (error) {
        console.error('Error fetching external jobs:', error.message);
      }
    }

    res.status(200).json({
      success: true,
      count: allJobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: allJobs
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
      .populate('companyRef', 'name logo website location description');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Track analytics (async, don't wait)
    Analytics.trackEvent({
      eventType: 'view',
      job: job._id,
      company: job.companyRef?._id || null,
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

    // Update company stats if applicable
    if (job.companyRef) {
      Company.findByIdAndUpdate(job.companyRef, {
        $inc: { 'stats.views': 1 }
      }).catch(err => console.error('Company stats error:', err));
    }

    res.status(200).json({
      success: true,
      data: job
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
// @access  Private (Employer/Admin)
export const createJob = async (req, res) => {
  try {
    // Check if user has a company profile
    const company = await Company.findOne({ owner: req.user.id });

    // Check job post credits if company exists
    if (company) {
      if (company.subscription.jobPostCredits <= 0) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient job post credits. Please upgrade your subscription.'
        });
      }
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
        'paranaque': [121.0196, 14.4793],
        'las pinas': [120.9833, 14.4500]
      };
      
      const normalized = location.toLowerCase().trim();
      return cityCoords[normalized] || [121.0244, 14.5547]; // Default to Makati
    };

    // Prepare locationDetails with proper GeoJSON structure
    const workArrangement = req.body.locationType || 'onsite';
    let locationDetails;

    // Only add GeoJSON structure for non-remote jobs
    if (workArrangement !== 'remote') {
      const coordinates = getCityCoordinates(req.body.location);
      locationDetails = {
        type: 'Point',
        coordinates: coordinates, // [longitude, latitude]
        workArrangement: workArrangement
      };
      console.log('✅ LocationDetails with coordinates:', locationDetails);
    } else {
      // For remote jobs, only include workArrangement
      locationDetails = {
        workArrangement: 'remote'
      };
      console.log('✅ LocationDetails for remote job:', locationDetails);
    }

    // Prepare job data
    const jobData = {
      ...req.body,
      postedBy: req.user.id,
      source: 'internal',
      locationDetails // Add proper locationDetails
    };

    // Add company reference if exists
    if (company) {
      jobData.companyRef = company._id;
      jobData.company = company.name;
      jobData.companyLogo = company.logo;
    } else {
      // If no company profile exists, use user's email or a default
      jobData.company = req.user.email || 'Unspecified Company';
    }

    // Generate slug from title and company
    const slug = `${jobData.title}-${jobData.company}`
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
    
    jobData.slug = `${slug}-${Date.now()}`;

    console.log('Creating job with data:', JSON.stringify(jobData, null, 2));

    const job = await Job.create(jobData);

    // Deduct job post credit and update company stats only for non-draft
    if (company && jobData.status !== 'draft') {
      company.subscription.jobPostCredits -= 1;
      company.stats.totalJobs += 1;
      company.stats.activeJobs += 1;
      await company.save();
    }

    res.status(201).json({
      success: true,
      message: jobData.status === 'draft' ? 'Job saved as draft' : 'Job created successfully',
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

// @desc    Search jobs with external APIs
// @route   GET /api/jobs/search/external
// @access  Public
export const searchExternalJobs = async (req, res) => {
  try {
    const { search, location, page = 1 } = req.query;

    const jobs = await fetchExternalJobs({ search, location, page });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
