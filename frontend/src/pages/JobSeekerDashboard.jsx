import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import './JobSeekerDashboard.css';

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch applications
      const appsRes = await fetch('http://localhost:8080/api/applications/my-applications?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const appsData = await appsRes.json();

      if (appsData.success) {
        setApplications(appsData.data);
        
        // Calculate stats
        const statsCalc = {
          total: appsData.total,
          pending: 0,
          reviewing: 0,
          shortlisted: 0,
          rejected: 0
        };

        appsData.data.forEach(app => {
          if (statsCalc[app.status] !== undefined) {
            statsCalc[app.status]++;
          }
        });

        setStats(statsCalc);
      }

      // Fetch saved jobs
      const savedRes = await fetch('http://localhost:8080/api/saved-jobs?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const savedData = await savedRes.json();

      if (savedData.success) {
        setSavedJobs(savedData.data);
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
      accepted: '#2ecc71',
      withdrawn: '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      reviewing: '👀',
      shortlisted: '⭐',
      rejected: '❌',
      accepted: '✅',
      withdrawn: '🚫'
    };
    return icons[status] || '📄';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="jobseeker-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p className="dashboard-subtitle">Here's your job search overview</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Applications</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card reviewing">
          <div className="stat-icon">👀</div>
          <div className="stat-content">
            <h3>{stats.reviewing}</h3>
            <p>Under Review</p>
          </div>
        </div>
        <div className="stat-card shortlisted">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{stats.shortlisted}</h3>
            <p>Shortlisted</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Recent Applications */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📝 Recent Applications</h2>
            <Link to="/applications" className="view-all-link">
              View All →
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No applications yet</h3>
              <p>Start applying to jobs that match your skills!</p>
              <Link to="/jobs" className="btn-primary">
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="applications-list">
              {applications.map(app => (
                <div key={app._id} className="application-card">
                  <div className="application-header">
                    <div className="job-info">
                      <h3>{app.job?.title}</h3>
                      <p className="company-name">{app.job?.company}</p>
                      <p className="location">📍 {app.job?.location}</p>
                    </div>
                    <div 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      {getStatusIcon(app.status)} {app.status}
                    </div>
                  </div>
                  <div className="application-footer">
                    <span className="applied-date">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    <Link to={`/applications/${app._id}`} className="view-details">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Jobs */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>💾 Saved Jobs</h2>
            <Link to="/saved-jobs" className="view-all-link">
              View All →
            </Link>
          </div>

          {savedJobs.length === 0 ? (
            <div className="empty-state small">
              <p>No saved jobs yet</p>
              <Link to="/jobs" className="btn-secondary">
                Find Jobs
              </Link>
            </div>
          ) : (
            <div className="saved-jobs-list">
              {savedJobs.map(saved => (
                <div key={saved._id} className="saved-job-card">
                  <div className="job-details">
                    <h4>{saved.job?.title}</h4>
                    <p>{saved.job?.company}</p>
                    <span className="job-type">{saved.job?.type}</span>
                  </div>
                  <Link to={`/jobs/${saved.job?.slug || saved.job?._id}`} className="btn-view">
                    View Job
                  </Link>
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
          <Link to="/jobs" className="action-card">
            <span className="action-icon">🔍</span>
            <span className="action-text">Browse Jobs</span>
          </Link>
          <Link to="/profile" className="action-card">
            <span className="action-icon">👤</span>
            <span className="action-text">Update Profile</span>
          </Link>
          <Link to="/analyzer" className="action-card">
            <span className="action-icon">🎯</span>
            <span className="action-text">AI Resume Analyzer</span>
          </Link>
          <Link to="/alerts" className="action-card">
            <span className="action-icon">🔔</span>
            <span className="action-text">Job Alerts</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
