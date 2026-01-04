# AI Features - Ollama Integration Guide

## 🤖 Overview

This Job Portal now includes AI-powered resume analysis and interview question generation using **Ollama** with the **llama3.2** model running locally.

---

## 📋 Features

### 1. **Resume Analysis** (`analyzeResume`)
- Analyzes a single resume against a job description
- Returns:
  - Summary of candidate qualifications (2-3 sentences)
  - Match score (0-100)
  - Top 3 strengths
  - Top 3 weaknesses/gaps

### 2. **Candidate Ranking** (`rankCandidates`)
- Analyzes multiple resumes against one job description
- Ranks candidates by match score (highest to lowest)
- Returns sorted list with analysis for each candidate

### 3. **Interview Questions Generator** (`generateInterviewQuestions`)
- Generates tailored interview questions for a job description
- Returns 5 questions (customizable) with:
  - The question text
  - Category (Technical, Behavioral, etc.)
  - Purpose/reasoning for the question

---

## 🛠️ Setup Instructions

### Step 1: Install Ollama

**Windows:**
1. Download Ollama from: https://ollama.ai/download
2. Run the installer
3. Ollama will start automatically

**Mac:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 2: Pull llama3.2 Model

```bash
ollama pull llama3.2
```

This will download the llama3.2 model (~2GB). Wait for it to complete.

### Step 3: Start Ollama Service

**Windows:** Ollama should start automatically. If not:
```bash
ollama serve
```

**Mac/Linux:**
```bash
ollama serve
```

Ollama will run on `http://localhost:11434`

### Step 4: Verify Installation

Test that Ollama is working:
```bash
ollama list
```

You should see `llama3.2` in the list.

Or check via the API endpoint:
```bash
curl http://localhost:5000/api/ai/status
```

---

## 🚀 API Endpoints

### 1. Check AI Service Status

**GET** `/api/ai/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "model": "llama3.2",
    "models": ["llama3.2", "llama3.1", ...],
    "message": "Ollama is running with llama3.2"
  }
}
```

### 2. Analyze Resume

**POST** `/api/ai/analyze-resume` (Requires authentication)

**Request Body:**
```json
{
  "resumeText": "John Doe\nSoftware Engineer with 5 years experience in React, Node.js...",
  "jobDescription": "We are looking for a Full Stack Developer with experience in MERN stack..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Experienced software engineer with strong React and Node.js skills, well-suited for full stack development.",
    "matchScore": 85,
    "strengths": [
      "5 years of React experience",
      "Strong Node.js and Express knowledge",
      "Experience with MongoDB"
    ],
    "weaknesses": [
      "Limited TypeScript experience",
      "No mention of testing frameworks",
      "Lacks DevOps experience"
    ]
  }
}
```

### 3. Rank Candidates

**POST** `/api/ai/rank-candidates` (Requires authentication)

**Request Body:**
```json
{
  "resumes": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "resumeText": "Software Engineer with 5 years..."
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "resumeText": "Full Stack Developer with 3 years..."
    }
  ],
  "jobDescription": "We are looking for a Full Stack Developer..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCandidates": 2,
    "candidates": [
      {
        "rank": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "matchScore": 85,
        "summary": "Experienced software engineer...",
        "strengths": ["React expertise", "Node.js", "MongoDB"],
        "weaknesses": ["Limited TypeScript"]
      },
      {
        "rank": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "matchScore": 72,
        "summary": "Solid full stack developer...",
        "strengths": ["Good foundation", "Fast learner"],
        "weaknesses": ["Less experience", "No MongoDB"]
      }
    ]
  }
}
```

### 4. Generate Interview Questions

**POST** `/api/ai/generate-questions` (Requires authentication)

**Request Body:**
```json
{
  "jobDescription": "We are looking for a Full Stack Developer with MERN stack experience...",
  "numQuestions": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobDescription": "We are looking for a Full Stack Developer with MERN stack experience...",
    "numQuestions": 5,
    "questions": [
      {
        "question": "Can you walk me through a recent MERN stack project you've built?",
        "category": "Technical",
        "purpose": "Assess hands-on experience with the full MERN stack"
      },
      {
        "question": "How do you handle state management in large React applications?",
        "category": "Technical",
        "purpose": "Evaluate understanding of React architecture patterns"
      },
      {
        "question": "Describe a time when you had to optimize a slow API endpoint.",
        "category": "Behavioral",
        "purpose": "Assess problem-solving skills and performance optimization knowledge"
      },
      {
        "question": "How do you approach testing in full stack applications?",
        "category": "Technical",
        "purpose": "Evaluate commitment to code quality and testing practices"
      },
      {
        "question": "What interests you most about working on our product?",
        "category": "Cultural Fit",
        "purpose": "Gauge genuine interest and alignment with company mission"
      }
    ]
  }
}
```

---

## 💻 Usage Examples

### Example 1: Analyze a Single Resume

```javascript
// In your frontend or API client
const analyzeResume = async (resumeText, jobDescription) => {
  const response = await fetch('http://localhost:5000/api/ai/analyze-resume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      resumeText,
      jobDescription
    })
  });
  
  const data = await response.json();
  console.log('Match Score:', data.data.matchScore);
  console.log('Strengths:', data.data.strengths);
};
```

### Example 2: Rank Multiple Candidates

