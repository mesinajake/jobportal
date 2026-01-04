import express from 'express';
import {
  createCompany,
  getCompanyBySlug,
  getCompanyById,
  updateCompany,
  getCompanyJobs,
  getCompanyAnalytics,
  updateSubscription,
  getMyCompany,
  verifyCompany
} from '../controllers/companyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/:slug', getCompanyBySlug);
router.get('/id/:id', getCompanyById);
router.get('/:id/jobs', getCompanyJobs);

// Protected routes (require authentication)
router.post('/', protect, createCompany);
router.get('/my/company', protect, getMyCompany);
router.put('/:id', protect, updateCompany);
router.get('/:id/analytics', protect, getCompanyAnalytics);
router.put('/:id/subscription', protect, updateSubscription);
router.put('/:id/verify', protect, verifyCompany);

export default router;
