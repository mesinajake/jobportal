import { Outlet, Navigate } from 'react-router-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './JobSeekerLayout.css';

/**
 * JobSeekerLayout - Layout wrapper for job seeker dashboard pages
 * Includes sidebar navigation specific to job seeker features
 */
export default function JobSeekerLayout() {
  const { loggedIn, logout, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Redirect other roles to their dashboards
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.role === 'employer') {
    return <Navigate to="/employer/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="jobseeker-layout">
      <aside className="jobseeker-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <i className="fa-solid fa-users"></i>
            <span>AppliTrak</span>
          </Link>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/job-seeker/dashboard" className="nav-item">
            <i className="fa-solid fa-gauge-high"></i>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/job-seeker/browse-jobs" className="nav-item">
            <i className="fa-solid fa-magnifying-glass"></i>
            <span>Browse Jobs</span>
          </NavLink>
          <NavLink to="/job-seeker/applications" className="nav-item">
            <i className="fa-solid fa-file-lines"></i>
            <span>My Applications</span>
          </NavLink>
          <NavLink to="/job-seeker/saved-jobs" className="nav-item">
            <i className="fa-solid fa-heart"></i>
            <span>Saved Jobs</span>
          </NavLink>
          <NavLink to="/job-seeker/analyzer" className="nav-item">
            <i className="fa-solid fa-robot"></i>
            <span>AI Analyzer</span>
          </NavLink>
          <NavLink to="/job-seeker/profile" className="nav-item">
            <i className="fa-solid fa-user"></i>
            <span>My Profile</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="jobseeker-main">
        <header className="jobseeker-header">
          <div className="header-title">
            <h2>Job Seeker Portal</h2>
          </div>
          <div className="header-user">
            <span>Welcome, {user?.name || 'Job Seeker'}</span>
            <i className="fa-solid fa-user-circle"></i>
          </div>
        </header>
        <main className="jobseeker-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
