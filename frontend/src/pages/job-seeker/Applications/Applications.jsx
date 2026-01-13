import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Applications.css';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // TODO: Fetch user's applications
    setLoading(false);
  }, []);

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'reviewed': return 'reviewed';
      case 'shortlisted': return 'shortlisted';
      case 'rejected': return 'rejected';
      case 'hired': return 'hired';
      default: return '';
    }
  };

  return (
    <div className="applications-page">
      <div className="page-header">
        <h1>My Applications</h1>
        <div className="filter-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{applications.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item pending">
          <span className="stat-number">{applications.filter(a => a.status === 'pending').length}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item reviewed">
          <span className="stat-number">{applications.filter(a => a.status === 'reviewed').length}</span>
          <span className="stat-label">Reviewed</span>
        </div>
        <div className="stat-item shortlisted">
          <span className="stat-number">{applications.filter(a => a.status === 'shortlisted').length}</span>
          <span className="stat-label">Shortlisted</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading applications...</div>
      ) : (
        <div className="applications-list">
          {filteredApplications.length === 0 ? (
            <div className="no-applications">
              <h3>No applications found</h3>
              <p>Start applying to jobs to see them here</p>
              <Link to="/job-seeker/search" className="btn-search">Browse Jobs</Link>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <div key={app._id} className="application-card">
                <div className="app-main">
                  <div className="company-logo">
                    {app.job?.company?.logo ? (
                      <img src={app.job.company.logo} alt="" />
                    ) : (
                      <div className="logo-placeholder">
                        {app.job?.company?.name?.[0] || 'C'}
                      </div>
                    )}
                  </div>
                  <div className="app-info">
                    <h3>{app.job?.title}</h3>
                    <p className="company">{app.job?.company?.name}</p>
                    <p className="location">{app.job?.location}</p>
                  </div>
                </div>
                
                <div className="app-status">
                  <span className={`status-badge ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  <span className="applied-date">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="app-actions">
                  <Link to={`/jobs/${app.job?._id}`} className="btn-view">
                    View Job
                  </Link>
                  <button className="btn-withdraw">Withdraw</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Applications;
