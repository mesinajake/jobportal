import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCompanyInfo } from '../../../hooks/useCompanyInfo';
import { apiClient } from '../../../services/api.js';
import useSavedJobs from '../../../hooks/useSavedJobs.js';
import './JobDetails.css';

/**
 * JobDetails - Individual job details page
 * Shows full job information and application options
 */
export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedIn, user } = useAuth();
  const { saved, toggle } = useSavedJobs();
  const { companyInfo } = useCompanyInfo();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyStatus, setApplyStatus] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await apiClient.get(`/jobs/${id}`);
        if (res.success) {
          setJob(res.data);
        } else {
          setError('Job not found');
        }
      } catch (e) {
        console.error('Failed to fetch job:', e);
        setError('Unable to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <section className="job-details loading-state">
        <div className="loading-spinner">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading job details...</p>
        </div>
      </section>
    );
  }

  if (error || !job) {
    return (
      <section className="job-details not-found">
        <i className="fa-solid fa-briefcase"></i>
        <h1>Job Not Found</h1>
        <p>{error || "We couldn't find the job you're looking for."}</p>
        <Link to="/careers" className="btn">Browse Positions</Link>
      </section>
    );
  }

  const handleApply = async (e) => {
    e.preventDefault();
    if (!loggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }
    
    setApplying(true);
    try {
      const res = await apiClient.post(`/applications`, {
        jobId: job._id
      });
      if (res.success) {
        setApplyStatus('Application submitted successfully! We will review your profile and get back to you.');
      } else {
        setApplyStatus(res.message || 'Failed to submit application');
      }
    } catch (e) {
      setApplyStatus(e.response?.data?.message || 'Unable to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const onSave = () => {
    if (!loggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }
    toggle(job._id);
  };

  return (
    <div className="job-details-page">
      <div className="job-details-card">
        <div className="job-header">
          <div className="company-info">
            {companyInfo?.logo && (
              <img src={companyInfo.logo} alt={companyInfo.name} className="company-logo" />
            )}
            <div>
              <h1>{job.title}</h1>
              <p className="company-name">{companyInfo?.name || 'Company'}</p>
              <p className="location">
                <i className="fa-solid fa-location-dot"></i> {job.location || 'Location TBD'}
              </p>
            </div>
          </div>
          <div className="job-meta">
            {job.department && (
              <span 
                className="tag department"
                style={{ backgroundColor: job.department.color || '#4A90A4' }}
              >
                {job.department.name}
              </span>
            )}
            {job.employmentType && (
              <span className="tag">{formatEmploymentType(job.employmentType)}</span>
            )}
            {job.workArrangement && (
              <span className="tag">{formatWorkArrangement(job.workArrangement)}</span>
            )}
          </div>
        </div>

        {job.salaryRange?.min && (
          <div className="salary-section">
            <h3>Compensation</h3>
            <p className="salary-range">
              <i className="fa-solid fa-peso-sign"></i> {formatSalary(job.salaryRange)}
              {job.salaryRange.currency && job.salaryRange.currency !== 'PHP' && ` ${job.salaryRange.currency}`}
            </p>
          </div>
        )}

        {job.requirements?.length > 0 && (
          <div className="job-section">
            <h2>Requirements</h2>
            <ul>
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {job.skills?.length > 0 && (
          <div className="job-section">
            <h2>Skills</h2>
            <div className="skills-list">
              {job.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        <div className="job-section">
          <h2>Job Description</h2>
          <div className="description-content">
            {job.description?.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {job.responsibilities?.length > 0 && (
          <div className="job-section">
            <h2>Responsibilities</h2>
            <ul>
              {job.responsibilities.map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>
          </div>
        )}

        {job.benefits?.length > 0 && (
          <div className="job-section">
            <h2>Benefits</h2>
            <ul className="benefits-list">
              {job.benefits.map((benefit, index) => (
                <li key={index}><i className="fa-solid fa-check"></i> {benefit}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="job-section">
          <p className="posted-info">
            Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
          </p>
        </div>

        {applyStatus && (
          <div className={`status-message ${applyStatus.includes('success') ? 'success' : 'error'}`}>
            {applyStatus}
          </div>
        )}

        <div className="job-actions">
          <button 
            onClick={handleApply} 
            className="btn btn-primary"
            disabled={applying || applyStatus.includes('success')}
          >
            {applying ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</>
            ) : applyStatus.includes('success') ? (
              <><i className="fa-solid fa-check"></i> Applied</>
            ) : (
              <><i className="fa-solid fa-paper-plane"></i> Apply Now</>
            )}
          </button>
          <button onClick={onSave} className="btn btn-secondary">
            {saved.includes(job._id) ? '♥ Saved' : '♡ Save Job'}
          </button>
        </div>
      </div>

      <div className="back-link">
        <Link to="/careers">
          <i className="fa-solid fa-arrow-left"></i> Back to Positions
        </Link>
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
