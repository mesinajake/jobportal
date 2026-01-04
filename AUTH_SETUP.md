# Authentication Setup - Job Portal

## ✅ Current Status: FULLY CONFIGURED & WORKING

Your authentication system is **already properly configured** to use MongoDB Atlas database. Both registration and login are functional.

## 🎯 How It Works

### Backend (Database Integration)

1. **User Model** (`backend/models/User.js`):
   - Stores users in MongoDB Atlas
   - Automatically hashes passwords with bcrypt before saving
   - Includes email validation
   - Fields: name, email, password (hashed), role, profile info

2. **Auth Controller** (`backend/controllers/authController.js`):
   - **Register**: Creates new user in database, returns JWT token
   - **Login**: Validates credentials against database, returns JWT token
   - **GetMe**: Retrieves current user from database
   - **Logout**: Clears authentication state

3. **JWT Authentication**:
   - Tokens generated with `jsonwebtoken` library
   - Token secret from environment variable: `JWT_SECRET`
   - 7-day expiration by default
   - Stored in localStorage on frontend

4. **Password Security**:
   - Passwords hashed with bcryptjs (10 salt rounds)
   - Never stored or returned in plain text
   - `select: false` on password field prevents accidental exposure

### Frontend (API Integration)

1. **API Client** (`frontend/src/services/api.js`):
   - Centralized API communication
   - Automatic JWT token inclusion in requests
   - Error handling and response parsing
   - Endpoints: `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`

2. **Auth Context** (`frontend/src/context/AuthContext.jsx`):
   - Global authentication state management
   - Persists user session in localStorage
   - Auto-checks authentication on app load
   - Provides: `login()`, `register()`, `logout()`, `updateUser()`

3. **Pages**:
   - **Register** (`frontend/src/pages/Register.jsx`): 
     - Validates password match
     - Calls backend API to create account
     - Auto-login after successful registration
   
   - **Login** (`frontend/src/pages/Login.jsx`):
     - Validates credentials via backend
     - Stores JWT token and user data
     - Redirects to previous page or home

## 🚀 Testing Authentication

### 1. Open the Application
- Frontend: http://localhost:5174
- Backend API: http://localhost:5000/api

### 2. Register a New User
1. Click "Register" or navigate to http://localhost:5174/register
2. Fill in:
   - Name: Your full name
   - Email: test@example.com (or any valid email)
   - Password: password123 (min 6 characters)
   - Confirm Password: password123
3. Click "Register now"
4. ✅ User is created in MongoDB Atlas
5. ✅ Automatically logged in
6. ✅ Redirected to home page

### 3. Login with Existing User
1. Click "Login" or navigate to http://localhost:5174/login
2. Enter email and password
3. Click "Log in now"
4. ✅ Credentials validated against database
5. ✅ JWT token generated and stored
6. ✅ Redirected to home page

### 4. Verify Database Storage
You can verify users are being stored by:
1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Navigate to your cluster: UserConfig
3. Click "Browse Collections"
4. Select database: `jobportal`
5. View collection: `users`
6. See all registered users with hashed passwords

## 🔐 Security Features

- ✅ **Password Hashing**: bcrypt with 10 salt rounds
- ✅ **JWT Tokens**: Signed with secret key, 7-day expiration
- ✅ **Protected Routes**: Middleware checks token validity
- ✅ **Input Validation**: Email format, password length, required fields
- ✅ **Duplicate Prevention**: Checks if email already exists
- ✅ **CORS Protection**: Only allows requests from localhost:5174

## 📊 Database Schema

```javascript
User {
  _id: ObjectId (auto-generated)
  name: String (required, max 50 chars)
  email: String (required, unique, lowercase)
  password: String (hashed, min 6 chars, not returned in queries)
  role: String (enum: 'user', 'employer', 'admin', default: 'user')
  phone: String
  location: String
  publicProfile: Boolean (default: true)
  preferredLocations: String
  jobTypes: Array of Strings
  resume: String (URL)
  skills: Array of Strings
  bio: String (max 500 chars)
  createdAt: Date
  updatedAt: Date
}
```

## 🎨 API Endpoints

### Public Endpoints (No Authentication)
- `POST /api/auth/register` - Create new account
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login to account
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Protected Endpoints (Requires JWT Token)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout (clears client-side token)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `DELETE /api/users/profile` - Delete account

## 🛠️ Configuration Files

### Backend `.env`:
```properties
MONGODB_URI=mongodb+srv://mesinajake9_db_user:YRgr89WPL5J3vY2A@userconfig.7wwyeam.mongodb.net/jobportal?retryWrites=true&w=majority&appName=UserConfig
JWT_SECRET=jobportal_secret_key_2025_change_me
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

### Frontend `.env`:
```properties
VITE_API_URL=http://localhost:5000/api
```

## ✅ Everything is Working!

Your authentication system is **fully functional** and uses the database:

1. ✅ Users are stored in MongoDB Atlas
2. ✅ Passwords are securely hashed
3. ✅ JWT tokens are properly generated
4. ✅ Frontend and backend are connected
5. ✅ Registration creates database records
6. ✅ Login validates against database
7. ✅ Protected routes require authentication

## 🎯 Next Steps

You can now:
1. Register a test account through the UI
2. Login with the created account
3. Access protected features (Profile, Saved Jobs, Dashboard)
4. View users in MongoDB Atlas dashboard

**No additional configuration needed - Everything is ready to use!** 🚀
