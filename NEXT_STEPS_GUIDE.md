# Next Steps - Backend Integration Guide

## 📋 Overview
This guide outlines the immediate next steps to integrate the enhanced MongoDB schemas into your JobPortal backend.

---

## 🎯 Priority 1: Company System (HIGH)

### 1. Create Company Controller
**File:** `backend/controllers/companyController.js`

**Required Functions:**
```javascript
// Create a new company profile
export const createCompany = async (req, res) => {
  // Verify user is employer
  // Create company with owner = req.user.id
  // Initialize subscription (default: free plan)
}

// Get company by slug
export const getCompanyBySlug = async (req, res) => {
  // Find company by slug
  // Populate owner details (exclude password)
  // Return company with stats
}

// Update company
export const updateCompany = async (req, res) => {
  // Verify ownership (req.user.id === company.owner)
  // Update allowed fields
  // Regenerate slug if name changed
}

// Get company jobs
export const getCompanyJobs = async (req, res) => {
  // Find all jobs where companyRef = companyId
  // Populate job details
  // Filter by status (active, draft, etc.)
}

// Get company analytics
export const getCompanyAnalytics = async (req, res) => {
  // Use Analytics.getCompanyStats()
  // Return views, applications, clicks
  // Include date range filtering
}

// Manage subscription
export const updateSubscription = async (req, res) => {
  // Update subscription plan
  // Add/deduct job post credits
  // Set expiration date
}
```

---

### 2. Create Company Routes
**File:** `backend/routes/companyRoutes.js`

```javascript
import express from 'express';
import {
  createCompany,
  getCompanyBySlug,
  updateCompany,
  getCompanyJobs,
  getCompanyAnalytics,
  updateSubscription
} from '../controllers/companyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/:slug', getCompanyBySlug);
router.get('/:slug/jobs', getCompanyJobs);

// Protected routes
router.post('/', protect, createCompany);
router.put('/:id', protect, updateCompany);
router.get('/:id/analytics', protect, getCompanyAnalytics);
router.put('/:id/subscription', protect, updateSubscription);

export default router;
```

---

### 3. Register Company Routes in Server
**File:** `backend/server.js`

```javascript
import companyRoutes from './routes/companyRoutes.js';

// Add after other route registrations
app.use('/api/companies', companyRoutes);
```

---

## 🎯 Priority 2: Enhanced Job Posting (HIGH)

### 4. Update Job Controller
**File:** `backend/controllers/jobController.js`

**Modifications Needed:**

```javascript
// In createJob function:
export const createJob = async (req, res) => {
  try {
    // NEW: Check if user has a company profile
    const company = await Company.findOne({ owner: req.user.id });
    
    // NEW: Check job post credits
    if (company && company.subscription.jobPostCredits <= 0) {
      return res.status(403).json({ 
        message: 'Insufficient job post credits' 
      });
    }
    
    const jobData = {
      ...req.body,
      postedBy: req.user.id,
      // NEW: Add company reference
      companyRef: company ? company._id : null,
      company: company ? company.name : req.body.company,
      companyLogo: company ? company.logo : req.body.companyLogo,
      source: 'internal'
    };
    
    const job = await Job.create(jobData);
    
    // NEW: Deduct job post credit
    if (company) {
      company.subscription.jobPostCredits -= 1;
      company.stats.totalJobs += 1;
      company.stats.activeJobs += 1;
      await company.save();
    }
    
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// In getJobById function:
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate('companyRef', 'name logo website location'); // NEW
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // NEW: Track analytics (don't await)
    Analytics.trackEvent({
      eventType: 'view',
      job: job._id,
      company: job.companyRef,
      user: req.user ? req.user.id : null,
      sessionId: req.sessionID || req.ip
    });
    
    // Increment view count
    job.views += 1;
    await job.save();
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## 🎯 Priority 3: Analytics Tracking (MEDIUM)

### 5. Create Analytics Controller
**File:** `backend/controllers/analyticsController.js`

```javascript
import Analytics from '../models/Analytics.js';

// Track an event
export const trackEvent = async (req, res) => {
  try {
    const { eventType, jobId } = req.body;
    
    const eventData = {
      eventType,
      job: jobId,
      user: req.user ? req.user.id : null,
      sessionId: req.sessionID || req.ip,
      device: {
        type: req.body.deviceType,
        browser: req.body.browser,
        os: req.body.os,
        userAgent: req.headers['user-agent']
      },
      referrer: {
        source: req.body.source,
        url: req.headers.referer
      }
    };
    
    await Analytics.trackEvent(eventData);
    
    res.status(200).json({ message: 'Event tracked' });
  } catch (error) {
    // Fail silently - don't break user experience
    console.error('Analytics error:', error);
    res.status(200).json({ message: 'Event received' });
  }
};

