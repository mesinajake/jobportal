import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loginWithGoogle, requestPhoneOTP, verifyPhoneOTP, loggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState('options'); // 'options', 'email', 'phone', 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (loggedIn) {
      const from = location.state?.from?.pathname || '/candidate/dashboard';
      navigate(from, { replace: true });
    }
  }, [loggedIn, navigate, location]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
    if (score <= 4) return { score, label: 'Medium', color: '#f59e0b' };
    return { score, label: 'Strong', color: '#10b981' };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!validateEmail(formData.email)) errors.email = 'Please enter a valid email';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!termsAccepted) errors.terms = 'You must accept the terms';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Google Sign Up
  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      alert('Google Sign-Up: In production, integrate with @react-oauth/google package.');
    } catch (err) {
      setError('Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Request
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await requestPhoneOTP(phoneNumber);
      if (result.success) {
        setAuthMethod('otp');
        setCountdown(60);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await verifyPhoneOTP(phoneNumber, otp, formData.name);
      if (result.success) {
        navigate('/candidate/dashboard', { replace: true });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Email Registration
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validateForm()) return;
    setLoading(true);
    setError('');

    try {
      const result = await register(formData.name, formData.email, formData.password);
      if (result && result.success) {
        navigate('/candidate/dashboard', { replace: true });
      } else {
        setError(result?.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // Render auth options
  const renderAuthOptions = () => (
    <>
      <div className="auth-header">
        <h1>Create Account</h1>
        <p>Start your career journey with us</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="social-auth-buttons">
        <button type="button" className="social-btn google-btn" onClick={handleGoogleSignUp} disabled={loading}>
          <svg viewBox="0 0 24 24" className="social-icon">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <button type="button" className="social-btn phone-btn" onClick={() => setAuthMethod('phone')} disabled={loading}>
          <svg viewBox="0 0 24 24" className="social-icon" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          Continue with Phone
        </button>
      </div>

      <div className="auth-divider"><span>or</span></div>

      <button type="button" className="btn-email-signin" onClick={() => setAuthMethod('email')}>
        Sign up with Email
      </button>

      <div className="auth-footer">
        <p>Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </>
  );

  // Render phone input
  const renderPhoneInput = () => (
    <>
      <div className="auth-header">
        <button type="button" className="back-btn" onClick={() => setAuthMethod('options')}>← Back</button>
        <h1>Phone Sign Up</h1>
        <p>Enter your phone number</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleRequestOTP} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input type="tel" id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1 (555) 123-4567" required />
        </div>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>
    </>
  );

  // Render OTP input
  const renderOTPInput = () => (
    <>
      <div className="auth-header">
        <button type="button" className="back-btn" onClick={() => setAuthMethod('phone')}>← Back</button>
        <h1>Enter Code</h1>
        <p>Sent to {phoneNumber}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleVerifyOTP} className="auth-form">
        <div className="form-group">
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit code" maxLength={6} className="otp-input" required />
        </div>
        <button type="submit" className="btn-submit" disabled={loading || otp.length !== 6}>
          {loading ? 'Verifying...' : 'Verify & Create Account'}
        </button>
      </form>

      <div className="resend-section">
        {countdown > 0 ? <p>Resend in {countdown}s</p> : (
          <button type="button" className="resend-btn" onClick={handleRequestOTP}>Resend Code</button>
        )}
      </div>
    </>
  );

  // Render email form
  const renderEmailForm = () => (
    <>
      <div className="auth-header">
        <button type="button" className="back-btn" onClick={() => setAuthMethod('options')}>← Back</button>
        <h1>Create Account</h1>
        <p>Sign up with email</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleEmailSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className={fieldErrors.name ? 'error' : ''} />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="your.email@example.com" className={fieldErrors.email ? 'error' : ''} />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <div className="password-input-wrapper">
            <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" className={fieldErrors.password ? 'error' : ''} />
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div className="strength-fill" style={{ width: `${(passwordStrength.score / 6) * 100}%`, backgroundColor: passwordStrength.color }} />
              </div>
              <span className="strength-label" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
            </div>
          )}
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <div className="password-input-wrapper">
            <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className={fieldErrors.confirmPassword ? 'error' : ''} />
            <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
        </div>

        <div className="terms">
          <label className={fieldErrors.terms ? 'error' : ''}>
            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
            <span>I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a></span>
          </label>
          {fieldErrors.terms && <span className="field-error">{fieldErrors.terms}</span>}
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </>
  );

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        {authMethod === 'options' && renderAuthOptions()}
        {authMethod === 'email' && renderEmailForm()}
        {authMethod === 'phone' && renderPhoneInput()}
        {authMethod === 'otp' && renderOTPInput()}
      </div>
    </div>
  );
};

export default Register;
