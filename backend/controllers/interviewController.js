import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Job from '../models/Job.js';

// @desc    Get interviews (with filters)
// @route   GET /api/interviews
// @access  Private
export const getInterviews = async (req, res) => {
  try {
    const { 
      application, 
      job, 
      candidate, 
      status, 
      startDate, 
      endDate,
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {};

    // For candidates, only show their own interviews
    if (req.user.role === 'candidate') {
      query.candidate = req.user.id;
    } else {
      // Staff can filter
      if (application) query.application = application;
      if (job) query.job = job;
      if (candidate) query.candidate = candidate;
    }

    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.scheduledAt = {};
      if (startDate) query.scheduledAt.$gte = new Date(startDate);
      if (endDate) query.scheduledAt.$lte = new Date(endDate);
    }

    const interviews = await Interview.find(query)
      .populate('application', 'status')
      .populate('job', 'title department')
      .populate('candidate', 'name email avatar')
      .populate('interviewers.user', 'name email avatar jobTitle')
      .populate('createdBy', 'name')
      .sort({ scheduledAt: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Interview.countDocuments(query);

    res.status(200).json({
      success: true,
      count: interviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single interview
// @route   GET /api/interviews/:id
// @access  Private
export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('application')
      .populate('job', 'title department location')
      .populate('candidate', 'name email phone avatar')
      .populate('interviewers.user', 'name email avatar jobTitle')
      .populate('feedback.interviewer', 'name avatar')
      .populate('result.decidedBy', 'name')
      .populate('createdBy', 'name');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check access
    if (req.user.role === 'candidate' && interview.candidate.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Schedule new interview
// @route   POST /api/interviews
// @access  Private (Recruiter+)
export const scheduleInterview = async (req, res) => {
  try {
    const {
      applicationId,
      round,
      type,
      title,
      interviewers,
      scheduledAt,
      duration,
      timezone,
      location,
      publicNotes
    } = req.body;

    // Validate application
    const application = await Application.findById(applicationId)
      .populate('job', 'title department')
      .populate('user', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check for scheduling conflicts for interviewers
    const scheduledDate = new Date(scheduledAt);
    const endDate = new Date(scheduledDate.getTime() + (duration || 60) * 60000);

    for (const interviewer of interviewers || []) {
      const conflict = await Interview.findOne({
        'interviewers.user': interviewer.user,
        status: { $in: ['scheduled', 'confirmed'] },
        $or: [
          {
            scheduledAt: { $lt: endDate },
            $expr: {
              $gt: [
                { $add: ['$scheduledAt', { $multiply: ['$duration', 60000] }] },
                scheduledDate
              ]
            }
          }
        ]
      });

      if (conflict) {
        const interviewerUser = await User.findById(interviewer.user).select('name');
        return res.status(400).json({
          success: false,
          message: `${interviewerUser?.name || 'An interviewer'} has a scheduling conflict at this time`
        });
      }
    }

    const interview = await Interview.create({
      application: applicationId,
      job: application.job._id,
      candidate: application.user._id,
      round: round || 1,
      type: type || 'phone_screen',
      title: title || `Round ${round || 1} - ${type || 'Interview'}`,
      interviewers: interviewers || [],
      scheduledAt,
      duration: duration || 60,
      timezone: timezone || 'America/New_York',
      location: location || { type: 'video', platform: 'zoom' },
      publicNotes,
      createdBy: req.user.id
    });

    // Update application status
    if (application.status === 'pending' || application.status === 'screening') {
      await application.updateStatus('phone_screen', req.user.id, 'Interview scheduled');
    }

    // Populate for response
    await interview.populate([
      { path: 'candidate', select: 'name email' },
      { path: 'interviewers.user', select: 'name email' },
      { path: 'job', select: 'title' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update interview
// @route   PUT /api/interviews/:id
// @access  Private (Recruiter+)
export const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    const {
      scheduledAt,
      duration,
      location,
      interviewers,
      status,
      publicNotes,
      internalNotes
    } = req.body;

    // Track rescheduling
    if (scheduledAt && new Date(scheduledAt).getTime() !== interview.scheduledAt.getTime()) {
      interview.rescheduleHistory.push({
        previousDate: interview.scheduledAt,
        newDate: new Date(scheduledAt),
        reason: req.body.rescheduleReason || 'Rescheduled',
        requestedBy: req.user.id
      });
      interview.scheduledAt = scheduledAt;
      interview.status = 'rescheduled';
    }

    if (duration) interview.duration = duration;
    if (location) interview.location = { ...interview.location, ...location };
    if (interviewers) interview.interviewers = interviewers;
    if (status) interview.status = status;
    if (publicNotes !== undefined) interview.publicNotes = publicNotes;
    if (internalNotes !== undefined) interview.internalNotes = internalNotes;

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel interview
// @route   DELETE /api/interviews/:id
// @access  Private (Recruiter+)
export const cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    interview.status = 'cancelled';
    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Submit interview feedback
// @route   POST /api/interviews/:id/feedback
// @access  Private (Interviewers)
export const submitFeedback = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user is an interviewer
    const isInterviewer = interview.interviewers.some(
      i => i.user.toString() === req.user.id
    );

    if (!isInterviewer && !['hr', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only interviewers can submit feedback'
      });
    }

    const {
      ratings,
      recommendation,
      strengths,
      areasOfImprovement,
      notes,
      privateNotes
    } = req.body;

    // Check if already submitted
    const existingFeedback = interview.feedback.find(
      f => f.interviewer.toString() === req.user.id
    );

    if (existingFeedback) {
      // Update existing feedback
      Object.assign(existingFeedback, {
        ratings,
        recommendation,
        strengths,
        areasOfImprovement,
        notes,
        privateNotes,
        submittedAt: new Date()
      });
    } else {
      // Add new feedback
      interview.feedback.push({
        interviewer: req.user.id,
        submittedAt: new Date(),
        ratings,
        recommendation,
        strengths,
        areasOfImprovement,
        notes,
        privateNotes
      });
    }

    // Mark as completed if all feedback received
    if (interview.isFeedbackComplete()) {
      interview.status = 'completed';
    }

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Candidate responds to interview invite
// @route   PUT /api/interviews/:id/respond
// @access  Private (Candidate)
export const respondToInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Verify it's the candidate
    if (interview.candidate.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { response, note } = req.body; // response: 'accepted', 'declined', 'rescheduled'

    interview.candidateResponse = {
      status: response,
      respondedAt: new Date(),
      note
    };

    if (response === 'accepted') {
      interview.status = 'confirmed';
    } else if (response === 'declined') {
      interview.status = 'cancelled';
    }

    await interview.save();

    res.status(200).json({
      success: true,
      message: `Interview ${response}`,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my interviews (for interviewers)
// @route   GET /api/interviews/my-schedule
// @access  Private
export const getMySchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      'interviewers.user': req.user.id,
      status: { $in: ['scheduled', 'confirmed', 'rescheduled'] }
    };

    if (startDate || endDate) {
      query.scheduledAt = {};
      if (startDate) query.scheduledAt.$gte = new Date(startDate);
      if (endDate) query.scheduledAt.$lte = new Date(endDate);
    }

    const interviews = await Interview.find(query)
      .populate('job', 'title')
      .populate('candidate', 'name email avatar')
      .populate('interviewers.user', 'name')
      .sort({ scheduledAt: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Make hiring decision after interview
// @route   POST /api/interviews/:id/decision
// @access  Private (Hiring Manager+)
export const makeDecision = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    const { decision, notes } = req.body; // decision: 'advance', 'hold', 'reject', 'offer'

    interview.result = {
      decision,
      decidedBy: req.user.id,
      decidedAt: new Date(),
      notes
    };

    await interview.save();

    // Update application status based on decision
    const application = await Application.findById(interview.application);
    if (application) {
      const statusMap = {
        'advance': 'interviewing',
        'offer': 'offer_pending',
        'reject': 'rejected',
        'hold': 'on_hold'
      };
      
      if (statusMap[decision]) {
        await application.updateStatus(
          statusMap[decision], 
          req.user.id, 
          `Decision after round ${interview.round}: ${decision}`
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Decision recorded: ${decision}`,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
