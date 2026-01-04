# Resume Upload Architecture

## Overview
The resume upload system follows a proper **client-server architecture** where file processing happens on the backend.

## Flow Diagram
```
User (Browser)
    ↓
    📎 Upload PDF/DOCX/TXT file
    ↓
React Frontend (JobAnalyzer.jsx)
    ↓
    POST /api/ai/upload-resume (with file in FormData)
    ↓
Node.js Backend (aiController.js)
    ↓
    📄 Extract text using:
       • pdf-parse (for PDF files)
       • mammoth (for DOCX files)
       • Buffer.toString() (for TXT files)
    ↓
    Return extracted text to frontend
    ↓
React displays text in textarea
    ↓
User pastes job description
    ↓
User clicks "Analyze Resume"
    ↓
    POST /api/ai/analyze (with resumeText + jobDescription)
    ↓
Node.js Backend (aiService.js)
    ↓
    🤖 Send to Ollama LLaMA 3.2
    ↓
    Return AI analysis (match score, strengths, weaknesses)
    ↓
React displays results
```

## Backend Components

### 1. File Upload Route (`aiRoutes.js`)
```javascript
POST /api/ai/upload-resume
- Protected route (requires JWT token)
- Uses multer middleware for file handling
- File size limit: 10MB
- Allowed types: PDF, DOCX, TXT
```

### 2. File Upload Controller (`aiController.js`)
```javascript
uploadResumeController()
- Receives file from req.file (multer)
- Detects file type (PDF/DOCX/TXT)
- Extracts text using appropriate library:
  * pdf-parse for PDF
  * mammoth for DOCX
  * Buffer.toString() for TXT
- Validates extracted text (min 50 chars)
- Returns extracted text to frontend
```

### 3. Text Extraction Libraries
- **pdf-parse**: Extracts text from PDF files (supports multi-page)
- **mammoth**: Extracts raw text from DOCX files
- **multer**: Handles multipart/form-data file uploads

## Frontend Components

### 1. File Upload Handler (`JobAnalyzer.jsx`)
```javascript
handleFileUpload()
- Creates FormData with file
- Sends POST request to /api/ai/upload-resume
- Receives extracted text from backend
- Fills textarea with extracted text
- Shows success/error messages
```

### 2. Removed Frontend Libraries
- ❌ pdfjs-dist (no longer needed)
- ❌ mammoth (no longer needed)

**Why?** File processing should happen on the server, not the browser:
- Better performance (server has more resources)
- Consistent extraction (same Node.js environment)
- Security (validate files on server)
- Smaller frontend bundle size

## API Endpoints

### Upload Resume
```http
POST /api/ai/upload-resume
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Form Data:
  resume: <PDF/DOCX/TXT file>

Response:
{
  "success": true,
  "data": {
    "text": "Extracted resume text...",
    "fileName": "john_doe_resume.pdf",
    "fileSize": 245678,
    "textLength": 1523
  }
}
```

### Analyze Resume
```http
POST /api/ai/analyze
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "resumeText": "Full resume text...",
  "jobDescription": "Full job description..."
}

Response:
{
  "success": true,
  "data": {
    "matchScore": 85,
    "summary": "Strong candidate with relevant experience...",
    "strengths": ["5+ years React", "Node.js expertise"],
    "weaknesses": ["Limited Python experience"]
  }
}
```

## Installation

### Backend Dependencies
```bash
cd backend
npm install multer pdf-parse mammoth
```

### Frontend Dependencies
```bash
cd frontend
# No additional dependencies needed!
# Removed: pdfjs-dist, mammoth
```

## Usage

### 1. Start Backend
```bash
cd backend
npm run dev
# Backend starts on http://localhost:5000
```

### 2. Start Ollama
```bash
ollama serve
# Ollama API on http://localhost:11434
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:5174
```

### 4. Use the Feature
1. Navigate to http://localhost:5174/login
2. Login with your credentials
3. Go to "AI Analyzer" in the navigation
4. Click "📎 Upload Resume"
5. Select a PDF, DOCX, or TXT file
6. Wait for text extraction
7. Paste job description
8. Click "🤖 Analyze Resume"
9. View AI-powered analysis

## Error Handling

### Backend Errors
- **No file uploaded**: 400 Bad Request
- **Unsupported file type**: 400 Bad Request
- **Text extraction failed**: 500 Internal Server Error
- **File too large (>10MB)**: 400 Bad Request
- **Insufficient text extracted**: 400 Bad Request

### Frontend Errors
- **Not logged in**: "Please login to upload files"
- **Network error**: "Failed to process file"
- **Backend error**: Shows error message from backend

## Security Features
- ✅ JWT authentication required
- ✅ File type validation (whitelist)
- ✅ File size limits (10MB)
- ✅ MIME type checking
- ✅ Extension checking (.pdf, .docx, .txt)
- ✅ Text length validation

## Performance Considerations
- Files stored in **memory** (not disk) using multer.memoryStorage()
- Fast processing for files under 10MB
- Automatic cleanup after request completes
- No temporary files on disk

## Future Enhancements
- [ ] Support for more file types (.doc, .rtf)
- [ ] Batch resume upload
- [ ] Resume parsing (extract name, email, skills)
- [ ] Save uploaded resumes to database
- [ ] Resume comparison feature
- [ ] Export analysis to PDF

## Troubleshooting

### "Failed to process file"
- Check if backend is running
- Check backend console for errors
- Verify file is PDF/DOCX/TXT format
- Ensure file is under 10MB

### "Could not extract enough text"
- PDF might be image-based (scanned document)
- Try OCR tools to convert image PDF to text
- Manually copy/paste text instead

### "Please login to upload files"
- JWT token expired or missing
- Login again to get new token
