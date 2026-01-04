# Job Portal Backend API

MERN Stack (MongoDB, Express, React, Node.js) backend for the Job Portal application.

## Features

- ✅ RESTful API with Express.js
- ✅ MongoDB database with Mongoose
- ✅ JWT authentication
- ✅ User registration and login
- ✅ Job CRUD operations
- ✅ Saved jobs functionality
- ✅ External job API integration (ZipRecruiter, Arbeitnow, Remotive)
- ✅ Role-based access control
- ✅ Input validation
- ✅ Error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=your_secret_key_here
ZIPRECRUITER_API_KEY=your_api_key_here
FRONTEND_URL=http://localhost:5173
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Database with Sample Jobs
```bash
npm run seed
```

### Clear Database
```bash
npm run seed -- -d
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (employer/admin only)
- `PUT /api/jobs/:id` - Update job (employer/admin only)
- `DELETE /api/jobs/:id` - Delete job (employer/admin only)
- `GET /api/jobs/search/external` - Search external APIs

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `PUT /api/users/change-password` - Change password (protected)
- `DELETE /api/users/profile` - Delete account (protected)

### Saved Jobs
- `GET /api/saved-jobs` - Get all saved jobs (protected)
- `POST /api/saved-jobs` - Save a job (protected)
- `PUT /api/saved-jobs/:id` - Update saved job (protected)
- `DELETE /api/saved-jobs/:id` - Remove saved job (protected)

## External Job APIs

### ZipRecruiter
Get your API key from: https://www.ziprecruiter.com/publishers

### Arbeitnow (Free, No API Key)
Documentation: https://arbeitnow.com/api

### Remotive (Free, No API Key)
Documentation: https://remotive.com/api

## Database Models

### User
- name, email, password
- role (user, employer, admin)
- profile fields (location, skills, bio, etc.)

### Job
- title, company, description
- location, salary, type
- source (internal, ziprecruiter, arbeitnow, etc.)
- requirements, responsibilities, benefits

### SavedJob
- user reference
- job reference
- notes, status

### Application
- user and job references
- cover letter, resume
- status tracking

## Security

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Protected routes with middleware
- Role-based authorization
- Input validation with express-validator

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **HTTP Client**: axios
- **Logging**: morgan
- **Environment**: dotenv
- **Dev Tools**: nodemon

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── jobController.js   # Job operations
│   ├── userController.js  # User operations
│   └── savedJobController.js
├── middleware/
│   └── auth.js            # Authentication middleware
├── models/
│   ├── User.js            # User model
│   ├── Job.js             # Job model
│   ├── SavedJob.js        # SavedJob model
│   └── Application.js     # Application model
├── routes/
│   ├── authRoutes.js      # Auth routes
│   ├── jobRoutes.js       # Job routes
│   ├── userRoutes.js      # User routes
│   └── savedJobRoutes.js  # Saved job routes
├── services/
│   └── jobApiService.js   # External API integration
├── seeders/
│   └── seedJobs.js        # Database seeder
├── utils/
│   └── jwt.js             # JWT utilities
├── .env                   # Environment variables
├── .env.example           # Example environment file
├── .gitignore             # Git ignore file
├── server.js              # Entry point
├── package.json           # Dependencies
└── README.md              # Documentation
```

## Author

Job Portal Team

## License

MIT
