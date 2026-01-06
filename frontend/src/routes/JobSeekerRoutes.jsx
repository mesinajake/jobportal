import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Import job-seeker pages from new structure
import Dashboard from '../pages/job-seeker/Dashboard';
import BrowseJobs from '../pages/job-seeker/BrowseJobs';
import Applications from '../pages/job-seeker/Applications';
import Profile from '../pages/job-seeker/Profile';
import JobDetails from '../pages/job-seeker/JobDetails';

/**
 * Job Seeker Routes - Protected routes for job seeker users only
 */
const JobSeekerRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Check if user is authenticated and has jobseeker role
  if (!user || user.role !== 'jobseeker') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="browse-jobs" element={<BrowseJobs />} />
      <Route path="job/:slug" element={<JobDetails />} />
      <Route path="applications" element={<Applications />} />
      <Route path="profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/job-seeker/dashboard" replace />} />
    </Routes>
  );
};

export default JobSeekerRoutes;
