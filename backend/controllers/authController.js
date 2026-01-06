import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import emailService from '../utils/emailService.js';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { companyConfig, isAllowedStaffDomain } from '../config/company.js';
import otpService from '../services/otpService.js';

// @desc    Register a new candidate (public registration)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
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

    // Public registration always creates candidates
    const user = await User.create({
      name,
      email,
      password,
      role: 'candidate' // Always candidate for public registration
    });

    // Generate email verification token
    const verificationToken = emailService.generateVerificationToken();
    user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email (don't await to avoid blocking)
    emailService.sendVerificationEmail(user, verificationToken)
      .catch(err => console.error('Email send error:', err));

    // Generate token with role
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
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

// @desc    Invite staff member (HR/Admin only)
// @route   POST /api/auth/invite-staff
// @access  Private (HR/Admin)
export const inviteStaff = async (req, res) => {
  try {
    const { email, role, department, jobTitle } = req.body;

    // Validate role
    const allowedRoles = ['recruiter', 'hiring_manager', 'hr'];
    if (req.user.role !== 'admin' && role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can invite other admins'
      });
    }

    if (!allowedRoles.includes(role) && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}`
      });
    }

    // Verify email domain
    if (!isAllowedStaffDomain(email)) {
      return res.status(400).json({
        success: false,
        message: `Staff must use a company email domain (${companyConfig.allowedStaffDomains.join(', ')})`
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(inviteToken).digest('hex');

    // Create user with pending status
    const user = await User.create({
      email,
      role,
      department,
      jobTitle,
      name: email.split('@')[0], // Temporary name
      password: crypto.randomBytes(16).toString('hex'), // Temporary password
      invitedBy: req.user.id,
      invitedAt: new Date(),
      inviteToken: hashedToken,
      inviteTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Send invite email
    try {
      await emailService.sendStaffInvite(user, inviteToken, req.user);
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: `Invitation sent to ${email}`,
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite/${inviteToken}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept staff invitation
// @route   POST /api/auth/accept-invite/:token
// @access  Public
export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and password'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      inviteToken: hashedToken,
      inviteTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invitation token'
      });
    }

    // Update user
    user.name = name;
    user.password = password;
    user.isVerified = true;
    user.inviteToken = undefined;
    user.inviteTokenExpires = undefined;
    await user.save();

    // Generate auth token
    const authToken = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Account activated successfully!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          jobTitle: user.jobTitle
        },
        token: authToken
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

    console.log('🔐 Login attempt:', { email, passwordLength: password?.length });

    // Validate email & password
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✓ User found:', { id: user._id, email: user.email, hasPassword: !!user.password });

    // Check if account is locked
    if (user.isLocked()) {
      console.log('❌ Account locked:', { email, lockUntil: user.lockUntil });
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    console.log('🔑 Password match:', isMatch);

    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      console.log('❌ Invalid password for:', email);
      
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

    console.log('✅ Login successful:', { email: user.email, role: user.role });

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
    console.error('❌ Login error:', error);
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

// ==========================================
// SOCIAL AUTHENTICATION (Google)
// ==========================================

// @desc    Login/Register with Google
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Google ID and email are required'
      });
    }

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if email exists with different auth method
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        // Link Google to existing account
        existingUser.googleId = googleId;
        existingUser.authProvider = existingUser.authProvider === 'local' ? 'local' : 'google';
        if (avatar && !existingUser.avatar) {
          existingUser.avatar = avatar;
        }
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new user with Google
        user = await User.create({
          googleId,
          email,
          name,
          avatar,
          authProvider: 'google',
          role: 'candidate',
          isVerified: true // Google accounts are pre-verified
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          authProvider: user.authProvider,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// PHONE AUTHENTICATION (OTP)
// ==========================================

// @desc    Request OTP for phone login/register
// @route   POST /api/auth/phone/request-otp
// @access  Public
export const requestPhoneOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Validate phone number format
    if (!otpService.isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Check rate limiting
    const formattedPhone = otpService.formatPhoneNumber(phoneNumber);
    const rateLimitCheck = otpService.isRateLimited(formattedPhone);
    
    if (rateLimitCheck.limited) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${rateLimitCheck.waitTime} seconds before requesting another OTP`
      });
    }

    // Generate OTP
    const otp = otpService.generateOTP();
    const otpData = otpService.createOTPData(otp);

    // Find or create user
    let user = await User.findOne({ phoneNumber: formattedPhone });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Create placeholder user - will be completed after OTP verification
      user = new User({
        phoneNumber: formattedPhone,
        authProvider: 'phone',
        role: 'candidate',
        name: 'Phone User', // Temporary, will prompt for name after verification
        phoneOtp: otpData
      });
    } else {
      user.phoneOtp = otpData;
    }

    await user.save();

    // Record request for rate limiting
    otpService.recordRequest(formattedPhone);

    // Send OTP
    const sendResult = await otpService.sendOTP(formattedPhone, otp);

    if (!sendResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phoneNumber: formattedPhone,
        isNewUser,
        expiresIn: 300 // 5 minutes
      }
    });
  } catch (error) {
    console.error('Phone OTP request error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify OTP and login/register
// @route   POST /api/auth/phone/verify-otp
// @access  Public
export const verifyPhoneOTP = async (req, res) => {
  try {
    const { phoneNumber, otp, name } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    const formattedPhone = otpService.formatPhoneNumber(phoneNumber);
    
    // Find user
    const user = await User.findOne({ phoneNumber: formattedPhone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number. Please request OTP first.'
      });
    }

    // Verify OTP
    const verifyResult = otpService.verifyOTP(otp, user.phoneOtp);

    if (!verifyResult.valid) {
      // Increment attempts
      user.phoneOtp.attempts = (user.phoneOtp.attempts || 0) + 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: verifyResult.error,
        attemptsRemaining: verifyResult.attemptsRemaining
      });
    }

    // OTP verified - update user
    user.phoneVerified = true;
    user.isVerified = true;
    user.phoneOtp = undefined; // Clear OTP data
    user.lastLogin = new Date();

    // Update name if provided (for new users)
    if (name && user.name === 'Phone User') {
      user.name = name;
    }

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Phone verification successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: user.role,
          authProvider: user.authProvider,
          isVerified: user.isVerified,
          needsProfileUpdate: user.name === 'Phone User'
        },
        token
      }
    });
  } catch (error) {
    console.error('Phone OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Admin/Staff Login (Email + Password only)
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with staff role
    const user = await User.findOne({ 
      email,
      role: { $in: ['admin', 'hr', 'hiring_manager', 'recruiter'] }
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or not authorized for admin access'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts
    if (user.loginAttempts > 0 || user.lockUntil) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorTempCode = crypto.createHash('sha256').update(code).digest('hex');
      user.twoFactorTempCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

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
      message: 'Admin login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          jobTitle: user.jobTitle,
          isVerified: user.isVerified,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
