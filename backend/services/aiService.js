import axios from 'axios';

// Ollama API configuration
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.2';

/**
 * Analyze a resume against a job description using Ollama llama3.2
 * @param {string} resumeText - The full text of the resume
 * @param {string} jobDescription - The job description to match against
 * @returns {Promise<{summary: string, matchScore: number, strengths: string[], weaknesses: string[]}>}
 */
export const analyzeResume = async (resumeText, jobDescription) => {
  try {
    // Use full text for better analysis (not truncated)
    const prompt = `You are an expert HR recruiter. Analyze this resume against the job requirements.

JOB REQUIREMENTS:
${jobDescription}

CANDIDATE RESUME:
${resumeText}

Carefully evaluate:
1. Skills match: Compare candidate's technical/soft skills with job requirements
2. Experience level: Years and relevance of experience
3. Education: Required vs actual qualifications
4. Specific achievements that align with the role
5. Missing critical requirements

Provide accurate scoring (0-100):
- 90-100: Excellent match, meets all key requirements
- 75-89: Strong match, meets most requirements
- 60-74: Good match, meets core requirements but lacks some
- 40-59: Fair match, has potential but significant gaps
- 0-39: Poor match, major requirements missing

Return ONLY this JSON format:
{"summary":"2-3 sentence evaluation","matchScore":75,"strengths":["specific strength 1","specific strength 2","specific strength 3"],"weaknesses":["specific gap 1","specific gap 2","specific gap 3"]}`;

    console.log('📊 Sending to Ollama with model:', MODEL_NAME);
    console.log('📝 Resume length:', resumeText.length, 'chars');
    console.log('📝 Job description length:', jobDescription.length, 'chars');
    
    const response = await axios.post(OLLAMA_API_URL, {
      model: MODEL_NAME,
      prompt: prompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.3,  // Lower temperature for more consistent scoring
        top_p: 0.9,
        num_predict: 500   // Allow longer, more detailed responses
      }
    }, {
      timeout: 180000 // 3 minutes timeout
    });

    // Parse the Ollama response
    const aiResponse = response.data.response;
    
    // Try to parse JSON from the response
    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parsing fails, try to extract data from text
      console.error('JSON parsing failed, attempting text extraction:', parseError);
      
      // Fallback: create a basic analysis
      analysis = {
        summary: aiResponse.substring(0, 200) || 'Unable to generate summary',
        matchScore: 50,
        strengths: ['Experience in relevant field'],
        weaknesses: ['Unable to fully analyze resume']
      };
    }

    // Ensure matchScore is a number between 0-100
    if (typeof analysis.matchScore !== 'number') {
      analysis.matchScore = parseInt(analysis.matchScore) || 50;
    }
    analysis.matchScore = Math.min(100, Math.max(0, analysis.matchScore));

    // Ensure arrays exist
    analysis.strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
    analysis.weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];

    return {
      summary: analysis.summary || 'No summary available',
      matchScore: analysis.matchScore,
      strengths: analysis.strengths.slice(0, 3), // Limit to 3
      weaknesses: analysis.weaknesses.slice(0, 3) // Limit to 3
    };

  } catch (error) {
    console.error('❌ Error analyzing resume with Ollama:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Is timeout?:', error.code === 'ECONNABORTED');
    
    // Return a fallback response instead of throwing
    return {
      summary: 'Unable to analyze resume. Please ensure Ollama is running.',
      matchScore: 0,
      strengths: [],
      weaknesses: ['AI service unavailable'],
      error: error.message
    };
  }
};

/**
 * Rank multiple candidates by analyzing their resumes against a job description
 * @param {Array<{name: string, resumeText: string, email?: string}>} resumes - Array of resume objects
 * @param {string} jobDescription - The job description to match against
 * @returns {Promise<Array<{name: string, email: string, matchScore: number, summary: string, strengths: string[], weaknesses: string[], rank: number}>>}
 */
export const rankCandidates = async (resumes, jobDescription) => {
  try {
    if (!Array.isArray(resumes) || resumes.length === 0) {
      throw new Error('Resumes must be a non-empty array');
    }

    console.log(`Analyzing ${resumes.length} candidates...`);

    // Analyze each resume
    const analysisPromises = resumes.map(async (resume, index) => {
      console.log(`Analyzing candidate ${index + 1}/${resumes.length}: ${resume.name}`);
      
      const analysis = await analyzeResume(resume.resumeText, jobDescription);
      
      return {
        name: resume.name || `Candidate ${index + 1}`,
        email: resume.email || '',
        resumeText: resume.resumeText,
        matchScore: analysis.matchScore,
        summary: analysis.summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses
      };
    });

    // Wait for all analyses to complete
    const results = await Promise.all(analysisPromises);

    // Sort by match score (highest first)
    const rankedResults = results
      .sort((a, b) => b.matchScore - a.matchScore)
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }));

    console.log(`Ranking complete. Top candidate: ${rankedResults[0].name} (${rankedResults[0].matchScore}%)`);

    return rankedResults;

  } catch (error) {
    console.error('Error ranking candidates:', error.message);
    throw error;
  }
};

