import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

// Company info from API
let cachedCompanyInfo = null;

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState(cachedCompanyInfo);
  const [loading, setLoading] = useState(!cachedCompanyInfo);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedCompanyInfo) {
      setCompanyInfo(cachedCompanyInfo);
      return;
    }

    const fetchCompanyInfo = async () => {
      try {
        const response = await apiClient.get('/company');
        if (response.success) {
          cachedCompanyInfo = response.data;
          setCompanyInfo(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch company info:', err);
        setError(err);
        // Use fallback
        setCompanyInfo(getDefaultCompanyInfo());
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
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
