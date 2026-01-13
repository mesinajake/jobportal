import { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'JobPortal',
    siteEmail: 'admin@jobportal.com',
    allowRegistration: true,
    requireEmailVerification: true,
    maxJobsPerEmployer: 10,
    applicationDeadlineDays: 30
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Save settings to API
    alert('Settings saved successfully!');
  };

  return (
    <div className="admin-settings">
      <h1>System Settings</h1>

      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <h2>General Settings</h2>
          
          <div className="form-group">
            <label htmlFor="siteName">Site Name</label>
            <input
              type="text"
              id="siteName"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="siteEmail">Admin Email</label>
            <input
              type="email"
              id="siteEmail"
              name="siteEmail"
              value={settings.siteEmail}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Registration Settings</h2>
          
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="allowRegistration"
              name="allowRegistration"
              checked={settings.allowRegistration}
              onChange={handleChange}
            />
            <label htmlFor="allowRegistration">Allow New Registrations</label>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="requireEmailVerification"
              name="requireEmailVerification"
              checked={settings.requireEmailVerification}
              onChange={handleChange}
            />
            <label htmlFor="requireEmailVerification">Require Email Verification</label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Job Settings</h2>
          
          <div className="form-group">
            <label htmlFor="maxJobsPerEmployer">Max Jobs Per Employer</label>
            <input
              type="number"
              id="maxJobsPerEmployer"
              name="maxJobsPerEmployer"
              value={settings.maxJobsPerEmployer}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="applicationDeadlineDays">Default Application Deadline (days)</label>
            <input
              type="number"
              id="applicationDeadlineDays"
              name="applicationDeadlineDays"
              value={settings.applicationDeadlineDays}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="save-btn">Save Settings</button>
      </form>
    </div>
  );
};

export default Settings;
