import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * PublicRoute - Route wrapper for public pages
 * Redirects authenticated users to their dashboard
 */
export default function PublicRoute({ children, redirectIfAuth = false }) {
  const { loggedIn, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect authenticated users away from login/register
  if (redirectIfAuth && loggedIn) {
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'employer':
        return <Navigate to="/employer/dashboard" replace />;
      default:
        return <Navigate to="/job-seeker/dashboard" replace />;
    }
  }

  return children || <Outlet />;
}
