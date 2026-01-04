import { useState } from 'react'
import './Header.css'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Header() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { loggedIn, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="header">
      <section className="flex">
        <div id="menu-btn" className="fa-solid fa-bars-staggered" onClick={() => setOpen(o => !o)} />
        <Link to="/" className="logo">
          <i className="fa-solid fa-users"></i>
          {' '}AppliTrak
        </Link>
        <nav className={`navbar ${open ? 'active' : ''}`} onClick={() => setOpen(false)}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/jobs">Jobs</NavLink>
          <NavLink to="/contact">Contacts</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          {loggedIn && <NavLink to="/analyzer">AI Analyzer</NavLink>}
          {loggedIn ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
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
        <Link to="/dashboard" id="post-job-btn" className="btn" style={{marginTop: 0}}>Post Job</Link>
      </section>
    </header>
  )
}
