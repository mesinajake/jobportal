import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Import employer pages from new structure
import Dashboard from '../pages/employer/Dashboard';
import PostJob from '../pages/employer/PostJob';
import ManageJobs from '../pages/employer/ManageJobs';
import ViewApplications from '../pages/employer/ViewApplications';

/**
 * Employer Routes - Protected routes for employer users only
 */
const EmployerRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Check if user is authenticated and has employer role
  if (!user || user.role !== 'employer') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="post-job" element={<PostJob />} />
      <Route path="manage-jobs" element={<ManageJobs />} />
      <Route path="applications" element={<ViewApplications />} />
      <Route path="applications/:jobId" element={<ViewApplications />} />
      <Route path="*" element={<Navigate to="/employer/dashboard" replace />} />
    </Routes>
  );
};

export default EmployerRoutes;
