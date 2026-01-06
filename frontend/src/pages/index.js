// Pages barrel export - organized by role

// Common pages (public)
export * from './common';

// Auth pages
export * from './auth';

// Admin pages
export { default as AdminDashboard } from './admin/Dashboard';
export { default as AdminUsers } from './admin/Users';
export { default as AdminReports } from './admin/Reports';
export { default as AdminSettings } from './admin/Settings';

// Legacy alias for backward compatibility
export { default as AdminManageUsers } from './admin/Users';

// Recruitment pages (staff)
export { default as RecruitmentDashboard } from './employer/Dashboard';
// Note: PostJob, ManageJobs, ViewApplications, Profile are in employer folder

// Candidate pages
export { default as CandidateDashboard } from './job-seeker/Dashboard';
export { default as BrowseJobs } from './job-seeker/BrowseJobs';
export { default as JobDetails } from './job-seeker/JobDetails';
export { default as Applications } from './job-seeker/Applications';
export { default as JobAnalyzer } from './job-seeker/JobAnalyzer';
export { default as CandidateProfile } from './job-seeker/Profile';
export { default as SearchJobs } from './job-seeker/SearchJobs';

// Legacy aliases for backward compatibility
export { default as JobSeekerDashboard } from './job-seeker/Dashboard';
export { default as EmployerDashboard } from './employer/Dashboard';
export { default as JobSeekerProfile } from './job-seeker/Profile';
