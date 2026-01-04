import { 
  analyzeResume, 
  rankCandidates, 
  generateInterviewQuestions,
  checkOllamaStatus 
} from '../services/aiService.js';
import mammoth from 'mammoth';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * POST /api/ai/analyze-resume
 * Upload resume file + job description, extract text, and analyze with AI
 * Accepts: multipart/form-data with 'resume' file and 'jobDescription' text
 */
export const analyzeResumeController = async (req, res) => {
  try {
    console.log('📥 Analyze Resume Request Received');
    console.log('📄 Body keys:', Object.keys(req.body));
    console.log('📎 File:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');
    
    const { jobDescription } = req.body;
    const resumeFile = req.file;

    // Validation
    if (!resumeFile && !req.body.resumeText) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file or provide resume text'
      });
    }

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required'
      });
    }

    if (jobDescription.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Job description is too short. Please provide a complete job description.'
      });
    }

    let resumeText = '';

    // If file uploaded, extract text from it
    if (resumeFile) {
      console.log('Processing uploaded file:', resumeFile.originalname);
      console.log('File type:', resumeFile.mimetype);
      console.log('File size:', resumeFile.size, 'bytes');

      const fileType = resumeFile.mimetype;
      const fileName = resumeFile.originalname.toLowerCase();

      // Extract text based on file type
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        console.log('Extracting text from PDF...');
        const pdfData = await pdfParse(resumeFile.buffer);
        resumeText = pdfData.text;
        console.log('PDF extraction complete. Pages:', pdfData.numpages);
      } 
      else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        fileName.endsWith('.docx')
      ) {
        console.log('Extracting text from DOCX...');
        const result = await mammoth.extractRawText({ buffer: resumeFile.buffer });
        resumeText = result.value;
        console.log('DOCX extraction complete.');
      } 
      else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        console.log('Reading TXT file...');
        resumeText = resumeFile.buffer.toString('utf-8');
        console.log('TXT file read complete.');
      } 
      else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported file type. Please upload PDF, DOCX, or TXT files.'
        });
      }
    } else {
      // Use provided text if no file uploaded
      resumeText = req.body.resumeText;
    }

    // Validate extracted/provided text
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is too short. Please provide a complete resume.'
      });
    }

    console.log('Analyzing resume with Ollama...');
    console.log('Resume text length:', resumeText.trim().length);
    console.log('Job description length:', jobDescription.length);

    const analysis = await analyzeResume(resumeText.trim(), jobDescription.trim());

    res.status(200).json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('❌ Error in analyzeResumeController:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze resume',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * POST /api/ai/rank-candidates
 * Rank multiple candidates based on their resumes
 */
export const rankCandidatesController = async (req, res) => {
  try {
    const { resumes, jobDescription } = req.body;

    // Validation
    if (!Array.isArray(resumes) || resumes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resumes must be a non-empty array'
      });
    }

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required'
      });
    }

    if (jobDescription.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Job description is too short. Please provide a complete job description.'
      });
    }

    // Validate each resume object
    for (let i = 0; i < resumes.length; i++) {
      if (!resumes[i].resumeText) {
        return res.status(400).json({
          success: false,
          message: `Resume at index ${i} is missing resumeText`
        });
      }
      if (resumes[i].resumeText.length < 50) {
        return res.status(400).json({
          success: false,
          message: `Resume at index ${i} is too short`
        });
      }
    }

    console.log(`Ranking ${resumes.length} candidates...`);
    const rankedCandidates = await rankCandidates(resumes, jobDescription);

    res.status(200).json({
      success: true,
      data: {
        totalCandidates: rankedCandidates.length,
        candidates: rankedCandidates
      }
    });

  } catch (error) {
    console.error('Error in rankCandidatesController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rank candidates',
      error: error.message
    });
  }
};

/**
 * POST /api/ai/generate-questions
 * Generate interview questions for a job description
 */
export const generateQuestionsController = async (req, res) => {
  try {
    const { jobDescription, numQuestions = 5 } = req.body;

    // Validation
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required'
      });
    }

    if (jobDescription.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Job description is too short. Please provide a complete job description.'
      });
    }

    const questionCount = parseInt(numQuestions);
    if (isNaN(questionCount) || questionCount < 1 || questionCount > 20) {
      return res.status(400).json({
        success: false,
        message: 'Number of questions must be between 1 and 20'
      });
    }

    console.log(`Generating ${questionCount} interview questions...`);
    const questions = await generateInterviewQuestions(jobDescription, questionCount);

    res.status(200).json({
      success: true,
      data: {
        jobDescription: jobDescription.substring(0, 100) + '...',
        numQuestions: questions.length,
        questions: questions
      }
    });

  } catch (error) {
    console.error('Error in generateQuestionsController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate interview questions',
      error: error.message
    });
  }
};

/**
 * GET /api/ai/status
 * Check Ollama service status
 */
export const checkStatusController = async (req, res) => {
  try {
    const status = await checkOllamaStatus();
    
    res.status(200).json({
      success: status.available,
      data: status
    });

  } catch (error) {
    console.error('Error in checkStatusController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check Ollama status',
      error: error.message
    });
  }
};

export default {
  analyzeResumeController,
  rankCandidatesController,
  generateQuestionsController,
  checkStatusController
};
