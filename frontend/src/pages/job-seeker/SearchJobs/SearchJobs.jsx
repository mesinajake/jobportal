import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SearchJobs.css';

const SearchJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    type: '',
    experience: '',
    salary: ''
  });

  useEffect(() => {
    // TODO: Fetch jobs with filters
    setLoading(false);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Search with current filters
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="search-jobs">
      <div className="search-header">
        <h1>Find Your Dream Job</h1>
        <p>Search through thousands of job opportunities</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-main">
          <input
            type="text"
            name="keyword"
            placeholder="Job title, keywords, or company"
            value={filters.keyword}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={filters.location}
            onChange={handleFilterChange}
          />
          <button type="submit" className="btn-search">Search</button>
        </div>
        
        <div className="filters-row">
          <select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="">Job Type</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
          <select name="experience" value={filters.experience} onChange={handleFilterChange}>
            <option value="">Experience</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior</option>
          </select>
          <select name="salary" value={filters.salary} onChange={handleFilterChange}>
            <option value="">Salary Range</option>
            <option value="0-50000">$0 - $50,000</option>
            <option value="50000-100000">$50,000 - $100,000</option>
            <option value="100000+">$100,000+</option>
          </select>
        </div>
      </form>

      {loading ? (
        <div className="loading">Loading jobs...</div>
      ) : (
        <div className="jobs-results">
          <div className="results-header">
            <p>{jobs.length} jobs found</p>
          </div>
          
          <div className="jobs-grid">
            {jobs.length === 0 ? (
              <div className="no-jobs">
                <p>No jobs found matching your criteria</p>
                <p>Try adjusting your search filters</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job._id} className="job-card">
                  <div className="job-header">
                    <div className="company-logo">
                      {job.company?.logo ? (
                        <img src={job.company.logo} alt={job.company.name} />
                      ) : (
                        <div className="logo-placeholder">{job.company?.name?.[0] || 'C'}</div>
                      )}
                    </div>
                    <div className="job-title-info">
                      <h3>{job.title}</h3>
                      <p className="company-name">{job.company?.name}</p>
                    </div>
                  </div>
                  
                  <div className="job-meta">
                    <span>📍 {job.location}</span>
                    <span>💼 {job.type}</span>
                    {job.salary && (
                      <span>💰 ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()}</span>
                    )}
                  </div>
                  
                  <p className="job-description">
                    {job.description?.substring(0, 150)}...
                  </p>
                  
                  <div className="job-actions">
                    <Link to={`/jobs/${job._id}`} className="btn-view">View Details</Link>
                    <button className="btn-save">♡ Save</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchJobs;
