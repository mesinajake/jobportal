import express from 'express';
import {
  getSavedJobs,
  saveJob,
  removeSavedJob,
  updateSavedJob
} from '../controllers/savedJobController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getSavedJobs);
router.post('/', protect, saveJob);
router.put('/:id', protect, updateSavedJob);
router.delete('/:id', protect, removeSavedJob);

export default router;
