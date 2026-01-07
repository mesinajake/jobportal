import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

// Company info from API
let cachedCompanyInfo = null;
// Shared promise for request deduplication
let fetchPromise = null;

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState(cachedCompanyInfo);
  const [loading, setLoading] = useState(!cachedCompanyInfo);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Return early if already cached
    if (cachedCompanyInfo) {
      setCompanyInfo(cachedCompanyInfo);
      setLoading(false);
      return;
    }

    // Deduplicate concurrent requests
    if (!fetchPromise) {
      fetchPromise = apiClient.get('/company')
        .then(response => {
          if (response.success) {
            cachedCompanyInfo = response.data;
            return response.data;
          }
          throw new Error('Failed to fetch company info');
        })
        .catch(err => {
          console.error('Failed to fetch company info:', err);
          // Return fallback on error
          return getDefaultCompanyInfo();
        })
        .finally(() => {
          fetchPromise = null; // Reset for future calls
        });
    }

    // Use the shared promise
    let mounted = true;
    fetchPromise
      .then(data => {
        if (mounted) {
          setCompanyInfo(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setCompanyInfo(getDefaultCompanyInfo());
          setLoading(false);
        }
      });

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  return { companyInfo, loading, error };
}

// Fallback company info if API fails
function getDefaultCompanyInfo() {
  return {
    name: 'Company Name',
    tagline: 'Your Company Tagline',
    description: 'Company description',
    logo: '/images/company-logo.png',
    website: 'https://company.com',
    industry: 'Technology',
    companySize: '51-200',
    founded: 2020,
    headquarters: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    },
    socialMedia: {},
    benefits: [],
    culture: '',
    values: [],
    careerPage: {
      title: 'Join Our Team',
      subtitle: 'Build your career with us',
      showSalary: true,
      showBenefits: true
    }
  };
}

export default useCompanyInfo;
