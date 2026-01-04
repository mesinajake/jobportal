import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUser
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), updateUserProfile);
router.put('/change-password', protect, changePassword);
router.delete('/profile', protect, deleteUser);

export default router;
