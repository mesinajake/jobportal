# Quick Fix for Email OTP 500 Error

## 🔥 The Problem
You're getting a 500 error because the `.env` file is missing!

## ✅ Quick Fix (2 Minutes)

### Step 1: Create .env File
```powershell
# In backend directory
cd backend
Copy-Item .env.example .env
```

### Step 2: Edit .env File (Minimum Settings)
Open `backend/.env` and add these minimum settings:

```env
# Required - Minimum for Email OTP to work
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=my_super_secret_jwt_key_change_this_in_production_12345

# Optional - Leave empty for development (OTP will show in console)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### Step 3: Make Sure MongoDB is Running

**Option A: Using MongoDB Atlas (Cloud - Free)**
1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in .env

**Option B: Using Local MongoDB**
```powershell
# Check if MongoDB is running
mongosh

# If not installed, use MongoDB Atlas (easier)
```

### Step 4: Restart Backend Server
```powershell
# Stop current server (Ctrl+C)
# Then restart:
npm start
```

### Step 5: Test Email OTP
```
Visit: http://localhost:5173/login/email-otp
Enter your email
Check backend console for OTP code!
```

## 🧪 Run Diagnostic Tool

To check everything automatically:
```powershell
cd backend
node diagnose-email-otp.js
```

This will tell you exactly what's missing!

## 📋 What Each Setting Does

### **NODE_ENV=development**
- Enables console logging for OTP
- Shows detailed error messages
- No email service needed!

### **MONGODB_URI**
- Database connection
- Required for storing users
- Use local or Atlas (free)

### **JWT_SECRET**
- Signs authentication tokens
- Must be a random string
- Change in production!

### **SMTP Settings (Optional)**
- Only needed for real emails
- In development, OTP prints to console
- Can leave empty for testing!

## 🎯 Expected Result

After fix, when you request OTP, backend console will show:
```
📧 ===== EMAIL (Development Mode) =====
To: your-email@example.com
Subject: Your Verification Code: 123456 - Job Portal
Content: HTML content provided
=====================================
```

Then you can use `123456` to login!

## 🚨 Still Having Issues?

Run the diagnostic:
```powershell
node diagnose-email-otp.js
```

It will show you exactly what's wrong!

## 💡 Pro Tip

For quick development without MongoDB setup, use MongoDB Atlas:
1. Free tier (512MB)
2. No installation needed
3. Works immediately
4. Sign up at: https://www.mongodb.com/cloud/atlas/register
