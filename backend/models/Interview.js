import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    // Link to application
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true
    },
    // Link to job for easy querying
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    // Candidate being interviewed
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Interview round number
    round: {
      type: Number,
      required: true,
      default: 1
    },
    // Type of interview
    type: {
      type: String,
      enum: [
        'phone_screen',
        'technical',
        'behavioral',
        'cultural_fit',
        'hiring_manager',
        'hr_round',
        'panel',
        'executive',
        'final'
      ],
      default: 'phone_screen'
    },
    // Interview title/name
    title: {
      type: String,
      trim: true
    },
    // Interviewers
    interviewers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        default: 'interviewer' // 'lead', 'interviewer', 'observer'
      },
      confirmed: {
        type: Boolean,
        default: false
      }
    }],
    // Scheduling
    scheduledAt: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      default: 60
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    // Location / Meeting details
    location: {
      type: {
        type: String,
        enum: ['in_person', 'video', 'phone'],
        default: 'video'
      },
      address: String, // For in-person interviews
      meetingLink: String, // For video interviews
      meetingId: String,
      meetingPassword: String,
      platform: {
        type: String,
        enum: ['zoom', 'teams', 'google_meet', 'phone', 'custom'],
        default: 'zoom'
      },
      phoneNumber: String, // For phone interviews
      notes: String // e.g., "Ask for John at reception"
    },
    // Status
    status: {
      type: String,
      enum: [
        'scheduled',
        'confirmed',
        'rescheduled',
        'in_progress',
        'completed',
        'cancelled',
        'no_show'
      ],
      default: 'scheduled'
    },
    // Candidate response to invite
    candidateResponse: {
      status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'rescheduled'],
        default: 'pending'
      },
      respondedAt: Date,
      note: String
    },
    // Interview feedback from each interviewer
    feedback: [{
      interviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      submittedAt: Date,
      // Rating scores (1-5)
      ratings: {
        technicalSkills: { type: Number, min: 1, max: 5 },
        communication: { type: Number, min: 1, max: 5 },
        problemSolving: { type: Number, min: 1, max: 5 },
        cultureFit: { type: Number, min: 1, max: 5 },
        overall: { type: Number, min: 1, max: 5 }
      },
      // Recommendation
      recommendation: {
        type: String,
        enum: ['strong_hire', 'hire', 'no_decision', 'no_hire', 'strong_no_hire']
      },
      // Detailed feedback
      strengths: [String],
      areasOfImprovement: [String],
      notes: String,
      // Private notes (not shared with other interviewers)
      privateNotes: String
    }],
    // Overall interview result (filled after all feedback)
    result: {
      decision: {
        type: String,
        enum: ['advance', 'hold', 'reject', 'offer', 'pending']
      },
      decidedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      decidedAt: Date,
      notes: String
    },
    // Reminders
    reminders: {
      candidateReminded: Boolean,
      candidateRemindedAt: Date,
      interviewersReminded: Boolean,
      interviewersRemindedAt: Date
    },
    // Calendar integration
    calendarEventId: String, // External calendar event ID
    // Rescheduling history
    rescheduleHistory: [{
      previousDate: Date,
      newDate: Date,
      reason: String,
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      requestedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Notes visible to all
    publicNotes: String,
    // Internal notes for HR/recruiters only
    internalNotes: String,
    // Created by
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for common queries
interviewSchema.index({ application: 1, round: 1 });
interviewSchema.index({ candidate: 1, scheduledAt: -1 });
interviewSchema.index({ 'interviewers.user': 1, scheduledAt: -1 });
interviewSchema.index({ job: 1, status: 1 });
interviewSchema.index({ scheduledAt: 1, status: 1 });

// Virtual for interview duration end time
interviewSchema.virtual('endsAt').get(function() {
  if (this.scheduledAt && this.duration) {
    return new Date(this.scheduledAt.getTime() + this.duration * 60000);
  }
  return null;
});

// Virtual for average rating
interviewSchema.virtual('averageRating').get(function() {
  if (!this.feedback || this.feedback.length === 0) return null;
  
  const ratings = this.feedback
    .filter(f => f.ratings?.overall)
    .map(f => f.ratings.overall);
  
  if (ratings.length === 0) return null;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
});

// Method to check if all interviewers have submitted feedback
interviewSchema.methods.isFeedbackComplete = function() {
  if (!this.interviewers || this.interviewers.length === 0) return false;
  
  const interviewerIds = this.interviewers.map(i => i.user.toString());
  const feedbackIds = this.feedback.map(f => f.interviewer.toString());
  
  return interviewerIds.every(id => feedbackIds.includes(id));
};

interviewSchema.set('toJSON', { virtuals: true });
interviewSchema.set('toObject', { virtuals: true });

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
