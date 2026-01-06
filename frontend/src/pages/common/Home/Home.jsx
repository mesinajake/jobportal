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
  const navigate = useNavigate()
  const { companyInfo } = useCompanyInfo()

  // Fetch latest jobs and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, deptRes] = await Promise.all([
          apiClient.get('/jobs?limit=6&status=open'),
          apiClient.get('/departments')
        ])
        if (jobsRes.success) setJobs(jobsRes.data || [])
        if (deptRes.success) setDepartments(deptRes.data || [])
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
            <Link to="/careers" className="btn btn-primary">View All Positions</Link>
            <Link to="/about" className="btn btn-secondary">Learn About Us</Link>
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
        ) : jobs.length > 0 ? (
          <div className="box-container">
            {jobs.map(job => (
              <div className="box job-card" key={job._id}>
                <div className="job-header">
                  <span 
                    className="department-tag"
                    style={{ backgroundColor: job.department?.color || '#4A90A4' }}
                  >
                    {job.department?.name || 'General'}
                  </span>
                  {job.employmentType && (
                    <span className="employment-type">{formatEmploymentType(job.employmentType)}</span>
                  )}
                </div>
                <h3 className="job-title">{job.title}</h3>
                <p className="location">
                  <i className="fa-solid fa-location-dot"></i> {job.location || 'Remote'}
                </p>
                {job.workArrangement && (
                  <p className="work-arrangement">
                    <i className="fa-solid fa-briefcase"></i> {formatWorkArrangement(job.workArrangement)}
                  </p>
                )}
                <Link to={`/careers/${job._id}`} className="btn">View Details</Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-jobs">
            <p>No open positions at the moment. Check back soon!</p>
            <Link to="/register" className="btn">Join Our Talent Network</Link>
          </div>
        )}
        {jobs.length > 0 && (
          <div className="view-all-jobs">
            <Link to="/careers" className="btn btn-outline">View All Positions</Link>
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
            <Link to="/careers" className="btn btn-primary">Explore Opportunities</Link>
            <Link to="/register" className="btn btn-secondary">Create Profile</Link>
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
