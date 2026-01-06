import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './Jobs.css';

/**
 * ManageJobs Component
 * Clean, modern job management interface for employers
 */
const Jobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/jobs/my/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || []);
      } else {
        showMessage('Failed to fetch jobs', 'error');
      }
    } catch (err) {
      showMessage('Failed to load jobs. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Delete "${jobTitle}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setJobs(jobs.filter(job => job._id !== jobId));
        showMessage('Job deleted successfully', 'success');
      } else {
        showMessage('Failed to delete job', 'error');
      }
    } catch (err) {
      showMessage('Failed to delete job', 'error');
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setJobs(jobs.map(job => 
          job._id === jobId ? { ...job, status: newStatus } : job
        ));
        showMessage(`Job status updated to ${newStatus}`, 'success');
      } else {
        showMessage('Failed to update job status', 'error');
      }
    } catch (err) {
      showMessage('Failed to update job status', 'error');
    }
  };

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(job => job.status === filter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.category?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'applications':
          return (b.applicationsCount || 0) - (a.applicationsCount || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [jobs, filter, searchQuery, sortBy]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusCounts = () => {
    return {
      all: jobs.length,
      active: jobs.filter(j => j.status === 'active').length,
      pending: jobs.filter(j => j.status === 'pending').length,
      draft: jobs.filter(j => j.status === 'draft').length,
      closed: jobs.filter(j => j.status === 'closed').length
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="manage-jobs">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-jobs">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Manage Jobs</h1>
          <p>View and manage all your job postings</p>
          <p>{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} total</p>
        </div>
        <Link to="/employer/post-job" className="btn-primary">
          ➕ Post Job
        </Link>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`message-alert ${messageType}`}>
          {message}
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="controls-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title, location, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-sort">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">By Title</option>
            <option value="applications">Most Applications</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'active', 'pending', 'draft', 'closed'].map(status => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="tab-count">{statusCounts[status]}</span>
          </button>
        ))}
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length > 0 ? (
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <div key={job._id} className="job-card">
              <div className="job-card-header">
                <div className="job-meta">
                  <span className={`status-badge ${job.status}`}>{job.status}</span>
                  <span className="job-date">Posted {formatDate(job.createdAt)}</span>
                </div>
              </div>

              <div className="job-card-body">
                <h3 className="job-title">{job.title}</h3>
                <p className="job-location">📍 {job.location}</p>
                
                <div className="job-stats">
                  <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <span className="stat-text">{job.salary || 'Competitive'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏰</span>
                    <span className="stat-text">{job.type || 'Full-time'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <span className="stat-text">{job.applicationsCount || 0} applicants</span>
                  </div>
                </div>
              </div>

              <div className="job-card-actions">
                <Link to={`/job/${job.slug || job._id}`} className="btn-view">
                  View
                </Link>
                <Link to={`/employer/jobs/${job._id}/edit`} className="btn-edit">
                  Edit
                </Link>
                <select
                  className="status-dropdown"
                  value={job.status}
                  onChange={(e) => handleStatusChange(job._id, e.target.value)}
                  title="Change status"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteJob(job._id, job.title)}
                  title="Delete job"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>
            {searchQuery ? 'No jobs match your search' : 
             filter !== 'all' ? `No ${filter} jobs` : 
             'No jobs posted yet'}
          </h3>
          <p>
            {searchQuery ? 'Try a different search term' :
             filter !== 'all' ? `You don't have any ${filter} job postings` :
             'Start attracting talent by posting your first job'}
          </p>
          {!searchQuery && (
            <Link to="/employer/post-job" className="btn-primary">
              Post Your First Job
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Jobs;
