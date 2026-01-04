# Authentication System - Testing Guide

## 🔐 System Overview

Your Job Portal now has a complete authentication system that:
- ✅ Stores users in MongoDB database
- ✅ Remembers logged-in users (even after browser refresh)
- ✅ Allows users to logout and login again without re-registering
- ✅ Uses JWT tokens for secure authentication
- ✅ Validates user credentials on login

---

## 🔧 What Was Fixed

### 1. Token Persistence Issue
**Problem**: Token wasn't properly saved to localStorage
**Fix**: Now saves token BEFORE setting API client token

```javascript
// OLD (didn't save token to localStorage properly)
apiClient.setToken(token)
localStorage.setItem('user', JSON.stringify(user))

// NEW (saves token properly)
localStorage.setItem('token', token)
localStorage.setItem('user', JSON.stringify(user))
apiClient.setToken(token)
```

### 2. Authentication Check on Page Load
**Problem**: User had to login again after refreshing page
**Fix**: Enhanced auth check to:
- Look for stored token
- Verify token with server
- Fall back to stored user data if server is unreachable
- Maintain login state across page refreshes

### 3. Better Error Handling
**Problem**: Generic error messages
**Fix**: 
- Specific validation messages
- Server error messages passed to frontend
- Better user feedback

---

## 🧪 Testing Instructions

### Test 1: New User Registration

1. **Make sure both servers are running:**
   ```powershell
   # Terminal 1 - Backend
   cd C:\Users\Jake\OneDrive\Desktop\JobPortal\backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd C:\Users\Jake\OneDrive\Desktop\JobPortal\frontend
   npm run dev
   ```

2. **Open browser** → http://localhost:5174

3. **Click "Register" or go to** → http://localhost:5174/register

4. **Fill in the form:**
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Confirm Password: `password123`

5. **Click "Register now"**

6. **Expected Result:**
   - ✅ Redirected to home page
   - ✅ User menu shows "Hi, John Doe"
   - ✅ Console shows: "Registration successful! Redirecting to home..."

7. **Check browser console (F12):**
   ```
   AuthContext: Registration successful, user set: {...}
   AuthContext: Token saved: eyJhbGciOiJIUzI1...
   ```

8. **Verify in MongoDB:**
   - Open MongoDB Compass or check database
   - Database: `jobportal`
   - Collection: `users`
   - Should see new user with hashed password

---

### Test 2: Logout and Login Again

1. **Click your profile icon** → Click "Logout"

2. **Expected Result:**
   - ✅ Redirected to home page
   - ✅ "Login/Register" buttons appear
   - ✅ User menu disappears

3. **Click "Login"** → http://localhost:5174/login

4. **Enter credentials:**
   - Email: `john@example.com`
   - Password: `password123`

5. **Click "Log in now"**

6. **Expected Result:**
   - ✅ Successfully logs in (NO need to register again!)
   - ✅ Redirected to home page
   - ✅ User menu shows "Hi, John Doe"
   - ✅ Console shows: "Login successful! Redirecting..."

---

### Test 3: Page Refresh (Stay Logged In)

1. **Make sure you're logged in**

2. **Press F5 or refresh the page**

3. **Expected Result:**
   - ✅ Page reloads
   - ✅ User STAYS logged in
   - ✅ User menu still shows name
   - ✅ Console shows: "User authenticated from server: {...}"

4. **Check localStorage (F12 → Application → Local Storage):**
   - Should see `token` and `user` stored

---

### Test 4: Invalid Login Attempt

1. **Go to login page**

2. **Enter wrong credentials:**
   - Email: `john@example.com`
   - Password: `wrongpassword`

3. **Click "Log in now"**

4. **Expected Result:**
   - ✅ Error message: "Invalid email or password"
   - ❌ User NOT logged in

---

### Test 5: Duplicate Registration

1. **Go to register page**

2. **Try to register with existing email:**
   - Name: `Jane Doe`
   - Email: `john@example.com` (same as before)
   - Password: `password123`

3. **Click "Register now"**

4. **Expected Result:**
   - ✅ Error message: "An account with this email already exists. Please login instead."
   - ❌ User NOT created

---

### Test 6: Browser Close and Reopen

1. **Make sure you're logged in**

2. **Close the browser completely**

3. **Reopen browser and go to** http://localhost:5174

4. **Expected Result:**
   - ✅ User STILL logged in
   - ✅ Token persists across browser sessions
   - ✅ No need to login again

---

## 🔍 Debugging

### Check Console Logs

Open browser console (F12) to see detailed logs:

**During Registration:**
```
AuthContext: Calling register API...
API Request: http://localhost:5000/api/auth/register
API Response: 201 {success: true, data: {...}}
AuthContext: Registration successful, user set: {id: '...', name: 'John Doe', ...}
AuthContext: Token saved: eyJhbGciOiJIUzI1NiIs...
```

**During Login:**
```
Attempting login: {email: 'john@example.com'}
AuthContext: Calling login API...
API Request: http://localhost:5000/api/auth/login
API Response: 200 {success: true, data: {...}}
AuthContext: Login successful, user set: {...}
Login successful! Redirecting...
```

