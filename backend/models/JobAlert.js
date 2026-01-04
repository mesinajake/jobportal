import mongoose from 'mongoose';

const jobAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    // Search criteria
    keywords: [String],
    location: String,
    locationCoordinates: {
      type: { type: String, default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    },
    radius: {
      type: Number, // in kilometers
      default: 50
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
    },
    categories: [String],
    salaryMin: Number,
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive']
    },
    remoteOnly: {
      type: Boolean,
      default: false
    },
    // Alert settings
    frequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly'],
      default: 'daily'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastSentAt: Date,
    // Tracking
    totalJobsSent: {
      type: Number,
      default: 0
    },
    lastCheckedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
jobAlertSchema.index({ user: 1, isActive: 1 });
jobAlertSchema.index({ frequency: 1, isActive: 1, lastSentAt: 1 });
jobAlertSchema.index({ locationCoordinates: '2dsphere' });

// Method to check if alert should be sent
jobAlertSchema.methods.shouldSend = function() {
  if (!this.isActive) return false;
  
  if (!this.lastSentAt) return true;
  
  const now = Date.now();
  const lastSent = this.lastSentAt.getTime();
  const hoursSinceLastSent = (now - lastSent) / (1000 * 60 * 60);
  
  switch (this.frequency) {
    case 'instant':
      return true;
    case 'daily':
      return hoursSinceLastSent >= 24;
    case 'weekly':
      return hoursSinceLastSent >= 168;
    default:
      return false;
  }
};

// Method to build query for matching jobs
jobAlertSchema.methods.buildJobQuery = function() {
  const query = { isActive: true };
  
  if (this.keywords && this.keywords.length > 0) {
    query.$text = { $search: this.keywords.join(' ') };
  }
  
  if (this.jobType) {
    query.type = this.jobType;
  }
  
  if (this.categories && this.categories.length > 0) {
    query.category = { $in: this.categories };
  }
  
  if (this.salaryMin) {
    query['salaryDetails.min'] = { $gte: this.salaryMin };
  }
  
  if (this.experienceLevel) {
    query.experienceLevel = this.experienceLevel;
  }
  
  if (this.remoteOnly) {
    query['locationDetails.type'] = { $in: ['remote', 'hybrid'] };
  }
  
  // Location-based query will be handled separately with $geoNear
  
  return query;
};

const JobAlert = mongoose.model('JobAlert', jobAlertSchema);

export default JobAlert;
