import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSpecificUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Database connected\n');

    // Get credentials from command line
    const testEmail = process.argv[2] || 'test@test.com';
    const testPassword = process.argv[3] || 'password123';
    
    console.log('Testing credentials:');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('---');
    
    // Find user
    const user = await User.findOne({ email: testEmail }).select('+password');
    
    if (!user) {
      console.log('❌ USER NOT FOUND IN DATABASE');
      console.log('\nAvailable users:');
      const allUsers = await User.find().select('email role');
      allUsers.forEach(u => console.log(`  - ${u.email} (${u.role})`));
      return;
    }
    
    console.log('✓ User found');
    console.log('User ID:', user._id);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('Has password:', !!user.password);
    console.log('Password hash length:', user.password ? user.password.length : 0);
    
    // Check account lock status
    if (user.isLocked()) {
      console.log('\n❌ ACCOUNT IS LOCKED');
      console.log('Lock until:', user.lockUntil);
      console.log('Login attempts:', user.loginAttempts);
      return;
    }
    
    // Test password
    console.log('\nTesting password...');
    const isMatch = await user.comparePassword(testPassword);
    
    if (isMatch) {
      console.log('✅ PASSWORD MATCHES! Login should work.');
    } else {
      console.log('❌ PASSWORD DOES NOT MATCH!');
      console.log('\nThis is why login is failing.');
      console.log('Possible reasons:');
      console.log('1. Wrong password entered');
      console.log('2. Password was changed but you\'re using old password');
      console.log('3. User was created with different password');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

console.log('=== Auth Login Test ===\n');
testSpecificUser();
