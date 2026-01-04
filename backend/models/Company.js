import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  logo: String,
  coverImage: String,
  website: String,
  industry: String,
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  founded: Number,
  location: {
    headquarters: {
      city: String,
      country: String,
      address: String
    },
    offices: [{
      city: String,
      country: String,
      address: String
    }]
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  benefits: [String],
  culture: String,
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [String],
  
  // Subscription/Credits for job posting
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    jobPostCredits: {
      type: Number,
      default: 3 // Free tier gets 3 job posts
    },
    expiresAt: Date
  },
  
  // Statistics
  stats: {
    totalJobs: { type: Number, default: 0 },
    activeJobs: { type: Number, default: 0 },
    totalApplications: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Generate slug from company name before saving
companySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const Company = mongoose.model('Company', companySchema);

export default Company;
