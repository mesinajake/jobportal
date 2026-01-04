# MongoDB Schema Enhancement - Incremental Migration Summary

## Overview
This document outlines all the enhancements made to the JobPortal MongoDB schema using an **incremental approach** - adding new features while maintaining backward compatibility with existing data.

## ✅ Completed Enhancements

### 1. User Model (`backend/models/User.js`)
**Status:** Enhanced ✅

#### New Fields Added:
```javascript
// Location tracking with geospatial support
locationDetails: {
  city: String,
  country: String,
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  }
}

// Enhanced resume tracking
resume: {
  url: String,
  uploadedAt: Date
}

// Professional experience
experience: [{
  title: String,
  company: String,
  startDate: Date,
  endDate: Date,
  current: Boolean,
  description: String
}]

// Education history
education: [{
  school: String,
  degree: String,
  field: String,
  startDate: Date,
  endDate: Date,
  current: Boolean
}]

// Job preferences
preferences: {
  salaryMin: Number,
  industries: [String],
  remotePreference: { type: String, enum: ['onsite', 'remote', 'hybrid', 'any'] }
}

// Verification system
verification: {
  email: { type: Boolean, default: false },
  emailVerifiedAt: Date,
  verificationToken: String,
  verificationExpires: Date
}
```

#### New Indexes:
- Geospatial index: `locationDetails.coordinates` (2dsphere)

---

### 2. Company Model (`backend/models/Company.js`)
**Status:** Created ✅

#### Purpose:
Separate company profiles for employers with subscription management and analytics tracking.

#### Key Features:
```javascript
// Company owner reference
owner: { type: ObjectId, ref: 'User', required: true }

// Subscription system
subscription: {
  plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'] },
  jobPostCredits: Number,
  expiresAt: Date
}

// Statistics tracking
stats: {
  totalJobs: Number,
  activeJobs: Number,
  totalApplications: Number,
  views: Number
}

// Auto-generated slug from company name
slug: { type: String, unique: true, sparse: true }
```

#### Features:
- Auto-generates slugs from company names
- Tracks job post credits for subscription limits
- Company verification system
- Statistics aggregation

---

### 3. Job Model (`backend/models/Job.js`)
**Status:** Enhanced ✅

#### New Fields Added:
```javascript
// Company reference for internally posted jobs
companyRef: { type: ObjectId, ref: 'Company' }
companyLogo: String

// Enhanced location with coordinates
locationDetails: {
  type: { type: String, enum: ['onsite', 'remote', 'hybrid'] },
  city: String,
  country: String,
  address: String,
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  }
}

// Enhanced salary structure
salaryDetails: {
  min: Number,
  max: Number,
  currency: { type: String, default: 'USD' },
  period: { type: String, enum: ['hour', 'month', 'year'] },
  isVisible: { type: Boolean, default: true }
}

// External job tracking
externalId: String // To prevent duplicate aggregated jobs
lastSyncedAt: Date

// Additional fields
experienceLevel: { type: String, enum: ['entry', 'mid', 'senior', 'lead', 'executive'] }
skills: [String]
featured: { type: Boolean, default: false }
status: { type: String, enum: ['draft', 'active', 'paused', 'closed', 'expired'] }
```

#### New Indexes:
- Geospatial: `locationDetails.coordinates` (2dsphere)
- Compound: `{ status: 1, isActive: 1, createdAt: -1 }`
- Compound: `{ companyRef: 1, status: 1 }`
- Compound: `{ category: 1, type: 1, isActive: 1 }`
- Unique: `{ source: 1, externalId: 1 }` (prevents duplicate external jobs)

#### Backward Compatibility:
- Original `company` (String) field maintained
- New `companyRef` (ObjectId) used for internal posts
- Aggregated jobs still use `company` string + embedded data

---

### 4. Application Model (`backend/models/Application.js`)
**Status:** Enhanced ✅

