import React from 'react';

/**
 * Step 4: Education & Additional Requirements
 * Education level, field of study, certifications, languages
 */
const Step4Education = ({ formData, errors, handleChange, handleArrayInput, addArrayField, removeArrayField }) => {
  return (
    <div className="form-step">
      <h2 className="step-title">🎓 Education & Additional Requirements</h2>
      <p className="step-description">
        Specify educational requirements and additional qualifications for this role.
      </p>

      {/* Education Level */}
      <div className="form-group full-width">
        <label htmlFor="educationLevel" className="form-label required">
          Minimum Education Level
        </label>
        <select
          id="educationLevel"
          name="educationLevel"
          value={formData.educationLevel}
          onChange={handleChange}
          className={`form-select ${errors.educationLevel ? 'error' : ''}`}
        >
          <option value="">Select Minimum Education</option>
          <option value="High School">High School Diploma / GED</option>
          <option value="Associate">Associate Degree</option>
          <option value="Bachelor">Bachelor's Degree</option>
          <option value="Master">Master's Degree</option>
          <option value="PhD">Ph.D. / Doctorate</option>
          <option value="Certification">Professional Certification</option>
          <option value="No Degree Required">No Degree Required</option>
        </select>
        {errors.educationLevel && <span className="error-message">{errors.educationLevel}</span>}
        <span className="field-hint">
          Select the minimum educational qualification required for this position
        </span>
      </div>

      {/* Field of Study */}
      <div className="form-group full-width">
        <label htmlFor="fieldOfStudy" className="form-label">
          Preferred Field of Study
        </label>
        <input
          type="text"
          id="fieldOfStudy"
          name="fieldOfStudy"
          value={formData.fieldOfStudy}
          onChange={handleChange}
          placeholder="e.g., Computer Science, Engineering, Business Administration"
          className="form-input"
        />
        <span className="field-hint">
          Optional: Specify if a particular field of study is preferred or required
        </span>
      </div>

      {/* Professional Certifications */}
      <div className="form-group full-width">
        <label className="form-label">
          Professional Certifications
        </label>
        <span className="field-hint mb-2">
          List any certifications that would be beneficial for this role
        </span>
        {formData.certifications.map((certification, index) => (
          <div key={index} className="array-input-group">
            <input
              type="text"
              value={certification}
              onChange={(e) => handleArrayInput('certifications', index, e.target.value)}
              placeholder={`Certification ${index + 1} (e.g., AWS Certified Solutions Architect, PMP)`}
              className="form-input"
            />
            <div className="array-actions">
              {formData.certifications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField('certifications', index)}
                  className="btn-remove"
                  title="Remove certification"
                >
                  ✕
                </button>
              )}
              {index === formData.certifications.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayField('certifications')}
                  className="btn-add"
                  title="Add another certification"
                >
                  + Add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Language Requirements */}
      <div className="form-group full-width">
        <label className="form-label">
          Language Requirements
        </label>
        <span className="field-hint mb-2">
          Specify languages required or beneficial for this position
        </span>
        {formData.languages.map((language, index) => (
          <div key={index} className="array-input-group language-input">
            <input
              type="text"
              value={language.split(' - ')[0] || language}
              onChange={(e) => {
                const proficiency = language.split(' - ')[1] || 'Fluent';
                handleArrayInput('languages', index, `${e.target.value} - ${proficiency}`);
              }}
              placeholder={`Language ${index + 1} (e.g., English)`}
              className="form-input language-name"
            />
            <select
              value={language.split(' - ')[1] || 'Fluent'}
              onChange={(e) => {
                const langName = language.split(' - ')[0] || language;
                handleArrayInput('languages', index, `${langName} - ${e.target.value}`);
              }}
              className="form-select language-proficiency"
            >
              <option value="Basic">Basic</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Fluent">Fluent</option>
              <option value="Native">Native</option>
            </select>
            <div className="array-actions">
              {formData.languages.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField('languages', index)}
                  className="btn-remove"
                  title="Remove language"
                >
                  ✕
                </button>
              )}
              {index === formData.languages.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayField('languages', 'English - Fluent')}
                  className="btn-add"
                  title="Add another language"
                >
                  + Add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Application Deadline */}
      <div className="form-group full-width">
        <label htmlFor="applicationDeadline" className="form-label">
          Application Deadline
        </label>
        <input
          type="date"
          id="applicationDeadline"
          name="applicationDeadline"
          value={formData.applicationDeadline}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          className="form-input"
        />
        <span className="field-hint">
          Optional: Set a deadline for applications. Leave empty for no deadline.
        </span>
      </div>

      {/* Additional Questions */}
      <div className="form-group full-width">
        <label htmlFor="applicationQuestions" className="form-label">
          Screening Questions
        </label>
        <textarea
          id="applicationQuestions"
          name="applicationQuestions"
          value={formData.applicationQuestions}
          onChange={handleChange}
          placeholder="Add any screening questions you'd like applicants to answer (one per line):

Example:
- Why are you interested in this position?
- What is your expected salary range?
- When are you available to start?
- Do you have authorization to work in [country]?"
          className="form-textarea"
          rows={8}
        />
        <span className="field-hint">
          Optional: Add questions to help screen applicants beyond their resume
        </span>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <div className="info-icon">💡</div>
        <div className="info-content">
          <h4>Education Requirements Tips</h4>
          <ul>
            <li><strong>Be Realistic:</strong> Only require degrees if truly necessary for the role</li>
            <li><strong>Experience Equivalent:</strong> Consider stating "or equivalent experience"</li>
            <li><strong>Certifications:</strong> List required vs. preferred certifications separately</li>
            <li><strong>Language Skills:</strong> Be specific about proficiency levels needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Step4Education;
