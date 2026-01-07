/**
 * Email OTP Diagnostic Script
 * Checks all requirements for Email OTP to work
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`)
};

async function runDiagnostics() {
  console.clear();
  log.section('📧 EMAIL OTP DIAGNOSTIC TOOL');

  let hasErrors = false;
  const issues = [];
  const warnings = [];

  // 1. Check .env file
  log.section('1️⃣  Checking Environment Configuration');
  
  if (!process.env.MONGODB_URI) {
    log.error('.env file missing or MONGODB_URI not set');
    issues.push('Create .env file from .env.example');
    hasErrors = true;
  } else if (process.env.MONGODB_URI.includes('your_mongodb_connection_string_here')) {
    log.error('MONGODB_URI is still using example value');
    issues.push('Update MONGODB_URI with your actual MongoDB connection string');
    hasErrors = true;
  } else {
    log.success('MONGODB_URI is configured');
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_here') {
    log.error('JWT_SECRET is not configured');
    issues.push('Set a secure JWT_SECRET in .env');
    hasErrors = true;
  } else {
    log.success('JWT_SECRET is configured');
  }

  if (process.env.NODE_ENV !== 'development') {
    log.warning(`NODE_ENV is '${process.env.NODE_ENV}' (should be 'development' for testing)`);
    warnings.push('Set NODE_ENV=development in .env for testing');
  } else {
    log.success('NODE_ENV is set to development');
  }

  // 2. Check SMTP Configuration
  log.section('2️⃣  Checking Email Service Configuration');

  if (!process.env.SMTP_HOST) {
    log.warning('SMTP not configured - emails will be logged to console only');
    log.info('This is fine for development! OTP will appear in backend console');
  } else {
    log.success('SMTP_HOST is configured');
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      log.error('SMTP credentials incomplete');
      issues.push('Set SMTP_USER and SMTP_PASS in .env');
      hasErrors = true;
    } else {
      log.success('SMTP credentials are set');
    }
  }

  // 3. Check MongoDB Connection
  log.section('3️⃣  Checking Database Connection');

  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('your_mongodb_connection_string_here')) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      log.success('Successfully connected to MongoDB');
      await mongoose.connection.close();
    } catch (error) {
      log.error(`MongoDB connection failed: ${error.message}`);
      issues.push('Fix MongoDB connection string or ensure database is accessible');
      hasErrors = true;
    }
  }

  // 4. Check Required Dependencies
  log.section('4️⃣  Checking Dependencies');

  try {
    const pkg = await import('../package.json', { assert: { type: 'json' } });
    const deps = pkg.default.dependencies;

    const requiredDeps = ['express', 'mongoose', 'dotenv', 'nodemailer', 'bcryptjs', 'jsonwebtoken'];
    
    requiredDeps.forEach(dep => {
      if (deps[dep]) {
        log.success(`${dep} is installed`);
      } else {
        log.error(`${dep} is missing`);
        issues.push(`Run: npm install ${dep}`);
        hasErrors = true;
      }
    });
  } catch (error) {
    log.warning('Could not verify dependencies');
  }

  // 5. Test OTP Generation
  log.section('5️⃣  Testing OTP Generation');

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    log.success(`OTP Generation: ${otp} (sample)`);
    log.success(`OTP Hashing: ${hashedOTP.substring(0, 20)}... (SHA-256)`);
  } catch (error) {
    log.error(`Crypto operations failed: ${error.message}`);
    hasErrors = true;
  }

  // 6. Summary
  log.section('📊 DIAGNOSTIC SUMMARY');

  if (hasErrors) {
    log.error(`Found ${issues.length} critical issue(s):`);
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  } else {
    log.success('No critical issues found!');
  }

  if (warnings.length > 0) {
    log.warning(`Found ${warnings.length} warning(s):`);
    warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`);
    });
  }

  // 7. Quick Fix Instructions
  if (hasErrors) {
    log.section('🔧 QUICK FIX INSTRUCTIONS');
    
    console.log('\n1️⃣  Create .env file:');
    console.log('   cd backend');
    console.log('   copy .env.example .env');
    
    console.log('\n2️⃣  Edit .env file with minimum settings:');
    console.log('   NODE_ENV=development');
    console.log('   PORT=8080');
    console.log('   MONGODB_URI=mongodb://localhost:27017/jobportal');
    console.log('   JWT_SECRET=your_secret_key_here_make_it_long_and_random');
    console.log('   # SMTP settings optional for development');
    
    console.log('\n3️⃣  Restart your backend server:');
    console.log('   npm start');
    
    console.log('\n4️⃣  Test Email OTP:');
    console.log('   Visit: http://localhost:5173/login/email-otp');
    console.log('   OTP will appear in backend console!');
  } else {
    log.section('✅ ALL SYSTEMS GO!');
    log.info('Your Email OTP system is ready to use!');
    log.info('Test it at: http://localhost:5173/login/email-otp');
  }

  console.log('\n');
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error('Diagnostic error:', error);
  process.exit(1);
});
