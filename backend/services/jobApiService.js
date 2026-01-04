import axios from 'axios';

// Helper function to generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper function to calculate days ago
const daysAgo = (dateStr) => {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return 'recently';
    const diffMs = Date.now() - d.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  } catch {
    return 'recently';
  }
};

// Fetch jobs from FindWork.dev API
export const fetchFindWorkJobs = async ({ search = '', location = '', page = 1 }) => {
  try {
    const apiKey = process.env.FINDWORK_API_KEY || '4ab40bbd543eb2acfb3bc096e02aefe5be159c47';
    
    const params = {
      page: page || 1
    };

    if (search) params.search = search;
    if (location) params.location = location;

    const response = await axios.get('https://findwork.dev/api/jobs/', {
      params,
      headers: {
        'Authorization': `Token ${apiKey}`
      }
    });

    if (!response.data || !response.data.results) {
      return [];
    }

    return response.data.results.map(job => ({
      id: job.id || `findwork-${Date.now()}-${Math.random()}`,
      slug: `findwork-${slugify(job.role || job.company_name || 'job')}-${job.id}`,
      title: job.role || job.text || 'Untitled Position',
      company: job.company_name || 'Company Not Specified',
      description: job.text || job.description || '',
      location: job.location || (job.remote ? 'Remote' : 'Not specified'),
      salary: job.salary || 'Not specified',
      type: job.employment_type || 'Full time',
      posted: daysAgo(job.date_posted || job.published_at),
      image: job.logo || '/images/Job-offers.png',
      externalUrl: job.url || '#',
      source: 'findwork',
      isActive: true
    }));
  } catch (error) {
    console.error('FindWork API Error:', error.message);
    return [];
  }
};

// Fetch jobs from Arbeitnow API (free, no API key required)
export const fetchArbeitnowJobs = async ({ search = '', location = '', page = 1 }) => {
  try {
    const url = `${process.env.ARBEITNOW_API_URL || 'https://arbeitnow.com/api/job-board-api'}?page=${page}`;
    const response = await axios.get(url);

    if (!response.data || !response.data.data) {
      return [];
    }

    const jobs = response.data.data.map(job => {
      const title = job.title || job.job_title || 'Unknown Title';
      const company = job.company_name || job.company || 'Unknown Company';
      
      return {
        id: job.slug || job.id || `arbeit-${Date.now()}-${Math.random()}`,
        slug: `arbeitnow-${job.slug || slugify(`${title}-${company}`)}`,
        title,
        company,
        description: job.description || '',
        location: job.location || (job.remote ? 'Remote' : 'Not specified'),
        salary: job.salary || 'Not specified',
        type: Array.isArray(job.job_types) && job.job_types.length ? job.job_types[0] : 'Full time',
        posted: daysAgo(job.created_at || job.published_at),
        image: '/images/Job-offers.png',
        externalUrl: job.url || '#',
        source: 'arbeitnow',
        isActive: true
      };
    });

    // Filter by search and location if provided
    return jobs.filter(job => {
      const matchesSearch = !search || 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase());
      
      const matchesLocation = !location || 
        job.location.toLowerCase().includes(location.toLowerCase());

      return matchesSearch && matchesLocation;
    });
  } catch (error) {
    console.error('Arbeitnow API Error:', error.message);
    return [];
  }
};

// Fetch jobs from Remotive API (free, no API key required)
export const fetchRemotiveJobs = async ({ search = '', location = '' }) => {
  try {
    const params = {};
    if (search) params.search = search;
    if (location) params.location = location;

    const url = process.env.REMOTIVE_API_URL || 'https://remotive.com/api/remote-jobs';
    const response = await axios.get(url, { params });

    if (!response.data || !response.data.jobs) {
      return [];
    }

    return response.data.jobs.slice(0, 20).map(job => ({
      id: job.id || `remotive-${Date.now()}-${Math.random()}`,
      slug: `remotive-${slugify(job.title || 'job')}-${job.id}`,
      title: job.title || 'Untitled Position',
      company: job.company_name || 'Company Not Specified',
      description: job.description || '',
      location: job.candidate_required_location || 'Remote',
      salary: job.salary || 'Not specified',
      type: job.job_type || 'Remote',
      posted: daysAgo(job.publication_date),
      image: job.company_logo || '/images/Job-offers.png',
      externalUrl: job.url || '#',
      source: 'remotive',
      isActive: true
    }));
  } catch (error) {
    console.error('Remotive API Error:', error.message);
    return [];
  }
};

// Aggregate jobs from all sources
export const fetchExternalJobs = async ({ search = '', location = '', page = 1 }) => {
  try {
    const promises = [
      fetchFindWorkJobs({ search, location, page }),
      fetchArbeitnowJobs({ search, location, page }),
      fetchRemotiveJobs({ search, location })
    ];

    const results = await Promise.allSettled(promises);
    
    const allJobs = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    // Remove duplicates based on title and company
    const uniqueJobs = allJobs.reduce((acc, job) => {
      const key = `${job.title}-${job.company}`.toLowerCase();
      if (!acc.has(key)) {
        acc.set(key, job);
      }
      return acc;
    }, new Map());

    return Array.from(uniqueJobs.values());
  } catch (error) {
    console.error('Error fetching external jobs:', error.message);
    return [];
  }
};
