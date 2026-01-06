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
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
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
  // Traditional auth
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  
  // Google OAuth
  googleAuth: (data) => apiClient.post('/auth/google', data),
  
  // Phone OTP auth
  requestPhoneOTP: (phoneNumber) => apiClient.post('/auth/phone/request-otp', { phoneNumber }),
  verifyPhoneOTP: (data) => apiClient.post('/auth/phone/verify-otp', data),
  
  // Admin login (email/password only)
  adminLogin: (data) => apiClient.post('/auth/admin/login', data),
};

// Jobs API
export const jobsAPI = {
  getJobs: (params) => apiClient.get('/jobs', params),
  getJob: (id) => apiClient.get(`/jobs/${id}`),
  createJob: (data) => apiClient.post('/jobs', data),
  updateJob: (id, data) => apiClient.put(`/jobs/${id}`, data),
  deleteJob: (id) => apiClient.delete(`/jobs/${id}`),
  approveJob: (id) => apiClient.put(`/jobs/${id}/approve`),
  rejectJob: (id, reason) => apiClient.put(`/jobs/${id}/reject`, { reason }),
  getPendingJobs: () => apiClient.get('/jobs/admin/pending-approval'),
  getJobsByDepartment: (deptId) => apiClient.get(`/jobs/by-department/${deptId}`),
};

// Departments API
export const departmentsAPI = {
  getDepartments: () => apiClient.get('/departments'),
  getDepartment: (id) => apiClient.get(`/departments/${id}`),
  createDepartment: (data) => apiClient.post('/departments', data),
  updateDepartment: (id, data) => apiClient.put(`/departments/${id}`, data),
  deleteDepartment: (id) => apiClient.delete(`/departments/${id}`),
  getDepartmentJobs: (id) => apiClient.get(`/departments/${id}/jobs`),
  getDepartmentTeam: (id) => apiClient.get(`/departments/${id}/team`),
  getDepartmentStats: (id) => apiClient.get(`/departments/${id}/stats`),
};

// Applications API
export const applicationsAPI = {
  getApplications: (params) => apiClient.get('/applications', params),
  getApplication: (id) => apiClient.get(`/applications/${id}`),
  createApplication: (data) => apiClient.post('/applications', data),
  updateApplicationStatus: (id, data) => apiClient.put(`/applications/${id}/status`, data),
  withdrawApplication: (id) => apiClient.delete(`/applications/${id}`),
};

// Interviews API
export const interviewsAPI = {
  getInterviews: (params) => apiClient.get('/interviews', params),
  getInterview: (id) => apiClient.get(`/interviews/${id}`),
  scheduleInterview: (data) => apiClient.post('/interviews', data),
  updateInterview: (id, data) => apiClient.put(`/interviews/${id}`, data),
  cancelInterview: (id) => apiClient.delete(`/interviews/${id}`),
  submitFeedback: (id, data) => apiClient.post(`/interviews/${id}/feedback`, data),
  respondToInterview: (id, data) => apiClient.put(`/interviews/${id}/respond`, data),
  getMySchedule: () => apiClient.get('/interviews/my-schedule'),
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

// Company API
export const companyAPI = {
  getCompanyInfo: () => apiClient.get('/company'),
};

export { apiClient };
export default apiClient;
