import React from 'react';

/**
 * Step 3: Compensation & Location
 * Salary, benefits, location, and work arrangements
 */
const Step3Compensation = ({ formData, errors, handleChange, handleArrayInput, addArrayField, removeArrayField }) => {
  return (
    <div className="form-step">
      <h2 className="step-title">💰 Compensation & Location</h2>
      <p className="step-description">
        Provide competitive compensation details and work location information.
      </p>

      {/* Salary Range */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="salaryMin" className="form-label required">
            Minimum Salary
          </label>
          <input
            type="number"
            id="salaryMin"
            name="salaryMin"
            value={formData.salaryMin}
            onChange={handleChange}
            placeholder="50000"
            className={`form-input ${errors.salaryMin ? 'error' : ''}`}
            min="0"
          />
          {errors.salaryMin && <span className="error-message">{errors.salaryMin}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="salaryMax" className="form-label required">
            Maximum Salary
          </label>
          <input
            type="number"
            id="salaryMax"
            name="salaryMax"
            value={formData.salaryMax}
            onChange={handleChange}
            placeholder="80000"
            className={`form-input ${errors.salaryMax ? 'error' : ''}`}
            min="0"
          />
          {errors.salaryMax && <span className="error-message">{errors.salaryMax}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="salaryCurrency" className="form-label required">
            Currency
          </label>
          <select
            id="salaryCurrency"
            name="salaryCurrency"
            value={formData.salaryCurrency}
            onChange={handleChange}
            className={`form-select ${errors.salaryCurrency ? 'error' : ''}`}
          >
            <option value="">Select Currency</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="SGD">SGD - Singapore Dollar</option>
            <option value="MYR">MYR - Malaysian Ringgit</option>
            <option value="PHP">PHP - Philippine Peso</option>
            <option value="INR">INR - Indian Rupee</option>
          </select>
          {errors.salaryCurrency && <span className="error-message">{errors.salaryCurrency}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="salaryPeriod" className="form-label required">
            Pay Period
          </label>
          <select
            id="salaryPeriod"
            name="salaryPeriod"
            value={formData.salaryPeriod}
            onChange={handleChange}
            className={`form-select ${errors.salaryPeriod ? 'error' : ''}`}
          >
            <option value="">Select Period</option>
            <option value="year">Per Year</option>
            <option value="month">Per Month</option>
            <option value="hour">Per Hour</option>
          </select>
          {errors.salaryPeriod && <span className="error-message">{errors.salaryPeriod}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="salaryNegotiable"
            checked={formData.salaryNegotiable}
            onChange={(e) => handleChange({ target: { name: 'salaryNegotiable', value: e.target.checked } })}
          />
          <span>Salary is negotiable based on experience</span>
        </label>
      </div>

      {/* Location */}
      <div className="form-group full-width">
        <label htmlFor="location" className="form-label required">
          Job Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, State/Province, Country (e.g., San Francisco, CA, USA)"
          className={`form-input ${errors.location ? 'error' : ''}`}
        />
        {errors.location && <span className="error-message">{errors.location}</span>}
        <span className="field-hint">
          For remote positions, you can specify "Remote" or "Remote - [Region]"
        </span>
      </div>

      {/* Location Type */}
      <div className="form-group full-width">
        <label className="form-label required">Work Arrangement</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="locationType"
              value="onsite"
              checked={formData.locationType === 'onsite'}
              onChange={handleChange}
            />
            <span className="radio-custom"></span>
            <div className="radio-text">
              <strong>On-site</strong>
              <small>Work from office full-time</small>
            </div>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="locationType"
              value="remote"
              checked={formData.locationType === 'remote'}
              onChange={handleChange}
            />
            <span className="radio-custom"></span>
            <div className="radio-text">
              <strong>Remote</strong>
              <small>Work from anywhere</small>
            </div>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="locationType"
              value="hybrid"
              checked={formData.locationType === 'hybrid'}
              onChange={handleChange}
            />
            <span className="radio-custom"></span>
            <div className="radio-text">
              <strong>Hybrid</strong>
              <small>Mix of remote and on-site</small>
            </div>
          </label>
        </div>
        {errors.locationType && <span className="error-message">{errors.locationType}</span>}
      </div>

      {/* Benefits */}
      <div className="form-group full-width">
        <label className="form-label">
          Benefits & Perks
        </label>
        <span className="field-hint mb-2">
          List the benefits and perks offered with this position
        </span>
        {formData.benefits.map((benefit, index) => (
          <div key={index} className="array-input-group">
            <input
              type="text"
              value={benefit}
              onChange={(e) => handleArrayInput('benefits', index, e.target.value)}
              placeholder={`Benefit ${index + 1} (e.g., Health Insurance, 401k, Remote Work)`}
              className="form-input"
            />
            <div className="array-actions">
              {formData.benefits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField('benefits', index)}
                  className="btn-remove"
                  title="Remove benefit"
                >
                  ✕
                </button>
              )}
              {index === formData.benefits.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayField('benefits')}
                  className="btn-add"
                  title="Add another benefit"
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
          <h4>Compensation Best Practices</h4>
          <ul>
            <li><strong>Be Transparent:</strong> Providing salary ranges increases application rates by 30%</li>
            <li><strong>Be Competitive:</strong> Research market rates for your location and industry</li>
            <li><strong>Highlight Benefits:</strong> Non-salary benefits can be a major deciding factor</li>
            <li><strong>Consider Total Comp:</strong> Include stock options, bonuses, or commission if applicable</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Step3Compensation;
