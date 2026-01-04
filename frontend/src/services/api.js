// API configuration
// Always use full URL - browser can connect directly even though other tools can't
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// API client
class ApiClient {
  constructor() {
    this.baseURL = API_URL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders(excludeContentType = false) {
    const headers = {};

    if (!excludeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if we're sending FormData
    const isFormData = options.body instanceof FormData;
    
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(isFormData), // Skip Content-Type for FormData
        ...options.headers,
      },
    };

    try {
      console.log('API Request:', url, config); // Debug log
      const response = await fetch(url, config);
      const data = await response.json();

      console.log('API Response:', response.status, data); // Debug log

      if (!response.ok) {
        console.error('API Error Response:', data); // Debug log
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error.message, error); // Enhanced error log
      throw error;
    }
  }

  // GET request
  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  put(endpoint, data) {
    // If data is FormData, send it as-is. Otherwise, stringify it.
    const body = data instanceof FormData ? data : JSON.stringify(data);
    
    return this.request(endpoint, {
      method: 'PUT',
      body,
    });
  }

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

const apiClient = new ApiClient();

// Auth API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

// Jobs API
export const jobsAPI = {
  getJobs: (params) => apiClient.get('/jobs', params),
  getJob: (id) => apiClient.get(`/jobs/${id}`),
  createJob: (data) => apiClient.post('/jobs', data),
  updateJob: (id, data) => apiClient.put(`/jobs/${id}`, data),
  deleteJob: (id) => apiClient.delete(`/jobs/${id}`),
  searchExternal: (params) => apiClient.get('/jobs/search/external', params),
};

// Users API
export const usersAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  changePassword: (data) => apiClient.put('/users/change-password', data),
  deleteAccount: () => apiClient.delete('/users/profile'),
};

// Saved Jobs API
export const savedJobsAPI = {
  getSavedJobs: () => apiClient.get('/saved-jobs'),
  saveJob: (data) => apiClient.post('/saved-jobs', data),
  updateSavedJob: (id, data) => apiClient.put(`/saved-jobs/${id}`, data),
  removeSavedJob: (id) => apiClient.delete(`/saved-jobs/${id}`),
};

export { apiClient };
export default apiClient;