```javascript
const rankCandidates = async (resumes, jobDescription) => {
  const response = await fetch('http://localhost:5000/api/ai/rank-candidates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      resumes,
      jobDescription
    })
  });
  
  const data = await response.json();
  
  // Display ranked candidates
  data.data.candidates.forEach(candidate => {
    console.log(`#${candidate.rank}: ${candidate.name} - ${candidate.matchScore}%`);
  });
};
```

### Example 3: Generate Interview Questions

```javascript
const generateQuestions = async (jobDescription) => {
  const response = await fetch('http://localhost:5000/api/ai/generate-questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      jobDescription,
      numQuestions: 5
    })
  });
  
  const data = await response.json();
  
  // Display questions
  data.data.questions.forEach((q, index) => {
    console.log(`Q${index + 1} [${q.category}]: ${q.question}`);
    console.log(`Purpose: ${q.purpose}\n`);
  });
};
```

---

## 🧪 Testing with curl

### Test Resume Analysis
```bash
curl -X POST http://localhost:5000/api/ai/analyze-resume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "resumeText": "John Doe - Software Engineer with 5 years of experience in React, Node.js, Express, and MongoDB. Built multiple full-stack applications.",
    "jobDescription": "We are seeking a Full Stack Developer with MERN stack experience to join our team."
  }'
```

### Test Candidate Ranking
```bash
curl -X POST http://localhost:5000/api/ai/rank-candidates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "resumes": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "resumeText": "Software Engineer with 5 years of React and Node.js experience"
      },
      {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "resumeText": "Junior Developer with 1 year of JavaScript experience"
      }
    ],
    "jobDescription": "Senior Full Stack Developer position requiring 3+ years MERN stack experience"
  }'
```

### Test Interview Questions
```bash
curl -X POST http://localhost:5000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "jobDescription": "Full Stack Developer with MERN stack experience",
    "numQuestions": 5
  }'
```

### Check AI Service Status (No auth required)
```bash
curl http://localhost:5000/api/ai/status
```

---

## ⚙️ Configuration

### Environment Variables

Add to your `.env` file (optional):

```env
# Ollama Configuration
OLLAMA_API_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3.2
```

**Defaults:**
- `OLLAMA_API_URL`: `http://localhost:11434/api/generate`
- `OLLAMA_MODEL`: `llama3.2`

---

## 🔧 Troubleshooting

### Problem: "Ollama is not running"

**Solution:**
```bash
ollama serve
```

Keep this terminal open while using the AI features.

### Problem: "llama3.2 model not found"

**Solution:**
```bash
ollama pull llama3.2
```

Wait for download to complete (~2GB).

### Problem: Slow responses

**Cause:** Large language models take time to process, especially on CPU.

**Solutions:**
- Use a smaller model: `ollama pull llama3.2:1b`
- Upgrade to GPU-enabled system
- Be patient - first request may take 10-30 seconds
- Subsequent requests are faster (model stays in memory)

### Problem: Timeout errors

**Solution:** The API has a 60-second timeout. For very long resumes or complex analyses:
1. Summarize the resume text before sending
2. Break job descriptions into key requirements only
3. Increase timeout in `aiService.js` if needed

### Problem: JSON parsing errors

**Cause:** Sometimes the AI doesn't return perfect JSON.

**Solution:** The service has fallback handling built-in. If you see fallback responses, try:
1. Make your prompts more specific
2. Update to latest llama3.2 version
3. Use structured output format

---

## 📊 Performance Tips

1. **Keep Ollama Running:** Don't stop the `ollama serve` process
2. **First Request is Slow:** The model loads into memory on first use
3. **Batch Candidates:** Ranking multiple candidates together is more efficient than individual analyses
4. **Concise Input:** Shorter, focused resume text and job descriptions work better
5. **Reuse Sessions:** Keep the backend server running to maintain model in memory

---

## 🎯 Use Cases

### For Recruiters
1. Quickly screen large volumes of resumes
2. Rank candidates objectively
3. Generate consistent interview questions for each position
4. Identify skill gaps in candidates

### For Hiring Managers
1. Get AI-powered candidate summaries
2. Compare candidates side-by-side with match scores
3. Prepare tailored interview questions
4. Make data-driven hiring decisions

### For HR Departments
1. Standardize candidate evaluation process
2. Reduce bias in initial screening
3. Save time on resume review
4. Improve interview quality

---

## 📝 File Structure

```
backend/
├── services/
│   └── aiService.js         # Core AI functions (analyzeResume, rankCandidates, generateInterviewQuestions)
├── controllers/
│   └── aiController.js      # API request handlers
├── routes/
│   └── aiRoutes.js          # API route definitions
└── server.js                # Import and mount AI routes
```

---

## 🚀 Next Steps

1. **Test the Status Endpoint:**
   ```bash
   curl http://localhost:5000/api/ai/status
   ```

2. **Install Ollama** if you haven't already

3. **Pull llama3.2 model:**
   ```bash
   ollama pull llama3.2
   ```

4. **Start Ollama:**
   ```bash
   ollama serve
   ```

5. **Test the AI endpoints** with sample data

6. **Integrate into your frontend** UI for resume screening and interview prep

---

## 🎉 Summary

You now have three powerful AI functions:

✅ **analyzeResume(resumeText, jobDescription)**
- Returns summary, match score, strengths, weaknesses

✅ **rankCandidates(resumes[], jobDescription)**
- Analyzes and ranks multiple candidates

✅ **generateInterviewQuestions(jobDescription, numQuestions)**
- Creates tailored interview questions

All powered by **Ollama llama3.2** running locally on your machine! 🤖
