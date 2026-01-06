import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function testAuthDebug() {
  try {
    // Connect to database
    console.log('Connecting to database...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log('MongoDB URI:', mongoUri ? 'Found' : 'NOT FOUND');
    await mongoose.connect(mongoUri);
    console.log('✓ Database connected\n');

    // Check for test user
    const testEmail = 'test@test.com';
    console.log(`Looking for user: ${testEmail}`);
    
    let user = await User.findOne({ email: testEmail }).select('+password');
    
    if (!user) {
      console.log('✗ User not found in database');
      console.log('\nCreating test user...');
      
      user = await User.create({
        name: 'Test User',
        email: testEmail,
        password: 'password123',
        role: 'jobseeker'
      });
      
      console.log('✓ Test user created');
      
      // Re-fetch with password for verification
      user = await User.findOne({ email: testEmail }).select('+password');
    } else {
      console.log('✓ User found in database');
    }
    
    console.log('\nUser details:');
    console.log('- ID:', user._id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Password hash:', user.password ? user.password.substring(0, 30) + '...' : 'NO PASSWORD');
    console.log('- Login attempts:', user.loginAttempts);
    console.log('- Is locked:', user.isLocked ? user.isLocked() : 'N/A');
    
    // Test password comparison
    console.log('\nTesting password verification...');
    const testPassword = 'password123';
    
    if (user.password) {
      const isMatch = await user.comparePassword(testPassword);
      console.log(`- Password "${testPassword}" matches:`, isMatch);
      
      // Also test bcrypt directly
      const directMatch = await bcrypt.compare(testPassword, user.password);
      console.log('- Direct bcrypt compare:', directMatch);
    } else {
      console.log('✗ User has no password!');
    }
    
    // List all users
    console.log('\n\nAll users in database:');
    const allUsers = await User.find().select('name email role');
    allUsers.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email} (${u.role}) - ${u.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Database disconnected');
    process.exit(0);
  }
}

testAuthDebug();
