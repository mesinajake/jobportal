import express from 'express';
import {
  createJobAlert,
  getUserAlerts,
  getJobAlert,
  updateJobAlert,
  deleteJobAlert,
  testJobAlert,
  toggleJobAlert,
  processAlerts
} from '../controllers/jobAlertController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Alert CRUD operations
router.post('/', createJobAlert);
router.get('/', getUserAlerts);
router.get('/process', processAlerts);
router.get('/:id', getJobAlert);
router.put('/:id', updateJobAlert);
router.delete('/:id', deleteJobAlert);
router.get('/:id/test', testJobAlert);
router.patch('/:id/toggle', toggleJobAlert);

export default router;
