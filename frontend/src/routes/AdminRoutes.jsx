import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Import admin pages from new structure
import Dashboard from '../pages/admin/Dashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';

/**
 * Admin Routes - Protected routes for admin users only
 */
const AdminRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Check if user is authenticated and has admin role
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="users" element={<ManageUsers />} />
      <Route path="reports" element={<Reports />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