/**
 * Generate tailored interview questions for a job description using Ollama
 * @param {string} jobDescription - The job description
 * @param {number} numQuestions - Number of questions to generate (default: 5)
 * @returns {Promise<Array<{question: string, category: string, purpose: string}>>}
 */
export const generateInterviewQuestions = async (jobDescription, numQuestions = 5) => {
  try {
    const prompt = `You are an expert HR recruiter creating interview questions.

Job Description:
${jobDescription}

Generate ${numQuestions} tailored interview questions for this position. For each question, provide:
1. The interview question
2. The category (e.g., "Technical", "Behavioral", "Situational", "Cultural Fit")
3. The purpose (why this question is important for this role)

Format your response EXACTLY as JSON array:
[
  {
    "question": "The interview question here?",
    "category": "Technical",
    "purpose": "Why this question matters for this role"
  }
]`;

    const response = await axios.post(OLLAMA_API_URL, {
      model: MODEL_NAME,
      prompt: prompt,
      stream: false,
      format: 'json'
    }, {
      timeout: 60000 // 60 second timeout
    });

    // Parse the Ollama response
    const aiResponse = response.data.response;
    
    let questions;
    try {
      questions = JSON.parse(aiResponse);
      
      // Ensure it's an array
      if (!Array.isArray(questions)) {
        // If response is an object with a questions property
        if (questions.questions && Array.isArray(questions.questions)) {
          questions = questions.questions;
        } else {
          throw new Error('Response is not an array');
        }
      }
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      
      // Fallback: generate basic questions
      questions = [
        {
          question: "Can you describe your experience relevant to this position?",
          category: "Experience",
          purpose: "Assess background and qualifications"
        },
        {
          question: "What interests you most about this role?",
          category: "Motivation",
          purpose: "Understand candidate's interest and fit"
        },
        {
          question: "Describe a challenging situation you've faced and how you handled it.",
          category: "Behavioral",
          purpose: "Evaluate problem-solving skills"
        },
        {
          question: "Where do you see yourself in 3-5 years?",
          category: "Career Goals",
          purpose: "Assess long-term fit with the organization"
        },
        {
          question: "What questions do you have for us?",
          category: "Engagement",
          purpose: "Gauge candidate's preparation and interest"
        }
      ];
    }

    // Ensure we have the requested number of questions
    questions = questions.slice(0, numQuestions);
    
    // Ensure each question has required fields
    questions = questions.map((q, index) => ({
      question: q.question || `Question ${index + 1}`,
      category: q.category || 'General',
      purpose: q.purpose || 'Assess candidate qualifications'
    }));

    return questions;

  } catch (error) {
    console.error('Error generating interview questions with Ollama:', error.message);
    
    // Return fallback questions
    return [
      {
        question: "Tell me about your background and experience.",
        category: "General",
        purpose: "Understand candidate's qualifications"
      },
      {
        question: "Why are you interested in this position?",
        category: "Motivation",
        purpose: "Assess cultural fit"
      },
      {
        question: "What are your greatest strengths?",
        category: "Self-Assessment",
        purpose: "Evaluate self-awareness"
      },
      {
        question: "Describe a time you overcame a challenge.",
        category: "Behavioral",
        purpose: "Assess problem-solving abilities"
      },
      {
        question: "What questions do you have for us?",
        category: "Engagement",
        purpose: "Gauge interest and preparation"
      }
    ].slice(0, numQuestions);
  }
};

/**
 * Check if Ollama service is available
 * @returns {Promise<{available: boolean, model: string, message: string}>}
 */
export const checkOllamaStatus = async () => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags', {
      timeout: 5000
    });
    
    const models = response.data.models || [];
    const hasLlama = models.some(m => m.name.includes('llama3.2'));
    
    return {
      available: true,
      model: MODEL_NAME,
      models: models.map(m => m.name),
      message: hasLlama 
        ? 'Ollama is running with llama3.2' 
        : 'Ollama is running but llama3.2 model not found. Run: ollama pull llama3.2'
    };
  } catch (error) {
    return {
      available: false,
      model: MODEL_NAME,
      message: 'Ollama is not running. Start it with: ollama serve'
    };
  }
};

export default {
  analyzeResume,
  rankCandidates,
  generateInterviewQuestions,
  checkOllamaStatus
};
