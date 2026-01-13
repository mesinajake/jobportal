import { Outlet, Navigate } from 'react-router-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './AdminLayout.css';

/**
 * AdminLayout - Layout wrapper for admin dashboard pages
 * Includes sidebar navigation and admin-specific header
 */
export default function AdminLayout() {
  const { loggedIn, logout, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or not admin
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <i className="fa-solid fa-users"></i>
            <span>AppliTrak</span>
          </Link>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className="nav-item">
            <i className="fa-solid fa-gauge-high"></i>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/users" className="nav-item">
            <i className="fa-solid fa-users-gear"></i>
            <span>Manage Users</span>
          </NavLink>
          <NavLink to="/admin/reports" className="nav-item">
            <i className="fa-solid fa-chart-line"></i>
            <span>Reports</span>
          </NavLink>
          <NavLink to="/admin/settings" className="nav-item">
            <i className="fa-solid fa-gear"></i>
            <span>Settings</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-search">
            <i className="fa-solid fa-search"></i>
            <input type="text" placeholder="Search..." />
          </div>
          <div className="header-user">
            <span>{user?.name || 'Admin'}</span>
            <i className="fa-solid fa-user-circle"></i>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
