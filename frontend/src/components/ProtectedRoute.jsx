import { Navigate, useLocation } from 'react-router-dom'
import './ProtectedRoute.css'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { loggedIn } = useAuth()
  const location = useLocation()

  if (!loggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}
