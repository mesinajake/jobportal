import { useState } from 'react'
import './Register.css'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [cpass, setCpass] = useState('')
  const [role, setRole] = useState('jobseeker') // NEW: Default to jobseeker
  const [companyName, setCompanyName] = useState('') // NEW: For employers
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!name || !email || !pass || !cpass) {
      setError('Please fill in all fields')
      return
    }

    // Employer-specific validation
    if (role === 'employer' && !companyName) {
      setError('Please provide your company name')
      return
    }
    
    if (pass !== cpass) {
      setError('Passwords do not match!')
      return
    }
    
    if (pass.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    console.log('Attempting registration:', { name, email, role }); // Debug log
    try {
      const ok = await register(name, email, pass, role, companyName)
      if (ok) {
        console.log('Registration successful! Redirecting to dashboard...'); // Debug log
        navigate('/dashboard', { replace: true })
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Registration error:', error); // Debug log
      // Show specific error message from server
      if (error.message.includes('already exists')) {
        setError('An account with this email already exists. Please login instead.')
      } else {
        setError(error.message || 'Registration failed. Please try again.')
      }
    }
  }

  return (
    <div className="account-form-container">
      <section className="account-form">
        <form onSubmit={onSubmit}>
          <h3>Create New Account!</h3>
          {error && <p style={{ color: 'crimson', marginBottom: '1rem' }}>{error}</p>}
          
          {/* NEW: Role Selection */}
          <div className="role-selection">
            <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
              I want to:
            </label>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <label className="role-option" style={{ flex: 1 }}>
                <input
                  type="radio"
                  name="role"
                  value="jobseeker"
                  checked={role === 'jobseeker'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <span>🔍 Find Jobs (Job Seeker)</span>
              </label>
              <label className="role-option" style={{ flex: 1 }}>
                <input
                  type="radio"
                  name="role"
                  value="employer"
                  checked={role === 'employer'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <span>🏢 Hire Talent (Employer)</span>
              </label>
            </div>
          </div>

          <input
            type="text"
            required
            name="name"
            maxLength={40}
            placeholder={role === 'employer' ? 'Enter your full name' : 'Enter your name'}
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* NEW: Company Name for Employers */}
          {role === 'employer' && (
            <input
              type="text"
              required
              name="companyName"
              maxLength={100}
              placeholder="Enter your company name"
              className="input"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          )}

          <input
            type="email"
            required
            name="email"
            maxLength={50}
            placeholder="Enter your email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            name="pass"
            maxLength={20}
            placeholder="Enter your password"
            className="input"
            id="pass"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <input
            type="password"
            required
            name="c_pass"
            maxLength={20}
            placeholder="Confirm your password"
            className="input"
            id="c_pass"
            value={cpass}
            onChange={(e) => setCpass(e.target.value)}
          />
          <p>Already have an account? <Link to="/login">Login Now</Link></p>
          <input type="submit" value="Register now" name="submit" className="btn" />
        </form>
      </section>
    </div>
  )
}
