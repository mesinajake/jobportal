import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, requestPhoneOTP, verifyPhoneOTP, loggedIn } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMethod, setAuthMethod] = useState('options'); // 'options', 'phone', 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

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

  // Google Sign In Handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      // For demo purposes, we'll simulate Google OAuth
      // In production, integrate with @react-oauth/google or gapi
      // This shows the expected data structure
      
      // Simulated Google response - replace with actual Google OAuth
      const mockGoogleData = {
        googleId: 'google_' + Date.now(),
        email: 'demo@gmail.com',
        name: 'Demo User',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=random'
      };
      
      // Show prompt for actual implementation
      alert('Google Sign-In: In production, this would open Google OAuth popup.\n\nFor now, integrate with @react-oauth/google package.');
      
      // Uncomment when Google OAuth is integrated:
      // const result = await loginWithGoogle(mockGoogleData);
      // if (result.success) {
      //   navigate('/candidate/dashboard', { replace: true });
      // } else {
      //   setError(result.message);
      // }
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Request Handler
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await requestPhoneOTP(phoneNumber);
      
      if (result.success) {
        setAuthMethod('otp');
        setCountdown(60); // 60 second cooldown
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification Handler
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifyPhoneOTP(phoneNumber, otp);
      
      if (result.success) {
        const from = location.state?.from?.pathname || '/candidate/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const result = await requestPhoneOTP(phoneNumber);
      if (result.success) {
        setCountdown(60);
        setOtp('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Render auth options
  const renderAuthOptions = () => (
    <>
      <div className="auth-header">
        <h1>Welcome to Careers</h1>
        <p>Sign in to explore job opportunities</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="social-auth-buttons">
        {/* Google Sign In */}
        <button 
          type="button" 
          className="social-btn google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" className="social-icon">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Phone Sign In */}
        <button 
          type="button" 
          className="social-btn phone-btn"
          onClick={() => setAuthMethod('phone')}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" className="social-icon" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          Continue with Phone
        </button>
      </div>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <div className="email-signin-link">
        <Link to="/login/email" className="btn-email-signin">
          Sign in with Email
        </Link>
      </div>

      <div className="auth-footer">
        <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
        <p className="admin-link">
          <Link to="/admin/login">Staff / Admin Login</Link>
        </p>
      </div>
    </>
  );

  // Render phone number input
  const renderPhoneInput = () => (
    <>
      <div className="auth-header">
        <button 
          type="button" 
          className="back-btn"
          onClick={() => setAuthMethod('options')}
        >
          ← Back
        </button>
        <h1>Phone Sign In</h1>
        <p>Enter your phone number to receive a verification code</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleRequestOTP} className="auth-form">
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1 (555) 123-4567"
            required
          />
          <small className="input-hint">We'll send you a verification code</small>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Already have an account? <Link to="/login">Other sign in options</Link></p>
      </div>
    </>
  );

  // Render OTP verification
  const renderOTPVerification = () => (
    <>
      <div className="auth-header">
        <button 
          type="button" 
          className="back-btn"
          onClick={() => {
            setAuthMethod('phone');
            setOtp('');
          }}
        >
          ← Back
        </button>
        <h1>Enter Verification Code</h1>
        <p>We sent a code to {phoneNumber}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleVerifyOTP} className="auth-form">
        <div className="form-group">
          <label htmlFor="otp">Verification Code</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="otp-input"
            required
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading || otp.length !== 6}>
          {loading ? 'Verifying...' : 'Verify & Sign In'}
        </button>
      </form>

      <div className="resend-section">
        {countdown > 0 ? (
          <p>Resend code in {countdown}s</p>
        ) : (
          <button 
            type="button" 
            className="resend-btn"
            onClick={handleResendOTP}
            disabled={loading}
          >
            Resend Code
          </button>
        )}
      </div>

      <div className="auth-footer">
        <p>Wrong number? <button type="button" className="link-btn" onClick={() => setAuthMethod('phone')}>Change</button></p>
      </div>
    </>
  );

  return (
    <div className="auth-page">
      <div className="auth-container">
        {authMethod === 'options' && renderAuthOptions()}
        {authMethod === 'phone' && renderPhoneInput()}
        {authMethod === 'otp' && renderOTPVerification()}
      </div>
    </div>
  );
};

export default Login;
