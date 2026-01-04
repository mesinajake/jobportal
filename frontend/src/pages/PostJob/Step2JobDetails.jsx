import React from 'react';

/**
 * Step 2: Detailed Job Description
 * Comprehensive job details, requirements, and responsibilities
 */
const Step2JobDetails = ({ 
  formData, 
  errors, 
  handleChange, 
  handleArrayInput, 
  addArrayField, 
  removeArrayField 
}) => {
  return (
    <div className="form-step">
      <h2 className="step-title">📝 Job Description & Requirements</h2>
      <p className="step-description">
        Provide detailed information about the role to attract the right candidates.
      </p>

      {/* Job Description */}
      <div className="form-group full-width">
        <label htmlFor="description" className="form-label required">
          Job Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the role, day-to-day responsibilities, team structure, and what makes this opportunity exciting...

Example:
We are seeking a talented Full Stack Developer to join our growing engineering team. You will work on building scalable web applications, collaborating with cross-functional teams, and contributing to technical decisions.

Your typical day will involve writing clean code, participating in code reviews, and solving complex technical challenges in a fast-paced environment."
          className={`form-textarea ${errors.description ? 'error' : ''}`}
          rows={10}
          maxLength={5000}
        />
        <div className="textarea-footer">
          {errors.description && <span className="error-message">{errors.description}</span>}
          <span className="char-count">{formData.description.length} / 5000 characters</span>
        </div>
        <span className="field-hint">
          Include company overview, role purpose, team size, and growth opportunities
        </span>
      </div>

      {/* Job Requirements */}
      <div className="form-group full-width">
        <label className="form-label required">
          Job Requirements (Minimum Qualifications)
        </label>
        <span className="field-hint mb-2">
          List the must-have qualifications and experience
        </span>
        {formData.requirements.map((requirement, index) => (
          <div key={index} className="array-input-group">
            <input
              type="text"
              value={requirement}
              onChange={(e) => handleArrayInput('requirements', index, e.target.value)}
              placeholder={`Requirement ${index + 1} (e.g., 5+ years experience with React)`}
              className="form-input"
            />
            <div className="array-actions">
              {formData.requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField('requirements', index)}
                  className="btn-remove"
                  title="Remove requirement"
                >
                  ✕
                </button>
              )}
              {index === formData.requirements.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayField('requirements')}
                  className="btn-add"
                  title="Add another requirement"
                >
                  + Add
                </button>
              )}
            </div>
          </div>
        ))}
        {errors.requirements && <span className="error-message">{errors.requirements}</span>}
      </div>

      {/* Job Responsibilities */}
      <div className="form-group full-width">
        <label className="form-label required">
          Key Responsibilities
        </label>
        <span className="field-hint mb-2">
          What will the candidate be doing on a day-to-day basis?
        </span>
        {formData.responsibilities.map((responsibility, index) => (
          <div key={index} className="array-input-group">
            <input
              type="text"
              value={responsibility}
              onChange={(e) => handleArrayInput('responsibilities', index, e.target.value)}
              placeholder={`Responsibility ${index + 1} (e.g., Design and develop new features)`}
              className="form-input"
            />
            <div className="array-actions">
              {formData.responsibilities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField('responsibilities', index)}
                  className="btn-remove"
                  title="Remove responsibility"
                >
                  ✕
                </button>
              )}
              {index === formData.responsibilities.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayField('responsibilities')}
                  className="btn-add"
                  title="Add another responsibility"
                >
                  + Add
                </button>
              )}
            </div>
          </div>
        ))}
        {errors.responsibilities && <span className="error-message">{errors.responsibilities}</span>}
      </div>

      {/* Required Skills */}
      <div className="form-group full-width">
        <label className="form-label">
          Required Skills & Technologies
        </label>
        <span className="field-hint mb-2">
          List specific technical skills, tools, and technologies
        </span>
        {formData.skills.map((skill, index) => (
          <div key={index} className="array-input-group">
            <input
              type="text"
              value={skill}
              onChange={(e) => handleArrayInput('skills', index, e.target.value)}
              placeholder={`Skill ${index + 1} (e.g., React, Node.js, MongoDB)`}
              className="form-input"
            />
            <div className="array-actions">
              {formData.skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField('skills', index)}
                  className="btn-remove"
                  title="Remove skill"
                >
                  ✕
                </button>
              )}
              {index === formData.skills.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayField('skills')}
                  className="btn-add"
                  title="Add another skill"
                >
                  + Add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="info-box">
        <div className="info-icon">💡</div>
        <div className="info-content">
          <h4>Writing Effective Job Descriptions</h4>
          <ul>
            <li><strong>Be Clear:</strong> Use simple language and avoid jargon</li>
            <li><strong>Be Specific:</strong> Quantify requirements when possible (e.g., "3+ years")</li>
            <li><strong>Be Honest:</strong> Differentiate between "required" and "nice to have"</li>
            <li><strong>Sell the Role:</strong> Highlight what makes your company and role unique</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Step2JobDetails;
