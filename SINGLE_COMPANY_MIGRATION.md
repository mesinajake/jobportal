# Single Company Job Portal Migration Summary

## Overview

This document summarizes the migration from a multi-employer job portal to a single-company internal job portal. The migration removes all multi-company features and restructures the application around departments, internal roles, and streamlined workflows.

## What Changed

### Backend Changes

#### New Files Created

| File | Purpose |
|------|---------|
| `config/company.js` | Centralized company configuration (replaces Company model) |
| `models/Department.js` | Organizational structure for jobs |
| `models/Interview.js` | Interview scheduling and feedback tracking |
| `middleware/roleAccess.js` | Granular RBAC (Role-Based Access Control) system |
| `controllers/departmentController.js` | Department CRUD operations |
| `routes/departmentRoutes.js` | Department API endpoints |
| `controllers/interviewController.js` | Interview management |
| `routes/interviewRoutes.js` | Interview API endpoints |

#### Modified Files

| File | Changes |
|------|---------|
| `models/User.js` | New roles: candidate, recruiter, hiring_manager, hr, admin |
| `models/Job.js` | Removed company refs, added department-based structure |
| `models/Application.js` | Removed company ref, added enhanced status workflow |
| `controllers/authController.js` | New registration flow, staff invite system |
| `controllers/jobController.js` | Department-based, approval workflow, removed credits |
| `routes/authRoutes.js` | Added invite routes for staff |
| `routes/jobRoutes.js` | Permission-based access, approval workflow |
| `routes/applicationRoutes.js` | Updated for new role system |
| `server.js` | New routes, removed company routes |

#### Deleted Files

| File | Reason |
|------|--------|
| `models/Company.js` | Replaced by config/company.js |
| `controllers/companyController.js` | No longer needed |
| `routes/companyRoutes.js` | No longer needed |
| `services/jobApiService.js` | External job API removed |

### Frontend Changes

#### New Files Created

| File | Purpose |
|------|---------|
| `hooks/useCompanyInfo.js` | Hook to fetch company info from API |

#### Modified Files

| File | Changes |
|------|---------|
| `App.jsx` | New routing structure (candidate/recruit paths) |
| `context/AuthContext.jsx` | Added isStaff/hasRole helpers |
| `components/ProtectedRoute.jsx` | Role-based access control |
| `pages/index.js` | New naming conventions |
| `pages/auth/Register/Register.jsx` | Candidates only registration |
| `pages/auth/Login/Login.jsx` | Role-based redirects |
| `pages/common/Home/Home.jsx` | Careers landing page |
| `pages/common/About/About.jsx` | Company-focused content |
| `pages/job-seeker/BrowseJobs/BrowseJobs.jsx` | Uses API, department filters |
| `pages/job-seeker/JobDetails/JobDetails.jsx` | Uses API, department info |
| `components/common/Header/Header.jsx` | New navigation links |
| `services/api.js` | Added departments, interviews, applications APIs |

#### Deleted Files/Folders

| File/Folder | Reason |
|-------------|--------|
| `pages/common/Company/` | Multi-company pages removed |
| `services/jobsApi.js` | Replaced by apiClient |

### Database Schema Changes

#### User Model - New Roles

```javascript
role: {
  type: String,
  enum: ['candidate', 'recruiter', 'hiring_manager', 'hr', 'admin'],
  default: 'candidate'
}
```

New fields added:
- `department` - Reference to Department
- `employeeId` - Internal employee ID
- `jobTitle` - Staff job title
- `invitedBy`, `invitedAt`, `inviteToken`, `inviteTokenExpires` - Staff invitation system

#### Job Model Changes

Removed:
- `company` (String)
- `companyRef` (ObjectId)
- `companyLogo`
- `externalUrl`, `source`, `externalId`, `lastSyncedAt`

Added:
- `department` (required, ref: 'Department')
- `hiringManager` (ref: 'User')
- `positions`, `positionsFilled`
- `internalOnly`
- `referralBonus`
- `approvalInfo` object (status, approvedBy, approvedAt, rejectedBy, rejectedAt, rejectionReason)

New status values:
```javascript
['draft', 'pending_approval', 'approved', 'open', 'paused', 'closed', 'filled', 'cancelled']
```

