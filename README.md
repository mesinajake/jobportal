# Job Portal - MERN Stack Application

A full-stack job portal application built with MongoDB, Express.js, React, and Node.js.

## 🚀 Features

### Frontend (React + Vite)
- ✅ Modern UI with React 18
- ✅ Responsive design
- ✅ Job search and filtering
- ✅ User authentication (Login/Register)
- ✅ User profiles and preferences
- ✅ Save and track jobs
- ✅ Real-time job search
- ✅ External job API integration

### Backend (Node.js + Express + MongoDB)
- ✅ RESTful API architecture
- ✅ JWT authentication
- ✅ MongoDB with Mongoose ODM
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ External job API integration (ZipRecruiter, Arbeitnow, Remotive)
- ✅ Input validation
- ✅ Error handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - OR use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud-hosted)
- **npm** or **yarn** package manager
- **Git** (optional)

## 🛠️ Installation & Setup

### Step 1: Clone or Download the Project

```bash
cd JobPortal
```

### Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000

# MongoDB - Choose one option:
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/jobportal

# Option 2: MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobportal

# JWT Secret (change in production!)
JWT_SECRET=your_super_secret_jwt_key_here_change_me
JWT_EXPIRE=7d

# ZipRecruiter API (optional)
# Get your API key from: https://www.ziprecruiter.com/publishers
ZIPRECRUITER_API_KEY=

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

5. Start MongoDB (if using local installation):
```bash
# Windows
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"

# macOS/Linux
mongod

# OR use MongoDB service:
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

6. Seed the database with sample jobs (optional):
```bash
npm run seed
```

7. Start the backend server:
```bash
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

The backend API should now be running at: http://localhost:5000

### Step 3: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
# The file already exists, but verify it contains:
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend should now be running at: http://localhost:5173

## 📱 Usage

### Access the Application

1. Open your browser and go to: http://localhost:5173
2. Register a new account or login with:
   - Email: `admin@gmail.com`
   - Password: `successful`

### API Endpoints

Base URL: `http://localhost:5000/api`

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (requires token)
- `POST /auth/logout` - Logout user

#### Jobs
- `GET /jobs` - Get all jobs
- `GET /jobs/:id` - Get single job
- `POST /jobs` - Create job (employer/admin only)
- `PUT /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job
- `GET /jobs/search/external` - Search external APIs

#### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `PUT /users/change-password` - Change password
- `DELETE /users/profile` - Delete account

#### Saved Jobs
- `GET /saved-jobs` - Get all saved jobs
- `POST /saved-jobs` - Save a job
- `PUT /saved-jobs/:id` - Update saved job
- `DELETE /saved-jobs/:id` - Remove saved job

## 🔑 External Job APIs

### ZipRecruiter API Setup

1. Visit: https://www.ziprecruiter.com/publishers
2. Sign up for a publisher account
3. Get your API key
4. Add to `backend/.env`:
   ```
   ZIPRECRUITER_API_KEY=your_api_key_here
   ```

### Free Alternatives

The application also integrates with free job APIs:

1. **Arbeitnow** - No API key required
   - URL: https://arbeitnow.com/api
   - Already configured and working

2. **Remotive** - No API key required
   - URL: https://remotive.com/api
   - Uncomment in `backend/services/jobApiService.js` to enable

## 📁 Project Structure

```
JobPortal/
├── backend/                    # Node.js Backend
│   ├── config/                 # Configuration files
│   │   └── db.js              # MongoDB connection
│   ├── controllers/            # Request handlers
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── userController.js
│   │   └── savedJobController.js
│   ├── middleware/             # Custom middleware
│   │   └── auth.js            # Authentication middleware
│   ├── models/                 # Mongoose models
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── SavedJob.js
│   │   └── Application.js
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── userRoutes.js
│   │   └── savedJobRoutes.js
│   ├── services/               # Business logic
│   │   └── jobApiService.js   # External API integration
│   ├── seeders/                # Database seeders
│   │   └── seedJobs.js
│   ├── utils/                  # Utility functions
│   │   └── jwt.js
│   ├── .env                    # Environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── README.md
│   └── server.js              # Entry point
│
└── frontend/                   # React Frontend
    ├── public/                 # Static files
    │   └── images/            # Job images
    ├── src/
    │   ├── components/         # React components
    │   │   ├── Header.jsx
    │   │   ├── Footer.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/            # React Context
    │   │   └── AuthContext.jsx
    │   ├── data/               # Static data
    │   │   └── jobs.js
    │   ├── hooks/              # Custom hooks
    │   │   └── useSavedJobs.js
    │   ├── pages/              # Page components
    │   │   ├── Home.jsx
    │   │   ├── Jobs.jsx
    │   │   ├── Job.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Profile.jsx
    │   │   ├── About.jsx
    │   │   ├── Contact.jsx
    │   │   └── Company.jsx
    │   ├── services/           # API services
    │   │   ├── api.js         # API client
    │   │   └── jobsApi.js     # Job API calls
    │   ├── utils/              # Utilities
    │   │   └── slug.js
    │   ├── App.jsx             # Main App component
    │   ├── main.jsx            # Entry point
    │   └── index.css           # Global styles
    ├── .env                    # Environment variables
    ├── package.json
    ├── vite.config.js
    └── README.md
```

## 🧪 Testing the API

### Using cURL

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get jobs
curl http://localhost:5000/api/jobs

# Search jobs
curl "http://localhost:5000/api/jobs?search=developer&location=manila"
```

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the API endpoints
3. Set base URL: `http://localhost:5000/api`
4. For protected routes, add header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_JWT_TOKEN`

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error**: `MongoNetworkError: failed to connect to server`

**Solution**:
1. Ensure MongoDB is running
2. Check MONGODB_URI in `.env`
3. For MongoDB Atlas, whitelist your IP address

### Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Frontend Can't Connect to Backend

**Error**: `ERR_CONNECTION_REFUSED`

**Solution**:
1. Ensure backend is running on port 5000
2. Check `VITE_API_URL` in `frontend/.env`
3. Verify CORS settings in `backend/server.js`

## 🚀 Deployment

### Backend (Heroku/Railway/Render)

1. Set environment variables
2. Set `NODE_ENV=production`
3. Use MongoDB Atlas for database
4. Deploy using platform-specific commands

### Frontend (Vercel/Netlify)

1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder
3. Set environment variable: `VITE_API_URL=your-backend-url`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- External APIs: ZipRecruiter, Arbeitnow, Remotive
- UI Design inspiration
- MERN Stack community
