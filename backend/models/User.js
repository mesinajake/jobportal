import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default
    },
    role: {
      type: String,
      enum: ['jobseeker', 'employer', 'admin'],
      default: 'jobseeker'
    },
    phone: {
      type: String,
      trim: true
    },
    // Enhanced location with coordinates for geospatial queries
    location: {
      type: String,
      trim: true
    },
    locationDetails: {
      city: String,
      country: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: [Number]
      }
    },
    publicProfile: {
      type: Boolean,
      default: true
    },
    avatar: {
      type: String,
      trim: true
    },
    preferredLocations: {
      type: String,
      trim: true
    },
    jobTypes: {
      type: [String],
      default: []
    },
    resume: {
      url: {
        type: String,
        trim: true
      },
      uploadedAt: Date
    },
    skills: [{
      name: {
        type: String,
        required: true
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      }
    }],
    // Enhanced experience tracking
    experience: [{
      title: String,
      company: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String
    }],
    // Enhanced education tracking
    education: [{
      degree: String,
      institution: String,
      graduationYear: Number,
      fieldOfStudy: String
    }],
    languages: [{
      name: {
        type: String,
        required: true
      },
      proficiency: {
        type: String,
        enum: ['basic', 'intermediate', 'advanced', 'native'],
        default: 'intermediate'
      }
    }],
    portfolioLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      other: String
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    // Job preferences
    preferredLocations: String,
    jobTypes: [String],
    industries: [String],
    desiredRoles: String,
    salaryMin: Number,
    salaryMax: Number,
    availabilityDate: String,
    willingToRelocate: {
      type: Boolean,
      default: false
    },
    preferences: {
      salaryMin: Number,
      industries: [String],
      remotePreference: {
        type: String,
        enum: ['onsite', 'remote', 'hybrid', 'any'],
        default: 'any'
      }
    },
    // Account verification
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Two-Factor Authentication (for employers)
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String,
    twoFactorTempCode: String,
    twoFactorTempCodeExpires: Date,
    // Security tracking
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise increment
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return await this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Transform the document when converting to JSON
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    // Remove sensitive fields
    delete ret.password;
    delete ret.__v;
    
    // Ensure all array fields are returned (even if empty)
    ret.skills = ret.skills || [];
    ret.experience = ret.experience || [];
    ret.education = ret.education || [];
    ret.languages = ret.languages || [];
    ret.jobTypes = ret.jobTypes || [];
    ret.industries = ret.industries || [];
    
    // Ensure object fields are returned
    ret.portfolioLinks = ret.portfolioLinks || { linkedin: '', github: '', portfolio: '', other: '' };
    
    return ret;
  }
});

// Create sparse geospatial index for location-based searches (only indexes docs with coordinates)
userSchema.index({ 'locationDetails.coordinates': '2dsphere' }, { sparse: true });

const User = mongoose.model('User', userSchema);

export default User;
