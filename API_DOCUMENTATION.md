# 📚 Complete API Documentation - Job Portal

## Base URL
```
Development: http://localhost:8080/api
Production: https://your-domain.com/api
```

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Rate Limit:** 5 requests / 15 minutes

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "jobseeker",  // or "employer"
  
  // Optional for employers:
  "companyName": "My Company",
  "companyWebsite": "https://company.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Job Seeker registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "jobseeker",
      "isVerified": false
    },
    "company": null,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login
**POST** `/auth/login`

**Rate Limit:** 5 requests / 15 minutes

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200) - No 2FA:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "jobseeker",
      "isVerified": true,
      "twoFactorEnabled": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (200) - With 2FA:**
```json
{
  "success": true,
  "message": "Please check your email for the verification code",
  "data": {
    "requires2FA": true,
    "userId": "65f1a2b3c4d5e6f7g8h9i0j1"
  }
}
```

**Error (401) - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Error (423) - Account Locked:**
```json
{
  "success": false,
  "message": "Account is temporarily locked due to multiple failed login attempts. Please try again later."
}
```

---

### 3. Verify Email
**GET** `/auth/verify-email/:token`

**No Authentication Required**

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now login.",
  "data": {
    "isVerified": true
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Invalid or expired verification token"
}
```

---

### 4. Resend Verification Email
**POST** `/auth/resend-verification`

**Rate Limit:** 5 requests / hour

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

---

### 5. Forgot Password
**POST** `/auth/forgot-password`

**Rate Limit:** 3 requests / hour

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account with that email exists, we have sent a password reset link"
}
```

---

### 6. Reset Password
**PUT** `/auth/reset-password/:token`

**Rate Limit:** 3 requests / hour

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful! You can now login with your new password."
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

---

### 7. Get Current User
**GET** `/auth/me`

**Authentication Required**

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "jobseeker",
    "isVerified": true,
    "phone": "+1234567890",
    "location": "New York, USA",
    "skills": [
      { "name": "JavaScript", "level": "advanced" },
      { "name": "React", "level": "expert" }
    ],
    "experience": [],
    "education": [],
    "resume": {
      "url": "/uploads/resumes/resume123.pdf",
      "uploadedAt": "2025-01-04T10:30:00.000Z"
    }
  }
}
```

---

### 8. Logout
**POST** `/auth/logout`

**Authentication Required**

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {}
}
```

---

### 9. Enable 2FA (Employer Only)
**POST** `/auth/enable-2fa`

**Authentication Required** (Employer role)

**Response (200):**
```json
{
  "success": true,
  "message": "2FA enabled successfully",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAA...",
    "method": "email"
  }
}
```

---

### 10. Disable 2FA
**POST** `/auth/disable-2fa`

**Authentication Required** (Employer role)

**Response (200):**
```json
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

---

### 11. Verify 2FA Code
**POST** `/auth/verify-2fa`

**Rate Limit:** 5 requests / 15 minutes

**Request Body:**
```json
{
  "userId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "2FA verification successful",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Employer Name",
      "email": "employer@example.com",
      "role": "employer",
      "isVerified": true,
      "twoFactorEnabled": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Invalid or expired verification code"
}
```

---

## 📝 Jobs Endpoints

### 1. Get All Jobs
**GET** `/jobs`

**Query Parameters:**
```
?search=developer
&location=Remote
&type=Full time
&category=Software
&source=internal
&page=1
&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "count": 150,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  },
  "data": [
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "title": "Senior Full Stack Developer",
      "company": "Tech Company",
      "companyLogo": "/images/company-logo.png",
      "description": "We are looking for...",
      "location": "San Francisco, CA",
      "salary": "$120k - $180k",
      "type": "Full time",
      "category": "Software Development",
      "posted": "2 days ago",
      "views": 234,
      "applications": 15,
      "isActive": true,
      "status": "active",
      "source": "internal"
    }
  ]
}
```

---

### 2. Get Job by ID
**GET** `/jobs/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Senior Full Stack Developer",
    "company": "Tech Company",
    "companyRef": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Tech Company",
      "logo": "/uploads/logos/tech-company.png",
      "website": "https://techcompany.com",
      "location": "San Francisco, CA"
    },
    "description": "Full job description...",
    "requirements": [
      "5+ years experience",
      "React, Node.js",
      "Strong communication skills"
    ],
    "responsibilities": [
      "Develop features",
      "Code reviews",
      "Mentoring"
    ],
    "benefits": [
      "Health insurance",
      "401k matching",
      "Remote work"
    ],
    "location": "San Francisco, CA / Remote",
    "salary": "$120k - $180k",
    "type": "Full time",
    "category": "Software Development",
    "experienceLevel": "senior",
    "skills": ["React", "Node.js", "TypeScript"],
    "postedBy": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "name": "Hiring Manager",
      "email": "hiring@techcompany.com"
    },
    "views": 234,
    "applications": 15,
    "isActive": true,
    "status": "active",
    "createdAt": "2025-01-02T10:30:00.000Z",
    "expiresAt": "2025-02-01T23:59:59.000Z"
  }
}
```

---

### 3. Create Job (Employer Only)
**POST** `/jobs`

**Authentication Required** (Employer role)

**Rate Limit:** 20 posts / day

**Request Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "description": "We are looking for...",
  "location": "San Francisco, CA",
  "salary": "$120k - $180k",
  "type": "Full time",
  "category": "Software Development",
  "experienceLevel": "senior",
  "requirements": [
    "5+ years experience",
    "React, Node.js"
  ],
  "responsibilities": [
    "Develop features",
    "Code reviews"
  ],
  "benefits": [
    "Health insurance",
    "401k"
  ],
  "skills": ["React", "Node.js", "TypeScript"],
  "status": "active",  // or "draft"
  "expiresAt": "2025-02-01"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Senior Full Stack Developer",
    ...
  }
}
```

