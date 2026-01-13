import { useState, useEffect } from 'react'
import './Home.css'
import { Link, useNavigate } from 'react-router-dom'
import { useCompanyInfo } from '../../../hooks/useCompanyInfo'
import { apiClient } from '../../../services/api'

export default function Home() {
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [jobs, setJobs] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [savingJob, setSavingJob] = useState(null)
  const navigate = useNavigate()
  const { companyInfo } = useCompanyInfo()
  
  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('token')

  // Fetch latest jobs and departments
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const fetchData = async () => {
      try {
        const requests = [
          apiClient.get('/jobs?limit=6&status=open'),
          apiClient.get('/departments')
        ];
        
        // Fetch saved jobs if user is authenticated
        if (isAuthenticated) {
          requests.push(apiClient.get('/saved-jobs'));
        }
        
        const responses = await Promise.all(requests);
        
        if (!mounted) return; // Component unmounted, don't update state
        
        if (responses[0].success) setJobs(responses[0].data || []);
        if (responses[1].success) setDepartments(responses[1].data || []);
        
        // Set saved jobs if user is authenticated
        if (isAuthenticated && responses[2]?.success) {
          const savedJobIds = new Set(responses[2].data.map(sj => sj.job._id || sj.job));
          setSavedJobs(savedJobIds);
        }
      } catch (err) {
        if (err.name === 'AbortError' || !mounted) return;
        console.error('Failed to fetch data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [isAuthenticated])

  const handleChange = (e) => {
    const v = e.target.value
    setQ(v)
    if (v.trim().length > 0 && jobs.length > 0) {
      const term = v.toLowerCase()
      const matches = jobs
        .filter(j => j.title.toLowerCase().includes(term))
        .slice(0, 6)
        .map(j => j.title)
      const unique = [...new Set(matches)]
      setSuggestions(unique)
    } else {
      setSuggestions([])
    }
  }

  const handleSelect = (s) => {
    setQ(s)
    setSuggestions([])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(`/careers?q=${encodeURIComponent(q.trim())}`)
  }

  const handleSaveJob = async (jobId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/' } });
      return;
    }

    setSavingJob(jobId);
    const isSaved = savedJobs.has(jobId);

    try {
      if (isSaved) {
        const response = await apiClient.delete(`/saved-jobs/${jobId}`);
        if (response.success) {
          setSavedJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        }
      } else {
        const response = await apiClient.post('/saved-jobs', { jobId });
        if (response.success) {
          setSavedJobs(prev => new Set(prev).add(jobId));
        }
      }
    } catch (err) {
      console.error('Failed to save/unsave job:', err);
    } finally {
      setSavingJob(null);
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="home careers-hero">
        <div className="content">
          <div className="company-branding">
            {companyInfo?.logo && (
              <img src={companyInfo.logo} alt={companyInfo.name} className="company-logo-hero" />
            )}
          </div>
          <span className="tagline">{companyInfo?.tagline || 'Join Our Team'}</span>
          <h3>Build Your Career at {companyInfo?.name || 'Our Company'}</h3>
          <p className="hero-description">
            {companyInfo?.careerPage?.heroText || 
             'Discover exciting opportunities and be part of a team that values innovation, growth, and collaboration.'}
          </p>
          <form className="search-job" style={{ position: 'relative' }} onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Search open positions..."
              value={q}
              onChange={handleChange}
              autoComplete="off"
            />
            <button type="submit"><i className="fa-solid fa-search"></i></button>
            {suggestions.length > 0 && (
              <ul className="suggestions">
                {suggestions.map((s, i) => (
                  <li key={i} onClick={() => handleSelect(s)}>{s}</li>
                ))}
              </ul>
            )}
          </form>
          <div className="links">
            <Link to="/careers" className="btn-careers-primary">View All Positions</Link>
            <Link to="/about" className="btn-about-secondary">Learn About Us</Link>
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="why-join-us">
        <h2 className="heading">Why Join {companyInfo?.name || 'Our Team'}?</h2>
        <div className="benefits-grid">
          {(companyInfo?.benefits || defaultBenefits).slice(0, 6).map((benefit, index) => (
            <div className="benefit-card" key={index}>
              <i className={getBenefitIcon(benefit)}></i>
              <h4>{benefit}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Departments Section */}
      {departments.length > 0 && (
        <section className="departments-section">
          <h2 className="heading">Explore by Department</h2>
          <div className="departments-grid">
            {departments.map(dept => (
              <Link 
                to={`/careers?department=${dept._id}`} 
                className="department-card" 
                key={dept._id}
                style={{ borderColor: dept.color || '#4A90A4' }}
              >
                <h4>{dept.name}</h4>
                <p>{dept.description?.substring(0, 80) || 'Explore opportunities'}{dept.description?.length > 80 ? '...' : ''}</p>
                <span className="dept-jobs-count">
                  {dept.openPositions || 0} open position{dept.openPositions !== 1 ? 's' : ''}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Openings Section */}
      <section className="jobs latest-openings">
        <h2 className="heading">Latest Openings</h2>
        {loading ? (
          <div className="loading-spinner">Loading opportunities...</div>
        ) : (
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
                    className={`btn-save ${isAuthenticated && savedJobs.has(job._id) ? 'saved' : ''}`}
                    onClick={() => handleSaveJob(job._id)}
                    disabled={savingJob === job._id}
                    aria-label={savedJobs.has(job._id) ? 'Unsave job' : 'Save job'}
                    title={isAuthenticated ? (savedJobs.has(job._id) ? 'Remove from saved' : 'Save for later') : 'Login to save jobs'}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24"
                      style={{
                        width: '20px',
                        height: '20px',
                        fill: isAuthenticated && savedJobs.has(job._id) ? '#2c3e50' : 'none',
                        stroke: '#2c3e50',
                        strokeWidth: '2px',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        display: 'block'
                      }}
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>{isAuthenticated && savedJobs.has(job._id) ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>
            ))}
            {jobs.length === 0 && !loading && (
              <div className="no-results">
                <i className="fa-solid fa-briefcase"></i>
                <h3>No positions found</h3>
                <p>Check back later for new opportunities</p>
              </div>
            )}
          </div>
        )}
        {jobs.length > 0 && (
          <div className="view-all-jobs">
            <Link to="/careers" className="btn-outline">View All Positions</Link>
          </div>
        )}
      </section>

      {/* Company Culture Section */}
      <section className="company-culture">
        <h2 className="heading">Life at {companyInfo?.name || 'Our Company'}</h2>
        <div className="culture-content">
          <div className="culture-text">
            <p>
              {companyInfo?.careerPage?.cultureText || 
               'We believe in creating an environment where everyone can thrive. Our culture is built on collaboration, innovation, and mutual respect.'}
            </p>
            <div className="culture-highlights">
              <div className="highlight">
                <i className="fa-solid fa-users"></i>
                <span>{companyInfo?.companySize || '50+'} Team Members</span>
              </div>
              <div className="highlight">
                <i className="fa-solid fa-building"></i>
                <span>{companyInfo?.locations?.length || 1} Location{(companyInfo?.locations?.length || 1) !== 1 ? 's' : ''}</span>
              </div>
              <div className="highlight">
                <i className="fa-solid fa-industry"></i>
                <span>{companyInfo?.industry || 'Technology'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join our team and make an impact. We're always looking for talented individuals.</p>
          <div className="cta-buttons">
            <Link to="/careers" className="btn-explore-primary">Explore Opportunities</Link>
            <Link to="/register" className="btn-register-secondary">Create Profile</Link>
          </div>
        </div>
      </section>
    </>
  )
}

// Helper functions
const defaultBenefits = [
  'Health Insurance',
  'Flexible Work Hours',
  'Professional Development',
  'Paid Time Off',
  'Team Events',
  'Career Growth'
]

function getBenefitIcon(benefit) {
  const iconMap = {
    'health': 'fa-solid fa-heart-pulse',
    'insurance': 'fa-solid fa-shield-heart',
    'flexible': 'fa-solid fa-clock',
    'remote': 'fa-solid fa-house-laptop',
    'development': 'fa-solid fa-graduation-cap',
    'training': 'fa-solid fa-chalkboard-user',
    'time off': 'fa-solid fa-umbrella-beach',
    'vacation': 'fa-solid fa-plane',
    'team': 'fa-solid fa-people-group',
    'events': 'fa-solid fa-calendar-check',
    'growth': 'fa-solid fa-chart-line',
    'career': 'fa-solid fa-stairs',
    'bonus': 'fa-solid fa-money-bill-wave',
    'equity': 'fa-solid fa-chart-pie',
    'gym': 'fa-solid fa-dumbbell',
    'wellness': 'fa-solid fa-spa',
    'food': 'fa-solid fa-utensils',
    'transport': 'fa-solid fa-bus',
    'parking': 'fa-solid fa-square-parking',
    'childcare': 'fa-solid fa-baby-carriage'
  }
  
  const lowerBenefit = benefit.toLowerCase()
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerBenefit.includes(key)) return icon
  }
  return 'fa-solid fa-check-circle'
}

function formatEmploymentType(type) {
  const types = {
    'full-time': 'Full Time',
    'part-time': 'Part Time',
    'contract': 'Contract',
    'internship': 'Internship',
    'temporary': 'Temporary'
  }
  return types[type] || type
}

function formatWorkArrangement(arrangement) {
  const arrangements = {
    'onsite': 'On-site',
    'remote': 'Remote',
    'hybrid': 'Hybrid'
  }
  return arrangements[arrangement] || arrangement
}

function formatSalary(range) {
  const format = (n) => n.toLocaleString()
  if (range.min && range.max) {
    return `${format(range.min)} - ${format(range.max)}`
  }
  return range.min ? `From ${format(range.min)}` : ''
}
