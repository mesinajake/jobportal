import Company from '../models/Company.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Analytics from '../models/Analytics.js';

// @desc    Create a new company profile
// @route   POST /api/companies
// @access  Private (Employer only)
export const createCompany = async (req, res) => {
  try {
    // Check if user already has a company
    const existingCompany = await Company.findOne({ owner: req.user.id });
    if (existingCompany) {
      return res.status(400).json({ 
        message: 'You already have a company profile' 
      });
    }

    // Verify user is an employer
    const user = await User.findById(req.user.id);
    if (user.role !== 'employer') {
      return res.status(403).json({ 
        message: 'Only employers can create company profiles' 
      });
    }

    const companyData = {
      ...req.body,
      owner: req.user.id,
      subscription: {
        plan: 'free',
        jobPostCredits: 3, // Free plan gets 3 job posts
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    };

    const company = await Company.create(companyData);
    
    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get company by slug
// @route   GET /api/companies/:slug
// @access  Public
export const getCompanyBySlug = async (req, res) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug })
      .populate('owner', 'name email');

    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get company by ID
// @route   GET /api/companies/id/:id
// @access  Public
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('owner', 'name email');

    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Owner only)
export const updateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    // Verify ownership
    if (company.owner.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this company' 
      });
    }

    // Fields that can be updated
    const allowedFields = [
      'name', 'description', 'industry', 'size', 
      'website', 'logo', 'location', 'socialLinks',
      'benefits', 'culture'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        company[field] = req.body[field];
      }
    });

    await company.save();

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get company jobs
// @route   GET /api/companies/:id/jobs
// @access  Public
export const getCompanyJobs = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    const { status = 'active', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { companyRef: company._id };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('postedBy', 'name email');

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get company analytics
// @route   GET /api/companies/:id/analytics
// @access  Private (Owner only)
export const getCompanyAnalytics = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    // Verify ownership
    if (company.owner.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view analytics' 
      });
    }

    const { startDate, endDate } = req.query;

    const stats = await Analytics.getCompanyStats(
      company._id,
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );

    res.json({
      success: true,
      data: {
        companyStats: company.stats,
        analytics: stats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Update company subscription
// @route   PUT /api/companies/:id/subscription
// @access  Private (Owner only)
export const updateSubscription = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    // Verify ownership
    if (company.owner.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update subscription' 
      });
    }

    const { plan, jobPostCredits } = req.body;

    if (plan) {
      company.subscription.plan = plan;
      
      // Set credits based on plan
      const planCredits = {
        free: 3,
        basic: 10,
        premium: 50,
        enterprise: 999
      };
      
      company.subscription.jobPostCredits = planCredits[plan] || 3;
      company.subscription.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    // Manually add/deduct credits (for admin use)
    if (jobPostCredits !== undefined) {
      company.subscription.jobPostCredits += jobPostCredits;
      if (company.subscription.jobPostCredits < 0) {
        company.subscription.jobPostCredits = 0;
      }
    }

    await company.save();

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get user's company (if they own one)
// @route   GET /api/companies/my-company
// @access  Private
export const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ owner: req.user.id })
      .populate('owner', 'name email');

    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'You do not have a company profile' 
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Verify company
// @route   PUT /api/companies/:id/verify
// @access  Private (Admin only)
export const verifyCompany = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can verify companies' 
      });
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    company.verification.isVerified = req.body.verified;
    company.verification.verifiedAt = req.body.verified ? new Date() : null;

    await company.save();

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

export default {
  createCompany,
  getCompanyBySlug,
  getCompanyById,
  updateCompany,
  getCompanyJobs,
  getCompanyAnalytics,
  updateSubscription,
  getMyCompany,
  verifyCompany
};
