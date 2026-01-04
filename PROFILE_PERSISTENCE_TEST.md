# Profile Persistence Testing Guide 🧪

## Debug Logging Added ✅

I've added comprehensive console logging to track the entire save/load cycle. Open your browser's **Developer Console** (F12) to see what's happening.

## Test Procedure

### Step 1: Make Changes and Save
1. Open http://localhost:5176/profile
2. **Open Developer Console (F12)** - You'll see detailed logs
3. Make changes:
   - Change your name to "Test User 123"
   - Add bio: "Full Stack Developer"
   - Add skills: "React", "Node.js", "MongoDB"
   - Add experience, education, anything
4. Wait 2 seconds for auto-save
5. **Watch Console Logs:**
   ```
   💾 Profile: Starting save...
   📤 Profile: Sending data to backend: {...}
   🔄 AuthContext: updateUser called with: {...}
   📥 AuthContext: Backend response: {...}
   ✅ AuthContext: Updating user state with: {...}
   💾 AuthContext: User saved to localStorage
   ✅ Profile: Save successful!
   ```

### Step 2: Verify Save Status
- Top of page should show: **"✓ Saved just now"** (green checkmark)
- No errors in console
- Success message appears (if manual save)

### Step 3: Logout
1. Click logout button
2. **Watch Console:**
   ```
   🔄 Profile: User logged out, resetting initialization
   ```
3. You're redirected to login page

### Step 4: Login Again
1. Login with same credentials
2. **Watch Console for Auth:**
   ```
   AuthContext: Checking auth on mount...
   AuthContext: Token found: true
   AuthContext: User authenticated from server: {...}
   ```

### Step 5: Go to Profile
1. Navigate to Profile page
2. **Watch Console:**
   ```
   🔄 Profile: Initializing with user data: {...}
   📝 Profile: Setting form fields with: {...}
   ✅ Profile: Initialization complete
   ```
3. **VERIFY:** All your changes are there!
   - Name: "Test User 123" ✅
   - Bio: "Full Stack Developer" ✅
   - Skills: "React", "Node.js", "MongoDB" ✅

## What the Logs Tell You

### ✅ Success Indicators
- `💾 AuthContext: User saved to localStorage` - Data saved locally
- `✅ Profile: Save successful!` - Backend updated
- `✅ AuthContext: Updating user state` - Context updated
- `✅ Profile: Initialization complete` - Data loaded on page

### ❌ Error Indicators
- `❌ Profile: Save failed:` - Save didn't work
- `❌ AuthContext: Update profile failed:` - Backend error
- `⚠️ AuthContext: Update failed - response not successful` - API error

## Troubleshooting

### If Changes Don't Persist:

#### 1. Check Backend Connection
```
Console should show:
✅ Profile: Save successful!
```
If you see `❌ Profile: Save failed:` - Backend is down or erroring

#### 2. Check Database Save
Look for backend terminal logs showing:
```
PUT /api/users/profile 200
```
If it's 500 error - Database issue

#### 3. Check Data Loading
After login, console should show:
```
AuthContext: User authenticated from server: {
  name: "Test User 123",  ← Your saved data
  skills: [...],          ← Your skills
  ...
}
```

#### 4. Check Profile Initialization
On Profile page:
```
🔄 Profile: Initializing with user data: {
  name: "Test User 123",  ← Should match
  skills: [...],          ← Should match
}
```

## Common Issues & Fixes

### Issue 1: "Data saves but disappears on reload"
**Symptom:** Changes save but when you revisit profile, old data appears

**Check:** 
- Console log: `AuthContext: User authenticated from server`
- Does the server response contain your changes?

**Fix:** Backend might not be saving. Check backend terminal for errors.

---

### Issue 2: "Auto-save not triggering"
**Symptom:** No "Saving..." indicator appears

**Check:**
- Console: Should see change detection logs
- "● Unsaved changes" indicator should appear

**Fix:** Make sure you're editing a field, then wait 2 full seconds.

---

### Issue 3: "Login doesn't load saved data"
**Symptom:** Login works but profile is empty

**Check:**
- Console: `AuthContext: User authenticated from server: {}`
- If user object is empty, backend isn't returning data

**Fix:** Check `/api/auth/me` endpoint is working.

---

## Manual Database Check

If you want to verify data is REALLY in MongoDB:

1. Check backend terminal after save
2. Should see: `PUT /api/users/profile 200`
3. Data is permanently stored in MongoDB

## What I Fixed

### 1. Added Reset on Logout
```javascript
useEffect(() => {
  if (!user) {
    setIsInitialized(false)  // ← Allows re-initialization
  }
}, [user])
```

### 2. Added Comprehensive Logging
- Save process logging
- Load process logging  
- Error tracking
- State updates

### 3. Verified Data Flow
```
Profile Changes
     ↓
Auto-save (2 seconds)
     ↓
updateUser(profileData)
     ↓
API PUT /users/profile
     ↓
Backend saves to MongoDB
     ↓
Response with saved data
     ↓
Update AuthContext state
     ↓
Save to localStorage (backup)
     ↓
✅ Data persisted!

Logout
     ↓
Clear user state
     ↓
Reset isInitialized flag
     ↓

Login
     ↓
API GET /auth/me
     ↓
MongoDB returns saved data
     ↓
Set user in AuthContext
     ↓

Visit Profile
     ↓
Initialize with user data
     ↓
✅ All changes loaded!
```

## Expected Console Output

### During Save:
```
💾 Profile: Starting save...
📤 Profile: Sending data to backend: { name: "Test User 123", ... }
🔄 AuthContext: updateUser called with: { name: "Test User 123", ... }
📥 AuthContext: Backend response: { success: true, data: {...} }
✅ AuthContext: Updating user state with: { name: "Test User 123", ... }
💾 AuthContext: User saved to localStorage
✅ Profile: Save successful!
```

### During Logout:
```
🔄 Profile: User logged out, resetting initialization
AuthContext: Logging out...
```

### During Login:
```
AuthContext: Checking auth on mount...
AuthContext: Token found: true
AuthContext: Calling getMe API...
AuthContext: User authenticated from server: { name: "Test User 123", ... }
```

### On Profile Page:
```
🔄 Profile: Initializing with user data: { name: "Test User 123", ... }
📝 Profile: Setting form fields with: { name: "Test User 123", ... }
✅ Profile: Initialization complete
```

## Test NOW! 🚀

1. Go to http://localhost:5176/profile
2. Open Console (F12)
3. Make changes
4. Watch logs
5. Logout
6. Login
7. Check profile
8. **Report what you see in the console!**

If something isn't working, copy the console logs and share them - I'll see exactly where the issue is! 🔍
