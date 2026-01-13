import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './EmailOTPLogin.css';

const EmailOTPLogin = () => {
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth();
  
  const [step, setStep] = useState('email'); // 'email' or 'verify'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus OTP input when step changes
  useEffect(() => {
    if (step === 'verify') {
      const otpInput = document.getElementById('otp-input');
      if (otpInput) otpInput.focus();
    }
  }, [step]);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/email/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('verify');
        setIsNewUser(data.data.isNewUser);
        setCountdown(60); // 60 second cooldown before resend
        setAttemptsRemaining(3);
        setSuccess('Verification code sent! Check your email.');
      } else {
        setError(data.message || 'Failed to send verification code');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Request OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate inputs
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (isNewUser && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/email/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp,
          ...(isNewUser && { name: name.trim() })
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update auth context with authenticated user
        setAuthenticatedUser(data.data.user, data.data.token);
        
        // Redirect based on role
        const redirectPath = data.data.user.role === 'candidate' 
          ? '/candidate/dashboard' 
          : `/${data.data.user.role}/dashboard`;
        
        navigate(redirectPath, { replace: true });
      } else {
        setError(data.message || 'Invalid verification code');
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Verify OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setError('');
    await handleRequestOTP({ preventDefault: () => {} });
  };

  const handleChangeEmail = () => {
    setStep('email');
    setOtp('');
    setName('');
    setError('');
    setSuccess('');
    setIsNewUser(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="email-otp-container">
      <div className="email-otp-card">
        <div className="email-otp-header">
          <div className="icon-circle">
            {step === 'email' ? '📧' : '🔐'}
          </div>
          <h2>{step === 'email' ? 'Sign in with Email' : 'Verify Your Email'}</h2>
          <p className="subtitle">
            {step === 'email' 
              ? 'Get a secure code sent to your email' 
              : `Code sent to ${email}`
            }
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <span>{success}</span>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleRequestOTP} className="otp-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit-primary"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button 
              type="button" 
              className="btn-login-secondary"
              onClick={() => navigate('/login')}
            >
              Sign in with Password
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="otp-form">
            {isNewUser && (
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
                <small>Since this is your first time, please tell us your name</small>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="otp-input">Verification Code</label>
              <input
                type="text"
                id="otp-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                pattern="\d{6}"
                inputMode="numeric"
                required
                disabled={loading}
                className="otp-input"
              />
              <small>
                {attemptsRemaining < 3 && (
                  <span className="attempts-warning">
                    ⚠️ {attemptsRemaining} attempt(s) remaining
                  </span>
                )}
              </small>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || otp.length !== 6 || (isNewUser && !name.trim())}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                'Verify & Sign In'
              )}
            </button>

            <div className="otp-actions">
              <button
                type="button"
                className="btn-link"
                onClick={handleResendOTP}
                disabled={countdown > 0 || loading}
              >
                {countdown > 0 
                  ? `Resend code in ${formatTime(countdown)}` 
                  : 'Resend Code'
                }
              </button>
              <button
                type="button"
                className="btn-link"
                onClick={handleChangeEmail}
                disabled={loading}
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        <div className="security-notice">
          <p>
            <strong>🔒 Security Notice:</strong> Never share your verification code with anyone. 
            Job Portal staff will never ask for this code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailOTPLogin;
