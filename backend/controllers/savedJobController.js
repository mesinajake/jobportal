import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';

// @desc    Get all saved jobs for current user
// @route   GET /api/saved-jobs
// @access  Private
export const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user.id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: savedJobs.length,
      data: savedJobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Save a job
// @route   POST /api/saved-jobs
// @access  Private
export const saveJob = async (req, res) => {
  try {
    const { jobId, notes } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({ user: req.user.id, job: jobId });
    if (existingSave) {
      return res.status(400).json({
        success: false,
        message: 'Job already saved'
      });
    }

    const savedJob = await SavedJob.create({
      user: req.user.id,
      job: jobId,
      notes
    });

    await savedJob.populate('job');

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: savedJob
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove saved job
// @route   DELETE /api/saved-jobs/:id
// @access  Private
export const removeSavedJob = async (req, res) => {
  try {
    const savedJob = await SavedJob.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found'
      });
    }

    await savedJob.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Saved job removed successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update saved job (notes, status)
// @route   PUT /api/saved-jobs/:id
// @access  Private
export const updateSavedJob = async (req, res) => {
  try {
    let savedJob = await SavedJob.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found'
      });
    }

    savedJob = await SavedJob.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('job');

    res.status(200).json({
      success: true,
      message: 'Saved job updated successfully',
      data: savedJob
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
