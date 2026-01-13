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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  
  const { saved, toggle } = useSavedJobs();
  const { loggedIn } = useAuth();

  // Fetch departments on mount
  useEffect(() => {
    let mounted = true;

    const fetchDepartments = async () => {
      try {
        const res = await apiClient.get('/departments');
        if (mounted && res.success) setDepartments(res.data || []);
      } catch (e) {
        if (!mounted) return;
        console.error('Failed to fetch departments:', e);
      }
    };

    fetchDepartments();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch jobs when filters or page change
  useEffect(() => {
    let mounted = true;

    const fetchJobs = async () => {
      if (mounted) {
        setLoading(true);
        setError('');
      }

      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('search', q.trim());
        if (department) params.set('department', department);
        if (employmentType) params.set('employmentType', employmentType);
        if (workArrangement) params.set('workArrangement', workArrangement);
        params.set('status', 'open');
        params.set('page', currentPage.toString());
        params.set('limit', '10');
        
        const res = await apiClient.get(`/jobs?${params.toString()}`);
        
        if (!mounted) return; // Component unmounted
        
        if (res.success) {
          setJobs(res.data || []);
          setTotalPages(res.pages || 1);
          setTotalJobs(res.total || 0);
          
          // Scroll to top smoothly when page changes
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setError('Failed to load jobs');
        }
      } catch (e) {
        if (!mounted) return;
        console.error('Failed to fetch jobs:', e);
        setError('Unable to load jobs. Please try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchJobs();

    return () => {
      mounted = false;
    };
  }, [q, department, employmentType, workArrangement, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
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
    setCurrentPage(1);
    navigate(`/careers${qs.toString() ? `?${qs.toString()}` : ''}`);
  };

  const clearFilters = () => {
    setQ('');
    setDepartment('');
    setEmploymentType('');
    setWorkArrangement('');
    setCurrentPage(1);
    navigate('/careers');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
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
        </form>
      </div>

      {error && <div className="error-banner"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
      {loading && <div className="loading-banner"><i className="fa-solid fa-spinner fa-spin"></i> Loading positions...</div>}

      {!loading && jobs.length > 0 && (
        <div className="results-info">
          <p className="results-count">
            Showing <strong>{((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalJobs)}</strong> of <strong>{totalJobs}</strong> position{totalJobs !== 1 ? 's' : ''}
          </p>
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
              <Link to={`/careers/${job._id}`} className="btn">View Details</Link>
              <button 
                className={`btn-save ${loggedIn && saved.includes(job._id) ? 'saved' : ''}`}
                onClick={() => onSave(job._id)}
                aria-label={saved.includes(job._id) ? 'Unsave job' : 'Save job'}
                title={loggedIn ? (saved.includes(job._id) ? 'Remove from saved' : 'Save for later') : 'Login to save jobs'}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24"
                  style={{
                    width: '20px',
                    height: '20px',
                    fill: loggedIn && saved.includes(job._id) ? '#2c3e50' : 'none',
                    stroke: '#2c3e50',
                    strokeWidth: '2px',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    display: 'block'
                  }}
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>{loggedIn && saved.includes(job._id) ? 'Saved' : 'Save'}</span>
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

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <i className="fa-solid fa-chevron-left"></i>
            <span>Previous</span>
          </button>

          <div className="pagination-numbers">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
              ) : (
                <button
                  key={page}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <span>Next</span>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
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
