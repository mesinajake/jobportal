import nodemailer from 'nodemailer';
import crypto from 'crypto';

/**
 * Email Service Utility
 * Handles all email operations with proper error handling and logging
 * Best Practice: Centralized email service for maintainability
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter with environment configuration
   * Supports both SMTP and Gmail
   */
  initializeTransporter() {
    try {
      // For development: Use ethereal email or configure SMTP
      if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
        console.log('⚠️  Email service running in development mode without SMTP configuration');
        console.log('📧 Emails will be logged to console only');
        return;
      }

      // Use default import properly
      if (typeof nodemailer === 'function') {
        this.transporter = nodemailer({
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
      } else if (nodemailer.createTransport) {
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
      }

      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
    }
  }

  /**
   * Generate secure verification token
   * Best Practice: Use crypto for secure token generation
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate reset password token with expiry
   * Best Practice: Tokens should expire for security
   */
  generateResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return { token, hashedToken, expires };
  }

  /**
   * Send email with retry logic
   * Best Practice: Implement retry mechanism for transient failures
   */
  async sendEmail(options, retries = 3) {
    const { to, subject, html, text } = options;

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      throw new Error('Missing required email fields: to, subject, and content (html or text)');
    }

    // Development mode: Log email instead of sending
    if (!this.transporter) {
      console.log('\n📧 ===== EMAIL (Development Mode) =====');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', text || 'HTML content provided');
      console.log('=====================================\n');
      return { success: true, mode: 'development' };
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
   * Best Practice: Separate methods for different email types
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
          .button { display: inline-block; padding: 12px 30px; background-color: #3f6fb6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
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
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3f6fb6;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with us, please ignore this email.</p>
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
      
      Thank you for registering with Job Portal. Please verify your email address to complete your registration.
      
      Click the link below to verify your email:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with us, please ignore this email.
      
      © ${new Date().getFullYear()} Job Portal. All rights reserved.
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
   * Best Practice: Include security warnings
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
          .header { background-color: #d9534f; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #d9534f; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
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
            <p>We received a request to reset your password for your Job Portal account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #d9534f;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
                <li>Never share this link with anyone</li>
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
      Password Reset Request
      
      Hi ${user.name},
      
      We received a request to reset your password for your Job Portal account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      ⚠️ Security Notice:
      - This link will expire in 1 hour
      - If you didn't request this reset, please ignore this email
      - Your password will remain unchanged until you create a new one
      - Never share this link with anyone
      
      © ${new Date().getFullYear()} Job Portal. All rights reserved.
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Job Portal',
      html,
      text
    });
  }

  /**
   * Send 2FA verification code for employers
   * Best Practice: Separate 2FA email for enhanced security
   */
  async send2FACode(user, code) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #5cb85c; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; text-align: center; }
          .code { font-size: 32px; letter-spacing: 8px; color: #3f6fb6; font-weight: bold; background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0; }
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
      
      © ${new Date().getFullYear()} Job Portal. All rights reserved.
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Your 2FA Verification Code - Job Portal',
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
