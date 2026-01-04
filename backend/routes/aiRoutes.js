import express from 'express';
import multer from 'multer';
import {
  analyzeResumeController,
  rankCandidatesController,
  generateQuestionsController,
  checkStatusController
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const fileName = file.originalname.toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || 
        allowedExtensions.some(ext => fileName.endsWith(ext))) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  }
});

// Public route to check if AI service is available
router.get('/status', checkStatusController);

// Protected routes (require authentication)
// Full descriptive names
router.post('/analyze-resume', protect, upload.single('resume'), analyzeResumeController);
router.post('/rank-candidates', protect, rankCandidatesController);
router.post('/generate-questions', protect, generateQuestionsController);

// Short alias routes (analyze accepts file + jobDescription)
router.post('/analyze', protect, upload.single('resume'), analyzeResumeController);
router.post('/rank', protect, rankCandidatesController);
router.post('/interview', protect, generateQuestionsController);

export default router;
