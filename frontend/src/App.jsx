import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Common pages (public)
import { Home, About, Contact } from './pages/common'

// Auth pages
import { Login, Register } from './pages/auth'
import EmailLogin from './pages/auth/Login/EmailLogin/EmailLogin.jsx'
import AdminLogin from './pages/auth/AdminLogin/AdminLogin.jsx'

// Candidate pages (formerly job-seeker)
import { 
  Dashboard as CandidateDashboard, 
  BrowseJobs as Jobs, 
  JobDetails as Job,
  Profile as CandidateProfile, 
  JobAnalyzer 
} from './pages/job-seeker'

// Recruitment pages (formerly employer)
import { 
  PostJob, 
  Dashboard as RecruitmentDashboard,
  ManageJobs,
  ViewApplications,
  Profile as StaffProfile
} from './pages/employer'

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          {/* Public Routes - Careers Page */}
          <Route path="/" element={<Home />} />
          <Route path="/careers" element={<Jobs />} />
          <Route path="/careers/:id" element={<Job />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/email" element={<EmailLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/job/:id" element={<Job />} />
          
          {/* Candidate Routes */}
          <Route path="/candidate/dashboard" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/candidate/profile" element={<ProtectedRoute><CandidateProfile /></ProtectedRoute>} />
          <Route path="/candidate/applications" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/analyzer" element={<ProtectedRoute><JobAnalyzer /></ProtectedRoute>} />
          
          {/* Legacy routes - redirect to new structure */}
          <Route path="/dashboard" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><CandidateProfile /></ProtectedRoute>} />
          <Route path="/job-seeker/dashboard" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/job-seeker/browse-jobs" element={<Jobs />} />
          
          {/* Recruitment/Staff Routes */}
          <Route path="/recruit/dashboard" element={<ProtectedRoute requiredRoles={['recruiter', 'hiring_manager', 'hr', 'admin']}><RecruitmentDashboard /></ProtectedRoute>} />
          <Route path="/recruit/post-job" element={<ProtectedRoute requiredRoles={['recruiter', 'hiring_manager', 'hr', 'admin']}><PostJob /></ProtectedRoute>} />
          <Route path="/recruit/jobs" element={<ProtectedRoute requiredRoles={['recruiter', 'hiring_manager', 'hr', 'admin']}><ManageJobs /></ProtectedRoute>} />
          <Route path="/recruit/jobs/:id" element={<ProtectedRoute requiredRoles={['recruiter', 'hiring_manager', 'hr', 'admin']}><ManageJobs /></ProtectedRoute>} />
          <Route path="/recruit/applications" element={<ProtectedRoute requiredRoles={['recruiter', 'hiring_manager', 'hr', 'admin']}><ViewApplications /></ProtectedRoute>} />
          <Route path="/recruit/profile" element={<ProtectedRoute requiredRoles={['recruiter', 'hiring_manager', 'hr', 'admin']}><StaffProfile /></ProtectedRoute>} />
          
          {/* Legacy employer routes - redirect to recruitment */}
          <Route path="/employer/dashboard" element={<ProtectedRoute requiredRoles={['recruiter', 'hiring_manager', 'hr', 'admin']}><RecruitmentDashboard /></ProtectedRoute>} />
          <Route path="/employer/post-job" element={<ProtectedRoute requiredRoles={['recruiter', 'hiring_manager', 'hr', 'admin']}><PostJob /></ProtectedRoute>} />
          <Route path="/employer/manage-jobs" element={<ProtectedRoute requiredRoles={['recruiter', 'hiring_manager', 'hr', 'admin']}><ManageJobs /></ProtectedRoute>} />
          <Route path="/employer/applications" element={<ProtectedRoute requiredRoles={['recruiter', 'hiring_manager', 'hr', 'admin']}><ViewApplications /></ProtectedRoute>} />
          <Route path="/employer/profile" element={<ProtectedRoute requiredRoles={['recruiter', 'hiring_manager', 'hr', 'admin']}><StaffProfile /></ProtectedRoute>} />
          <Route path="/jobs/post" element={<ProtectedRoute requiredRoles={['recruiter', 'hiring_manager', 'hr', 'admin']}><PostJob /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
