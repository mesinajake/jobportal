#!/usr/bin/env node
import mongoose from 'mongoose';
import User from './models/User.js';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function manageUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    while (true) {
      console.log('\n╔═══════════════════════════════════╗');
      console.log('║     User Management Utility      ║');
      console.log('╚═══════════════════════════════════╝\n');
      console.log('1. List all users');
      console.log('2. Reset user password');
      console.log('3. Test login credentials');
      console.log('4. Create new user');
      console.log('5. Exit\n');

      const choice = await question('Choose an option (1-5): ');

      switch (choice.trim()) {
        case '1':
          await listUsers();
          break;
        case '2':
          await resetUserPassword();
          break;
        case '3':
          await testCredentials();
          break;
        case '4':
          await createUser();
          break;
        case '5':
          console.log('\n👋 Goodbye!');
          process.exit(0);
        default:
          console.log('❌ Invalid choice');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

async function listUsers() {
  console.log('\n📋 All Users:\n');
  const users = await User.find().select('name email role loginAttempts lockUntil isVerified');
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Verified: ${user.isVerified ? '✓' : '✗'}`);
    console.log(`   Login Attempts: ${user.loginAttempts}`);
    if (user.lockUntil && user.lockUntil > Date.now()) {
      console.log(`   Status: 🔒 LOCKED until ${user.lockUntil}`);
    } else {
      console.log(`   Status: 🔓 Active`);
    }
    console.log('');
  });
}

async function resetUserPassword() {
  const email = await question('\nEnter user email: ');
  const user = await User.findOne({ email: email.trim() });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log(`\nFound: ${user.name} (${user.role})`);
  const newPassword = await question('Enter new password: ');
  
  user.password = newPassword;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();
  
  console.log('✅ Password reset successfully!');
  console.log(`\nLogin credentials:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${newPassword}`);
}

async function testCredentials() {
  const email = await question('\nEnter email: ');
  const password = await question('Enter password: ');
  
  const user = await User.findOne({ email: email.trim() }).select('+password');
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log(`\n✓ User found: ${user.name} (${user.role})`);
  
  if (user.isLocked && user.isLocked()) {
    console.log('❌ Account is LOCKED');
    console.log('Lock until:', user.lockUntil);
    return;
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (isMatch) {
    console.log('✅ PASSWORD MATCHES! Login will work.');
  } else {
    console.log('❌ PASSWORD DOES NOT MATCH!');
  }
}

async function createUser() {
  console.log('\n📝 Create New User\n');
  
  const name = await question('Name: ');
  const email = await question('Email: ');
  const password = await question('Password: ');
  const role = await question('Role (jobseeker/employer/admin): ');
  
  try {
    const user = await User.create({
      name: name.trim(),
      email: email.trim(),
      password: password,
      role: role.trim() || 'jobseeker'
    });
    
    console.log('\n✅ User created successfully!');
    console.log(`ID: ${user._id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    console.log('❌ Error creating user:', error.message);
  }
}

console.log('🔧 Starting User Management Utility...\n');
manageUsers();
