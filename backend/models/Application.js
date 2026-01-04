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
    // NEW: Company reference for direct access
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    coverLetter: {
      type: String,
      trim: true
    },
    resume: {
      type: String, // URL or path to resume
      trim: true
    },
    // NEW: Enhanced resume tracking
    resumeDetails: {
      filename: String,
      url: String,
      uploadedAt: Date,
      parsedText: String, // Cached for AI analysis
      aiScore: Number // Match score from AI analysis
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted', 'withdrawn'],
      default: 'pending'
    },
    // NEW: Status history tracking
    statusHistory: [{
      status: {
        type: String,
        enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted', 'withdrawn']
      },
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
    // NEW: Notes from employer
    notes: [{
      text: String,
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    appliedAt: {
      type: Date,
      default: Date.now
    },
    // NEW: Withdrawal tracking
    withdrawnAt: Date,
    withdrawnReason: String,
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

// NEW: Indexes for common queries
applicationSchema.index({ company: 1, status: 1, appliedAt: -1 });
applicationSchema.index({ user: 1, status: 1, appliedAt: -1 });
applicationSchema.index({ status: 1, appliedAt: -1 });

// NEW: Method to update status with history tracking
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
