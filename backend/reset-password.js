import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Database connected\n');

    const email = process.argv[2];
    const newPassword = process.argv[3];
    
    if (!email || !newPassword) {
      console.log('Usage: node reset-password.js <email> <new-password>');
      console.log('\nExample: node reset-password.js user@example.com newpassword123');
      process.exit(1);
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found:', email);
      console.log('\nAvailable users:');
      const allUsers = await User.find().select('email role name');
      allUsers.forEach(u => console.log(`  - ${u.email} (${u.role}) - ${u.name}`));
      process.exit(1);
    }
    
    console.log('Found user:');
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('\nResetting password to:', newPassword);
    
    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    
    // Reset login attempts if locked
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    
    await user.save();
    
    console.log('✅ Password reset successfully!');
    console.log('\nYou can now login with:');
    console.log('Email:', email);
    console.log('Password:', newPassword);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

resetPassword();
