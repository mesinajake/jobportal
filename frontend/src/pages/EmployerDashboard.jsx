import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './EmployerDashboard.css';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    credits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch company profile
      const companyRes = await fetch('http://localhost:8080/api/companies/my/company', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const companyData = await companyRes.json();

      if (companyData.success) {
        setCompany(companyData.data);
        
        // Fetch company jobs
        const jobsRes = await fetch(`http://localhost:8080/api/companies/${companyData.data._id}/jobs?limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const jobsData = await jobsRes.json();

        if (jobsData.success) {
          setJobs(jobsData.data);
        }

        // Fetch applications
        const appsRes = await fetch('http://localhost:8080/api/applications/received?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const appsData = await appsRes.json();

        if (appsData.success) {
          setApplications(appsData.data);
        }

        // Set stats
        setStats({
          totalJobs: companyData.data.stats.totalJobs,
          activeJobs: companyData.data.stats.activeJobs,
          totalApplications: companyData.data.stats.totalApplications,
          credits: companyData.data.subscription.jobPostCredits
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      reviewing: '#3498db',
      shortlisted: '#27ae60',
      rejected: '#e74c3c',
      accepted: '#2ecc71'
    };
    return colors[status] || '#95a5a6';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="no-company">
        <h2>No Company Profile Found</h2>
        <p>Please create a company profile to start posting jobs.</p>
        <button onClick={() => navigate('/company/setup')} className="btn-primary">
          Create Company Profile
        </button>
      </div>
    );
  }

  return (
    <div className="employer-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {company.name}! 🏢</h1>
          <p className="dashboard-subtitle">Manage your jobs and applications</p>
        </div>
        <Link to="/jobs/post" className="btn-post-job">
          ➕ Post New Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card jobs">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{stats.totalJobs}</h3>
            <p>Total Jobs Posted</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.activeJobs}</h3>
            <p>Active Jobs</p>
          </div>
        </div>
        <div className="stat-card applications">
          <div className="stat-icon">📬</div>
          <div className="stat-content">
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
          </div>
        </div>
        <div className="stat-card credits">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <h3>{stats.credits}</h3>
            <p>Job Post Credits</p>
          </div>
          {stats.credits === 0 && (
            <div className="credit-warning">⚠️ No credits left</div>
          )}
        </div>
      </div>

      {/* Credits Warning */}
      {stats.credits === 0 && (
        <div className="alert alert-warning">
          <strong>⚠️ No Job Post Credits Available</strong>
          <p>You've used all your free credits. Upgrade to post more jobs!</p>
          <Link to="/subscription/upgrade" className="btn-upgrade">
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Posted Jobs */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📋 Your Posted Jobs</h2>
            <Link to="/my-jobs" className="view-all-link">
              View All →
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No jobs posted yet</h3>
              <p>Start hiring by posting your first job!</p>
              <Link to="/jobs/post" className="btn-primary">
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="jobs-list">
              {jobs.map(job => (
                <div key={job._id} className="job-card">
                  <div className="job-header">
                    <div className="job-info">
                      <h3>{job.title}</h3>
                      <p className="job-meta">
                        📍 {job.location} • {job.type}
                      </p>
                    </div>
                    <div className={`status-badge ${job.status}`}>
                      {job.status}
                    </div>
                  </div>
                  <div className="job-stats">
                    <span className="stat-item">
                      👁️ {job.views} views
                    </span>
                    <span className="stat-item">
                      📬 {job.applications} applications
                    </span>
                    <span className="stat-item">
                      📅 {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="job-actions">
                    <Link to={`/jobs/${job.slug || job._id}`} className="btn-view">
                      View Job
                    </Link>
                    <Link to={`/jobs/${job._id}/edit`} className="btn-edit">
                      Edit
                    </Link>
                    <Link to={`/jobs/${job._id}/applications`} className="btn-applications">
                      View Applications ({job.applications})
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📨 Recent Applications</h2>
            <Link to="/applications/received" className="view-all-link">
              View All →
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state small">
              <p>No applications yet</p>
              <p className="small-text">Applications will appear here once candidates apply</p>
            </div>
          ) : (
            <div className="applications-list">
              {applications.map(app => (
                <div key={app._id} className="application-card">
                  <div className="applicant-info">
                    <div className="applicant-avatar">
                      {app.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="applicant-details">
                      <h4>{app.user?.name}</h4>
                      <p className="job-title">{app.job?.title}</p>
                      <p className="applied-time">
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="application-actions">
                    <div 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(app.status) }}
                      title={app.status}
                    ></div>
                    <Link to={`/applications/${app._id}`} className="btn-review">
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>⚡ Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/jobs/post" className="action-card primary">
            <span className="action-icon">➕</span>
            <span className="action-text">Post New Job</span>
          </Link>
          <Link to="/applications/received" className="action-card">
            <span className="action-icon">📬</span>
            <span className="action-text">View Applications</span>
          </Link>
          <Link to="/company/profile" className="action-card">
            <span className="action-icon">🏢</span>
            <span className="action-text">Company Profile</span>
          </Link>
          <Link to="/analytics" className="action-card">
            <span className="action-icon">📊</span>
            <span className="action-text">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
