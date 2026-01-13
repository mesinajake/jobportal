import mongoose from 'mongoose';
import { companyConfig } from '../config/company.js';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    // Department this job belongs to (replaces company reference)
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please select a department']
    },
    // Hiring manager for this position
    hiringManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Number of positions to fill
    positions: {
      type: Number,
      default: 1,
      min: 1
    },
    positionsFilled: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
      trim: true
    },
    // GeoJSON for location-based queries
    locationDetails: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function(v) {
            // Skip validation if not provided (for remote jobs)
            if (!v || v.length === 0) return true;
            if (v.length !== 2) return false;
            const [lng, lat] = v;
            return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
          },
          message: 'Coordinates must be [longitude, latitude]'
        }
      },
      workArrangement: {
        type: String,
        enum: ['onsite', 'remote', 'hybrid'],
        default: 'onsite'
      }
    },
    salary: {
      type: String,
      default: 'Not specified'
    },
    // NEW: Enhanced salary structure
    salaryDetails: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      period: {
        type: String,
        enum: ['hour', 'month', 'year'],
        default: 'year'
      },
      isVisible: {
        type: Boolean,
        default: true
      }
    },
    type: {
      type: String,
      enum: ['Full time', 'Part time', 'Contract', 'Remote', 'Internship', 'Temporary'],
      default: 'Full time'
    },
    category: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      default: '/images/Job-offers.png'
    },
    slug: {
      type: String,
      unique: true,
      trim: true
    },
    // Internal job posting flags
    internalOnly: {
      type: Boolean,
      default: false // If true, only visible to company employees
    },
    referralBonus: {
      type: Number,
      default: 0
    },
    requirements: {
      type: [String],
      default: []
    },
    responsibilities: {
      type: [String],
      default: []
    },
    benefits: {
      type: [String],
      default: []
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive']
    },
    skills: [String],
    featured: {
      type: Boolean,
      default: false
    },
    // Status with approval workflow
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'open', 'paused', 'closed', 'filled', 'cancelled'],
      default: 'draft'
    },
    // Approval tracking
    approvalInfo: {
      submittedAt: Date,
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      approvedAt: Date,
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rejectedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rejectionReason: String
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    expiresAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    views: {
      type: Number,
      default: 0
    },
    applications: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create index for search
jobSchema.index({ title: 'text', description: 'text', location: 'text' });

// Geospatial index for location-based queries (sparse: only index docs with coordinates)
jobSchema.index({ 'locationDetails.coordinates': '2dsphere' }, { sparse: true });

// Department-based queries
jobSchema.index({ department: 1, status: 1, createdAt: -1 });
jobSchema.index({ status: 1, isActive: 1, createdAt: -1 });
jobSchema.index({ category: 1, type: 1, isActive: 1 });
jobSchema.index({ hiringManager: 1, status: 1 });
jobSchema.index({ internalOnly: 1, status: 1 });

// Method to get days ago
jobSchema.virtual('posted').get(function () {
  const diffMs = Date.now() - this.createdAt.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
});

// Ensure virtuals are included when converting to JSON
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

const Job = mongoose.model('Job', jobSchema);

export default Job;
