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
  verify2FA
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { 
  authLimiter, 
  passwordResetLimiter, 
  emailVerificationLimiter 
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', emailVerificationLimiter, resendVerification);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.put('/reset-password/:token', passwordResetLimiter, resetPassword);
router.post('/verify-2fa', authLimiter, verify2FA);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// 2FA routes (Employer only)
router.post('/enable-2fa', protect, authorize('employer', 'admin'), enable2FA);
router.post('/disable-2fa', protect, authorize('employer', 'admin'), disable2FA);

export default router;
