import express from 'express';
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  approveJob,
  rejectJob,
  getPendingJobs,
  getJobsByDepartment
} from '../controllers/jobController.js';
import { protect } from '../middleware/auth.js';
import { requirePermission, requireRole, requireStaff } from '../middleware/roleAccess.js';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/by-department/:departmentId', getJobsByDepartment);
router.get('/:id', getJob);

// Protected routes - require authentication
router.use(protect);

// Staff can create and manage jobs
router.post('/', requirePermission('create_job'), createJob);
router.put('/:id', requirePermission('edit_own_jobs'), updateJob);
router.delete('/:id', requirePermission('delete_job'), deleteJob);

// Approval workflow routes (Hiring Manager/HR/Admin)
router.get('/admin/pending-approval', requireRole('hiring_manager', 'hr', 'admin'), getPendingJobs);
router.put('/:id/approve', requirePermission('approve_job_posting'), approveJob);
router.put('/:id/reject', requirePermission('approve_job_posting'), rejectJob);

export default router;
