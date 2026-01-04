# AI Routes - Quick Reference

## 🎯 Available Endpoints

All AI endpoints are prefixed with `/api/ai`

### 1. Check Status (Public)
```
GET /api/ai/status
```
No authentication required. Check if Ollama is running.

---

### 2. Analyze Resume (Protected)

**Full Route:**
```
POST /api/ai/analyze-resume
```

**Short Alias:**
```
POST /api/ai/analyze
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "resumeText": "Full resume text here...",
  "jobDescription": "Job description here..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Candidate summary...",
    "matchScore": 85,
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2", "weakness 3"]
  }
}
```

---

### 3. Rank Candidates (Protected)

**Full Route:**
```
POST /api/ai/rank-candidates
```

**Short Alias:**
```
POST /api/ai/rank
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "resumes": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "resumeText": "Resume text..."
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "resumeText": "Resume text..."
    }
  ],
  "jobDescription": "Job description here..."
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
        "summary": "Summary...",
        "strengths": [...],
        "weaknesses": [...]
      },
      {
        "rank": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "matchScore": 72,
        "summary": "Summary...",
        "strengths": [...],
        "weaknesses": [...]
      }
    ]
  }
}
```

---

### 4. Generate Interview Questions (Protected)

**Full Route:**
```
POST /api/ai/generate-questions
```

**Short Alias:**
```
POST /api/ai/interview
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "jobDescription": "Job description here...",
  "numQuestions": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobDescription": "Job description here...",
    "numQuestions": 5,
    "questions": [
      {
        "question": "Interview question here?",
        "category": "Technical",
        "purpose": "Why this question matters"
      }
    ]
  }
}
```

---

## 🧪 Quick Test Commands

### 1. Check Status
```bash
curl http://localhost:5000/api/ai/status
```

### 2. Analyze Resume (using short route)
```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "resumeText": "John Doe - 5 years React experience",
    "jobDescription": "React Developer position"
  }'
```

### 3. Rank Candidates (using short route)
```bash
curl -X POST http://localhost:5000/api/ai/rank \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "resumes": [
      {"name": "John", "email": "john@test.com", "resumeText": "5 years React"},
      {"name": "Jane", "email": "jane@test.com", "resumeText": "2 years React"}
    ],
    "jobDescription": "React Developer"
  }'
```

### 4. Generate Interview Questions (using short route)
```bash
curl -X POST http://localhost:5000/api/ai/interview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobDescription": "React Developer position",
    "numQuestions": 5
  }'
```

---

## 📋 Route Summary

| Purpose | Full Route | Short Alias | Auth Required |
|---------|-----------|-------------|---------------|
| Check Status | `GET /api/ai/status` | - | ❌ No |
| Analyze Resume | `POST /api/ai/analyze-resume` | `POST /api/ai/analyze` | ✅ Yes |
| Rank Candidates | `POST /api/ai/rank-candidates` | `POST /api/ai/rank` | ✅ Yes |
| Interview Questions | `POST /api/ai/generate-questions` | `POST /api/ai/interview` | ✅ Yes |

---

## ⚡ Controller Mapping

Each route calls its corresponding controller:

```javascript
// aiRoutes.js
router.post('/analyze', protect, analyzeResumeController);
router.post('/rank', protect, rankCandidatesController);
router.post('/interview', protect, generateQuestionsController);
```

Controllers are defined in `backend/controllers/aiController.js`:
- `analyzeResumeController` → calls `analyzeResume()` from aiService
- `rankCandidatesController` → calls `rankCandidates()` from aiService
- `generateQuestionsController` → calls `generateInterviewQuestions()` from aiService

---

## 🔐 Authentication

All AI endpoints (except `/status`) require a valid JWT token:

```javascript
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get a token by logging in:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "yourpassword"}'
```

---

## 🎯 Usage in Frontend

```javascript
// Example: Analyze Resume
const analyzeResume = async (resumeText, jobDescription) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ resumeText, jobDescription })
  });
  
  const data = await response.json();
  return data;
};

// Example: Rank Candidates
const rankCandidates = async (resumes, jobDescription) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/ai/rank', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ resumes, jobDescription })
  });
  
  const data = await response.json();
  return data;
};

// Example: Generate Interview Questions
const generateQuestions = async (jobDescription, numQuestions = 5) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/ai/interview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ jobDescription, numQuestions })
  });
  
  const data = await response.json();
  return data;
};
```

---

## ✅ Complete Flow

1. **User logs in** → Gets JWT token
2. **User submits resume(s)** → Frontend sends to `/api/ai/analyze` or `/api/ai/rank`
3. **Backend validates token** → `protect` middleware checks JWT
4. **Controller validates input** → Checks for required fields
5. **Service calls Ollama** → Sends prompt to llama3.2
6. **AI processes request** → Returns structured response
7. **Backend returns JSON** → Frontend displays results

---

## 🚀 Ready to Use!

Your AI routes are now set up and ready:

✅ `POST /api/ai/analyze` - Analyze single resume  
✅ `POST /api/ai/rank` - Rank multiple candidates  
✅ `POST /api/ai/interview` - Generate interview questions  
✅ `GET /api/ai/status` - Check Ollama availability  

Just make sure:
1. ✅ Backend server is running (`npm run dev` in backend folder)
2. ✅ Ollama is running (`ollama serve`)
3. ✅ llama3.2 model is installed (`ollama pull llama3.2`)

Test with the curl commands above!