**On Page Refresh:**
```
AuthContext: Checking auth on mount...
AuthContext: Token found: true
AuthContext: Stored user found: true
AuthContext: User authenticated from server: {...}
```

---

## 🗄️ Database Verification

### Check Users in MongoDB

**Using MongoDB Compass:**
1. Connect to your MongoDB Atlas cluster
2. Navigate to `jobportal` database
3. Open `users` collection
4. You should see registered users with:
   - `name`: User's name
   - `email`: User's email
   - `password`: Hashed password (bcrypt)
   - `role`: "user" (default)
   - `createdAt`: Registration timestamp

**Using curl (command line):**
```powershell
# Register a test user
curl.exe -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"

# Login with the user
curl.exe -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

---

## 🔐 How Authentication Works

### Registration Flow
```
1. User fills registration form
   ↓
2. Frontend sends: POST /api/auth/register
   { name, email, password }
   ↓
3. Backend checks if email exists
   ↓
4. Backend hashes password (bcrypt)
   ↓
5. Backend saves user to MongoDB
   ↓
6. Backend generates JWT token
   ↓
7. Backend returns: { user, token }
   ↓
8. Frontend saves token & user to localStorage
   ↓
9. User is logged in!
```

### Login Flow
```
1. User enters email & password
   ↓
2. Frontend sends: POST /api/auth/login
   { email, password }
   ↓
3. Backend finds user by email
   ↓
4. Backend compares password hash
   ↓
5. If match: generates JWT token
   ↓
6. Backend returns: { user, token }
   ↓
7. Frontend saves token & user to localStorage
   ↓
8. User is logged in!
```

### Stay Logged In (Page Refresh)
```
1. Page loads/refreshes
   ↓
2. Frontend checks localStorage for token
   ↓
3. If token exists, set in API client
   ↓
4. Frontend sends: GET /api/auth/me
   with Authorization: Bearer <token>
   ↓
5. Backend verifies token
   ↓
6. Backend returns user data
   ↓
7. User stays logged in!
```

---

## 🛡️ Security Features

### Password Hashing
- Passwords are NEVER stored in plain text
- Uses bcrypt with salt rounds
- Even database admins can't see passwords

### JWT Tokens
- Signed with secret key
- Contains user ID
- Expires after 7 days
- Verified on every protected request

### Protected Routes
- Certain pages require authentication
- Token checked on backend
- Unauthorized users redirected to login

---

## 🚨 Common Issues & Solutions

### Issue 1: "Registration failed"
**Check:**
- Backend server running? (`npm run dev` in backend folder)
- MongoDB connected? (Check backend console for "MongoDB Connected")
- Network error? (Check browser console)

### Issue 2: "Invalid credentials" on login
**Solutions:**
- Verify email is correct
- Check password (case-sensitive)
- Ensure user was registered successfully
- Check MongoDB for user existence

### Issue 3: Not staying logged in after refresh
**Check:**
- Browser localStorage enabled?
- Token saved? (F12 → Application → Local Storage)
- Backend `/api/auth/me` endpoint working?

### Issue 4: "User already exists"
**Solution:**
- Use the login page instead of register
- Or use a different email address

---

## 📊 Testing Checklist

- [ ] Register new user successfully
- [ ] User appears in MongoDB database
- [ ] Password is hashed in database
- [ ] Logout works correctly
- [ ] Login with same credentials works
- [ ] Page refresh keeps user logged in
- [ ] Browser close and reopen keeps user logged in
- [ ] Invalid credentials show error
- [ ] Duplicate email shows error
- [ ] Protected routes require login
- [ ] Token expires after 7 days (long-term test)

---

## 🔄 Complete User Journey

```
Day 1:
1. New user visits site
2. Clicks "Register"
3. Fills form and submits
4. ✅ Account created in database
5. ✅ Automatically logged in
6. Browses jobs, saves favorites
7. Closes browser

Day 2:
8. Opens browser again
9. ✅ Still logged in (token remembered!)
10. Continues browsing
11. Clicks "Logout"
12. ✅ Logged out successfully

Day 3:
13. Visits site again
14. Clicks "Login"
15. Enters same email & password
16. ✅ Logs in successfully (NO re-registration needed!)
17. All saved jobs still there
```

---

## 📞 Support Commands

### Clear all users (start fresh):
```javascript
// In MongoDB Compass or shell
db.users.deleteMany({})
```

### Check registered users:
```javascript
db.users.find({}, { password: 0 }).pretty()
```

### Clear localStorage (browser console):
```javascript
localStorage.clear()
location.reload()
```

### Test backend endpoint directly:
```powershell
# Test registration
curl.exe -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"test123\"}"
```

---

## ✅ System is Working When:

1. ✅ New users can register
2. ✅ Users are saved to MongoDB
3. ✅ Passwords are hashed
4. ✅ Users can logout
5. ✅ Users can login again (no re-registration)
6. ✅ Login persists across page refreshes
7. ✅ Login persists across browser sessions
8. ✅ Invalid credentials are rejected
9. ✅ Duplicate emails are prevented
10. ✅ Tokens expire after 7 days

**Your authentication system is now fully functional! 🎉**

