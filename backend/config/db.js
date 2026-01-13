import mongoose from 'mongoose';

// Connection retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const connectDB = async (retryCount = 0) => {
  try {
    // Validate environment variable
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log(`🔌 Connecting to MongoDB... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);

    // Provide helpful error messages
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('💡 Network error: Check your internet connection or MongoDB URI');
    } else if (error.message.includes('Authentication failed')) {
      console.error('💡 Authentication error: Check your MongoDB username and password');
    } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('💡 IP Whitelist error: Add your IP address to MongoDB Atlas whitelist');
      console.error('   1. Go to https://cloud.mongodb.com');
      console.error('   2. Network Access → Add IP Address → Add Current IP Address');
      console.error('   3. Or use 0.0.0.0/0 for development (allows all IPs)');
    }

    // Retry logic with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB(retryCount + 1);
    } else {
      console.error(`❌ Failed to connect after ${MAX_RETRIES} attempts`);
      console.error('💡 Please check:');
      console.error('   - MongoDB Atlas IP whitelist settings');
      console.error('   - MONGODB_URI in your .env file');
      console.error('   - Internet connection');
      console.error('   - MongoDB Atlas cluster status');
      
      // Don't exit in development mode - allow manual restart
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      } else {
        console.warn('⚠️  Running without database connection. Restart when ready.');
      }
    }
  }
};

export default connectDB;
