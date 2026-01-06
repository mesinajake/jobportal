/**
 * Company Configuration
 * Single-company job portal configuration
 * All company-related settings are centralized here instead of a database model
 */

export const companyConfig = {
  // Basic Company Information
  name: 'AppliTrak',
  legalName: 'AppliTrak, Inc.',
  tagline: 'Building the future together',
  description: `We are a forward-thinking company dedicated to innovation and excellence. 
    Our team is passionate about creating solutions that make a difference.`,
  
  // Branding
  logo: '/images/company-logo.png',
  favicon: '/images/favicon.ico',
  coverImage: '/images/company-cover.jpg',
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  
  // Contact Information
  website: 'https://applitrak.com',
  email: 'careers@applitrak.com',
  phone: '+1 (555) 123-4567',
  
  // Industry & Size
  industry: 'Technology',
  companySize: '201-500',
  founded: 2015,
  
  // Locations
  headquarters: {
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    address: '123 Innovation Way',
    zipCode: '94105'
  },
  offices: [
    {
      name: 'New York Office',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      address: '456 Tech Avenue'
    },
    {
      name: 'Austin Office',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      address: '789 Startup Blvd'
    }
  ],
  
  // Social Media
  socialMedia: {
    linkedin: 'https://linkedin.com/company/applitrak',
    twitter: 'https://twitter.com/applitrak',
    facebook: 'https://facebook.com/applitrak',
    instagram: 'https://instagram.com/applitrak',
    glassdoor: 'https://glassdoor.com/applitrak'
  },
  
  // Employee Benefits
  benefits: [
    'Competitive salary & equity',
    'Health, dental, and vision insurance',
    '401(k) with company match',
    'Unlimited PTO',
    'Remote work flexibility',
    'Professional development budget',
    'Home office stipend',
    'Wellness programs',
    'Parental leave',
    'Team events and offsites'
  ],
  
  // Company Culture
  culture: `We believe in fostering an inclusive environment where every voice matters. 
    Our culture is built on collaboration, continuous learning, and making an impact.`,
  
  values: [
    { name: 'Innovation', description: 'We embrace new ideas and technologies' },
    { name: 'Integrity', description: 'We do the right thing, always' },
    { name: 'Collaboration', description: 'We achieve more together' },
    { name: 'Growth', description: 'We invest in our people' },
    { name: 'Impact', description: 'We create meaningful solutions' }
  ],
  
  // Career Page Settings
  careerPage: {
    title: 'Join Our Team',
    subtitle: 'Build your career with us and make a difference',
    showSalary: true,
    showBenefits: true,
    showTeamPhotos: true,
    enableEmployeeReferrals: true,
    referralBonusDefault: 2500, // Default referral bonus in USD
    enableInternalJobs: true // Show internal-only postings to employees
  },
  
  // Domain Restrictions for Staff Registration
  // Only emails from these domains can be invited as staff
  allowedStaffDomains: [
    'applitrak.com',
    'subsidiary.com'
  ],
  
  // Application Settings
  applicationSettings: {
    requireCoverLetter: false,
    requireResume: true,
    maxResumeSize: 5, // MB
    allowedResumeFormats: ['.pdf', '.doc', '.docx'],
    autoRejectAfterDays: 30, // Auto-reject applications after X days if no response
    enableApplicationWithdrawal: true
  },
  
  // Interview Settings
  interviewSettings: {
    defaultDuration: 60, // minutes
    reminderHoursBefore: 24,
    calendarIntegration: true,
    videoInterviewPlatform: 'zoom', // 'zoom', 'teams', 'google-meet', 'custom'
    customVideoLink: '' // For custom platform
  },
  
  // Approval Workflow Settings
  approvalWorkflow: {
    requireJobApproval: true,
    jobApprovalRoles: ['hiring_manager', 'hr', 'admin'],
    requireOfferApproval: true,
    offerApprovalRoles: ['hr', 'admin']
  },
  
  // Data Retention (GDPR compliance)
  dataRetention: {
    keepRejectedApplicationsMonths: 12,
    keepAcceptedApplicationsYears: 7,
    enableCandidateDataDeletion: true
  },
  
  // Email Templates Configuration
  emailSettings: {
    senderName: 'AppliTrak Careers',
    senderEmail: 'careers@applitrak.com',
    replyToEmail: 'hr@applitrak.com'
  }
};

// Helper function to get company info for public display
export const getPublicCompanyInfo = () => ({
  name: companyConfig.name,
  tagline: companyConfig.tagline,
  description: companyConfig.description,
  logo: companyConfig.logo,
  website: companyConfig.website,
  industry: companyConfig.industry,
  companySize: companyConfig.companySize,
  founded: companyConfig.founded,
  headquarters: companyConfig.headquarters,
  offices: companyConfig.offices,
  socialMedia: companyConfig.socialMedia,
  benefits: companyConfig.benefits,
  culture: companyConfig.culture,
  values: companyConfig.values,
  careerPage: companyConfig.careerPage
});

// Helper to check if email domain is allowed for staff
export const isAllowedStaffDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return companyConfig.allowedStaffDomains.includes(domain);
};

export default companyConfig;
