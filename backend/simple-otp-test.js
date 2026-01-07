/**
 * Simple test to diagnose Email OTP issues
 * Run this with: node simple-otp-test.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

console.log('\n🔍 DIAGNOSING EMAIL OTP ISSUE...\n');

// Step 1: Check environment variables
console.log('1️⃣  Environment Variables:');
console.log('   NODE_ENV:', process.env.NODE_ENV || '❌ NOT SET');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ NOT SET');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('   PORT:', process.env.PORT || '❌ NOT SET');

// Step 2: Test MongoDB connection
console.log('\n2️⃣  Testing MongoDB Connection...');
if (!process.env.MONGODB_URI) {
  console.log('   ❌ MONGODB_URI not set in .env file');
  console.log('   👉 Create .env file with: MONGODB_URI=mongodb://localhost:27017/jobportal');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('   ✅ MongoDB connected successfully');
  
  // Step 3: Test User model
  console.log('\n3️⃣  Testing User Model...');
  const User = (await import('./models/User.js')).default;
  
  // Try to create a test user with email auth
  const testUser = new User({
    email: 'test-otp@example.com',
    name: 'Test User',
    authProvider: 'email',
    role: 'candidate',
    isVerified: false,
    password: undefined
  });
  
  // Validate without saving
  const validationError = testUser.validateSync();
  if (validationError) {
    console.log('   ❌ User model validation failed:');
    console.log('   ', validationError.message);
    throw validationError;
  }
  
  console.log('   ✅ User model validation passed');
  
  // Step 4: Test OTP generation
  console.log('\n4️⃣  Testing OTP Generation...');
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  
  console.log('   ✅ Generated OTP:', otp);
  console.log('   ✅ Hashed OTP:', hashedOTP.substring(0, 20) + '...');
  
  // Step 5: Test saving user with OTP
  console.log('\n5️⃣  Testing User Save with OTP...');
  testUser.emailOtp = {
    code: hashedOTP,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 0
  };
  
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test-otp@example.com' });
    if (existingUser) {
      console.log('   ℹ️  Test user exists, updating...');
      existingUser.emailOtp = testUser.emailOtp;
      await existingUser.save();
    } else {
      console.log('   ℹ️  Creating new test user...');
      await testUser.save();
    }
    console.log('   ✅ User saved successfully with OTP');
  } catch (saveError) {
    console.log('   ❌ Failed to save user:');
    console.log('   ', saveError.message);
    throw saveError;
  }
  
  // Clean up test user
  await User.deleteOne({ email: 'test-otp@example.com' });
  
  // Step 6: Test email service
  console.log('\n6️⃣  Testing Email Service...');
  const emailService = (await import('./utils/emailService.js')).default;
  console.log('   ✅ Email service loaded');
  
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    console.log('   ℹ️  Development mode - emails will log to console');
  }
  
  console.log('\n✅ ALL TESTS PASSED!');
  console.log('\n👉 Email OTP should work now. If still getting 500 error:');
  console.log('   1. Check backend console for actual error message');
  console.log('   2. Make sure backend server was restarted after creating .env');
  console.log('   3. Check that .env file exists in backend folder');
  
  await mongoose.connection.close();
  process.exit(0);
  
} catch (error) {
  console.log('\n❌ TEST FAILED:');
  console.log('Error:', error.message);
  console.log('\nStack:', error.stack);
  
  console.log('\n🔧 LIKELY FIX:');
  if (error.message.includes('connect')) {
    console.log('   MongoDB connection failed');
    console.log('   👉 Check MONGODB_URI in .env file');
    console.log('   👉 Or use: MONGODB_URI=mongodb://localhost:27017/jobportal');
  } else if (error.message.includes('password')) {
    console.log('   Password validation issue');
    console.log('   👉 Backend server needs to be restarted');
  } else {
    console.log('   Unknown error - check error message above');
  }
  
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
}
