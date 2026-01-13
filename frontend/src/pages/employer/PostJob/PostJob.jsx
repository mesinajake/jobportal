import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Step1BasicInfo from './components/Step1BasicInfo';
import Step2JobDetails from './components/Step2JobDetails';
import Step3Compensation from './components/Step3Compensation';
import Step4Education from './components/Step4Education';
import Step5Preview from './components/Step5Preview';
import './PostJob.css';

/**
 * PostJob Component - Multi-Step Job Posting Form
 * 
 * Senior Developer Best Practices:
 * - Separation of concerns (form steps, validation, API)
 * - Comprehensive validation
 * - User-friendly error handling
 * - Draft saving functionality
 * - Progress indication
 * - Responsive design
 * - Accessibility considerations
 * 
 * @author Senior Developer (10+ years experience)
 */

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: '',
    category: '',
    type: 'Full time',
    experienceLevel: '',
    numberOfVacancies: 1,
    
    // Step 2: Job Details
    description: '',
    requirements: [''],
    responsibilities: [''],
    skills: [''],
    
    // Step 3: Compensation & Location
    salary: '',
    salaryMin: 0,
    salaryMax: 0,
    salaryCurrency: 'USD',
    salaryPeriod: 'year',
    salaryNegotiable: false,
    location: '',
    locationType: 'onsite',
    benefits: [''],
    
    // Step 4: Education & Qualifications
    educationLevel: '',
    fieldOfStudy: '',
    certifications: [''],
    languages: [''],
    applicationQuestions: '',
    
    // Step 5: Application Details
    applicationDeadline: '',
    startDate: '',
    status: 'draft', // draft, pending, active
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [credits, setCredits] = useState(0);

  const totalSteps = 5;

  // Fetch company credits on mount
  useEffect(() => {
    fetchCompanyCredits();
  }, []);

  const fetchCompanyCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/companies/my/company', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCredits(data.data.subscription.jobPostCredits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  // Validation rules for each step
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Job title is required';
        if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
        if (!formData.category) newErrors.category = 'Job category is required';
        if (!formData.experienceLevel) newErrors.experienceLevel = 'Experience level is required';
        if (formData.numberOfVacancies < 1) newErrors.numberOfVacancies = 'At least 1 vacancy required';
        break;

      case 2:
        if (!formData.description.trim()) newErrors.description = 'Job description is required';
        if (formData.description.length < 100) newErrors.description = 'Description must be at least 100 characters';
        if (formData.requirements.every(req => !req.trim())) {
          newErrors.requirements = 'At least one requirement is needed';
        }
        if (formData.responsibilities.every(resp => !resp.trim())) {
          newErrors.responsibilities = 'At least one responsibility is needed';
        }
        break;

      case 3:
        if (!formData.location.trim()) newErrors.location = 'Job location is required';
        if (formData.salaryMin && formData.salaryMax) {
          if (Number(formData.salaryMin) >= Number(formData.salaryMax)) {
            newErrors.salary = 'Maximum salary must be greater than minimum';
          }
        }
        break;

      case 4:
        if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required';
        break;

      case 5:
        if (!formData.applicationDeadline) newErrors.applicationDeadline = 'Application deadline is required';
        const deadline = new Date(formData.applicationDeadline);
        if (deadline <= new Date()) newErrors.applicationDeadline = 'Deadline must be in the future';
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate between steps
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle array inputs (requirements, skills, etc.)
  const handleArrayInput = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  // Save as draft
  const saveDraft = async () => {
    // Prevent multiple submissions
    if (isSubmitting || loading) return;
    
    try {
      setLoading(true);
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to continue');
        navigate('/login', { replace: true });
        return;
      }

      const jobData = prepareJobData();
      jobData.status = 'draft';

      // Reduced logging for production
      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Saving draft:', jobData.title);
      }

      const response = await fetch('http://localhost:8080/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });
      
      const data = await response.json();

      if (response.ok) {
        alert('✅ Job saved as draft successfully!');
        
        // Add delay before navigation to prevent HMR issues
        setTimeout(() => {
          navigate('/employer/dashboard', { replace: true });
        }, 300);
      } else {
        // Show detailed error message
        const errorMsg = data.message || data.error || 'Failed to save draft';
        alert(`❌ Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert(`❌ Failed to save draft: ${error.message}`);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Submit for review
  const submitForReview = async () => {
    // Prevent multiple submissions
    if (isSubmitting || loading) return;
    
    // Validate all steps
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        alert(`⚠️ Please complete all required fields in Step ${i}`);
        return;
      }
    }

    if (credits <= 0) {
      alert('⚠️ You have no job post credits remaining. Please upgrade your subscription.');
      navigate('/subscription', { replace: true });
      return;
    }

    try {
      setLoading(true);
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to continue');
        navigate('/login', { replace: true });
        return;
      }

      const jobData = prepareJobData();
      jobData.status = 'pending'; // Pending moderation

      // Reduced logging for production
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 Submitting job:', jobData.title);
      }

      const response = await fetch('http://localhost:8080/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });
      
      const data = await response.json();

      if (response.ok) {
        alert('✅ Job submitted for review! It will be published within 1-2 business days.');
        
        // Add delay before navigation to prevent HMR issues
        setTimeout(() => {
          navigate('/employer/dashboard', { replace: true });
        }, 300);
      } else {
        // Show detailed error message
        const errorMsg = data.message || data.error || 'Failed to submit job';
        alert(`❌ Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      alert(`❌ Failed to submit job: ${error.message}`);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Prepare job data for submission
  const prepareJobData = () => {
    // Validate required fields
    if (!formData.title?.trim()) {
      throw new Error('Job title is required');
    }
    if (!formData.description?.trim()) {
      throw new Error('Job description is required');
    }
    if (!formData.location?.trim()) {
      throw new Error('Job location is required');
    }

    return {
      title: formData.title.trim(),
      category: formData.category || 'Other',
      type: formData.type || 'Full time',
      experienceLevel: formData.experienceLevel || 'Entry Level',
      description: formData.description.trim(),
      
      // Filter out empty array items
      requirements: formData.requirements.filter(r => r.trim()),
      responsibilities: formData.responsibilities.filter(r => r.trim()),
      skills: formData.skills.filter(s => s.trim()),
      benefits: formData.benefits.filter(b => b.trim()),
      certifications: formData.certifications.filter(c => c.trim()),
      languages: formData.languages.filter(l => l.trim()),
      
      location: formData.location.trim(),
      locationType: formData.locationType,
      
      salary: formData.salaryMin && formData.salaryMax 
        ? `${formData.salaryCurrency} ${formData.salaryMin} - ${formData.salaryMax} / ${formData.salaryPeriod}`
        : 'Competitive',
      
      salaryDetails: {
        min: Number(formData.salaryMin) || null,
        max: Number(formData.salaryMax) || null,
        currency: formData.salaryCurrency,
        period: formData.salaryPeriod,
        isVisible: true,
        isNegotiable: formData.salaryNegotiable
      },
      
      educationLevel: formData.educationLevel,
      fieldOfStudy: formData.fieldOfStudy || '',
      
      // Map frontend field name to backend
      vacancies: formData.numberOfVacancies || 1,
      
      // Application details
      expiresAt: formData.applicationDeadline || null,
      applicationQuestions: formData.applicationQuestions || '',
      
      status: formData.status,
    };
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo 
          formData={formData}
          errors={errors}
          handleChange={handleChange}
        />;
      case 2:
        return <Step2JobDetails
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          handleArrayInput={handleArrayInput}
          addArrayField={addArrayField}
          removeArrayField={removeArrayField}
        />;
      case 3:
        return <Step3Compensation
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          handleArrayInput={handleArrayInput}
          addArrayField={addArrayField}
          removeArrayField={removeArrayField}
        />;
      case 4:
        return <Step4Education
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          handleArrayInput={handleArrayInput}
          addArrayField={addArrayField}
          removeArrayField={removeArrayField}
        />;
      case 5:
        return <Step5Preview
          formData={formData}
          goToStep={goToStep}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="post-job-container">
      <div className="page-header">
        <h1>Post a New Job</h1>
        <p>Complete all steps to submit your job posting for review</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-steps">
          <div 
            className="progress-line" 
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
            <div 
              key={step}
              className={`step ${currentStep > step ? 'completed' : ''} ${currentStep === step ? 'active' : ''}`}
            >
              <div className="step-circle">
                {currentStep > step ? '' : step}
              </div>
              <div className="step-label">{getStepLabel(step)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="form-card">
        {renderStepContent()}
      
        {/* Navigation Buttons */}
        <div className="form-actions">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {currentStep > 1 && (
              <button 
                type="button"
                onClick={prevStep}
                className="btn-secondary"
                disabled={loading || isSubmitting}
              >
                ← Previous
              </button>
            )}
            <button 
              type="button"
              onClick={saveDraft}
              className="btn-save-draft"
              disabled={loading || isSubmitting}
            >
              {isSubmitting ? '💾 Saving...' : '💾 Save as Draft'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontSize: '0.95rem', color: '#6b7280', fontWeight: '600' }}>
              {credits} Credit{credits !== 1 ? 's' : ''} Available
            </div>
            {currentStep < totalSteps ? (
              <button 
                type="button"
                onClick={nextStep}
                className="btn-primary"
                disabled={loading || isSubmitting}
              >
                Next Step →
              </button>
            ) : (
              <button 
                type="button"
                onClick={submitForReview}
                className="btn-primary"
                disabled={loading || isSubmitting}
              >
                {isSubmitting ? '⏳ Submitting...' : '✓ Submit for Review'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get step labels
const getStepLabel = (step) => {
  const labels = {
    1: 'Basic Info',
    2: 'Job Details',
    3: 'Compensation',
    4: 'Qualifications',
    5: 'Review & Submit'
  };
  return labels[step] || '';
};

export default PostJob;
