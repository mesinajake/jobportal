import { useState } from 'react'
import './Job.css'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getJobBySlug } from '../data/jobs.js'
import { useAuth } from '../context/AuthContext.jsx'
import { slugify } from '../utils/slug.js'
import useSavedJobs from '../hooks/useSavedJobs.js'


export default function Job() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { loggedIn } = useAuth()
  const { saved, toggle } = useSavedJobs()
  const [status, setStatus] = useState('')

  const jobLive = location.state?.jobLive || (function () {
    try { return JSON.parse(sessionStorage.getItem(`jobLive-${slug}`) || 'null') } catch { return null }
  })()
  const job = jobLive || getJobBySlug(slug)
  const isLive = !!jobLive

  if (!job) {
    return (
      <section className="job-details">
        <h1 className="heading">Job Not Found</h1>
        <p>We couldn't find the job you're looking for.</p>
        <Link to="/jobs" className="btn" style={{ marginTop: '1rem' }}>Back to Jobs</Link>
      </section>
    )
  }

  const companySlug = slugify(job.company)

  const handleApply = (e) => {
    e.preventDefault()
    if (!loggedIn) {
      navigate('/login', { state: { from: location } })
      return
    }
    setStatus('Application submitted!')
  }

  const onSave = () => {
    if (!loggedIn) {
      navigate('/login', { state: { from: location } })
      return
    }
    toggle(job.slug)
  }

  return (
    <section className="job-details">
      <h1 className="heading">Job Details</h1>

      <div className="details">
        <div className="job-info">
          <h3>{job.title}</h3>
          {isLive ? (
            <p style={{ fontWeight: 600 }}>{job.company}</p>
          ) : (
            <Link to={`/company/${companySlug}`}>{' '}{job.company}</Link>
          )}
          <p><i className="fa-solid fa-location-dot"></i> {job.location}</p>
        </div>

        <div className="basic-details">
          <h3>Salary</h3>
          <p>₱{job.salary}</p>
          <h3>Work Type</h3>
          <p>{job.type}</p>
        </div>

        <ul>
          <h3>Requirements</h3>
          <li>Education: <span>Bachelor's/College Degree</span></li>
          <li>Language: <span>Tagalog, English</span></li>
          <li>Experience: <span>1+ year related experience</span></li>
        </ul>

        <div className="description">
          <h3>Job Description</h3>
          <p>{job.description}</p>
          <ul>
            <li>Posted {job.posted}</li>
          </ul>
        </div>

        {status && (
          <p style={{ color: '#3f6fb6', padding: '.5rem 1rem' }}>{status}</p>
        )}

        {isLive ? (
          <div className="flex-btn">
            <a 
              href={job.url || job.externalUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn" 
              id="apply-btn"
            >
              Apply on company site
            </a>
            <button type="button" className="save" id="save-btn" onClick={onSave}>
              <span>{saved.includes(job.slug) ? 'Unsave' : 'Save'}</span>
            </button>
          </div>
        ) : job.externalUrl ? (
          // For jobs with external URLs (from APIs or manually added)
          <div className="flex-btn">
            <a 
              href={job.externalUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn" 
              id="apply-btn"
            >
              Apply on company site
            </a>
            <button type="button" className="save" id="save-btn" onClick={onSave}>
              <span>{saved.includes(job.slug) ? 'Unsave' : 'Save'}</span>
            </button>
          </div>
        ) : (
          // For internal jobs without external URLs
          <form className="flex-btn" onSubmit={handleApply}>
            <input type="submit" value="Apply Now" name="apply" className="btn" id="apply-btn" />
            <button type="button" className="save" id="save-btn" onClick={onSave}>
              <span>{saved.includes(job.slug) ? 'Unsave' : 'Save'}</span>
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
