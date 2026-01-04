import { useEffect, useMemo, useState } from 'react'
import './Jobs.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { jobs as allJobs } from '../data/jobs.js'
import { useAuth } from '../context/AuthContext.jsx'
import useSavedJobs from '../hooks/useSavedJobs.js'
import { searchLiveJobs } from '../services/jobsApi.js'

export default function Jobs() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const initialQ = params.get('q') || ''
  const initialLoc = params.get('loc') || ''

  const [q, setQ] = useState(initialQ)
  const [loc, setLoc] = useState(initialLoc)
  const { saved, toggle } = useSavedJobs()
  const { loggedIn } = useAuth()
  const [useLive, setUseLive] = useState(false)
  const [liveJobs, setLiveJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setQ(initialQ)
    setLoc(initialLoc)
  }, [initialQ, initialLoc])

  useEffect(() => {
    let active = true
    async function run() {
      if (!useLive) return
      setLoading(true)
      setError('')
      try {
        const data = await searchLiveJobs({ query: q, location: loc, pages: 1 })
        if (!active) return
        setLiveJobs(data)
      } catch (e) {
        if (!active) return
        setError('Live jobs unavailable. Showing offline results.')
        setLiveJobs([])
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [q, loc, useLive])

  const filteredLocal = useMemo(() => {
    const term = q.trim().toLowerCase()
    const l = loc.trim().toLowerCase()
    return allJobs.filter(j =>
      (!term || j.title.toLowerCase().includes(term) || j.company.toLowerCase().includes(term)) &&
      (!l || j.location.toLowerCase().includes(l))
    )
  }, [q, loc])

  const display = useLive ? liveJobs : filteredLocal

  const onSave = (slug) => {
    if (!loggedIn) {
      navigate('/login', { replace: false, state: { from: location } })
      return
    }
    toggle(slug)
  }

  const onFilterSubmit = (e) => {
    e.preventDefault()
    const qs = new URLSearchParams()
    if (q.trim()) qs.set('q', q.trim())
    if (loc.trim()) qs.set('loc', loc.trim())
    navigate(`/jobs${qs.toString() ? `?${qs.toString()}` : ''}`)
  }

  return (
    <>
      <section className="job-filter">
        <h1 className="heading">Filter Jobs</h1>
        <form onSubmit={onFilterSubmit}>
          <div className="flex">
            <div className="box">
              <p>Job Title <span>*</span></p>
              <input className="input" type="text" placeholder="keyword, category or company" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div className="box">
              <p>Job Location</p>
              <input className="input" type="text" placeholder="city, country or state" value={loc} onChange={e => setLoc(e.target.value)} />
            </div>
            <div className="box">
              <p>Data Source</p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={useLive} onChange={e => setUseLive(e.target.checked)} />
                <span>Use live jobs (beta)</span>
              </label>
            </div>
          </div>
        </form>
      </section>

      <section className="jobs-container">
        <h1 className="heading">Latest Jobs</h1>
        {useLive && (
          <p style={{ padding: '0 1.5rem 1rem', color: '#3f6fb6', justifyContent: 'center', display: 'flex' }}>
            Live jobs powered by FindWork.dev API {loading ? '· Loading…' : ''}
          </p>
        )}
        {error && (
          <p style={{ padding: '0 1.5rem', color: 'crimson' }}>{error}</p>
        )}
        <div className="box-container">
          {display.map(job => (
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
                <Link
                  to={`/job/${job.slug}`}
                  state={useLive ? { jobLive: job } : undefined}
                  className="btn"
                  onClick={() => {
                    if (useLive) {
                      try { sessionStorage.setItem(`jobLive-${job.slug}`, JSON.stringify(job)) } catch {}
                    }
                  }}
                >
                  View Details
                </Link>
                <div className="save-heart-btn">
                  <button type="button" className="save" onClick={() => onSave(job.slug)}>
                    <span>{saved.includes(job.slug) ? 'Unsave' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {display.length === 0 && !loading && (
            <p style={{ padding: '1rem 1.5rem' }}>No jobs found. Try different filters.</p>
          )}
        </div>
      </section>
    </>
  )
}
