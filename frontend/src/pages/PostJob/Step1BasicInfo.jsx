import React from 'react';

/**
 * Step 1: Basic Job Information
 * Collects essential job details following Jobstreet workflow
 */
const Step1BasicInfo = ({ formData, errors, handleChange }) => {
  return (
    <div className="form-step">
      <h2 className="step-title">Basic Job Information</h2>
      <p className="step-description">
        Let's start with the essential details about the position you're hiring for.
      </p>

      <div className="form-grid">
        {/* Job Title */}
        <div className="form-group full-width">
          <label htmlFor="title" className="form-label required">
            Job Position / Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Senior Full Stack Developer"
            className={`form-input ${errors.title ? 'error' : ''}`}
            maxLength={100}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
          <span className="field-hint">
            Be specific and include seniority level (e.g., Junior, Senior, Lead)
          </span>
        </div>

        {/* Job Category / Specialization */}
        <div className="form-group">
          <label htmlFor="category" className="form-label required">
            Job Category / Specialization
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`form-input ${errors.category ? 'error' : ''}`}
          >
            <option value="">Select a category</option>
            <option value="Software Development">Software Development</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="Data Science">Data Science & Analytics</option>
            <option value="DevOps">DevOps & Cloud</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Product Management">Product Management</option>
            <option value="Project Management">Project Management</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="Database Administration">Database Administration</option>
            <option value="Network Engineering">Network Engineering</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Business Analysis">Business Analysis</option>
            <option value="Sales & Marketing">Sales & Marketing</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance & Accounting">Finance & Accounting</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        {/* Employment Type */}
        <div className="form-group">
          <label htmlFor="type" className="form-label required">
            Employment Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-input"
          >
            <option value="Full time">Full Time</option>
            <option value="Part time">Part Time</option>
            <option value="Contract">Contract</option>
            <option value="Temporary">Temporary</option>
            <option value="Internship">Internship</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* Experience Level */}
        <div className="form-group">
          <label htmlFor="experienceLevel" className="form-label required">
            Years of Experience Required
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
            className={`form-input ${errors.experienceLevel ? 'error' : ''}`}
          >
            <option value="">Select experience level</option>
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="mid">Mid Level (2-5 years)</option>
            <option value="senior">Senior Level (5-10 years)</option>
            <option value="lead">Lead / Expert (10+ years)</option>
            <option value="executive">Executive Level</option>
          </select>
          {errors.experienceLevel && <span className="error-message">{errors.experienceLevel}</span>}
        </div>

        {/* Number of Vacancies */}
        <div className="form-group">
          <label htmlFor="numberOfVacancies" className="form-label required">
            Number of Vacancies
          </label>
          <input
            type="number"
            id="numberOfVacancies"
            name="numberOfVacancies"
            value={formData.numberOfVacancies}
            onChange={handleChange}
            min="1"
            max="100"
            className={`form-input ${errors.numberOfVacancies ? 'error' : ''}`}
          />
          {errors.numberOfVacancies && <span className="error-message">{errors.numberOfVacancies}</span>}
          <span className="field-hint">How many positions are you hiring for?</span>
        </div>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <div className="info-icon">💡</div>
        <div className="info-content">
          <h4>Tips for a Great Job Title</h4>
          <ul>
            <li>Include the seniority level (Junior, Mid, Senior)</li>
            <li>Be specific about the role (e.g., "Frontend Developer" not just "Developer")</li>
            <li>Avoid internal jargon or abbreviations</li>
            <li>Keep it under 60 characters for better visibility</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