// Get job analytics
export const getJobAnalytics = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { startDate, endDate } = req.query;
    
    const stats = await Analytics.getJobStats(
      jobId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get company analytics
export const getCompanyAnalytics = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;
    
    const stats = await Analytics.getCompanyStats(
      companyId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { trackEvent, getJobAnalytics, getCompanyAnalytics };
```

---

### 6. Create Analytics Routes
**File:** `backend/routes/analyticsRoutes.js`

```javascript
import express from 'express';
import { trackEvent, getJobAnalytics, getCompanyAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route - track events
router.post('/track', trackEvent);

// Protected routes - view analytics
router.get('/jobs/:jobId', protect, getJobAnalytics);
router.get('/companies/:companyId', protect, getCompanyAnalytics);

export default router;
```

---

## 🎯 Priority 4: Job Alerts (MEDIUM)

### 7. Create JobAlert Controller
**File:** `backend/controllers/jobAlertController.js`

```javascript
import JobAlert from '../models/JobAlert.js';
import Job from '../models/Job.js';

// Create job alert
export const createJobAlert = async (req, res) => {
  try {
    const alertData = {
      ...req.body,
      user: req.user.id
    };
    
    const alert = await JobAlert.create(alertData);
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user's job alerts
export const getUserAlerts = async (req, res) => {
  try {
    const alerts = await JobAlert.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update job alert
export const updateJobAlert = async (req, res) => {
  try {
    const alert = await JobAlert.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    Object.assign(alert, req.body);
    await alert.save();
    
    res.json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete job alert
export const deleteJobAlert = async (req, res) => {
  try {
    const alert = await JobAlert.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Test alert (preview matching jobs)
export const testJobAlert = async (req, res) => {
  try {
    const alert = await JobAlert.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    const query = alert.buildJobQuery();
    const jobs = await Job.find(query)
      .limit(10)
      .sort({ createdAt: -1 });
    
    res.json({
      matchCount: jobs.length,
      sampleJobs: jobs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createJobAlert,
  getUserAlerts,
  updateJobAlert,
  deleteJobAlert,
  testJobAlert
};
```

---

### 8. Create JobAlert Routes
**File:** `backend/routes/jobAlertRoutes.js`

```javascript
import express from 'express';
import {
  createJobAlert,
  getUserAlerts,
  updateJobAlert,
  deleteJobAlert,
  testJobAlert
} from '../controllers/jobAlertController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', createJobAlert);
router.get('/', getUserAlerts);
router.put('/:id', updateJobAlert);
router.delete('/:id', deleteJobAlert);
router.get('/:id/test', testJobAlert);

export default router;
```

---

## 🎯 Priority 5: Update Application Controller (HIGH)

### 9. Enhance Application Controller
**File:** `backend/controllers/applicationController.js`

**Add to existing functions:**

```javascript
// In createApplication:
export const createApplication = async (req, res) => {
  try {
    const job = await Job.findById(req.body.jobId)
      .populate('companyRef');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const applicationData = {
      user: req.user.id,
      job: job._id,
      company: job.companyRef, // NEW: Add company reference
      coverLetter: req.body.coverLetter,
      resume: req.body.resume,
      // NEW: Add resume details if available
      resumeDetails: req.body.resumeDetails
    };
    
    const application = await Application.create(applicationData);
    
    // NEW: Update job application count
    job.applications += 1;
    await job.save();
    
    // NEW: Update company stats
    if (job.companyRef) {
      await Company.findByIdAndUpdate(job.companyRef, {
        $inc: { 'stats.totalApplications': 1 }
      });
    }
    
    // NEW: Track analytics
    Analytics.trackEvent({
      eventType: 'apply',
      job: job._id,
      company: job.companyRef,
      user: req.user.id
    });
    
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
```

---

## 📊 Testing Checklist

### Before Testing
- [ ] Restart backend server to load new models
- [ ] Verify MongoDB connection
- [ ] Check for any console errors

### Company System
- [ ] Create company profile via POST `/api/companies`
- [ ] Get company by slug via GET `/api/companies/:slug`
- [ ] Update company via PUT `/api/companies/:id`
- [ ] Post job with company reference
- [ ] Verify job post credits deduction

### Analytics
- [ ] View a job (should auto-track)
- [ ] Track custom event via POST `/api/analytics/track`
- [ ] Get job stats via GET `/api/analytics/jobs/:id`
- [ ] Get company stats via GET `/api/analytics/companies/:id`

### Job Alerts
- [ ] Create alert via POST `/api/alerts`
- [ ] List user alerts via GET `/api/alerts`
- [ ] Test alert via GET `/api/alerts/:id/test`
- [ ] Update alert via PUT `/api/alerts/:id`
- [ ] Delete alert via DELETE `/api/alerts/:id`

### Applications
- [ ] Submit application (verify company reference added)
- [ ] Check status history tracking
- [ ] Update application status (verify history)
- [ ] Add employer notes

---

## 🚨 Important Notes

### Backward Compatibility
- Existing jobs without `companyRef` will still work
- Existing applications without `company` field will still work
- Old API calls remain functional

### Migration Path
1. Deploy schema changes ✅ (DONE)
2. Add new controllers (THIS STEP)
3. Add new routes (THIS STEP)
4. Update existing controllers to use new fields
5. Test thoroughly
6. Deploy frontend updates

### Environment Variables
Make sure these are in your `.env`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=8080
```

---

## 📝 Next Commands to Run

After creating the controller and route files:

```powershell
# Restart the backend server
cd backend
npm start
```

---

**Status:** Ready to implement ✅  
**Estimated Time:** 2-3 hours  
**Risk Level:** Low (backward compatible)  
**Testing Required:** Yes (see checklist above)
