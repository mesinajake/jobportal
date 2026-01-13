import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCompanyInfo } from '../../../hooks/useCompanyInfo';
import './Header.css';

/**
 * Header - Main navigation header component
 * Displays logo, navigation links, and auth status
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { loggedIn, logout, user, isStaff } = useAuth();
  const { companyInfo } = useCompanyInfo();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (!loggedIn) return '/candidate/dashboard';
    if (isStaff && isStaff()) {
      return '/recruit/dashboard';
    }
    return '/candidate/dashboard';
  };

  // Determine profile link based on role
  const getProfileLink = () => {
    if (!loggedIn) return '/candidate/profile';
    if (isStaff && isStaff()) {
      return '/recruit/profile';
    }
    return '/candidate/profile';
  };

  return (
    <header className="header">
      <div className="header-container">
        <button 
          className="menu-toggle" 
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        
        <Link to="/" className="logo">
          {companyInfo?.logo ? (
            <img src={companyInfo.logo} alt={companyInfo.name} className="logo-img" />
          ) : (
            <i className="fa-solid fa-briefcase"></i>
          )}
          <span>{companyInfo?.name || 'Careers'}</span>
        </Link>
        
        <nav className={`nav-menu ${open ? 'active' : ''}`} onClick={() => setOpen(false)}>
          <NavLink to="/" end className="nav-link">Home</NavLink>
          <NavLink to="/careers" className="nav-link">Careers</NavLink>
          <NavLink to="/about" className="nav-link">About</NavLink>
          <NavLink to="/contact" className="nav-link">Contact</NavLink>
          
          {/* AI Analyzer visible to all, with smart redirect */}
          <NavLink to="/analyzer" className="nav-link nav-link-ai">
            <i className="fa-solid fa-robot"></i> AI Analyzer
          </NavLink>
          
          {loggedIn && (
            <NavLink to={getDashboardLink()} className="nav-link">Dashboard</NavLink>
          )}
          
          {loggedIn ? (
            <div className="nav-auth">
              <NavLink to={getProfileLink()} className="nav-link">
                <i className="fa-solid fa-user"></i> Profile
              </NavLink>
              <button onClick={handleLogout} className="logout-btn">
                <i className="fa-solid fa-sign-out-alt"></i> Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="nav-link login-link">
              <i className="fa-solid fa-user"></i> Login
            </NavLink>
          )}
        </nav>
        
        {loggedIn && isStaff && isStaff() && (
          <Link to="/recruit/post-job" className="btn-post-job">
            <i className="fa-solid fa-plus"></i> Post Job
          </Link>
        )}
      </div>
    </header>
  );
}
