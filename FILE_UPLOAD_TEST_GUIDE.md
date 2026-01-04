# Quick Test Guide - File Upload Feature

## 🚀 Ready to Test!

All the code changes have been implemented. Here's what to do:

---

## 📋 Pre-Test Checklist

### Backend Status
✅ User model updated with `avatar` field
✅ Multer middleware created (`backend/middleware/upload.js`)
✅ Upload routes configured with file handling
✅ User controller updated to handle FormData
✅ Static file serving enabled for `/uploads`

### Frontend Status
✅ API client updated to handle FormData
✅ Profile.jsx updated to send FormData
✅ File upload UI already exists
✅ Avatar preview functionality ready
✅ Resume upload functionality ready

---

## 🧪 Test Steps

### Test 1: Upload Profile Photo (Avatar)

1. **Navigate to Profile Page**
   - Login to your account
   - Go to `/profile` route
   - You should see the "Profile Picture" section

2. **Upload an Image**
   - Click the "Upload Photo" button
   - Select a JPG or PNG image (under 5MB)
   - You should see a preview of the image immediately

3. **Save Profile**
   - Click "Save Profile" button
   - OR wait 2 seconds for auto-save
   - Watch the console for logs

4. **Verify Upload**
   - Check backend console for: `📸 updateUserProfile: Avatar uploaded: [filename]`
   - Check `backend/uploads/avatars/` directory for the file
   - Refresh the page → Avatar should still be visible

5. **Test Persistence**
   - Logout
   - Login again
   - Go to Profile page
   - Avatar should load from server

6. **Test File Replacement**
   - Upload a different image
   - Save profile
   - Check `backend/uploads/avatars/` → Only new file should exist

---

### Test 2: Upload Resume

1. **Navigate to Resume Section**
   - On Profile page, scroll to "Resume" section
   - (Or it might be in a different tab depending on your UI)

2. **Upload a Document**
   - Click "Upload Resume" button
   - Select a PDF or Word document (under 10MB)
   - You should see the filename displayed

3. **Save Profile**
   - Click "Save Profile" button
   - OR wait 2 seconds for auto-save
   - Watch the console for logs

4. **Verify Upload**
   - Check backend console for: `📄 updateUserProfile: Resume uploaded: [filename]`
   - Check `backend/uploads/resumes/` directory for the file
   - Note the file URL

5. **Test Access**
   - Open browser
   - Navigate to: `http://localhost:8080/uploads/resumes/[your-filename].pdf`
   - File should download or display in browser

6. **Test Persistence**
   - Logout
   - Login again
   - Go to Profile page
   - Resume info should be displayed

---

### Test 3: Upload Both Together

1. **Upload Both Files**
   - Upload a new avatar
   - Upload a new resume
   - DON'T save yet

2. **Save Once**
   - Click "Save Profile" one time
   - Both files should upload together

3. **Verify**
   - Check both directories for files
   - Both should be present
   - Database should have both URLs

---

### Test 4: Error Cases

**Test File Size Limit (Avatar)**
- Try to upload an image > 5MB
- Should show error: "Image size must be less than 5MB"
- File should NOT be uploaded

**Test File Size Limit (Resume)**
- Try to upload a document > 10MB
- Should show error: "Resume size must be less than 10MB"
- File should NOT be uploaded

**Test Invalid File Type (Resume)**
- Try to upload a .txt or .jpg file as resume
- Should show error: "Only PDF and Word documents are allowed"
- File should NOT be uploaded

---

## 🔍 What to Look For

### Frontend Console (Browser DevTools)
```
💾 Profile: Starting save...
📤 Profile: Sending FormData to backend
🔄 AuthContext: updateUser called with: FormData { ... }
📥 AuthContext: Backend response: { success: true, data: {...} }
✅ AuthContext: Updating user state with: { avatar: "/uploads/avatars/..." }
💾 AuthContext: User saved to localStorage
✅ Profile: Save successful!
```

### Backend Console (Terminal)
```
📝 updateUserProfile: Request body: { name: 'John', email: '...', ... }
📁 updateUserProfile: Files: {
  avatar: [ { filename: 'user123-1234567890-photo.jpg', ... } ]
}
📸 updateUserProfile: Avatar uploaded: user123-1234567890-photo.jpg
💾 updateUserProfile: Saving to database: { avatar: '/uploads/avatars/...' }
✅ updateUserProfile: User updated successfully
```

