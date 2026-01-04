import { jobsAPI } from './api.js';

// Search jobs from backend (includes both internal and external jobs)
export async function searchLiveJobs({ query = '', location = '', pages = 1 } = {}) {
  try {
    const params = {
      search: query,
      location: location,
      page: pages,
      limit: 20,
      includeExternal: 'true'
    };

    const response = await jobsAPI.searchExternal(params);
    
    if (response.success) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching jobs:', error);
    return [];
  }
}

// Get all jobs with filters
export async function fetchJobs({ search = '', location = '', type = '', page = 1 } = {}) {
  try {
    const params = {
      search,
      location,
      type,
      page,
      limit: 20
    };

    const response = await jobsAPI.getJobs(params);
    
    if (response.success) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

// Get single job by ID or slug
export async function getJobById(id) {
  try {
    const response = await jobsAPI.getJob(id);
    
    if (response.success) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}
