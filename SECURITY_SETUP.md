# 🔒 Security Setup Guide

## ✅ Security Checklist - COMPLETED

Your project has been secured and uploaded to GitHub with all best practices in place:

### What Was Secured:
- ✅ **Hardcoded API Key Removed** - FindWork API key removed from `jobApiService.js`
- ✅ **.env Files Protected** - All `.env` files are in `.gitignore` and NOT tracked by git
- ✅ **.env.example Created** - Template files created for both backend and frontend
- ✅ **Upload Directories Preserved** - `.gitkeep` files added to maintain directory structure
- ✅ **No Credentials in Code** - All sensitive data uses environment variables

---

## 🚀 Setup Instructions for New Developers

### 1. Clone the Repository
```bash
git clone https://github.com/mesinajake/jobportal.git
cd jobportal
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file from the template:
```bash
cp .env.example .env
```

Edit `backend/.env` with your actual credentials:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobportal

# JWT Secret (Generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Email Configuration
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

# API Keys
FINDWORK_API_KEY=your_findwork_api_key_here
ZIPRECRUITER_API_KEY=your_ziprecruiter_api_key_here
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file from the template:
```bash
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🔐 Ongoing Security Best Practices

### ❌ NEVER Do This:
- Hardcode credentials in any file
- Commit `.env` files
- Share connection strings in documentation
- Push credentials to GitHub, even in comments
- Store passwords in README files
- Use default or weak JWT secrets in production

### ✅ ALWAYS Do This:
- Use environment variables for all secrets
- Keep `.env` in `.gitignore`
- Use `.env.example` for documentation
- Rotate passwords if exposed
- Use strong, unique passwords (minimum 32 characters for JWT_SECRET)
- Enable MongoDB IP whitelisting
- Monitor your MongoDB activity logs
- Use different credentials for development and production

---

## 🔑 How to Generate Secure Secrets

### JWT Secret (Recommended: 64+ characters)
```bash
# On Linux/Mac
openssl rand -base64 64

# On Windows (PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Create a database user with a strong password
4. Whitelist your IP address
5. Get your connection string (never commit this!)

### Email SMTP Setup (Gmail)
1. Enable 2-Factor Authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app-specific password
4. Use this password in `SMTP_PASS` (not your regular Gmail password)

### API Keys
- **FindWork API**: [https://findwork.dev/developers/](https://findwork.dev/developers/)
- **ZipRecruiter API**: [https://www.ziprecruiter.com/publishers](https://www.ziprecruiter.com/publishers)

---

## 🚨 What to Do If Credentials Are Exposed

1. **Immediately Rotate All Exposed Credentials**
   - Change MongoDB password
   - Generate new JWT_SECRET
   - Revoke and create new API keys
   - Change email app passwords

2. **Update Environment Variables**
   ```bash
   # Update your .env file with new credentials
   nano backend/.env
   ```

3. **Clear Git History (if credentials were committed)**
   ```bash
   # This is destructive - use with caution
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```

4. **Monitor Your Services**
   - Check MongoDB Atlas activity logs
   - Check API usage dashboards
   - Monitor for unusual access patterns

---

## 📁 Project Structure

```
JobPortal/
├── backend/
│   ├── .env                 ← Your secrets (NOT in git)
│   ├── .env.example         ← Template (safe to commit)
│   ├── .gitignore           ← Protects .env
│   └── uploads/
│       ├── avatars/.gitkeep ← Preserves directory
│       └── resumes/.gitkeep ← Preserves directory
├── frontend/
│   ├── .env                 ← Your config (NOT in git)
│   └── .env.example         ← Template (safe to commit)
└── .gitignore               ← Root protection
```

---

## ✅ Security Verification

Before pushing code, always verify:

```bash
# Check if .env is tracked (should return nothing)
git ls-files | grep .env$

# Check for hardcoded credentials (should find none in code)
grep -r "mongodb+srv://" --include="*.js" --include="*.jsx" .
grep -r "api.*key.*=.*['\"][a-zA-Z0-9]{20}" --include="*.js" --include="*.jsx" .

# Verify .gitignore is working
git status
# Should NOT see any .env files in changes
```

---

## 🎯 Current Git Status

- **Repository**: https://github.com/mesinajake/jobportal.git
- **Branches**: `main` and `development` both pushed
- **Security**: ✅ All credentials protected
- **Status**: Ready for collaboration

---

## 📞 Support

If you have questions about security setup:
1. Check this guide first
2. Review `.env.example` files
3. Never share actual credentials in issues or discussions
4. Use environment-specific values for different environments

**Remember: Security is everyone's responsibility! 🔒**
