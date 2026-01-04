import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const dropIndexes = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Dropping indexes from User collection...');
    await User.collection.dropIndexes();
    console.log('✅ Indexes dropped successfully');

    console.log('🔄 Creating new indexes...');
    await User.syncIndexes();
    console.log('✅ New indexes created successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

dropIndexes();
