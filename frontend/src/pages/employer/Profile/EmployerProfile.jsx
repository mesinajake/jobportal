import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import './EmployerProfile.css';

/**
 * EmployerProfile Component
 * Company profile management for employers
 */
const EmployerProfile = () => {
  const { user } = useAuth();
  const logoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  // Company Information
  const [companyData, setCompanyData] = useState({
    companyName: '',
    logo: null,
    industry: '',
    companySize: '',
    foundedYear: '',
    website: '',
    description: '',
    tagline: ''
  });

  // Contact Information
  const [contactInfo, setContactInfo] = useState({
    businessEmail: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  });

  // Primary Contact Person
  const [primaryContact, setPrimaryContact] = useState({
    contactName: '',
    position: '',
    email: '',
    phone: ''
  });

  // Social Media
  const [socialMedia, setSocialMedia] = useState({
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: ''
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    newApplications: true,
    candidateMessages: true,
    dailyDigest: false,
    weeklyReport: true
  });

  // UI State
  const [activeTab, setActiveTab] = useState('company');
  const [logoPreview, setLogoPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('unverified');

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const token = localStorage.getItem('token');
      const companyStorage = localStorage.getItem('company');
      
      if (companyStorage) {
        const company = JSON.parse(companyStorage);
        setCompanyData({
          companyName: company.name || '',
          industry: company.industry || '',
          companySize: company.companySize || '',
          foundedYear: company.foundedYear || '',
          website: company.website || '',
          description: company.description || '',
          tagline: company.tagline || ''
        });
        setVerificationStatus(company.isVerified ? 'verified' : 'unverified');
      }

      // Set user contact info
      if (user) {
        setPrimaryContact({
          contactName: user.name || '',
          position: user.position || '',
          email: user.email || '',
          phone: user.phone || ''
        });
      }
    } catch (error) {
      showMessage('Error loading company data', 'error');
    }
  };

  const handleCompanyChange = (field, value) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePrimaryContactChange = (field, value) => {
    setPrimaryContact(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (field, value) => {
    setSocialMedia(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showMessage('Logo size should be less than 2MB', 'error');
        return;
      }
      setCompanyData(prev => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Add company data
      Object.keys(companyData).forEach(key => {
        if (companyData[key] && key !== 'logo') {
          formData.append(key, companyData[key]);
        }
      });

      if (companyData.logo instanceof File) {
        formData.append('logo', companyData.logo);
      }

      // Add contact info
      Object.keys(contactInfo).forEach(key => {
        if (contactInfo[key]) {
          formData.append(key, contactInfo[key]);
        }
      });

      // Add social media
      formData.append('socialMedia', JSON.stringify(socialMedia));
      
      // Add notifications
      formData.append('notifications', JSON.stringify(notifications));

      const response = await fetch('http://localhost:8080/api/company/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        showMessage('Profile updated successfully!', 'success');
        localStorage.setItem('company', JSON.stringify(data.data));
      } else {
        showMessage(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showMessage('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const industryOptions = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
    'Manufacturing', 'Real Estate', 'Marketing', 'Consulting', 'Other'
  ];

  const companySizeOptions = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
  ];

  return (
    <div className="employer-profile">
      <div className="profile-header">
        <h1>Company Profile</h1>
        <div className="verification-status">
          {verificationStatus === 'verified' ? (
            <span className="verified-badge">✓ Verified</span>
          ) : (
            <span className="unverified-badge">⚠ Unverified</span>
          )}
        </div>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          Company Info
        </button>
        <button
          className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact Details
        </button>
        <button
          className={`tab ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          Social Media
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        
        {/* Company Info Tab */}
        {activeTab === 'company' && (
          <div className="tab-content">
            <section className="form-section">
              <h2>Company Information</h2>
              
              {/* Logo Upload */}
              <div className="form-group logo-upload">
                <label>Company Logo</label>
                <div className="logo-container">
                  <div className="logo-preview">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Company logo" />
                    ) : (
                      <div className="logo-placeholder">🏢</div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={handleLogoChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="btn-secondary"
                  >
                    Upload Logo
                  </button>
                  <span className="help-text">Max 2MB • PNG, JPG, SVG</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    value={companyData.companyName}
                    onChange={(e) => handleCompanyChange('companyName', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="industry">Industry *</label>
                  <select
                    id="industry"
                    value={companyData.industry}
                    onChange={(e) => handleCompanyChange('industry', e.target.value)}
                    required
                  >
                    <option value="">Select Industry</option>
                    {industryOptions.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companySize">Company Size</label>
                  <select
                    id="companySize"
                    value={companyData.companySize}
                    onChange={(e) => handleCompanyChange('companySize', e.target.value)}
                  >
                    <option value="">Select Size</option>
                    {companySizeOptions.map(size => (
                      <option key={size} value={size}>{size} employees</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="foundedYear">Founded Year</label>
                  <input
                    type="number"
                    id="foundedYear"
                    value={companyData.foundedYear}
                    onChange={(e) => handleCompanyChange('foundedYear', e.target.value)}
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="website">Website URL</label>
                <input
                  type="url"
                  id="website"
                  value={companyData.website}
                  onChange={(e) => handleCompanyChange('website', e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tagline">Company Tagline</label>
                <input
                  type="text"
                  id="tagline"
                  value={companyData.tagline}
                  onChange={(e) => handleCompanyChange('tagline', e.target.value)}
                  placeholder="A brief, catchy tagline"
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Company Description</label>
                <textarea
                  id="description"
                  value={companyData.description}
                  onChange={(e) => handleCompanyChange('description', e.target.value)}
                  rows="6"
                  placeholder="Tell candidates about your company, culture, and mission..."
                />
              </div>
            </section>
          </div>
        )}

        {/* Contact Details Tab */}
        {activeTab === 'contact' && (
          <div className="tab-content">
            <section className="form-section">
              <h2>Primary Contact</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactName">Contact Person Name</label>
                  <input
                    type="text"
                    id="contactName"
                    value={primaryContact.contactName}
                    onChange={(e) => handlePrimaryContactChange('contactName', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="position">Job Title</label>
                  <input
                    type="text"
                    id="position"
                    value={primaryContact.position}
                    onChange={(e) => handlePrimaryContactChange('position', e.target.value)}
                    placeholder="e.g., HR Manager"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactEmail">Email</label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={primaryContact.email}
                    onChange={(e) => handlePrimaryContactChange('email', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactPhone">Phone</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    value={primaryContact.phone}
                    onChange={(e) => handlePrimaryContactChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2>Business Address</h2>
              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input
                  type="text"
                  id="address"
                  value={contactInfo.address}
                  onChange={(e) => handleContactChange('address', e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    value={contactInfo.city}
                    onChange={(e) => handleContactChange('city', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">State/Province</label>
                  <input
                    type="text"
                    id="state"
                    value={contactInfo.state}
                    onChange={(e) => handleContactChange('state', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    value={contactInfo.country}
                    onChange={(e) => handleContactChange('country', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="zipCode">ZIP/Postal Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    value={contactInfo.zipCode}
                    onChange={(e) => handleContactChange('zipCode', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="businessEmail">Business Email</label>
                  <input
                    type="email"
                    id="businessEmail"
                    value={contactInfo.businessEmail}
                    onChange={(e) => handleContactChange('businessEmail', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Business Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    value={contactInfo.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="tab-content">
            <section className="form-section">
              <h2>Social Media Links</h2>
              <p className="section-description">Connect your company's social media profiles to build trust with candidates</p>

              <div className="form-group">
                <label htmlFor="linkedin">
                  <span className="social-icon">🔗</span> LinkedIn Company Page
                </label>
                <input
                  type="url"
                  id="linkedin"
                  value={socialMedia.linkedin}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/your-company"
                />
              </div>

              <div className="form-group">
                <label htmlFor="twitter">
                  <span className="social-icon">🐦</span> Twitter/X
                </label>
                <input
                  type="url"
                  id="twitter"
                  value={socialMedia.twitter}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/yourcompany"
                />
              </div>

              <div className="form-group">
                <label htmlFor="facebook">
                  <span className="social-icon">📘</span> Facebook
                </label>
                <input
                  type="url"
                  id="facebook"
                  value={socialMedia.facebook}
                  onChange={(e) => handleSocialChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourcompany"
                />
              </div>

              <div className="form-group">
                <label htmlFor="instagram">
                  <span className="social-icon">📷</span> Instagram
                </label>
                <input
                  type="url"
                  id="instagram"
                  value={socialMedia.instagram}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourcompany"
                />
              </div>
            </section>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="tab-content">
            <section className="form-section">
              <h2>Notification Preferences</h2>
              <p className="section-description">Choose how you want to receive updates</p>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notifications.newApplications}
                    onChange={(e) => handleNotificationChange('newApplications', e.target.checked)}
                  />
                  <span>Email me when someone applies to my jobs</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notifications.candidateMessages}
                    onChange={(e) => handleNotificationChange('candidateMessages', e.target.checked)}
                  />
                  <span>Email me when candidates send messages</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notifications.dailyDigest}
                    onChange={(e) => handleNotificationChange('dailyDigest', e.target.checked)}
                  />
                  <span>Send me a daily digest of new applications</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notifications.weeklyReport}
                    onChange={(e) => handleNotificationChange('weeklyReport', e.target.checked)}
                  />
                  <span>Send me a weekly hiring report</span>
                </label>
              </div>
            </section>

            {verificationStatus === 'unverified' && (
              <section className="form-section verification-section">
                <h2>Company Verification</h2>
                <div className="verification-info">
                  <span className="verification-icon">🔒</span>
                  <div>
                    <h3>Get Verified</h3>
                    <p>Verified companies get a trust badge and higher visibility. Upload business documents to start verification.</p>
                  </div>
                </div>
                <button type="button" className="btn-secondary" onClick={() => documentInputRef.current?.click()}>
                  Upload Documents
                </button>
                <input
                  type="file"
                  ref={documentInputRef}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  multiple
                />
              </section>
            )}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployerProfile;
