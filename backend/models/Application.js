import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    // Department reference for filtering (populated from job)
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    // Referral tracking
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    referralNote: String,
    coverLetter: {
      type: String,
      trim: true
    },
    resume: {
      type: String, // URL or path to resume
      trim: true
    },
    resumeDetails: {
      filename: String,
      url: String,
      uploadedAt: Date,
      parsedText: String, // Cached for AI analysis
      aiScore: Number // Match score from AI analysis
    },
    // Extended status for hiring workflow
    status: {
      type: String,
      enum: [
        'pending',
        'screening',
        'phone_screen',
        'interviewing',
        'final_round',
        'offer_pending',
        'offer_sent',
        'offer_accepted',
        'offer_declined',
        'hired',
        'rejected',
        'withdrawn',
        'on_hold'
      ],
      default: 'pending'
    },
    // Current stage in interview process
    currentStage: {
      type: Number,
      default: 0
    },
    // Status history tracking
    statusHistory: [{
      status: String,
      changedAt: {
        type: Date,
        default: Date.now
      },
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      note: String
    }],
    // Notes from recruiters/hiring managers
    notes: [{
      text: String,
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      isPrivate: {
        type: Boolean,
        default: false
      }
    }],
    // Rating from interviewers
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      ratedAt: Date
    },
    // Offer details
    offer: {
      salary: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      startDate: Date,
      expiresAt: Date,
      sentAt: Date,
      sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      respondedAt: Date,
      response: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'negotiating']
      },
      negotiationNotes: String
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    withdrawnAt: Date,
    withdrawnReason: String,
    // Rejection details
    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String,
    rejectionFeedback: String, // Optional feedback to candidate
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create compound index to ensure a user can't apply to the same job twice
applicationSchema.index({ user: 1, job: 1 }, { unique: true });

// Indexes for common queries
applicationSchema.index({ department: 1, status: 1, appliedAt: -1 });
applicationSchema.index({ user: 1, status: 1, appliedAt: -1 });
applicationSchema.index({ status: 1, appliedAt: -1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ referredBy: 1 });

// Method to update status with history tracking
applicationSchema.methods.updateStatus = function(newStatus, userId, note) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    note: note || `Status changed to ${newStatus}`
  });
  return this.save();
};

const Application = mongoose.model('Application', applicationSchema);

export default Application;