**Error (403) - No Credits:**
```json
{
  "success": false,
  "message": "Insufficient job post credits. Please upgrade your subscription."
}
```

---

## 📄 Applications Endpoints

### 1. Submit Application (Job Seeker Only)
**POST** `/applications`

**Authentication Required** (Job Seeker role)

**Rate Limit:** 50 applications / day

**Request Body:**
```json
{
  "jobId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "coverLetter": "I am interested in...",
  "resumeUrl": "/uploads/resumes/resume123.pdf"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j4",
    "job": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user": "65f1a2b3c4d5e6f7g8h9i0j5",
    "coverLetter": "I am interested in...",
    "resume": "/uploads/resumes/resume123.pdf",
    "status": "pending",
    "appliedAt": "2025-01-04T10:30:00.000Z"
  }
}
```

---

### 2. Get My Applications (Job Seeker)
**GET** `/applications/my-applications`

**Authentication Required** (Job Seeker role)

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j4",
      "job": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "title": "Senior Full Stack Developer",
        "company": "Tech Company"
      },
      "status": "reviewed",
      "appliedAt": "2025-01-04T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Received Applications (Employer)
**GET** `/applications/received`

**Authentication Required** (Employer role)

**Query Parameters:**
```
?status=pending
&jobId=65f1a2b3c4d5e6f7g8h9i0j1
```

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j4",
      "user": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j5",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "job": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "title": "Senior Full Stack Developer"
      },
      "coverLetter": "I am interested in...",
      "resume": "/uploads/resumes/resume123.pdf",
      "status": "pending",
      "appliedAt": "2025-01-04T10:30:00.000Z"
    }
  ]
}
```

---

## 📊 Analytics Endpoints

### 1. Track Event
**POST** `/analytics/track`

**Public Endpoint**

**Request Body:**
```json
{
  "eventType": "view",  // "view", "click", "apply", "save", "share"
  "job": "65f1a2b3c4d5e6f7g8h9i0j1",
  "company": "65f1a2b3c4d5e6f7g8h9i0j2",
  "user": "65f1a2b3c4d5e6f7g8h9i0j5"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Event tracked successfully"
}
```

---

### 2. Get Job Analytics
**GET** `/analytics/jobs/:jobId`

**Authentication Required** (Employer - job owner)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "job": "65f1a2b3c4d5e6f7g8h9i0j1",
    "totalViews": 234,
    "totalClicks": 45,
    "totalApplications": 15,
    "totalSaves": 23,
    "totalShares": 8,
    "conversionRate": 6.4,
    "daily": [
      {
        "date": "2025-01-04",
        "views": 45,
        "clicks": 12,
        "applications": 3
      }
    ]
  }
}
```

---

## 🏢 Company Endpoints

### 1. Create Company Profile
**POST** `/companies`

**Authentication Required** (Employer role)

**Request Body:**
```json
{
  "name": "Tech Company",
  "description": "We are a leading tech company...",
  "industry": "Technology",
  "size": "51-200",
  "location": "San Francisco, CA",
  "website": "https://techcompany.com",
  "logo": "/uploads/logos/tech-company.png",
  "benefits": [
    "Health insurance",
    "401k matching"
  ]
}
```

---

### 2. Get Company by Slug
**GET** `/companies/:slug`

**Public Endpoint**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "name": "Tech Company",
    "slug": "tech-company",
    "description": "We are a leading tech company...",
    "industry": "Technology",
    "size": "51-200",
    "location": "San Francisco, CA",
    "website": "https://techcompany.com",
    "logo": "/uploads/logos/tech-company.png",
    "stats": {
      "totalJobs": 5,
      "activeJobs": 3,
      "totalApplications": 45,
      "views": 1234
    },
    "subscription": {
      "plan": "premium",
      "jobPostCredits": 47
    }
  }
}
```

---

## 🔔 Job Alerts Endpoints

### 1. Create Job Alert
**POST** `/alerts`

**Authentication Required** (Job Seeker role)

**Request Body:**
```json
{
  "title": "JavaScript Developer Jobs",
  "keywords": ["JavaScript", "React", "Node.js"],
  "location": "San Francisco",
  "radius": 50,
  "type": "Full time",
  "salaryMin": 100000,
  "frequency": "daily",  // "instant", "daily", "weekly"
  "isActive": true
}
```

---

## 🔒 Security Features

### Rate Limit Headers
All responses include:
```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1735980123
```

### Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error: email is required"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized, token required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Employer role required."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error: [error details]"
}
```

---

## 🔑 Authentication

**Token Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload:**
```json
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "role": "jobseeker",
  "iat": 1735980123,
  "exp": 1736584923
}
```

**Token Expiry:** 7 days

---

## 📝 Notes

1. All timestamps are in ISO 8601 format
2. All IDs are MongoDB ObjectIDs
3. File uploads use multipart/form-data
4. Maximum file size: 5MB
5. Allowed file types: PDF, DOC, DOCX (resumes)
6. All endpoints support CORS
7. HTTPS required in production

---

**API Version:** 1.0.0  
**Last Updated:** January 4, 2026  
**Status:** Production Ready ✅
