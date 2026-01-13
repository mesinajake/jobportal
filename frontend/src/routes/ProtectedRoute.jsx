import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * ProtectedRoute - Route wrapper that requires authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { loggedIn, user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
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
