import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables immediately when this module is imported
dotenv.config();

/**
 * Email Service Utility
 * Handles all email operations with proper error handling and logging
 * Best Practice: Centralized email service for maintainability
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize email transporter with environment configuration
   * Uses lazy initialization to ensure env vars are loaded
   */
  ensureInitialized() {
    if (this.initialized) return;
    
    this.initialized = true;
    
    // Debug: Log what we're reading from environment
    console.log('\n🔧 Email Service Initialization:');
    console.log('  SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
    console.log('  SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
    console.log('  SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
    console.log('  SMTP_PASS:', process.env.SMTP_PASS ? `${process.env.SMTP_PASS.substring(0, 4)}****${process.env.SMTP_PASS.substring(process.env.SMTP_PASS.length - 4)} (${process.env.SMTP_PASS.length} chars)` : 'NOT SET');
    
    try {
      // Check if we have SMTP credentials
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('⚠️  No SMTP credentials found - running in console-only mode');
        console.log('📧 Emails will be logged to console only\n');
        this.transporter = null;
        return;
      }

      // Create transporter with Gmail settings
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
      });

      console.log('✅ Email service initialized successfully\n');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      this.transporter = null;
    }
  }

  /**
   * Generate secure verification token
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate reset password token with expiry
   */
  generateResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    return { token, hashedToken, expires };
  }

  /**
   * Send email with retry logic
   */
  async sendEmail(options, retries = 3) {
    // Ensure initialized before sending
    this.ensureInitialized();
    
    const { to, subject, html, text } = options;

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      throw new Error('Missing required email fields: to, subject, and content (html or text)');
    }

    // Development/Console mode: Log email instead of sending
    if (!this.transporter) {
      console.log('\n📧 ===== EMAIL (Console Mode) =====');
      console.log('To:', to);
      console.log('Subject:', subject);
      
      // Extract OTP from subject or content for easy testing
      const otpMatch = subject.match(/(\d{6})/);
      if (otpMatch) {
        console.log('🔑 OTP CODE:', otpMatch[1]);
      }
      
      console.log('=====================================\n');
      return { success: true, mode: 'console' };
    }

    // Production mode: Send actual email with retry logic
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const mailOptions = {
          from: `"${process.env.FROM_NAME || 'Job Portal'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
          to,
          subject,
          text,
          html: html || text
        };

        const info = await this.transporter.sendMail(mailOptions);
        
        console.log(`✅ Email sent successfully to ${to}`);
        console.log('Message ID:', info.messageId);
        
        return { success: true, messageId: info.messageId };
      } catch (error) {
        console.error(`❌ Email send attempt ${attempt}/${retries} failed:`, error.message);
        
        if (attempt === retries) {
          throw new Error(`Failed to send email after ${retries} attempts: ${error.message}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  /**
   * Send verification email to new users
   */
  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3f6fb6; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #3f6fb6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Job Portal!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Thank you for registering with Job Portal. Please verify your email address to complete your registration.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="btn">Verify Email Address</a>
            </p>
            <p><small>If you didn't create this account, you can safely ignore this email.</small></p>
            <p><small>This link will expire in 24 hours.</small></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Job Portal!
      
      Hi ${user.name},
      
      Please verify your email by clicking this link: ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create this account, you can safely ignore this email.
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Job Portal',
      html,
      text
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3f6fb6; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #3f6fb6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </p>
            <div class="warning">
              <p><strong>Security Notice:</strong></p>
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <p><small>This link will expire in 1 hour for security reasons.</small></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request
      
      Hi ${user.name},
      
      We received a request to reset your password. Click this link to reset: ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this, please ignore this email.
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password - Job Portal',
      html,
      text
    });
  }

  /**
   * Send 2FA verification code
   */
  async send2FACode(user, code) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3f6fb6; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; text-align: center; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3f6fb6; background: white; padding: 20px; border-radius: 8px; margin: 30px 0; display: inline-block; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Two-Factor Authentication</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Your verification code for Job Portal is:</p>
            <div class="code">${code}</div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't request this code, please secure your account immediately.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Two-Factor Authentication
      
      Hi ${user.name},
      
      Your verification code for Job Portal is: ${code}
      
      This code will expire in 10 minutes.
      
      If you didn't request this code, please secure your account immediately.
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Your 2FA Verification Code - Job Portal',
      html,
      text
    });
  }

  /**
   * Send OTP verification code via email
   */
  async sendOTPEmail(user, otp) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3f6fb6; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; text-align: center; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3f6fb6; background: white; padding: 20px; border-radius: 8px; margin: 30px 0; display: inline-block; border: 2px dashed #3f6fb6; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; text-align: left; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Your Verification Code</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name || 'there'},</h2>
            <p>Your one-time verification code for Job Portal is:</p>
            <div class="otp-code">${otp}</div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Never share this code with anyone</li>
                <li>Job Portal staff will never ask for this code</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Your Verification Code
      
      Hi ${user.name || 'there'},
      
      Your one-time verification code for Job Portal is: ${otp}
      
      This code will expire in 10 minutes.
      
      Security Notice:
      - Never share this code with anyone
      - Job Portal staff will never ask for this code
      - If you didn't request this code, please ignore this email
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `Your Verification Code: ${otp} - Job Portal`,
      html,
      text
    });
  }

  /**
   * Send application confirmation email to job seeker
   */
  async sendApplicationConfirmation(user, job) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3f6fb6; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .job-details { background-color: white; padding: 20px; border-left: 4px solid #3f6fb6; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Submitted!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Your application has been successfully submitted!</p>
            <div class="job-details">
              <h3>${job.title}</h3>
              <p><strong>Company:</strong> ${job.company}</p>
              <p><strong>Location:</strong> ${job.location}</p>
              <p><strong>Type:</strong> ${job.type}</p>
            </div>
            <p>You can track your application status in your dashboard.</p>
            <p>Good luck with your application!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `Application Submitted - ${job.title}`,
      html,
      text: `Your application for ${job.title} at ${job.company} has been submitted successfully!`
    });
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;
