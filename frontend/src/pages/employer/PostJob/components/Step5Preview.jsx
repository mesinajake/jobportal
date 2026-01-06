import React from 'react';

/**
 * Step 5: Preview & Submit
 * Final review of all job details before submission
 */
const Step5Preview = ({ formData, goToStep }) => {
  // Format salary display
  const formatSalary = () => {
    if (!formData.salaryMin || !formData.salaryMax) return 'Not specified';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.salaryCurrency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    return `${formatter.format(formData.salaryMin)} - ${formatter.format(formData.salaryMax)} ${formData.salaryNegotiable ? '(Negotiable)' : ''} per ${formData.salaryPeriod}`;
  };

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="form-step preview-step">
      <h2 className="step-title">👀 Review Your Job Posting</h2>
      <p className="step-description">
        Please review all information carefully before submitting. You can edit any section by clicking the "Edit" button.
      </p>

      {/* Basic Information */}
      <div className="preview-section">
        <div className="preview-header">
          <h3>📋 Basic Information</h3>
          <button type="button" onClick={() => goToStep(1)} className="btn-edit">
            Edit
          </button>
        </div>
        <div className="preview-content">
          <div className="preview-item">
            <strong>Job Title:</strong>
            <span>{formData.title}</span>
          </div>
          <div className="preview-item">
            <strong>Category:</strong>
            <span>{formData.category}</span>
          </div>
          <div className="preview-item">
            <strong>Employment Type:</strong>
            <span className="badge">{formData.employmentType}</span>
          </div>
          <div className="preview-item">
            <strong>Experience Level:</strong>
            <span className="badge">{formData.experienceLevel}</span>
          </div>
          <div className="preview-item">
            <strong>Number of Vacancies:</strong>
            <span>{formData.vacancies}</span>
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="preview-section">
        <div className="preview-header">
          <h3>📝 Job Description</h3>
          <button type="button" onClick={() => goToStep(2)} className="btn-edit">
            Edit
          </button>
        </div>
        <div className="preview-content">
          <div className="preview-item full">
            <strong>Description:</strong>
            <p className="description-text">{formData.description}</p>
          </div>
          
          {formData.requirements.filter(r => r.trim()).length > 0 && (
            <div className="preview-item full">
              <strong>Requirements:</strong>
              <ul className="preview-list">
                {formData.requirements.filter(r => r.trim()).map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {formData.responsibilities.filter(r => r.trim()).length > 0 && (
            <div className="preview-item full">
              <strong>Responsibilities:</strong>
              <ul className="preview-list">
                {formData.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {formData.skills.filter(s => s.trim()).length > 0 && (
            <div className="preview-item full">
              <strong>Required Skills:</strong>
              <div className="skills-tags">
                {formData.skills.filter(s => s.trim()).map((skill, idx) => (
                  <span key={idx} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compensation & Location */}
      <div className="preview-section">
        <div className="preview-header">
          <h3>💰 Compensation & Location</h3>
          <button type="button" onClick={() => goToStep(3)} className="btn-edit">
            Edit
          </button>
        </div>
        <div className="preview-content">
          <div className="preview-item">
            <strong>Salary Range:</strong>
            <span>{formatSalary()}</span>
          </div>
          <div className="preview-item">
            <strong>Location:</strong>
            <span>{formData.location}</span>
          </div>
          <div className="preview-item">
            <strong>Work Arrangement:</strong>
            <span className="badge location-badge">{formData.locationType}</span>
          </div>
          
          {formData.benefits.filter(b => b.trim()).length > 0 && (
            <div className="preview-item full">
              <strong>Benefits & Perks:</strong>
              <ul className="preview-list benefits-list">
                {formData.benefits.filter(b => b.trim()).map((benefit, idx) => (
                  <li key={idx}>✓ {benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Education & Requirements */}
      <div className="preview-section">
        <div className="preview-header">
          <h3>🎓 Education & Additional Requirements</h3>
          <button type="button" onClick={() => goToStep(4)} className="btn-edit">
            Edit
          </button>
        </div>
        <div className="preview-content">
          <div className="preview-item">
            <strong>Education Level:</strong>
            <span>{formData.educationLevel}</span>
          </div>
          
          {formData.fieldOfStudy && (
            <div className="preview-item">
              <strong>Field of Study:</strong>
              <span>{formData.fieldOfStudy}</span>
            </div>
          )}

          {formData.certifications.filter(c => c.trim()).length > 0 && (
            <div className="preview-item full">
              <strong>Certifications:</strong>
              <div className="skills-tags">
                {formData.certifications.filter(c => c.trim()).map((cert, idx) => (
                  <span key={idx} className="cert-tag">{cert}</span>
                ))}
              </div>
            </div>
          )}

          {formData.languages.filter(l => l.trim()).length > 0 && (
            <div className="preview-item full">
              <strong>Language Requirements:</strong>
              <div className="languages-list">
                {formData.languages.filter(l => l.trim()).map((lang, idx) => (
                  <span key={idx} className="language-item">{lang}</span>
                ))}
              </div>
            </div>
          )}

          <div className="preview-item">
            <strong>Application Deadline:</strong>
            <span>{formatDate(formData.applicationDeadline)}</span>
          </div>

          {formData.applicationQuestions && (
            <div className="preview-item full">
              <strong>Screening Questions:</strong>
              <pre className="questions-text">{formData.applicationQuestions}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Submission Info */}
      <div className="info-box submission-info">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <h4>What Happens Next?</h4>
          <ol className="submission-steps">
            <li>
              <strong>Submission for Review:</strong> Your job posting will be submitted to our moderation team
            </li>
            <li>
              <strong>Quality Check:</strong> We'll review your posting within 1-2 business days to ensure it meets our quality standards
            </li>
            <li>
              <strong>Goes Live:</strong> Once approved, your job will be published and visible to thousands of job seekers
            </li>
            <li>
              <strong>Start Receiving Applications:</strong> You'll be notified via email when candidates apply
            </li>
          </ol>
          <p className="submission-note">
            💳 <strong>Credit Notice:</strong> One job posting credit will be deducted only after your posting is approved and goes live.
          </p>
        </div>
      </div>

      {/* Action Buttons - These are in the parent component */}
    </div>
  );
};

export default Step5Preview;
