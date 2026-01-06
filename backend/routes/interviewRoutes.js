import express from 'express';
import {
  getInterviews,
  getInterview,
  scheduleInterview,
  updateInterview,
  cancelInterview,
  submitFeedback,
  respondToInterview,
  getMySchedule,
  makeDecision
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';
import { requirePermission, requireRole, requireStaff } from '../middleware/roleAccess.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Candidate and staff routes
router.get('/', getInterviews);
router.get('/my-schedule', requireStaff, getMySchedule);
router.get('/:id', getInterview);
router.put('/:id/respond', respondToInterview); // For candidates

// Staff only routes
router.post('/', requirePermission('schedule_interview'), scheduleInterview);
router.put('/:id', requirePermission('schedule_interview'), updateInterview);
router.delete('/:id', requirePermission('schedule_interview'), cancelInterview);

// Interviewer feedback
router.post('/:id/feedback', requireStaff, submitFeedback);

// Hiring manager decisions
router.post('/:id/decision', requireRole('hiring_manager', 'hr', 'admin'), makeDecision);

export default router;
