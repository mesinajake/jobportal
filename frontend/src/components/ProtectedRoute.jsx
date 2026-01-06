import { Navigate, useLocation } from 'react-router-dom'
import './ProtectedRoute.css'
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const { loggedIn, user, loading } = useAuth()
  const location = useLocation()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Redirect to login if not logged in
  if (!loggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Check role-based access if requiredRoles is specified
  if (requiredRoles.length > 0 && user) {
    // Admin always has access
    if (user.role === 'admin') {
      return children
    }
    
    // Check if user has one of the required roles
    if (!requiredRoles.includes(user.role)) {
      // Redirect candidates to their dashboard
      if (user.role === 'candidate') {
        return <Navigate to="/candidate/dashboard" replace />
      }
      // Redirect staff to recruitment dashboard
      return <Navigate to="/recruit/dashboard" replace />
    }
  }

  return children
}
