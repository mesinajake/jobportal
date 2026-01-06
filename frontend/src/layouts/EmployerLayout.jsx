import { Outlet, Navigate } from 'react-router-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './EmployerLayout.css';

/**
 * EmployerLayout - Layout wrapper for employer dashboard pages
 * Includes sidebar navigation specific to employer features
 */
export default function EmployerLayout() {
  const { loggedIn, logout, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or not employer
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'employer') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="employer-layout">
      <aside className="employer-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <i className="fa-solid fa-users"></i>
            <span>AppliTrak</span>
          </Link>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/employer/dashboard" className="nav-item">
            <i className="fa-solid fa-gauge-high"></i>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/employer/post-job" className="nav-item">
            <i className="fa-solid fa-plus-circle"></i>
            <span>Post a Job</span>
          </NavLink>
          <NavLink to="/employer/manage-jobs" className="nav-item">
            <i className="fa-solid fa-briefcase"></i>
            <span>Manage Jobs</span>
          </NavLink>
          <NavLink to="/employer/applications" className="nav-item">
            <i className="fa-solid fa-file-lines"></i>
            <span>Applications</span>
          </NavLink>
          <NavLink to="/employer/company-profile" className="nav-item">
            <i className="fa-solid fa-building"></i>
            <span>Company Profile</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="employer-main">
        <header className="employer-header">
          <div className="header-title">
            <h2>Employer Portal</h2>
          </div>
          <div className="header-user">
            <span>{user?.name || user?.companyName || 'Employer'}</span>
            <i className="fa-solid fa-user-circle"></i>
          </div>
        </header>
        <main className="employer-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
