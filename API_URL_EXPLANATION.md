# API URL Configuration - Where URLs Come From

## The URL: `http://localhost:5000/api/ai/analyze`

### Breakdown:
```
http://localhost:5000/api/ai/analyze
│     │         │    │   │   └─ Route: /analyze
│     │         │    │   └───── AI routes prefix: /ai
│     │         │    └───────── API prefix: /api
│     │         └────────────── Port: 5000
│     └──────────────────────── Host: localhost
└────────────────────────────── Protocol: http
```

---

## 🔍 Where It Comes From

### 1. **Frontend (JobAnalyzer.jsx)** - Before Fix
```javascript
// HARDCODED (Bad Practice ❌)
const response = await fetch('http://localhost:5000/api/ai/analyze', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 2. **Frontend (JobAnalyzer.jsx)** - After Fix ✅
```javascript
// Use environment variable (Good Practice ✅)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const response = await fetch(`${API_URL}/ai/analyze`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

---

## 📂 Backend Route Structure

### 1. **`server.js`** - Mounts AI routes
```javascript
import aiRoutes from './routes/aiRoutes.js';

// API Routes
app.use('/api/ai', aiRoutes);
//      ^^^^^^^^ Base path for AI routes
```

### 2. **`routes/aiRoutes.js`** - Defines /analyze route
```javascript
import { analyzeResumeController } from '../controllers/aiController.js';

// Route: /analyze
router.post('/analyze', protect, upload.single('resume'), analyzeResumeController);
//          ^^^^^^^^^ Combined with base path = /api/ai/analyze
```

### 3. **Full Path Calculation**
```
Server base:     (no prefix)
API prefix:      /api
AI routes:       /ai
Analyze route:   /analyze
─────────────────────────────
Final URL:       /api/ai/analyze
```

---

## 🌍 Environment Variables

### Frontend (`.env`)
```bash
# Development
VITE_API_URL=http://localhost:5000/api

# Production
VITE_API_URL=https://your-domain.com/api
```

### Backend (`.env`)
```bash
# Server configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key
```

---

## 🔧 How Environment Variables Work

### Vite (Frontend)
```javascript
// Access environment variable
const API_URL = import.meta.env.VITE_API_URL;

// With fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### Node.js (Backend)
```javascript
// Access environment variable
const PORT = process.env.PORT;

// With fallback
const PORT = process.env.PORT || 5000;
```

---

## 📍 All API Endpoints in Your App

### Auth Routes (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Job Routes (`/api/jobs`)
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (admin)
- `PUT /api/jobs/:id` - Update job (admin)
- `DELETE /api/jobs/:id` - Delete job (admin)

### User Routes (`/api/users`)
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Saved Jobs Routes (`/api/saved-jobs`)
- `GET /api/saved-jobs` - Get saved jobs
- `POST /api/saved-jobs` - Save a job
- `DELETE /api/saved-jobs/:id` - Remove saved job

### AI Routes (`/api/ai`)
- `GET /api/ai/status` - Check Ollama status
- **`POST /api/ai/analyze`** - Analyze resume (file + job description) ⭐
- `POST /api/ai/rank` - Rank candidates
- `POST /api/ai/interview` - Generate interview questions

---

## 🛠️ Updated Code Locations

### Frontend: `JobAnalyzer.jsx`
**Line 1-5:**
```javascript
import { useState } from 'react';
import './JobAnalyzer.css';

// API Base URL - use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

**Line ~74:**
```javascript
const response = await fetch(`${API_URL}/ai/analyze`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Backend: `server.js`
**Line ~55:**
```javascript
app.use('/api/ai', aiRoutes);
```

### Backend: `routes/aiRoutes.js`
**Line ~48:**
```javascript
router.post('/analyze', protect, upload.single('resume'), analyzeResumeController);
```

---

## ✅ Benefits of Using Environment Variables

### ❌ Before (Hardcoded)
```javascript
fetch('http://localhost:5000/api/ai/analyze')
```
- **Problem 1**: Can't change URL without editing code
- **Problem 2**: Doesn't work in production
- **Problem 3**: Breaks if backend runs on different port
- **Problem 4**: Hard to test with different environments

### ✅ After (Environment Variable)
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
fetch(`${API_URL}/ai/analyze`)
```
- ✅ Works in development and production
- ✅ Easy to change URL (just edit `.env` file)
- ✅ Can use different URLs for different environments
- ✅ No code changes needed for deployment

---

## 🚀 Setup for Different Environments

### Development (Local)
```bash
# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

### Staging
```bash
# frontend/.env.staging
VITE_API_URL=https://staging-api.yourapp.com/api
```

### Production
```bash
# frontend/.env.production
VITE_API_URL=https://api.yourapp.com/api
```

---

## 🔍 Debugging API Calls

### Check in Browser Console
```javascript
console.log('API URL:', `${API_URL}/ai/analyze`);
// Output: API URL: http://localhost:5000/api/ai/analyze
```

### Check in Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click "Analyze Resume"
4. Look for request to `/api/ai/analyze`
5. Check:
   - **Request URL**: Should be `http://localhost:5000/api/ai/analyze`
   - **Method**: POST
   - **Status**: Should be 200 (success) or error code
   - **Headers**: Should have `Authorization: Bearer <token>`
   - **Payload**: Should have FormData with file and jobDescription

---

## 📝 Summary

**The URL `http://localhost:5000/api/ai/analyze` comes from:**

1. **Frontend**: `JobAnalyzer.jsx` line ~74
2. **Constructed from**: `${API_URL}/ai/analyze`
3. **API_URL defined**: Line 5 using environment variable
4. **Backend route**: `server.js` mounts `/api/ai` + `aiRoutes.js` defines `/analyze`
5. **Full path**: `/api/ai/analyze` on `http://localhost:5000`

**Now uses environment variables** ✅ - More flexible and production-ready!
