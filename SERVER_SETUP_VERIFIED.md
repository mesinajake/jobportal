# Server.js Setup - Complete Configuration ✅

## 🎯 Current Setup (Verified)

Your `server.js` is fully configured with:

### 1. ✅ Express Server Setup
```javascript
import express from 'express';
const app = express();
```

### 2. ✅ CORS Middleware
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```
- Allows frontend (localhost:5173/5174) to make requests
- Supports credentials (cookies, auth headers)

### 3. ✅ JSON Middleware
```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```
- Parses incoming JSON requests
- Parses URL-encoded data
- Required for POST requests

### 4. ✅ AI Routes Imported
```javascript
import aiRoutes from './routes/aiRoutes.js';
```
- Imports the AI routes module

### 5. ✅ AI Routes Mounted
```javascript
app.use('/api/ai', aiRoutes);
```
- Mounts AI routes at `/api/ai` prefix
- All AI endpoints accessible at:
  - `POST /api/ai/analyze`
  - `POST /api/ai/rank`
  - `POST /api/ai/interview`
  - `GET /api/ai/status`

### 6. ✅ Server Running on Port 5000
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
```

---

## 📋 Complete Middleware Stack

Your server processes requests in this order:

```
1. CORS Middleware       → Handles cross-origin requests
2. express.json()        → Parses JSON request bodies
3. express.urlencoded()  → Parses form data
4. morgan('dev')         → Logs HTTP requests
5. Routes                → Matches URL to route handlers
6. Error Handler         → Catches and formats errors
7. 404 Handler           → Returns "Route not found"
```

---

## 🛣️ All Available Routes

```javascript
// Authentication
app.use('/api/auth', authRoutes);

// Jobs
app.use('/api/jobs', jobRoutes);

// Users
app.use('/api/users', userRoutes);

// Saved Jobs
app.use('/api/saved-jobs', savedJobRoutes);

// AI Features (NEW!)
app.use('/api/ai', aiRoutes);
```

---

## 🎯 AI Route Breakdown

When you access `/api/ai/*`, Express routes to `aiRoutes.js`:

```
GET  /api/ai/status              → checkStatusController
POST /api/ai/analyze-resume      → analyzeResumeController
POST /api/ai/analyze             → analyzeResumeController (alias)
POST /api/ai/rank-candidates     → rankCandidatesController
POST /api/ai/rank                → rankCandidatesController (alias)
POST /api/ai/generate-questions  → generateQuestionsController
POST /api/ai/interview           → generateQuestionsController (alias)
```

---

## 🧪 Test the Server

### 1. Start the Server
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running in development mode on port 5000
📡 API available at http://localhost:5000/api
MongoDB Connected: ac-ijam289-shard-00-02.7wwyeam.mongodb.net
```

### 2. Test Root Endpoint
```bash
curl http://localhost:5000/
```

Expected Response:
```json
{
  "success": true,
  "message": "Welcome to Job Portal API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "jobs": "/api/jobs",
    "users": "/api/users",
    "savedJobs": "/api/saved-jobs",
    "ai": "/api/ai"
  }
}
```

### 3. Test Health Check
```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "success": true,
  "message": "Job Portal API is running",
  "timestamp": "2025-10-24T..."
}
```

### 4. Test AI Status (No Auth Required)
```bash
curl http://localhost:5000/api/ai/status
```

Expected Response (if Ollama is running):
```json
{
  "success": true,
  "data": {
    "available": true,
    "model": "llama3.2",
    "models": ["llama3.2"],
    "message": "Ollama is running with llama3.2"
  }
}
```

Expected Response (if Ollama is NOT running):
```json
{
  "success": false,
  "data": {
    "available": false,
    "model": "llama3.2",
    "message": "Ollama is not running. Start it with: ollama serve"
  }
}
```

---

## 🔧 Configuration Details

### Environment Variables (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your_jwt_secret_here

# Ollama (Optional)
OLLAMA_API_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3.2
```

### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

- **origin**: Allows requests from your React frontend
- **credentials**: Enables sending cookies and auth headers
- **Default**: localhost:5173 (Vite default port)

### JSON Parsing
```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

- **express.json()**: Parses `Content-Type: application/json`
- **express.urlencoded()**: Parses `Content-Type: application/x-www-form-urlencoded`
- **extended: true**: Allows nested objects in URL-encoded data

---

## 📊 Request Flow Example

**POST /api/ai/analyze**

```
1. Client sends request:
   POST http://localhost:5000/api/ai/analyze
   Headers: {
     "Content-Type": "application/json",
     "Authorization": "Bearer token123"
   }
   Body: {
     "resumeText": "...",
     "jobDescription": "..."
   }

2. CORS middleware → Validates origin
3. express.json() → Parses JSON body
4. morgan → Logs: POST /api/ai/analyze 200
5. Router matches → /api/ai/*
6. aiRoutes → POST /analyze
7. protect middleware → Validates JWT token
8. analyzeResumeController → Processes request
9. aiService.analyzeResume() → Calls Ollama
10. Response sent back → JSON with results
```

---

## ✅ Verification Checklist

- [x] Express server initialized
- [x] CORS middleware configured (frontend: localhost:5173)
- [x] JSON middleware configured (express.json())
- [x] URL-encoded middleware configured
- [x] Morgan logging middleware
- [x] AI routes imported from './routes/aiRoutes.js'
- [x] AI routes mounted at '/api/ai'
- [x] Server listening on port 5000
- [x] Error handling middleware
- [x] 404 handler for unknown routes
- [x] Health check endpoint
- [x] Welcome route with API documentation

---

## 🚀 All Systems Ready!

Your `server.js` is **fully configured** with:

✅ **Express** - Web framework  
✅ **CORS** - Cross-origin resource sharing  
✅ **JSON Middleware** - Parse JSON requests  
✅ **AI Routes** - Imported and mounted at `/api/ai`  
✅ **Port 5000** - Server running  
✅ **Error Handling** - Proper error responses  
✅ **Request Logging** - Morgan dev mode  

---

## 🎯 Next Steps

1. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Ollama (for AI features):**
   ```bash
   ollama serve
   ```

3. **Test AI Routes:**
   ```bash
   # Check status
   curl http://localhost:5000/api/ai/status
   
   # Get your auth token
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your@email.com","password":"yourpassword"}'
   
   # Use token to test AI endpoints
   curl -X POST http://localhost:5000/api/ai/analyze \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"resumeText":"...","jobDescription":"..."}'
   ```

4. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

Your server is ready to handle all requests! 🎉
