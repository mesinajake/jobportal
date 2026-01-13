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
      <div className="back-link-top">
        <Link to="/careers">
          <i className="fa-solid fa-arrow-left"></i> Back to Positions
        </Link>
      </div>

      <div className="job-details-card">
        {/* Header Section with Company Info */}
        <div className="job-header-section">
          <div className="header-top">
            <div className="header-job-content">
              <h1 className="job-title-main">{job.title}</h1>
              <p className="company-name-link">{companyInfo?.name || 'Company'}</p>
            </div>
          </div>

          <div className="job-meta-tags">
            {job.department && (
              <span 
                className="meta-tag department-tag"
                style={{ backgroundColor: job.department.color || '#4A90A4', color: '#fff' }}
              >
                <i className="fa-solid fa-building"></i>
                {job.department.name}
              </span>
            )}
            {job.employmentType && (
              <span className="meta-tag">
                <i className="fa-solid fa-clock"></i>
                {formatEmploymentType(job.employmentType)}
              </span>
            )}
            {job.workArrangement && (
              <span className="meta-tag">
                <i className="fa-solid fa-laptop-house"></i>
                {formatWorkArrangement(job.workArrangement)}
              </span>
            )}
            <span className="meta-tag">
              <i className="fa-solid fa-location-dot"></i>
              {job.location || 'Location TBD'}
            </span>
          </div>

          {job.salaryRange?.min && (
            <div className="salary-badge">
              <i className="fa-solid fa-peso-sign"></i>
              <span className="salary-amount">{formatSalary(job.salaryRange)}</span>
              {job.salaryRange.currency && job.salaryRange.currency !== 'PHP' && (
                <span className="salary-currency">{job.salaryRange.currency}</span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="job-actions-top">
          <button 
            onClick={handleApply} 
            className="btn-apply"
            disabled={applying || applyStatus.includes('success')}
          >
            {applying ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</>
            ) : applyStatus.includes('success') ? (
              <><i className="fa-solid fa-check-circle"></i> Application Submitted</>
            ) : (
              <><i className="fa-solid fa-paper-plane"></i> Apply for this Position</>
            )}
          </button>
          <button onClick={onSave} className="btn-save-detail" title={saved.includes(job._id) ? 'Remove from saved' : 'Save for later'}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill={saved.includes(job._id) ? '#2c3e50' : 'none'}
              stroke="#2c3e50"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{saved.includes(job._id) ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {applyStatus && (
          <div className={`status-banner ${applyStatus.includes('success') ? 'success' : 'error'}`}>
            <i className={`fa-solid fa-${applyStatus.includes('success') ? 'check-circle' : 'exclamation-circle'}`}></i>
            {applyStatus}
          </div>
        )}

        {/* Job Content Grid */}
        <div className="job-content-grid">
          {/* Description Section */}
          <div className="content-section description-section">
            <h2 className="section-title">
              <i className="fa-solid fa-file-lines"></i>
              Job Description
            </h2>
            <div className="section-content">
              {job.description?.split('\n').map((paragraph, index) => (
                paragraph.trim() && <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Responsibilities */}
          {job.responsibilities?.length > 0 && (
            <div className="content-section">
              <h2 className="section-title">
                <i className="fa-solid fa-list-check"></i>
                Key Responsibilities
              </h2>
              <ul className="content-list">
                {job.responsibilities.map((resp, index) => (
                  <li key={index}>
                    <i className="fa-solid fa-angle-right"></i>
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="content-section">
              <h2 className="section-title">
                <i className="fa-solid fa-clipboard-check"></i>
                Requirements
              </h2>
              <ul className="content-list">
                {job.requirements.map((req, index) => (
                  <li key={index}>
                    <i className="fa-solid fa-angle-right"></i>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="content-section">
              <h2 className="section-title">
                <i className="fa-solid fa-star"></i>
                Required Skills
              </h2>
              <div className="skills-grid">
                {job.skills.map((skill, index) => (
                  <span key={index} className="skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits?.length > 0 && (
            <div className="content-section benefits-section">
              <h2 className="section-title">
                <i className="fa-solid fa-gift"></i>
                Benefits & Perks
              </h2>
              <div className="benefits-grid">
                {job.benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <i className="fa-solid fa-check-circle"></i>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Analyzer Teaser for Non-Logged Users */}
        {!loggedIn && (
          <div className="ai-analyzer-teaser">
            <div className="teaser-header">
              <span className="teaser-icon">🤖</span>
              <h3>Want to know how well your resume matches this role?</h3>
            </div>
            <p className="teaser-description">
              Use our AI-powered Resume Analyzer to get instant insights and personalized recommendations
            </p>
            <div className="teaser-features">
              <div className="teaser-feature">
                <i className="fa-solid fa-chart-line"></i>
                <span>Match Score Analysis</span>
              </div>
              <div className="teaser-feature">
                <i className="fa-solid fa-lightbulb"></i>
                <span>Skill Gap Insights</span>
              </div>
              <div className="teaser-feature">
                <i className="fa-solid fa-star"></i>
                <span>Improvement Tips</span>
              </div>
            </div>
            <div className="teaser-actions">
              <button 
                className="btn-teaser-primary"
                onClick={() => navigate('/register', { state: { from: location.pathname } })}
              >
                Create Free Account
              </button>
              <button 
                className="btn-teaser-secondary"
                onClick={() => navigate('/login', { state: { from: location.pathname } })}
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="job-footer">
          <p className="posted-date">
            <i className="fa-solid fa-calendar"></i>
            Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Recently'}
          </p>
        </div>
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