#### New Fields Added:
```javascript
// Company reference
company: { type: ObjectId, ref: 'Company' }

// Enhanced resume tracking
resumeDetails: {
  filename: String,
  url: String,
  uploadedAt: Date,
  parsedText: String, // Cached for AI analysis
  aiScore: Number // Match score from AI analysis
}

// Status history tracking
statusHistory: [{
  status: String,
  changedAt: Date,
  changedBy: { type: ObjectId, ref: 'User' },
  note: String
}]

// Employer notes
notes: [{
  text: String,
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: Date
}]

// Withdrawal tracking
withdrawnAt: Date
withdrawnReason: String
```

#### New Status Options:
- Added `withdrawn` to status enum

#### New Methods:
```javascript
// Update status with automatic history tracking
applicationSchema.methods.updateStatus = function(newStatus, userId, note) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    note: note || `Status changed to ${newStatus}`
  });
  return this.save();
};
```

#### New Indexes:
- `{ company: 1, status: 1, appliedAt: -1 }`
- `{ user: 1, status: 1, appliedAt: -1 }`
- `{ status: 1, appliedAt: -1 }`

---

### 5. JobAlert Model (`backend/models/JobAlert.js`)
**Status:** Created ✅

#### Purpose:
Allow users to set up automated job alerts based on their preferences.

#### Key Features:
```javascript
// User reference
user: { type: ObjectId, ref: 'User', required: true }

// Search criteria
keywords: [String]
location: String
locationCoordinates: { coordinates: [Number] }
radius: Number // in kilometers
jobType: String
categories: [String]
salaryMin: Number
experienceLevel: String
remoteOnly: Boolean

// Alert settings
frequency: { type: String, enum: ['instant', 'daily', 'weekly'] }
isActive: Boolean
lastSentAt: Date
totalJobsSent: Number
```

#### Methods:
```javascript
// Check if alert should be sent based on frequency
shouldSend()

// Build MongoDB query for matching jobs
buildJobQuery()
```

#### Indexes:
- `{ user: 1, isActive: 1 }`
- `{ frequency: 1, isActive: 1, lastSentAt: 1 }`
- `{ locationCoordinates: '2dsphere' }`

---

### 6. Analytics Model (`backend/models/Analytics.js`)
**Status:** Created ✅

#### Purpose:
Track user interactions with jobs for data-driven insights.

#### Event Types:
- `view` - Job page view
- `click` - External job link click
- `apply` - Job application submission
- `save` - Job saved for later
- `share` - Job shared

#### Key Features:
```javascript
// Event tracking
eventType: { type: String, enum: ['view', 'click', 'apply', 'save', 'share'] }
job: { type: ObjectId, ref: 'Job' }
company: { type: ObjectId, ref: 'Company' }
user: { type: ObjectId, ref: 'User' }

// Device info
device: {
  type: String, // desktop, mobile, tablet
  browser: String,
  os: String
}

// Location from IP
location: {
  city: String,
  country: String,
  coordinates: [Number]
}

// Referrer tracking
referrer: {
  source: String, // google, direct, linkedin
  url: String,
  campaign: String
}
```

#### Static Methods:
```javascript
// Track an event (fails silently)
Analytics.trackEvent(eventData)

// Get job statistics
Analytics.getJobStats(jobId, startDate, endDate)

// Get company statistics
Analytics.getCompanyStats(companyId, startDate, endDate)
```

#### Auto-Cleanup:
- TTL index deletes analytics older than 2 years

---

## 🔄 Migration Strategy

### Phase 1: Schema Enhancement (Completed)
✅ Enhanced existing models with new fields (backward compatible)
✅ Created new models (Company, JobAlert, Analytics)
✅ Added indexes for performance

### Phase 2: Backend Integration (Next Steps)
**Required Actions:**

1. **Create Company Controller** (`backend/controllers/companyController.js`)
   - Create company profile
   - Update company info
   - Get company details
   - Manage subscription/credits

2. **Create Company Routes** (`backend/routes/companyRoutes.js`)
   - POST `/api/companies` - Create company
   - GET `/api/companies/:slug` - Get company by slug
   - PUT `/api/companies/:id` - Update company
   - GET `/api/companies/:id/jobs` - Get company jobs
   - GET `/api/companies/:id/analytics` - Get company stats

