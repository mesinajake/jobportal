# 🚀 JobPortal - Full Stack MERN Application

> A modern AI-powered job portal connecting employers with job seekers, featuring resume analysis, multi-role authentication, and real-time job search.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/cloud/atlas)

![JobPortal Demo](./frontend/public/images/demo.png)

---

## ✨ Features

### For Job Seekers
- 🔍 **Advanced Job Search** - Filter by location, salary, job type, and more
- 📄 **Resume Upload & Parsing** - PDF/DOCX support with AI-powered text extraction
- 🤖 **AI Resume Analysis** - Get personalized job match scores and improvement suggestions
- 💾 **Save Jobs** - Bookmark interesting positions for later
- 🔔 **Job Alerts** - Get notified when matching jobs are posted
- 📊 **Application Tracking** - Monitor your application status

### For Employers
- 📝 **Job Posting** - Create and manage job listings
- 👥 **Applicant Management** - Review applications and resumes
- 🏢 **Company Profiles** - Showcase your company culture
- 📈 **Analytics Dashboard** - Track job posting performance

### Security & Authentication
- 🔐 **Multi-Role System** - Job seeker, employer, and admin roles
- 🛡️ **JWT Authentication** - Secure token-based auth
- 🔑 **Two-Factor Authentication** - Optional 2FA with QR codes
- 🚫 **Rate Limiting** - Protection against abuse
- 🧹 **Input Sanitization** - XSS and NoSQL injection prevention

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Library |
| React Router v6 | Navigation |
| Vite | Build Tool |
| CSS3 | Styling |
| Context API | State Management |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB Atlas | Database |
| Mongoose | ODM |
| JWT | Authentication |
| Multer | File Uploads |
| Helmet | Security Headers |

### AI & APIs
| Technology | Purpose |
|------------|---------|
| Ollama (TinyLlama) | Local AI for resume analysis |
| FindWork API | External job listings |
| Remotive API | Remote job listings |

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v16.0.0 or higher
- **npm** v8.0.0 or higher
- **MongoDB Atlas** account (free tier works)
- **Git** installed
- **Ollama** (optional, for AI features)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mesinajake/jobportal.git
cd jobportal
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
# Required
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/jobportal
JWT_SECRET=your_super_secure_random_string_minimum_32_characters
PORT=5000

# Optional - for AI features
OLLAMA_API_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=tinyllama
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the Application

**Development Mode (2 terminals):**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Visit:** `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|:--------:|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | ✅ |
| `PORT` | Server port | ❌ (default: 5000) |
| `NODE_ENV` | Environment (development/production) | ❌ |
| `JWT_EXPIRE` | Token expiration time | ❌ (default: 7d) |
| `FINDWORK_API_KEY` | FindWork.dev API key | ❌ |
| `OLLAMA_API_URL` | Ollama API endpoint | ❌ |
| `OLLAMA_MODEL` | AI model name | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ |

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|:--------:|
| `VITE_API_URL` | Backend API URL | ✅ |

> 📝 **See `.env.example` files for complete configuration**

---

## 📁 Project Structure

```
jobportal/
├── backend/                    # Express.js API
│   ├── config/                 # Database configuration
│   ├── controllers/            # Route handlers
│   ├── middleware/             # Auth, security, uploads
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API routes
│   ├── services/               # Business logic (AI, Jobs)
│   ├── utils/                  # Helper functions
│   ├── uploads/                # User uploads (gitignored)
│   ├── .env.example            # Environment template
│   └── server.js               # Entry point
│
├── frontend/                   # React application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── context/            # React Context
│   │   ├── pages/              # Page components
│   │   ├── services/           # API calls
│   │   └── App.jsx             # Root component
│   ├── .env.example            # Environment template
│   └── vite.config.js          # Vite configuration
│
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
├── LICENSE                     # MIT License
└── CONTRIBUTING.md             # Contribution guidelines
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| PUT | `/api/auth/reset-password/:token` | Reset password |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs (with filters) |
| GET | `/api/jobs/:id` | Get job by ID |
| POST | `/api/jobs` | Create job (Employer) |
| PUT | `/api/jobs/:id` | Update job (Employer) |
| DELETE | `/api/jobs/:id` | Delete job (Employer) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Apply to job |
| GET | `/api/applications/me` | Get my applications |
| GET | `/api/applications/job/:jobId` | Get job applications (Employer) |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze-resume` | Analyze resume with AI |
| POST | `/api/ai/match-score` | Get job match score |
| POST | `/api/ai/compare-candidates` | Compare candidates |

> 📚 **Full API documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 🚀 Deployment

### Backend (Heroku, Railway, Render)

1. Set environment variables in your hosting platform
2. Ensure `NODE_ENV=production`
3. Configure MongoDB Atlas IP whitelist

### Frontend (Vercel, Netlify)

1. Set `VITE_API_URL` to your production API URL
2. Build: `npm run build`
3. Deploy `dist/` folder

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Jake Mesina**
- GitHub: [@mesinajake](https://github.com/mesinajake)

---

## 🙏 Acknowledgments

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Database hosting
- [Ollama](https://ollama.ai) - Local AI models
- [FindWork API](https://findwork.dev) - Job listings API
- [React Documentation](https://reactjs.org/)
- [Express.js](https://expressjs.com/)

---

## 📧 Support

For questions or support, please open an issue on GitHub.

---

⭐ **If you found this project helpful, please give it a star!**
