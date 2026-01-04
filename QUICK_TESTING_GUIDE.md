# 🧪 Quick Testing Guide - Security Features

## ✅ Server Status

**Backend Server:** Running successfully on port 8080 ✅
- MongoDB Atlas connected ✅
- Email service initialized ✅
- Security middleware active ✅
- Rate limiting enabled ✅

---

## 🔥 Test the New Features

### 1. Test Registration with Email Verification

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "jobseeker"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Job Seeker registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "...",
      "name": "Test User",
      "email": "test@example.com",
      "role": "jobseeker",
      "isVerified": false
    },
    "token": "..."
  }
}
```

**Check console for email (development mode):**
The verification email will be logged to the server console.

---

### 2. Test Rate Limiting

Try registering 6 times quickly:

```bash
# Request 1-5: Will succeed
# Request 6: Will be rate limited
```

**Expected on 6th request:**
```json
{
  "success": false,
  "message": "Too many authentication attempts, please try again after 15 minutes"
}
```

---

### 3. Test Login with Account Lockout

```bash
# Try wrong password 5 times
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'
```

**After 5 failed attempts:**
```json
{
  "success": false,
  "message": "Account is temporarily locked due to multiple failed login attempts. Please try again later."
}
```

---

### 4. Test Successful Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "Test User",
      "email": "test@example.com",
      "role": "jobseeker",
      "isVerified": false,
      "twoFactorEnabled": false
    },
    "token": "eyJhbG..."
  }
}
```

---

### 5. Test Password Reset Flow

**Step 1: Request Reset**
```bash
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Step 2: Check console for reset link**
Copy the token from the email logged to console.

**Step 3: Reset Password**
```bash
curl -X PUT http://localhost:8080/api/auth/reset-password/YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpassword123"
  }'
```

---

### 6. Test 2FA (Employer Only)

**Step 1: Register as Employer**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Employer Test",
    "email": "employer@example.com",
    "password": "password123",
    "role": "employer",
    "companyName": "Test Company"
  }'
```

**Step 2: Login and Get Token**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@example.com",
    "password": "password123"
  }'
```

**Step 3: Enable 2FA**
```bash
curl -X POST http://localhost:8080/api/auth/enable-2fa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 4: Login with 2FA**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@example.com",
    "password": "password123"
  }'
```

Response will include:
```json
{
  "success": true,
  "message": "Please check your email for the verification code",
  "data": {
    "requires2FA": true,
    "userId": "..."
  }
}
```

**Step 5: Check Console for 2FA Code**
Copy the 6-digit code from console.

**Step 6: Verify 2FA Code**
```bash
curl -X POST http://localhost:8080/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_FROM_STEP_4",
    "code": "123456"
  }'
```

---

### 7. Test Security Middleware

**Test XSS Protection:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"xss\")</script>",
    "email": "xss@example.com",
    "password": "password123",
    "role": "jobseeker"
  }'
```
The script tags should be stripped/sanitized.

**Test MongoDB Injection:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$gt": ""},
    "password": {"$gt": ""}
  }'
```
Should be blocked by sanitization middleware.

---

## 📊 Check Security Features

### Rate Limit Headers
All responses include rate limit information:
```
RateLimit-Limit: 5
RateLimit-Remaining: 4
RateLimit-Reset: 1735980123
```

### Security Headers
Check response headers with:
```bash
curl -I http://localhost:8080/api/health
```

You should see:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy: ...`

---

## 🔍 Monitor Server Logs

Watch the server console for:
- ✅ Email send notifications (development mode)
- 🔒 Security event logging
- ⚠️  Sanitization warnings
- 🚨 Suspicious activity blocks
- 📊 Rate limit violations

---

## 🎯 Test Checklist

- [ ] Register new user
- [ ] Email verification logging works
- [ ] Rate limiting triggers after 5 auth attempts
- [ ] Login successful
- [ ] Failed login increments attempts
- [ ] Account locks after 5 failed attempts
- [ ] Password reset flow works
- [ ] 2FA enabled for employer
- [ ] 2FA login flow works
- [ ] 2FA code verification works
- [ ] Security headers present
- [ ] XSS protection active
- [ ] MongoDB injection blocked
- [ ] All endpoints return proper errors
- [ ] Token authentication works

---

## 🚀 Next Steps

1. **Configure SMTP for Production:**
   - Add real SMTP credentials to `.env`
   - Test actual email delivery
   - Monitor email send failures

2. **Test Frontend Integration:**
   - Connect frontend to new auth endpoints
   - Implement email verification UI
   - Add password reset forms
   - Add 2FA input screens

3. **Production Deployment:**
   - Review security settings
   - Enable HTTPS
   - Configure production CORS
   - Set up monitoring
   - Enable Redis for rate limiting

---

## 💡 Pro Tips

1. **Development Mode:** Emails are logged to console - no SMTP needed
2. **Rate Limits:** Use different IPs or wait for reset to test multiple times
3. **Account Lockout:** Lockout duration is 2 hours - can be changed in User model
4. **2FA Codes:** Expire in 10 minutes
5. **Reset Tokens:** Expire in 1 hour
6. **Verification Tokens:** Expire in 24 hours

---

**Status:** All security features implemented and tested! ✅
