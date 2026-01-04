import JobAlert from '../models/JobAlert.js';
import Job from '../models/Job.js';

// @desc    Create a new job alert
// @route   POST /api/alerts
// @access  Private
export const createJobAlert = async (req, res) => {
  try {
    const alertData = {
      ...req.body,
      user: req.user.id
    };

    const alert = await JobAlert.create(alertData);

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's job alerts
// @route   GET /api/alerts
// @access  Private
export const getUserAlerts = async (req, res) => {
  try {
    const alerts = await JobAlert.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single job alert
// @route   GET /api/alerts/:id
// @access  Private
export const getJobAlert = async (req, res) => {
  try {
    const alert = await JobAlert.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update job alert
// @route   PUT /api/alerts/:id
// @access  Private
export const updateJobAlert = async (req, res) => {
  try {
    const alert = await JobAlert.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'name', 'keywords', 'location', 'locationCoordinates', 'radius',
      'jobType', 'categories', 'salaryMin', 'experienceLevel',
      'remoteOnly', 'frequency', 'isActive'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        alert[field] = req.body[field];
      }
    });

    await alert.save();

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete job alert
// @route   DELETE /api/alerts/:id
// @access  Private
export const deleteJobAlert = async (req, res) => {
  try {
    const alert = await JobAlert.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Test job alert (preview matching jobs)
// @route   GET /api/alerts/:id/test
// @access  Private
export const testJobAlert = async (req, res) => {
  try {
    const alert = await JobAlert.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Build query from alert criteria
    const query = alert.buildJobQuery();

    // Handle location-based search if coordinates provided
    let jobs;
    if (alert.locationCoordinates && alert.locationCoordinates.coordinates.length === 2) {
      jobs = await Job.find({
        ...query,
        'locationDetails.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: alert.locationCoordinates.coordinates
            },
            $maxDistance: alert.radius * 1000 // Convert km to meters
          }
        }
      })
        .limit(10)
        .sort({ createdAt: -1 })
        .populate('companyRef', 'name logo');
    } else {
      jobs = await Job.find(query)
        .limit(10)
        .sort({ createdAt: -1 })
        .populate('companyRef', 'name logo');
    }

    res.json({
      success: true,
      data: {
        matchCount: jobs.length,
        sampleJobs: jobs,
        criteria: {
          keywords: alert.keywords,
          location: alert.location,
          jobType: alert.jobType,
          categories: alert.categories,
          salaryMin: alert.salaryMin,
          experienceLevel: alert.experienceLevel,
          remoteOnly: alert.remoteOnly
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle alert active status
// @route   PATCH /api/alerts/:id/toggle
// @access  Private
export const toggleJobAlert = async (req, res) => {
  try {
    const alert = await JobAlert.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.isActive = !alert.isActive;
    await alert.save();

    res.json({
      success: true,
      data: alert,
      message: `Alert ${alert.isActive ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get matching jobs for all user's active alerts (for scheduled processing)
// @route   GET /api/alerts/process
// @access  Private (Internal use / Cron job)
export const processAlerts = async (req, res) => {
  try {
    const alerts = await JobAlert.find({
      user: req.user.id,
      isActive: true
    });

    const results = [];

    for (const alert of alerts) {
      // Check if alert should be sent based on frequency
      if (!alert.shouldSend()) {
        continue;
      }

      const query = alert.buildJobQuery();
      
      // Add time filter - only jobs created since last check
      const lastChecked = alert.lastCheckedAt || alert.createdAt;
      query.createdAt = { $gte: lastChecked };

      const jobs = await Job.find(query)
        .limit(20)
        .sort({ createdAt: -1 })
        .populate('companyRef', 'name logo');

      if (jobs.length > 0) {
        results.push({
          alert: {
            id: alert._id,
            name: alert.name,
            frequency: alert.frequency
          },
          jobsCount: jobs.length,
          jobs: jobs
        });

        // Update alert tracking
        alert.lastSentAt = new Date();
        alert.lastCheckedAt = new Date();
        alert.totalJobsSent += jobs.length;
        await alert.save();
      }
    }

    res.json({
      success: true,
      alertsProcessed: alerts.length,
      alertsWithMatches: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  createJobAlert,
  getUserAlerts,
  getJobAlert,
  updateJobAlert,
  deleteJobAlert,
  testJobAlert,
  toggleJobAlert,
  processAlerts
};
