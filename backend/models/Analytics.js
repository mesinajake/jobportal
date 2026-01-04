import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    // Event type
    eventType: {
      type: String,
      enum: ['view', 'click', 'apply', 'save', 'share'],
      required: true
    },
    // References
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Session tracking
    sessionId: String,
    // Device & browser info
    device: {
      type: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet']
      },
      browser: String,
      os: String,
      userAgent: String
    },
    // Location info (from IP or user data)
    location: {
      city: String,
      country: String,
      region: String,
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: [Number] // [longitude, latitude]
      }
    },
    // Referrer info
    referrer: {
      source: String, // 'google', 'direct', 'linkedin', etc.
      url: String,
      campaign: String
    },
    // Additional metadata
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false // Using custom timestamp field
  }
);

// Indexes for efficient analytics queries
analyticsSchema.index({ job: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ company: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ user: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ timestamp: -1 }); // For time-based queries

// TTL index to auto-delete old analytics after 2 years
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

// Static method to track an event
analyticsSchema.statics.trackEvent = async function(eventData) {
  try {
    const event = new this(eventData);
    await event.save();
    return event;
  } catch (error) {
    console.error('Error tracking event:', error);
    // Don't throw error - analytics should fail silently
    return null;
  }
};

// Static method to get job statistics
analyticsSchema.statics.getJobStats = async function(jobId, startDate, endDate) {
  const match = {
    job: mongoose.Types.ObjectId(jobId),
    timestamp: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default 30 days
      $lte: endDate || new Date()
    }
  };
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Convert to object format
  const result = {
    views: 0,
    clicks: 0,
    applications: 0,
    saves: 0,
    shares: 0
  };
  
  stats.forEach(stat => {
    result[stat._id + 's'] = stat.count;
  });
  
  return result;
};

// Static method to get company statistics
analyticsSchema.statics.getCompanyStats = async function(companyId, startDate, endDate) {
  const match = {
    company: mongoose.Types.ObjectId(companyId),
    timestamp: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate || new Date()
    }
  };
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          eventType: '$eventType',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.eventType',
        total: { $sum: '$count' },
        byDate: {
          $push: {
            date: '$_id.date',
            count: '$count'
          }
        }
      }
    }
  ]);
  
  return stats;
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
