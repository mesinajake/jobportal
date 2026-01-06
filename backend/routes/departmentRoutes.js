import express from 'express';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentJobs,
  getDepartmentTeam,
  getDepartmentStats
} from '../controllers/departmentController.js';
import { protect } from '../middleware/auth.js';
import { requirePermission, requireStaff, requireRole } from '../middleware/roleAccess.js';

const router = express.Router();

// Public routes
router.get('/', getDepartments);
router.get('/:id', getDepartment);
router.get('/:id/jobs', getDepartmentJobs);

// Protected routes (require authentication)
router.use(protect);

// Staff-only routes
router.get('/:id/team', requireStaff, getDepartmentTeam);
router.get('/:id/stats', requirePermission('view_department_analytics'), getDepartmentStats);

// HR/Admin only routes
router.post('/', requireRole('hr', 'admin'), createDepartment);
router.put('/:id', requireRole('hr', 'admin'), updateDepartment);
router.delete('/:id', requireRole('admin'), deleteDepartment);

export default router;
