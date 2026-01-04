import React from 'react';
import './Dashboard.css';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import JobSeekerDashboard from './JobSeekerDashboard';
import EmployerDashboard from './EmployerDashboard';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Route to appropriate dashboard based on user role
  if (user.role === 'employer') {
    return <EmployerDashboard />;
  } else if (user.role === 'jobseeker') {
    return <JobSeekerDashboard />;
  } else if (user.role === 'admin') {
    // Admin dashboard can be added later
    return <EmployerDashboard />;
  }

  // Default fallback to job seeker dashboard
  return <JobSeekerDashboard />;
}
