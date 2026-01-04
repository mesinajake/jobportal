import Analytics from '../models/Analytics.js';
import Job from '../models/Job.js';

// @desc    Track an analytics event
// @route   POST /api/analytics/track
// @access  Public
export const trackEvent = async (req, res) => {
  try {
    const { eventType, jobId, deviceType, browser, os, source } = req.body;

    // Get job to extract company reference
    const job = await Job.findById(jobId);

    const eventData = {
      eventType,
      job: jobId,
      company: job?.companyRef || null,
      user: req.user ? req.user.id : null,
      sessionId: req.sessionID || req.ip,
      device: {
        type: deviceType,
        browser: browser,
        os: os,
        userAgent: req.headers['user-agent']
      },
      location: {
        // In production, you would use IP geolocation service
        city: req.body.city,
        country: req.body.country
      },
      referrer: {
        source: source,
        url: req.headers.referer || req.headers.referrer
      },
      metadata: req.body.metadata || {}
    };

    await Analytics.trackEvent(eventData);

    res.status(200).json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    // Analytics should fail silently - don't break user experience
    console.error('Analytics tracking error:', error);
    res.status(200).json({
      success: true,
      message: 'Event received'
    });
  }
};

// @desc    Get job analytics
// @route   GET /api/analytics/jobs/:jobId
// @access  Private
export const getJobAnalytics = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify job exists and user has permission
    const job = await Job.findById(jobId).populate('companyRef');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job or company
    if (job.postedBy.toString() !== req.user.id) {
      if (!job.companyRef || job.companyRef.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view analytics'
        });
      }
    }

    const stats = await Analytics.getJobStats(
      jobId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    // Get daily breakdown
    const dailyStats = await Analytics.aggregate([
      {
        $match: {
          job: job._id,
          timestamp: {
            $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            $lte: endDate ? new Date(endDate) : new Date()
          }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            eventType: '$eventType'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          events: {
            $push: {
              type: '$_id.eventType',
              count: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats,
        daily: dailyStats
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
// @route   GET /api/analytics/companies/:companyId
// @access  Private
export const getCompanyAnalytics = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;

    const Company = (await import('../models/Company.js')).default;
    const company = await Company.findById(companyId);

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

    const stats = await Analytics.getCompanyStats(
      companyId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user analytics (jobs they've interacted with)
// @route   GET /api/analytics/my-activity
// @access  Private
export const getUserAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      user: req.user.id,
      timestamp: {
        $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lte: endDate ? new Date(endDate) : new Date()
      }
    };

    const activity = await Analytics.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          jobs: { $addToSet: '$job' }
        }
      }
    ]);

    // Get most viewed jobs
    const topJobs = await Analytics.aggregate([
      { $match: { ...query, eventType: 'view' } },
      {
        $group: {
          _id: '$job',
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobDetails'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        activity,
        topJobs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  trackEvent,
  getJobAnalytics,
  getCompanyAnalytics,
  getUserAnalytics
};
