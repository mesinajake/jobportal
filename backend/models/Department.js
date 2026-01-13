import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters']
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, 'Department code cannot exceed 10 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // Department head (hiring manager level or above)
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Parent department for hierarchy
    parentDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    // Location of this department
    location: {
      city: String,
      country: String,
      office: String // e.g., 'Headquarters', 'NYC Office'
    },
    // Budget and headcount tracking
    headcount: {
      current: {
        type: Number,
        default: 0
      },
      approved: {
        type: Number,
        default: 0
      }
    },
    // Hiring settings for this department
    hiringSettings: {
      defaultInterviewRounds: {
        type: Number,
        default: 3
      },
      requiresHRApproval: {
        type: Boolean,
        default: true
      },
      interviewPanel: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    // Contact for recruitment queries
    recruitingContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Status
    isActive: {
      type: Boolean,
      default: true
    },
    // Color for UI display
    color: {
      type: String,
      default: '#2563eb'
    }
  },
  {
    timestamps: true
  }
);

// Index for quick lookup (code already has unique: true which creates an index)
departmentSchema.index({ parentDepartment: 1 });
departmentSchema.index({ isActive: 1 });

// Virtual to get sub-departments
departmentSchema.virtual('subDepartments', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'parentDepartment'
});

// Virtual to count open positions
departmentSchema.virtual('openPositions', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'department',
  count: true,
  match: { status: 'open' }
});

// Ensure virtuals are included
departmentSchema.set('toJSON', { virtuals: true });
departmentSchema.set('toObject', { virtuals: true });

const Department = mongoose.model('Department', departmentSchema);

export default Department;