3. **Create JobAlert Controller** (`backend/controllers/jobAlertController.js`)
   - Create alert
   - List user alerts
   - Update alert
   - Delete alert
   - Process alerts (scheduled job)

4. **Create JobAlert Routes** (`backend/routes/jobAlertRoutes.js`)
   - POST `/api/alerts` - Create alert
   - GET `/api/alerts` - Get user alerts
   - PUT `/api/alerts/:id` - Update alert
   - DELETE `/api/alerts/:id` - Delete alert

5. **Create Analytics Controller** (`backend/controllers/analyticsController.js`)
   - Track events
   - Get job analytics
   - Get company analytics
   - Get user analytics

6. **Create Analytics Routes** (`backend/routes/analyticsRoutes.js`)
   - POST `/api/analytics/track` - Track event
   - GET `/api/analytics/jobs/:id` - Job stats
   - GET `/api/analytics/companies/:id` - Company stats

7. **Update Existing Controllers**
   - `jobController.js`: Add company reference when creating jobs
   - `applicationController.js`: Add company reference, use new status tracking
   - `authController.js`: Handle company account creation

8. **Update Existing Routes**
   - Add company-related job endpoints
   - Add analytics tracking to job views

### Phase 3: Frontend Integration (Future)
- Company profile pages
- Job alert management UI
- Analytics dashboard
- Enhanced job posting for companies

---

## 📊 Database Indexes Summary

### Geospatial Indexes (for location-based queries)
- `User.locationDetails.coordinates` (2dsphere)
- `Job.locationDetails.coordinates` (2dsphere)
- `JobAlert.locationCoordinates` (2dsphere)
- `Analytics.location.coordinates` (2dsphere)

### Text Search Indexes
- `Job`: { title, company, description, location }

### Compound Indexes (for common queries)
- `Job`: { status, isActive, createdAt }
- `Job`: { companyRef, status }
- `Job`: { category, type, isActive }
- `Application`: { company, status, appliedAt }
- `Application`: { user, status, appliedAt }
- `Analytics`: { job, eventType, timestamp }
- `Analytics`: { company, eventType, timestamp }

### Unique Indexes
- `Job`: { source, externalId } (prevents duplicate external jobs)
- `Application`: { user, job } (one application per user per job)
- `Company.slug` (unique company URLs)

---

## 🔑 Key Benefits

### 1. Backward Compatibility
- All existing data continues to work
- No breaking changes to current functionality
- New fields are optional or have defaults

### 2. Scalability
- Proper indexing for fast queries
- Geospatial support for location-based features
- Analytics tracking without performance impact

### 3. Professional Features
- Company profiles with subscription management
- Job alerts for user engagement
- Comprehensive analytics for data-driven decisions
- Status tracking for application workflow

### 4. Future-Ready
- Ready for multi-tenant company system
- Supports external job aggregation
- Analytics foundation for ML/AI features
- Flexible structure for future additions

---

## 🚀 Next Immediate Steps

1. **Test existing functionality** - Ensure no breaking changes
2. **Create Company controller & routes** - Enable company features
3. **Update Job controller** - Add company reference logic
4. **Create Analytics middleware** - Auto-track job views
5. **Build frontend components** - Company profiles, job alerts UI

---

## 📝 Notes

### Data Migration
- **Not required** - All new fields have defaults or are optional
- Existing jobs work with `company` string field
- New jobs can optionally use `companyRef` ObjectId
- Both approaches supported simultaneously

### Performance Considerations
- All critical queries have indexes
- Analytics tracking is asynchronous and fails silently
- TTL indexes auto-cleanup old data
- Geospatial queries optimized with 2dsphere indexes

### Testing Recommendations
1. Create test company profile
2. Post job with company reference
3. Set up job alert and verify matching
4. Track analytics events
5. Query analytics stats
6. Test location-based job search

---

**Migration Status:** Phase 1 Complete ✅  
**Next Phase:** Backend Integration (Controllers & Routes)  
**Backward Compatible:** Yes ✅  
**Breaking Changes:** None ✅
