/**
 * OTP Service for Phone Authentication
 * Handles OTP generation, storage, and verification
 * 
 * NOTE: In production, integrate with SMS providers like:
 * - Twilio (https://www.twilio.com)
 * - AWS SNS
 * - Firebase Auth
 */

import crypto from 'crypto';

class OTPService {
  constructor() {
    // OTP configuration
    this.otpLength = 6;
    this.otpExpiry = 5 * 60 * 1000; // 5 minutes
    this.maxAttempts = 3;
    this.cooldownPeriod = 60 * 1000; // 1 minute between OTP requests
    
    // In-memory rate limiting (use Redis in production)
    this.rateLimits = new Map();
  }

  /**
   * Generate a numeric OTP
   */
  generateOTP() {
    // Generate cryptographically secure random digits
    const digits = '0123456789';
    let otp = '';
    const randomBytes = crypto.randomBytes(this.otpLength);
    
    for (let i = 0; i < this.otpLength; i++) {
      otp += digits[randomBytes[i] % 10];
    }
    
    return otp;
  }

  /**
   * Hash OTP for secure storage
   */
  hashOTP(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Check if phone number is rate limited
   */
  isRateLimited(phoneNumber) {
    const lastRequest = this.rateLimits.get(phoneNumber);
    if (lastRequest && Date.now() - lastRequest < this.cooldownPeriod) {
      return {
        limited: true,
        waitTime: Math.ceil((this.cooldownPeriod - (Date.now() - lastRequest)) / 1000)
      };
    }
    return { limited: false };
  }

  /**
   * Record OTP request for rate limiting
   */
  recordRequest(phoneNumber) {
    this.rateLimits.set(phoneNumber, Date.now());
    
    // Clean up old entries periodically
    if (this.rateLimits.size > 10000) {
      const cutoff = Date.now() - this.cooldownPeriod;
      for (const [phone, time] of this.rateLimits.entries()) {
        if (time < cutoff) {
          this.rateLimits.delete(phone);
        }
      }
    }
  }

  /**
   * Create OTP data for user storage
   */
  createOTPData(otp) {
    return {
      code: this.hashOTP(otp),
      expiresAt: new Date(Date.now() + this.otpExpiry),
      attempts: 0
    };
  }

  /**
   * Verify OTP against stored hash
   */
  verifyOTP(inputOtp, storedData) {
    if (!storedData || !storedData.code) {
      return { valid: false, error: 'No OTP found. Please request a new one.' };
    }

    // Check expiry
    if (new Date() > new Date(storedData.expiresAt)) {
      return { valid: false, error: 'OTP has expired. Please request a new one.' };
    }

    // Check max attempts
    if (storedData.attempts >= this.maxAttempts) {
      return { valid: false, error: 'Too many attempts. Please request a new OTP.' };
    }

    // Verify OTP
    const hashedInput = this.hashOTP(inputOtp);
    if (hashedInput === storedData.code) {
      return { valid: true };
    }

    return { 
      valid: false, 
      error: 'Invalid OTP. Please try again.',
      attemptsRemaining: this.maxAttempts - storedData.attempts - 1
    };
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, assume local number, add country code
    // This example assumes US (+1), adjust for your use case
    if (cleaned.startsWith('0')) {
      cleaned = '1' + cleaned.substring(1);
    }
    
    // If doesn't start with country code, add +1 (US)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    return '+' + cleaned;
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone) {
    // Basic validation - adjust regex for your target regions
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    const cleaned = phone.replace(/\D/g, '');
    return phoneRegex.test(cleaned);
  }

  /**
   * Send OTP via SMS
   * NOTE: This is a placeholder. Implement with your SMS provider.
   */
  async sendOTP(phoneNumber, otp) {
    // Format phone number
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    
    // In development, log the OTP
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📱 [DEV] OTP for ${formattedPhone}: ${otp}`);
      return { success: true, message: 'OTP sent (development mode - check console)' };
    }

    // Production: Integrate with SMS provider
    // Example with Twilio:
    /*
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      
      await client.messages.create({
        body: `Your JobPortal verification code is: ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });
      
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: 'Failed to send SMS' };
    }
    */

    // Placeholder for production
    console.log(`📱 Sending OTP to ${formattedPhone}`);
    return { success: true, message: 'OTP sent' };
  }
}

export const otpService = new OTPService();
export default otpService;
