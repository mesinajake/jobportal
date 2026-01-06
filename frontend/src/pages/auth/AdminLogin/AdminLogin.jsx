import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogin, loggedIn, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Redirect if already logged in as staff
  useEffect(() => {
    if (loggedIn && user) {
      const staffRoles = ['admin', 'hr', 'hiring_manager', 'recruiter'];
      if (staffRoles.includes(user.role)) {
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/recruit/dashboard', { replace: true });
        }
      } else {
        // Non-staff user, redirect to candidate dashboard
        navigate('/candidate/dashboard', { replace: true });
      }
    }
  }, [loggedIn, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminLogin(formData.email, formData.password);
      
      if (result && result.success) {
        const role = result.user?.role;
        
        if (role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (['recruiter', 'hiring_manager', 'hr'].includes(role)) {
          navigate('/recruit/dashboard', { replace: true });
        } else {
          setError('Access denied. This login is for staff and admins only.');
        }
      } else {
        setError(result?.message || 'Invalid credentials or not authorized for admin access.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-container">
        <div className="admin-brand">
          <div className="admin-logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <h2>Staff Portal</h2>
        </div>

        <div className="admin-auth-header">
          <h1>Admin Login</h1>
          <p>Sign in with your staff credentials</p>
        </div>

        {error && <div className="admin-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-auth-form">
          <div className="admin-form-group">
            <label htmlFor="email">Work Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="admin-form-options">
            <label className="admin-remember-me">
              <input type="checkbox" />
              <span>Keep me signed in</span>
            </label>
            <Link to="/forgot-password" className="admin-forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="admin-btn-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="admin-auth-footer">
          <p>Looking to apply for a job? <Link to="/login">Go to Candidate Login</Link></p>
        </div>

        <div className="admin-security-note">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
          <span>Secure login with 2FA support</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
