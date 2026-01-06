import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import useSavedJobs from '../../../hooks/useSavedJobs.js';
import { apiClient } from '../../../services/api.js';
import './BrowseJobs.css';

/**
 * BrowseJobs - Job listing page for candidates
 * Displays filterable list of available jobs from the company
 */
export default function BrowseJobs() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialQ = params.get('q') || '';
  const initialDept = params.get('department') || '';
  const initialType = params.get('type') || '';
  const initialArrangement = params.get('arrangement') || '';

  const [q, setQ] = useState(initialQ);
  const [department, setDepartment] = useState(initialDept);
  const [employmentType, setEmploymentType] = useState(initialType);
  const [workArrangement, setWorkArrangement] = useState(initialArrangement);
  const [departments, setDepartments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { saved, toggle } = useSavedJobs();
  const { loggedIn } = useAuth();

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await apiClient.get('/departments');
        if (res.success) setDepartments(res.data || []);
      } catch (e) {
        console.error('Failed to fetch departments:', e);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch jobs when filters change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('search', q.trim());
        if (department) params.set('department', department);
        if (employmentType) params.set('employmentType', employmentType);
        if (workArrangement) params.set('workArrangement', workArrangement);
        params.set('status', 'open');
        
        const res = await apiClient.get(`/jobs?${params.toString()}`);
        if (res.success) {
          setJobs(res.data || []);
        } else {
          setError('Failed to load jobs');
        }
      } catch (e) {
        console.error('Failed to fetch jobs:', e);
        setError('Unable to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [q, department, employmentType, workArrangement]);

  const onSave = (jobId) => {
    if (!loggedIn) {
      navigate('/login', { replace: false, state: { from: location } });
      return;
    }
    toggle(jobId);
  };

  const onFilterSubmit = (e) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (q.trim()) qs.set('q', q.trim());
    if (department) qs.set('department', department);
    if (employmentType) qs.set('type', employmentType);
    if (workArrangement) qs.set('arrangement', workArrangement);
    navigate(`/careers${qs.toString() ? `?${qs.toString()}` : ''}`);
  };

  const clearFilters = () => {
    setQ('');
    setDepartment('');
    setEmploymentType('');
    setWorkArrangement('');
    navigate('/careers');
  };

  return (
    <div className="browse-jobs">
      <div className="browse-header">
        <h1>Open Positions</h1>
        <p>Find your next career opportunity with us</p>
      </div>

      <div className="filter-section">
        <form onSubmit={onFilterSubmit} className="filter-form">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Job title, skills, keywords..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Employment Type</label>
            <select value={employmentType} onChange={e => setEmploymentType(e.target.value)}>
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Work Arrangement</label>
            <select value={workArrangement} onChange={e => setWorkArrangement(e.target.value)}>
              <option value="">All Arrangements</option>
              <option value="onsite">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="filter-buttons">
            <button type="submit" className="btn-search">
              <i className="fa-solid fa-search"></i> Search
            </button>
            <button type="button" className="btn-clear" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-banner"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
      {loading && <div className="loading-banner"><i className="fa-solid fa-spinner fa-spin"></i> Loading positions...</div>}

      {!loading && jobs.length > 0 && (
        <div className="results-info">
          <p className="results-count">Showing <strong>{jobs.length}</strong> position{jobs.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      <div className="jobs-grid">
        {jobs.map(job => (
          <div className="job-card" key={job._id}>
            <div className="job-header">
              <span 
                className="department-badge"
                style={{ backgroundColor: job.department?.color || '#4A90A4' }}
              >
                {job.department?.name || 'General'}
              </span>
              {job.employmentType && (
                <span className="type-badge">{formatEmploymentType(job.employmentType)}</span>
              )}
            </div>
            <h2 className="job-title">{job.title}</h2>
            <p className="job-location">
              <i className="fa-solid fa-location-dot"></i> {job.location || 'Location TBD'}
            </p>
            {job.workArrangement && (
              <p className="job-arrangement">
                <i className="fa-solid fa-briefcase"></i> {formatWorkArrangement(job.workArrangement)}
              </p>
            )}
            {job.salaryRange?.min && (
              <p className="job-salary">
                <i className="fa-solid fa-peso-sign"></i> 
                {formatSalary(job.salaryRange)}
              </p>
            )}
            <div className="job-actions">
              <Link to={`/careers/${job._id}`} className="btn-view">View Details</Link>
              <button className="btn-save" onClick={() => onSave(job._id)}>
                {saved.includes(job._id) ? '♥ Saved' : '♡ Save'}
              </button>
            </div>
          </div>
        ))}
        {jobs.length === 0 && !loading && (
          <div className="no-results">
            <i className="fa-solid fa-briefcase"></i>
            <h3>No positions found</h3>
            <p>Try different filters or check back later for new opportunities</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function formatEmploymentType(type) {
  const types = {
    'full-time': 'Full Time',
    'part-time': 'Part Time',
    'contract': 'Contract',
    'internship': 'Internship',
    'temporary': 'Temporary'
  };
  return types[type] || type;
}

function formatWorkArrangement(arrangement) {
  const arrangements = {
    'onsite': 'On-site',
    'remote': 'Remote',
    'hybrid': 'Hybrid'
  };
  return arrangements[arrangement] || arrangement;
}

function formatSalary(range) {
  const format = (n) => n.toLocaleString();
  if (range.min && range.max) {
    return `${format(range.min)} - ${format(range.max)}`;
  }
  return range.min ? `From ${format(range.min)}` : '';
}
