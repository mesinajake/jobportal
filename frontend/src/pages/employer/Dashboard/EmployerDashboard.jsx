import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './EmployerDashboard.css';

/**
 * EmployerDashboard Component
 * Main dashboard for employers to manage their job postings and applications
 */
const EmployerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    pendingReview: 0,
    scheduledInterviews: 0,
    jobViews: 0,
    // Pipeline stats
    newApplicants: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    offered: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch company data
      const companyData = localStorage.getItem('company');
      if (companyData) {
        setCompany(JSON.parse(companyData));
      }
      
      // Fetch jobs
      const jobsResponse = await fetch('http://localhost:8080/api/jobs/my/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        const jobs = jobsData.data || [];
        
        setRecentJobs(jobs.slice(0, 5));
        
        // Calculate total views
        const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);
        
        setStats(prev => ({
          ...prev,
          activeJobs: jobs.filter(j => j.status === 'active').length,
          pendingReview: jobs.filter(j => j.status === 'pending').length,
          jobViews: totalViews
        }));
      }

      // Fetch applications
      const appsResponse = await fetch('http://localhost:8080/api/applications/employer', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        const applications = appsData.data || [];
        
        setRecentApplications(applications.slice(0, 5));
        
        // Calculate pipeline stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const newToday = applications.filter(app => {
          const appDate = new Date(app.createdAt);
          appDate.setHours(0, 0, 0, 0);
          return appDate.getTime() === today.getTime();
        }).length;
        
        setStats(prev => ({
          ...prev,
          totalApplications: applications.length,
          newApplications: newToday,
          newApplicants: applications.filter(a => a.status === 'pending' || a.status === 'new').length,
          reviewing: applications.filter(a => a.status === 'reviewing').length,
          shortlisted: applications.filter(a => a.status === 'shortlisted').length,
          interview: applications.filter(a => a.status === 'interview').length,
          offered: applications.filter(a => a.status === 'offered').length
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="employer-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {company?.name || user?.name || 'Employer'}</h1>
          <p>Here's what's happening with your hiring today</p>
        </div>
        <Link to="/employer/post-job" className="btn-primary">
          ➕ Post Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.activeJobs}</h3>
            <p>Active Jobs</p>
          </div>
        </div>
        
        <div className="stat-card highlight">
          <div className="stat-icon">📨</div>
          <div className="stat-info">
            <h3>{stats.newApplications}</h3>
            <p>New Today</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/employer/manage-jobs" className="action-card">
          <span className="action-icon">📝</span>
          <span>Manage Jobs</span>
        </Link>
        <Link to="/employer/applications" className="action-card">
          <span className="action-icon">📥</span>
          <span>Applications</span>
          {stats.newApplicants > 0 && <span className="badge">{stats.newApplicants}</span>}
        </Link>
        <Link to="/employer/profile" className="action-card">
          <span className="action-icon">🏢</span>
          <span>Company Profile</span>
        </Link>
      </div>

      {/* Active Jobs */}
      <section className="content-section">
        <div className="section-header">
          <h2>Recent Jobs</h2>
          <Link to="/employer/manage-jobs" className="view-all-link">View All →</Link>
        </div>
        <div className="jobs-list">
          {recentJobs.length > 0 ? (
            <div className="jobs-cards">
              {recentJobs.map(job => (
                <div key={job._id} className="job-card">
                  <div className="job-card-header">
                    <div>
                      <h3>{job.title}</h3>
                      <p className="job-location">📍 {job.location}</p>
                    </div>
                    <span className={`status-badge ${job.status}`}>{job.status}</span>
                  </div>
                  <div className="job-card-stats">
                    <div className="stat-item">
                      <span className="stat-label">Applications</span>
                      <span className="stat-value">{job.applicationsCount || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Views</span>
                      <span className="stat-value">{job.views || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Posted</span>
                      <span className="stat-value">{formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                  <div className="job-card-actions">
                    <Link to={`/employer/jobs/${job._id}/edit`} className="btn-secondary">Edit</Link>
                    <Link to={`/job/${job.slug || job._id}`} className="btn-secondary">View</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <p>No active jobs yet</p>
              <Link to="/employer/post-job" className="btn-primary">Post Your First Job</Link>
            </div>
          )}
        </div>
      </section>

      {/* Recent Applications */}
      <section className="content-section">
        <div className="section-header">
          <h2>Recent Applications</h2>
          <Link to="/employer/applications" className="view-all-link">View All →</Link>
        </div>
        <div className="applications-list">
          {recentApplications.length > 0 ? (
            recentApplications.map(app => (
              <Link key={app._id} to={`/employer/applications/${app._id}`} className="application-card">
                <div className="applicant-avatar">
                  {app.applicant?.name?.charAt(0) || 'A'}
                </div>
                <div className="applicant-info">
                  <h4>{app.applicant?.name || 'Unknown Applicant'}</h4>
                  <p>{app.job?.title || 'Job Position'}</p>
                  <span className="apply-date">{formatDate(app.createdAt)}</span>
                </div>
                <span className={`status-badge ${app.status}`}>{app.status}</span>
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">👥</span>
              <p>No applications yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Verification Banner */}
      {company && !company.isVerified && (
        <div className="info-banner">
          <span className="banner-icon">🔒</span>
          <div className="banner-content">
            <strong>Verify Your Company</strong>
            <p>Get a verified badge to build trust with candidates</p>
          </div>
          <Link to="/employer/profile" className="btn-secondary">Verify Now</Link>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
