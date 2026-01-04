import express from 'express';
import {
  trackEvent,
  getJobAnalytics,
  getCompanyAnalytics,
  getUserAnalytics
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route - track events
router.post('/track', trackEvent);

// Protected routes - view analytics
router.get('/jobs/:jobId', protect, getJobAnalytics);
router.get('/companies/:companyId', protect, getCompanyAnalytics);
router.get('/my-activity', protect, getUserAnalytics);

export default router;
