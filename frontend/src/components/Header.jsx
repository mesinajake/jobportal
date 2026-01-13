import { useState } from 'react'
import './Header.css'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { loggedIn, logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  // Determine dashboard and profile routes based on user role
  const isEmployer = user?.role === 'employer';
  const dashboardPath = isEmployer ? '/employer/dashboard' : '/dashboard';
  const profilePath = isEmployer ? '/employer/profile' : '/profile';
  const postJobPath = isEmployer ? '/employer/post-job' : '/jobs/post';

  return (
    <header className="header">
      <section className="flex">
        <div id="menu-btn" className="fa-solid fa-bars-staggered" onClick={() => setOpen(o => !o)} />
        <Link to="/" className="logo">
          <i className="fa-solid fa-users"></i>
          {' '}AppliTrak
        </Link>
        <nav className={`navbar ${open ? 'active' : ''}`} onClick={() => setOpen(false)}>
          {!isEmployer && <NavLink to="/" end>Home</NavLink>}
          {!isEmployer && <NavLink to="/about">About Us</NavLink>}
          {!isEmployer && <NavLink to="/jobs">Jobs</NavLink>}
          <NavLink to="/contact">Contacts</NavLink>
          {loggedIn && <NavLink to={dashboardPath}>Dashboard</NavLink>}
          {loggedIn && !isEmployer && <NavLink to="/analyzer">AI Analyzer</NavLink>}
          {loggedIn && isEmployer && (
            <>
              <NavLink to="/employer/manage-jobs">Manage Jobs</NavLink>
              <NavLink to="/employer/applications">Applications</NavLink>
            </>
          )}
          {loggedIn ? (
            <>
              <NavLink to={profilePath}>Profile</NavLink>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '1rem 1.5rem',
                  fontSize: '1.6rem',
                  color: '#3f6fb6',
                  borderRadius: '.5rem'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login">Account</NavLink>
          )}
        </nav>
        <Link to={postJobPath} id="post-job-btn" className="btn" style={{marginTop: 0}}>Post Job</Link>
      </section>
    </header>
  )
}
