import { useMemo } from 'react'
import './Company.css'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { jobs as allJobs } from '../data/jobs.js'
import { slugify } from '../utils/slug.js'
import { useAuth } from '../context/AuthContext.jsx'
import useSavedJobs from '../hooks/useSavedJobs.js'

export default function Company() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { loggedIn } = useAuth()
  const { saved, toggle } = useSavedJobs()

  const jobs = useMemo(() => allJobs.filter(j => slugify(j.company) === slug), [slug])
  const companyName = jobs[0]?.company || slug.replace(/-/g, ' ')

  const onSave = (jobSlug) => {
    if (!loggedIn) {
      navigate('/login', { state: { from: location } })
      return
    }
    toggle(jobSlug)
  }

  return (
    <section className="view-company">
      <h1 className="heading">{companyName}</h1>
      <p style={{ padding: '0 1.5rem 1.5rem' }}>Open positions</p>

      <div className="box-container">
        {jobs.map(job => (
          <div className="box" key={job.slug}>
            <div className="company">
              <img src={job.image} alt={job.title} />
              <div>
                <h3>{job.company}</h3>
                <p>{job.posted}</p>
              </div>
            </div>
            <h3 className="job-title">{job.title}</h3>
            <p className="location"><i className="fa-solid fa-location-dot"></i> <span>{job.location}</span></p>
            <div className="tags">
              <p><i className="fa-solid fa-peso-sign"></i><span> {job.salary}</span></p>
              <p><i className="fa-solid fa-clock"></i> <span>{job.type}</span></p>
            </div>
            <div className="flex-btn">
              <Link to={`/job/${job.slug}`} className="btn">View Details</Link>
              <div className="save-heart-btn">
                <button type="button" className="save" onClick={() => onSave(job.slug)}>
                  <span>{saved.includes(job.slug) ? 'Unsave' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <p style={{ padding: '1rem 1.5rem' }}>No openings found for this company.</p>
        )}
      </div>

      <div style={{ padding: '1.5rem' }}>
        <Link to="/jobs" className="btn">Back to Jobs</Link>
      </div>
    </section>
  )
}
