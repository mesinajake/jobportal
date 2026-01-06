import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './ViewApplications.css';

/**
 * ViewApplications Component
 * Employer's page to view and manage all job applications
 */
const ViewApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/applications/employer', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setApplications(applications.map(app =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredApplications = applications.filter(app => {
    if (filter !== 'all' && app.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        app.applicant?.name?.toLowerCase().includes(query) ||
        app.job?.title?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="view-applications">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-applications">
      <div className="page-header">
        <h1>Applications</h1>
        <p>Review and manage job applications</p>
      </div>

      <div className="filters-bar">
        <div className="filter-tabs">
          {['all', 'pending', 'reviewing', 'shortlisted', 'rejected'].map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredApplications.length > 0 ? (
        <div className="applications-grid">
          {filteredApplications.map(app => (
            <div key={app._id} className="application-card">
              <div className="applicant-header">
                <div className="applicant-avatar">
                  {app.applicant?.name?.charAt(0) || 'A'}
                </div>
                <div className="applicant-info">
                  <h3>{app.applicant?.name || 'Unknown'}</h3>
                  <p>{app.applicant?.email}</p>
                </div>
                <span className={`status-badge ${app.status}`}>{app.status}</span>
              </div>

              <div className="job-applied">
                <span className="label">Applied for:</span>
                <Link to={`/employer/jobs/${app.job?._id}`}>{app.job?.title}</Link>
              </div>

              <div className="application-meta">
                <span><i className="fas fa-calendar"></i> {formatDate(app.createdAt)}</span>
                {app.applicant?.phone && (
                  <span><i className="fas fa-phone"></i> {app.applicant.phone}</span>
                )}
              </div>

              <div className="application-actions">
                {app.resume && (
                  <a href={app.resume} target="_blank" rel="noopener noreferrer" className="btn-action">
                    <i className="fas fa-file-pdf"></i> Resume
                  </a>
                )}
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app._id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <i className="fas fa-inbox"></i>
          <h3>No applications found</h3>
          <p>Applications will appear here when candidates apply to your jobs.</p>
        </div>
      )}
    </div>
  );
};

export default ViewApplications;
