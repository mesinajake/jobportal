import User from '../models/User.js';
import Company from '../models/Company.js';
import { generateToken } from '../utils/jwt.js';
import emailService from '../utils/emailService.js';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName, companyWebsite } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role'
      });
    }

    // Validate role
    if (!['jobseeker', 'employer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be jobseeker, employer, or admin'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate email verification token
    const verificationToken = emailService.generateVerificationToken();
    user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email (don't await to avoid blocking)
    emailService.sendVerificationEmail(user, verificationToken)
      .catch(err => console.error('Email send error:', err));

    // If employer, create company profile
    let company = null;
    if (role === 'employer') {
      company = await Company.create({
        name: companyName || `${name}'s Company`,
        owner: user._id,
        website: companyWebsite || '',
        subscription: {
          plan: 'free',
          jobPostCredits: 3,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });
    }

    // Generate token with role
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: `${role === 'employer' ? 'Employer' : 'Job Seeker'} registered successfully. Please check your email to verify your account.`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        company: company ? {
          id: company._id,
          name: company.name,
          credits: company.subscription.jobPostCredits
        } : null,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Check if 2FA is enabled for employers
    if (user.role === 'employer' && user.twoFactorEnabled) {
      // Generate temporary 2FA code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorTempCode = crypto.createHash('sha256').update(code).digest('hex');
      user.twoFactorTempCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      // Send 2FA code via email
      await emailService.send2FACode(user, code);

      return res.status(200).json({
        success: true,
        message: 'Please check your email for the verification code',
        data: {
          requires2FA: true,
          userId: user._id
        }
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          publicProfile: user.publicProfile,
          preferredLocations: user.preferredLocations,
          jobTypes: user.jobTypes,
          isVerified: user.isVerified,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    console.log('🔍 getMe: Fetching user with ID:', req.user.id);
    const user = await User.findById(req.user.id);
    
    console.log('📥 getMe: Raw user from DB:', {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      preferredLocations: user.preferredLocations,
      jobTypes: user.jobTypes,
      industries: user.industries,
      skills: user.skills,
      experience: user.experience,
      education: user.education,
      languages: user.languages,
      portfolioLinks: user.portfolioLinks,
      desiredRoles: user.desiredRoles,
      salaryMin: user.salaryMin,
      salaryMax: user.salaryMax,
      availabilityDate: user.availabilityDate,
      willingToRelocate: user.willingToRelocate
    });
    
    const userJSON = user.toJSON();
    console.log('📤 getMe: Sending JSON:', userJSON);

    res.status(200).json({
      success: true,
      data: userJSON
    });
  } catch (error) {
    console.error('❌ getMe error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {}
  });
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token from params to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Verify user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      data: {
        isVerified: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = emailService.generateVerificationToken();
    user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link'
      });
    }

    // Generate reset token
    const { token, hashedToken, expires } = emailService.generateResetToken();
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send password reset email
    await emailService.sendPasswordResetEmail(user, token);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset password with token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash token to compare
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Enable 2FA for employer
// @route   POST /api/auth/enable-2fa
// @access  Private (Employer only)
export const enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        message: '2FA is only available for employers'
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      });
    }

    // Generate secret for authenticator app (optional, for TOTP)
    const secret = speakeasy.generateSecret({
      name: `Job Portal (${user.email})`,
      length: 32
    });

    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = true;
    await user.save();

    // Generate QR code for authenticator app
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      message: '2FA enabled successfully',
      data: {
        secret: secret.base32,
        qrCode,
        method: 'email' // Currently using email-based 2FA
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/disable-2fa
// @access  Private (Employer only)
export const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify 2FA code
// @route   POST /api/auth/verify-2fa
// @access  Public
export const verify2FA = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID and verification code'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash the code to compare
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    // Check if code is valid and not expired
    if (
      !user.twoFactorTempCode ||
      user.twoFactorTempCode !== hashedCode ||
      user.twoFactorTempCodeExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Clear temp code
    user.twoFactorTempCode = undefined;
    user.twoFactorTempCodeExpires = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: '2FA verification successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