### File System
```
backend/
  uploads/
    avatars/
      user123-1234567890-photo.jpg         ← Your uploaded avatar
    resumes/
      user123-1234567890-resume.pdf        ← Your uploaded resume
```

### Database (MongoDB)
Check your user document:
```javascript
{
  _id: ObjectId("..."),
  name: "Your Name",
  email: "your@email.com",
  avatar: "/uploads/avatars/user123-1234567890-photo.jpg",  ← New field!
  resume: {
    url: "/uploads/resumes/user123-1234567890-resume.pdf",
    uploadedAt: ISODate("2025-01-20T...")
  },
  // ... other fields
}
```

---

## ❌ Common Issues & Fixes

### Issue: "Cannot find module 'multer'"
**Fix:** Run `cd backend && npm install multer`

### Issue: Files upload but can't access via HTTP
**Fix:** 
1. Check if `uploads` directory exists
2. Verify static middleware in server.js
3. Restart backend server

### Issue: FormData shows as empty object in console
**Normal:** FormData doesn't show content in console.log
**Verify:** Check Network tab → Request payload

### Issue: Arrays coming through as strings
**Normal:** FormData serializes arrays as JSON strings
**Fixed:** Controller parses them back to objects

### Issue: Boolean values not working
**Normal:** FormData sends everything as strings
**Fixed:** Controller handles `'true'` → `true` conversion

### Issue: Old files not being deleted
**Check:**
1. File permissions on uploads directory
2. Backend console for deletion errors
3. File paths in database

---

## 🎯 Expected Results

After successful testing, you should have:

✅ Avatar image visible on profile page
✅ Avatar persists across logout/login
✅ Resume file uploaded and metadata shown
✅ Old files automatically deleted when uploading new ones
✅ Files accessible via HTTP URLs
✅ No errors in console
✅ Database contains file URLs
✅ Auto-save works with file uploads
✅ File validation prevents invalid uploads

---

## 📸 Visual Confirmation

### Before Upload
- Profile picture shows placeholder (first letter of name)
- Resume section shows "Upload Resume" button

### After Avatar Upload
- Profile picture shows uploaded image
- Image persists on page refresh
- Image loads after logout/login

### After Resume Upload
- Resume section shows filename and upload date
- "Remove" button appears
- Resume accessible via URL

---

## 🐛 If Something Goes Wrong

### Debug Steps

1. **Check Frontend Console**
   - Any JavaScript errors?
   - FormData being created correctly?
   - API response showing success?

2. **Check Backend Console**
   - Multer errors?
   - File validation errors?
   - Database save errors?

3. **Check Network Tab**
   - Is request type `multipart/form-data`?
   - Are files in the request payload?
   - What's the response status code?

4. **Check File System**
   - Do upload directories exist?
   - Are files being created?
   - Correct permissions?

5. **Check Database**
   - Is avatar URL saved?
   - Is resume object complete?
   - Check field names match schema

---

## ✨ Success Indicators

You'll know everything is working when:

1. ✅ You upload an avatar → It shows in preview immediately
2. ✅ You save profile → Backend logs file upload
3. ✅ You refresh page → Avatar still visible
4. ✅ You logout/login → Avatar loads from server
5. ✅ You upload a resume → Filename displayed
6. ✅ You open resume URL → File downloads/displays
7. ✅ You upload new files → Old files automatically deleted
8. ✅ No errors in any console

---

## 🎉 Next Steps After Successful Test

Once everything works:

1. **Test with different file types** (JPG, PNG, PDF, DOCX)
2. **Test file size limits** (try uploading large files)
3. **Test with multiple users** (ensure files are user-specific)
4. **Test auto-save** (upload file and wait for auto-save)
5. **Test profile completion** (check if file uploads affect completion %)

Then consider optional enhancements:
- Image compression
- Cloud storage (AWS S3)
- Resume parsing
- Progress bars
- File management UI

---

## 📞 Need Help?

If tests fail, check:
1. ✅ `FILE_UPLOAD_COMPLETE.md` for detailed implementation info
2. ✅ Backend console logs for specific error messages
3. ✅ Browser console for frontend errors
4. ✅ Network tab for API request/response details
5. ✅ Database to verify data is being saved

**Most common fixes:**
- Restart backend server
- Clear browser cache
- Re-login to get fresh user data
- Check file permissions on upload directories

---

## 🚀 Ready? Let's Test!

1. Open your application
2. Go to Profile page
3. Upload a photo
4. Upload a resume
5. Save your profile
6. Check the results!

**Happy testing! 🎉**
