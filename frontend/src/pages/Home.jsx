import { useMemo, useState } from 'react'
import './Home.css'
import { Link, useNavigate } from 'react-router-dom'
import { jobs as allJobs } from '../data/jobs.js'

export default function Home() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    const values = new Set()
    allJobs.forEach(j => {
      values.add(j.title)
      values.add(j.company)
    })
    return Array.from(values).filter(v => v.toLowerCase().includes(term)).slice(0, 6)
  }, [q])

  const onSubmit = (e) => {
    e.preventDefault()
    const qs = new URLSearchParams()
    if (q.trim()) qs.set('q', q.trim())
    navigate(`/jobs${qs.toString() ? `?${qs.toString()}` : ''}`)
  }

  const latest = allJobs.slice(0, 6)

  return (
    <>
      <div className="home-container">
        <section className="home">
          <form onSubmit={onSubmit}>
            <h3>Looking for a job?</h3>
            <input
              type="text"
              name="title"
              id="input-box"
              placeholder="keyword, category or company"
              required
              maxLength={50}
              className="input"
              autoComplete="off"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="result-box">
              <ul>
                {suggestions.map(s => (
                  <li key={s} onClick={() => setQ(s)}>{s}</li>
                ))}
              </ul>
            </div>
            <input type="submit" value="Search Job" name="search" className="btn" />
          </form>
        </section>
      </div>

      <section className="jobs-container">
        <h1 className="heading">Latest Jobs</h1>
        <div className="box-container">
          {latest.map(job => (
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
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/jobs" className="btn">View All</Link>
        </div>
      </section>
    </>
  )
}