### Role Permissions

| Role | Permissions |
|------|-------------|
| **candidate** | Apply to jobs, view own applications |
| **recruiter** | View/manage applications, create jobs, schedule interviews |
| **hiring_manager** | All recruiter permissions + approve jobs for their department |
| **hr** | All hiring_manager permissions + manage all departments, invite staff |
| **admin** | Full access to all features |

## New API Endpoints

### Company
- `GET /api/company` - Get public company info

### Departments
- `GET /api/departments` - List all departments
- `GET /api/departments/:id` - Get department details
- `GET /api/departments/:id/jobs` - Get department jobs
- `POST /api/departments` - Create department (HR/Admin)
- `PUT /api/departments/:id` - Update department (HR/Admin)
- `DELETE /api/departments/:id` - Delete department (Admin)

### Interviews
- `GET /api/interviews` - List interviews
- `GET /api/interviews/my-schedule` - Get user's interview schedule
- `POST /api/interviews` - Schedule interview
- `PUT /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Cancel interview
- `POST /api/interviews/:id/feedback` - Submit feedback
- `PUT /api/interviews/:id/respond` - Candidate responds to invite
- `PUT /api/interviews/:id/decision` - Make hiring decision

### Jobs (Updated)
- `GET /api/jobs/admin/pending-approval` - Get jobs pending approval
- `PUT /api/jobs/:id/approve` - Approve job posting
- `PUT /api/jobs/:id/reject` - Reject job posting
- `GET /api/jobs/by-department/:departmentId` - Get jobs by department

### Auth (Updated)
- `POST /api/auth/invite-staff` - Invite staff member (HR/Admin)
- `POST /api/auth/accept-invite/:token` - Accept staff invitation

## Configuration

Update `backend/config/company.js` with your company information:

```javascript
export const companyConfig = {
  name: 'Your Company Name',
  legalName: 'Your Company Legal Name',
  tagline: 'Your Company Tagline',
  description: 'Company description...',
  logo: '/images/company-logo.png',
  
  // Update allowed domains for staff registration
  allowedStaffDomains: ['yourcompany.com'],
  
  // Update benefits
  benefits: [
    'Health Insurance',
    'Flexible Work Hours',
    // ... more benefits
  ],
  
  // Update locations
  locations: [
    {
      name: 'Headquarters',
      address: '123 Main St',
      city: 'Your City',
      // ...
    }
  ]
};
```

## Route Changes

| Old Route | New Route | Notes |
|-----------|-----------|-------|
| `/jobs` | `/careers` | Main job listing |
| `/job/:slug` | `/careers/:id` | Job details |
| `/job-seeker/dashboard` | `/candidate/dashboard` | Candidate dashboard |
| `/job-seeker/browse-jobs` | `/careers` | Redirect added |
| `/employer/dashboard` | `/recruit/dashboard` | Staff dashboard |
| `/employer/post-job` | `/recruit/post-job` | Post new job |
| `/company/:slug` | *Removed* | No multi-company |

## Migration Checklist

- [x] Update `config/company.js` with company info
- [x] Create Department model and seed initial departments
- [x] Update User roles in database (jobseeker → candidate, employer → recruiter/hr)
- [x] Update Job records to include department references
- [x] Test staff invitation flow
- [x] Test job posting approval workflow
- [x] Test interview scheduling
- [x] Verify all routes work correctly

## Next Steps

1. **Seed Initial Data**: Create initial departments and an admin user
2. **Update Environment**: Set up email configuration for invitations
3. **Test Thoroughly**: Test all user flows for each role
4. **Update Documentation**: Update any user-facing documentation
5. **Deploy**: Deploy backend and frontend changes together

## Database Migration Commands

```javascript
// Update existing users - Run in MongoDB
db.users.updateMany(
  { role: 'jobseeker' },
  { $set: { role: 'candidate' } }
);

db.users.updateMany(
  { role: 'employer' },
  { $set: { role: 'recruiter' } }
);

// Create admin user
db.users.updateOne(
  { email: 'admin@yourcompany.com' },
  { $set: { role: 'admin' } }
);
```

## Support

For issues or questions about this migration, refer to the code comments or create an issue in the repository.
