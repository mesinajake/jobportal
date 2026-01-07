import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  enable2FA,
  disable2FA,
  verify2FA,
  inviteStaff,
  acceptInvite,
  googleAuth,
  requestPhoneOTP,
  verifyPhoneOTP,
  requestEmailOTP,
  verifyEmailOTP,
  adminLogin
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleAccess.js';
import { 
  authLimiter, 
  passwordResetLimiter, 
  emailVerificationLimiter 
} from '../middleware/rateLimiter.js';

const router = express.Router();

// ==========================================
// PUBLIC AUTHENTICATION ROUTES
// ==========================================

// Traditional email/password (for all users)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Social Authentication (Google) - For candidates
router.post('/google', authLimiter, googleAuth);

// Email OTP Authentication (Passwordless) - For candidates
router.post('/email/request-otp', authLimiter, requestEmailOTP);
router.post('/email/verify-otp', authLimiter, verifyEmailOTP);

// Phone Authentication (OTP) - For candidates
router.post('/phone/request-otp', authLimiter, requestPhoneOTP);
router.post('/phone/verify-otp', authLimiter, verifyPhoneOTP);

// Admin/Staff Login (Email + Password only)
router.post('/admin/login', authLimiter, adminLogin);

// Email verification
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', emailVerificationLimiter, resendVerification);

// Password recovery
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.put('/reset-password/:token', passwordResetLimiter, resetPassword);

// 2FA verification
router.post('/verify-2fa', authLimiter, verify2FA);

// Staff invitation acceptance
router.post('/accept-invite/:token', authLimiter, acceptInvite);

// ==========================================
// PROTECTED ROUTES
// ==========================================

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Staff invitation routes (HR/Admin only)
router.post('/invite-staff', protect, requireRole('hr', 'admin'), inviteStaff);

// 2FA routes (Staff only - HR, hiring managers, admin)
router.post('/enable-2fa', protect, requireRole('hr', 'hiring_manager', 'admin'), enable2FA);
router.post('/disable-2fa', protect, requireRole('hr', 'hiring_manager', 'admin'), disable2FA);

export default router;
