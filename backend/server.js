import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { 
  configureHelmet, 
  configureSanitize, 
  validateInput, 
  corsOptions,
  securityHeaders,
  securityLogger,
  detectSuspiciousActivity
} from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import savedJobRoutes from './routes/savedJobRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import jobAlertRoutes from './routes/jobAlertRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import { getPublicCompanyInfo } from './config/company.js';

// Load environment variables
dotenv.config();

// Initialize Express app FIRST (don't need DB for middleware setup)
const app = express();

// Security Middleware - Apply FIRST
app.use(configureHelmet());
app.use(configureSanitize());
app.use(detectSuspiciousActivity);
app.use(securityHeaders);
app.use(securityLogger);

// CORS with security options
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input validation
app.use(validateInput);

// API rate limiting (general)
app.use('/api/', apiLimiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use(morgan('dev'));

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Job Portal API',
    version: '2.0.0',
    company: getPublicCompanyInfo().name,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      jobs: '/api/jobs',
      users: '/api/users',
      savedJobs: '/api/saved-jobs',
      ai: '/api/ai',
      departments: '/api/departments',
      analytics: '/api/analytics',
      alerts: '/api/alerts',
      interviews: '/api/interviews',
      company: '/api/company'
    }
  });
});

// Company info route (single endpoint)
app.get('/api/company', (req, res) => {
  res.status(200).json({
    success: true,
    data: getPublicCompanyInfo()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', jobAlertRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Job Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB FIRST
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connection successful');

    // NOW start the Express server - Try binding to all interfaces
    const PORT = process.env.PORT || 5000;
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`✅ Server is ready to accept requests`);
      
      const address = server.address();
      console.log('🔍 Server address:', address);
      
      // Try to make a self-test connection
      setTimeout(async () => {
        try {
          const http = await import('http');
          const options = {
            hostname: '127.0.0.1',
            port: PORT,
            path: '/api/health',
            method: 'GET'
          };
          const req = http.default.request(options, (res) => {
            console.log(`✅ Self-test SUCCESS: Server responded with status ${res.statusCode}`);
          });
          req.on('error', (e) => {
            console.error(`❌ Self-test FAILED: ${e.message}`);
          });
          req.end();
        } catch (err) {
          console.error('❌ Self-test error:', err);
        }
      }, 2000);
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Add global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
