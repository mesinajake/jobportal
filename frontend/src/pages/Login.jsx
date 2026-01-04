import { useState } from 'react'
import './Login.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const from = location.state?.from?.pathname || '/'

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    console.log('Attempting login:', { email }); // Debug log
    try {
      const ok = await login(email, password)
      if (ok) {
        console.log('Login successful! Redirecting...'); // Debug log
        navigate(from, { replace: true })
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Login error:', error); // Debug log
      setError(error.message || 'Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="account-form-container">
      <section className="account-form">
        <form onSubmit={onSubmit}>
          <h3>Welcome Back!</h3>
          {error && <p style={{ color: 'crimson', marginBottom: '1rem' }}>{error}</p>}
          <input
            type="email"
            placeholder="Enter your email"
            className="input"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            className="input"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p>Don't have an account? <Link to="/register">Register Now</Link></p>
          <input type="submit" value="Log in now" name="submit" className="btn" />
        </form>
      </section>
    </div>
  )
}
