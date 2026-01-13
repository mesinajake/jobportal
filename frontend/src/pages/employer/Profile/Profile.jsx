import { useEffect, useState, useRef, useCallback } from 'react'
import './Profile.css'
import { useAuth } from '@/context/AuthContext'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)
  const resumeInputRef = useRef(null)
  const autoSaveTimerRef = useRef(null)
  const lastSavedRef = useRef(null)
  
  // Basic Info
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  
  // Profile Settings
  const [publicProfile, setPublicProfile] = useState(true)
  
  // Job Preferences
  const [preferredLocations, setPreferredLocations] = useState('')
  const [jobTypes, setJobTypes] = useState([])
  const [industries, setIndustries] = useState([])
  const [desiredRoles, setDesiredRoles] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [availabilityDate, setAvailabilityDate] = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState(false)
  
  // Skills
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [skillLevel, setSkillLevel] = useState('intermediate')
  
  // Experience
  const [experience, setExperience] = useState([])
  const [showExpForm, setShowExpForm] = useState(false)
  
  // Education
  const [education, setEducation] = useState([])
  const [showEduForm, setShowEduForm] = useState(false)
  
  // Portfolio Links
  const [portfolioLinks, setPortfolioLinks] = useState({
    linkedin: '',
    github: '',
    portfolio: '',
    other: ''
  })
  
  // Resume
  const [resume, setResume] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [showResumePreview, setShowResumePreview] = useState(false)
  
  // Languages
  const [languages, setLanguages] = useState([])
  const [newLanguage, setNewLanguage] = useState('')
  const [languageProficiency, setLanguageProficiency] = useState('intermediate')
  
  // UI State
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaved, setLastSaved] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize profile data from user ONLY on first load
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Reset initialization when user changes (logout/login)
  useEffect(() => {
    if (!user) {
      console.log('🔄 Profile: User logged out, resetting initialization')
      setIsInitialized(false)
    }
  }, [user])
  
  useEffect(() => {
    if (user && !isInitialized) {
      console.log('🔄 Profile: Initializing with user data:', user)
      
      // Helper to construct full URL for uploaded files
      const getFullUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path; // Already full URL
        if (path.startsWith('/uploads')) {
          return `http://localhost:8080${path}`; // Add base URL
        }
        return path;
      };
      
      const userData = {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.bio || '',
        avatarPreview: getFullUrl(user?.avatar),
        publicProfile: user?.publicProfile ?? true,
        preferredLocations: user?.preferredLocations || '',
        jobTypes: Array.isArray(user?.jobTypes) ? user.jobTypes : [],
        industries: Array.isArray(user?.industries) ? user.industries : [],
        desiredRoles: user?.desiredRoles || '',
        salaryMin: user?.salaryMin || '',
        salaryMax: user?.salaryMax || '',
        availabilityDate: user?.availabilityDate || '',
        willingToRelocate: user?.willingToRelocate || false,
        skills: Array.isArray(user?.skills) ? user.skills : [],
        experience: Array.isArray(user?.experience) ? user.experience : [],
        education: Array.isArray(user?.education) ? user.education : [],
        portfolioLinks: user?.portfolioLinks || { linkedin: '', github: '', portfolio: '', other: '' },
        resume: user?.resume ? {
          ...user.resume,
          url: getFullUrl(user.resume.url)
        } : null,
        languages: Array.isArray(user?.languages) ? user.languages : []
      }
      
      console.log('📝 Profile: Setting form fields with:', userData)
      console.log('🖼️ Profile: Avatar URL:', userData.avatarPreview)
      console.log('📄 Profile: Resume URL:', userData.resume?.url)
      
      setName(userData.name)
      setEmail(userData.email)
      setPhone(userData.phone)
      setLocation(userData.location)
      setBio(userData.bio)
      setAvatarPreview(userData.avatarPreview)
      setPublicProfile(userData.publicProfile)
      setPreferredLocations(userData.preferredLocations)
      setJobTypes(userData.jobTypes)
      setIndustries(userData.industries)
      setDesiredRoles(userData.desiredRoles)
      setSalaryMin(userData.salaryMin)
      setSalaryMax(userData.salaryMax)
      setAvailabilityDate(userData.availabilityDate)
      setWillingToRelocate(userData.willingToRelocate)
      setSkills(userData.skills)
      setExperience(userData.experience)
      setEducation(userData.education)
      setPortfolioLinks(userData.portfolioLinks)
      setResume(userData.resume)
      setLanguages(userData.languages)
      
      // Store initial state for comparison
      lastSavedRef.current = JSON.stringify(userData)
      setLastSaved(new Date())
      setIsInitialized(true)
      console.log('✅ Profile: Initialization complete')
    }
  }, [user, isInitialized])
  
  // Calculate profile completion
  useEffect(() => {
    let completion = 0
    const fields = [
      name, email, phone, location, bio,
      avatarPreview, jobTypes.length > 0, skills.length > 0,
      experience.length > 0, education.length > 0, resume,
      portfolioLinks.linkedin || portfolioLinks.github
    ]
    const filledFields = fields.filter(f => f).length
    completion = Math.round((filledFields / fields.length) * 100)
    setProfileCompletion(completion)
  }, [name, email, phone, location, bio, avatarPreview, jobTypes, skills, experience, education, resume, portfolioLinks])

  // Detect unsaved changes
  useEffect(() => {
    // Don't trigger change detection until initialization is complete
    if (!isInitialized || !lastSavedRef.current) {
      console.log('⏸️ Profile: Skipping change detection - not initialized yet')
      return
    }
    
    const currentData = JSON.stringify({
      name, email, phone, location, bio,
      publicProfile, preferredLocations, jobTypes, industries,
      desiredRoles, salaryMin, salaryMax, availabilityDate,
      willingToRelocate, skills, experience, education,
      portfolioLinks, resume, languages
    })
    
    const hasChanges = currentData !== lastSavedRef.current
    console.log('🔍 Profile: Checking for changes:', {
      hasChanges,
      isInitialized,
      currentDataLength: currentData.length,
      lastSavedLength: lastSavedRef.current?.length
    })
    setHasUnsavedChanges(hasChanges)
    
    // Trigger auto-save if changes detected
    if (hasChanges && autoSaveEnabled) {
      console.log('⚡ Profile: Triggering auto-save')
      triggerAutoSave()
    }
  }, [name, email, phone, location, bio, publicProfile, preferredLocations, 
      jobTypes, industries, desiredRoles, salaryMin, salaryMax, availabilityDate,
      willingToRelocate, skills, experience, education, portfolioLinks, resume, 
      languages, autoSaveEnabled, isInitialized])

  // Auto-save function with debounce
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      if (hasUnsavedChanges && !isSaving) {
        saveProfile(true) // true = silent save (no toast)
      }
    }, 2000) // Save after 2 seconds of inactivity
  }, [hasUnsavedChanges, isSaving])

  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  // Warn user about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && !autoSaveEnabled) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, autoSaveEnabled])

  const allJobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid', 'Freelance', 'Internship']
  const allIndustries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Sales', 'Manufacturing', 'Retail', 'Hospitality', 'Other']
  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert']
  const proficiencyLevels = ['basic', 'conversational', 'fluent', 'native']

  const toggleJobType = (t) => {
    setJobTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }
  
  const toggleIndustry = (ind) => {
    setIndustries(prev => prev.includes(ind) ? prev.filter(x => x !== ind) : [...prev, ind])
  }
  
  // Avatar handling
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showMessage('Image size must be less than 5MB', 'error')
        return
      }
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  // Resume handling
  const handleResumeChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showMessage('Resume size must be less than 10MB', 'error')
        return
      }
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        showMessage('Only PDF and Word documents are allowed', 'error')
        return
      }
      
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file)
      
      setResumeFile(file)
      setResume({ 
        filename: file.name, 
        uploadedAt: new Date(),
        url: tempUrl // Temporary URL for immediate preview
      })
      
      showMessage('Resume selected! Click "Preview" to verify before saving.', 'success')
    }
  }
  
  // Skills handling
  const addSkill = () => {
    if (newSkill.trim() && !skills.find(s => s.name.toLowerCase() === newSkill.toLowerCase())) {
      setSkills([...skills, { name: newSkill.trim(), level: skillLevel }])
      setNewSkill('')
      setSkillLevel('intermediate')
    }
  }
  
  const removeSkill = (skillName) => {
    setSkills(skills.filter(s => s.name !== skillName))
  }
  
  // Experience handling
  const addExperience = (exp) => {
    setExperience([...experience, { ...exp, id: Date.now() }])
    setShowExpForm(false)
  }
  
  const removeExperience = (id) => {
    setExperience(experience.filter(e => e.id !== id))
  }
  
  // Education handling
  const addEducation = (edu) => {
    setEducation([...education, { ...edu, id: Date.now() }])
    setShowEduForm(false)
  }
  
  const removeEducation = (id) => {
    setEducation(education.filter(e => e.id !== id))
  }
  
  // Language handling
  const addLanguage = () => {
    if (newLanguage.trim() && !languages.find(l => l.name.toLowerCase() === newLanguage.toLowerCase())) {
      setLanguages([...languages, { name: newLanguage.trim(), proficiency: languageProficiency }])
      setNewLanguage('')
      setLanguageProficiency('intermediate')
    }
  }
  
  const removeLanguage = (langName) => {
    setLanguages(languages.filter(l => l.name !== langName))
  }
  
  const showMessage = (msg, type = 'success') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  // Main save function
  const saveProfile = async (silent = false) => {
    if (isSaving) return // Prevent multiple simultaneous saves
    
    console.log('💾 Profile: Starting save...')
    setIsSaving(true)
    if (!silent) setLoading(true)
    
    try {
      // Create FormData for file uploads
      const formData = new FormData()
      
      // Add all text fields
      formData.append('name', name)
      formData.append('email', email)
      formData.append('phone', phone || '')
      formData.append('location', location || '')
      formData.append('bio', bio || '')
      formData.append('publicProfile', publicProfile)
      formData.append('preferredLocations', preferredLocations || '')
      formData.append('desiredRoles', desiredRoles || '')
      formData.append('salaryMin', salaryMin || '')
      formData.append('salaryMax', salaryMax || '')
      formData.append('availabilityDate', availabilityDate || '')
      formData.append('willingToRelocate', willingToRelocate)
      
      // Add arrays as JSON strings
      formData.append('jobTypes', JSON.stringify(jobTypes))
      formData.append('industries', JSON.stringify(industries))
      formData.append('skills', JSON.stringify(skills))
      formData.append('experience', JSON.stringify(experience))
      formData.append('education', JSON.stringify(education))
      formData.append('languages', JSON.stringify(languages))
      formData.append('portfolioLinks', JSON.stringify(portfolioLinks))
      
      // Add resume info if exists (but not the file)
      if (resume) {
        formData.append('resume', JSON.stringify(resume))
      }
      
      // Add files if they exist
      if (avatar) {
        console.log('� Adding avatar file to FormData')
        formData.append('avatar', avatar)
      }
      
      if (resumeFile) {
        console.log('📎 Adding resume file to FormData')
        formData.append('resume', resumeFile)
      }
      
      console.log('📤 Profile: Sending FormData to backend')
      
      await updateUser(formData)
      
      console.log('✅ Profile: Save successful!')
      
      // Create a plain object for comparison (excluding files)
      const profileData = {
        name, email, phone, location, bio,
        publicProfile, preferredLocations, jobTypes, industries,
        desiredRoles, salaryMin, salaryMax, availabilityDate,
        willingToRelocate, skills, experience, education,
        portfolioLinks, resume, languages
      }
      
      // Update last saved reference
      lastSavedRef.current = JSON.stringify(profileData)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      
      // Clear file selections after successful upload
      if (avatar) setAvatar(null)
      if (resumeFile) setResumeFile(null)
      
      if (!silent) {
        showMessage('Profile saved successfully!', 'success')
      }
      
      return true
    } catch (error) {
      console.error('❌ Profile: Save failed:', error)
      if (!silent) {
        showMessage(error.message || 'Failed to save profile. Please try again.', 'error')
      }
      return false
    } finally {
      setIsSaving(false)
      if (!silent) setLoading(false)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    await saveProfile(false)
  }

  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return ''
    
    const now = new Date()
    const diff = Math.floor((now - lastSaved) / 1000) // seconds
    
    if (diff < 60) return 'Saved just now'
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `Saved ${Math.floor(diff / 3600)} hours ago`
    return `Saved on ${lastSaved.toLocaleDateString()}`
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="header-content">
          <div className="header-left">
            <h2>My Profile</h2>
            <div className="save-status">
              {isSaving && (
                <span className="saving-indicator">
                  <span className="spinner"></span> Saving...
                </span>
              )}
              {!isSaving && hasUnsavedChanges && (
                <span className="unsaved-indicator">
                  ● Unsaved changes
                </span>
              )}
              {!isSaving && !hasUnsavedChanges && lastSaved && (
                <span className="saved-indicator">
                  ✓ {getLastSavedText()}
                </span>
              )}
            </div>
          </div>
          <div className="header-right">
            <label className="auto-save-toggle">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              />
              <span>Auto-save</span>
            </label>
          </div>
        </div>
        <div className="profile-completion">
          <div className="completion-bar">
            <div className="completion-fill" style={{ width: `${profileCompletion}%` }}></div>
          </div>
          <span className="completion-text">{profileCompletion}% Complete</span>
        </div>
      </div>

      {message && (
        <div className={`toast-message ${messageType}`}>
          {messageType === 'success' ? '✓' : '✕'} {message}
        </div>
      )}

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          📋 Basic Info
        </button>
        <button 
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          🎯 Job Preferences
        </button>
        <button 
          className={`tab-btn ${activeTab === 'experience' ? 'active' : ''}`}
          onClick={() => setActiveTab('experience')}
        >
          💼 Experience & Education
        </button>
        <button 
          className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          🚀 Skills & Languages
        </button>
      </div>

      <form onSubmit={onSubmit} className="profile-form">
        
        {/* BASIC INFO TAB */}
        {activeTab === 'basic' && (
          <div className="tab-content">
            <div className="profile-section">
              <h3>Profile Picture</h3>
              <div className="avatar-upload-section">
                <div className="avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder">
                      {name ? name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="avatar-actions">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Photo
                  </button>
                  <p className="hint">Max size: 5MB (JPG, PNG)</p>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+63 XXX XXX XXXX"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Current Location</label>
                  <input
                    id="location"
                    type="text"
                    className="input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Manila, Philippines"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Professional Bio</label>
                <textarea
                  id="bio"
                  className="input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="4"
                  placeholder="Tell employers about yourself, your experience, and what you're looking for..."
                  maxLength="500"
                />
                <span className="char-count">{bio.length}/500</span>
              </div>
            </div>

            <div className="profile-section">
              <h3>Resume / CV</h3>
              <div className="resume-upload-section">
                {resume ? (
                  <div className="resume-preview">
                    <div className="file-icon">📄</div>
                    <div className="file-info">
                      <p className="file-name">
                        {resume.filename || resume.url?.split('/').pop() || 'Resume.pdf'}
                      </p>
                      <p className="file-date">
                        Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="resume-actions">
                        {resume.url && (
                          <>
                            <button
                              type="button"
                              className="btn-link"
                              onClick={() => setShowResumePreview(true)}
                            >
                              👁️ Preview
                            </button>
                            <a 
                              href={resume.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn-link"
                            >
                              📥 Download
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn-danger-small"
                      onClick={() => {
                        setResume(null)
                        setResumeFile(null)
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="resume-upload-empty">
                    <input 
                      type="file" 
                      ref={resumeInputRef} 
                      onChange={handleResumeChange}
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                    />
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => resumeInputRef.current?.click()}
                    >
                      Upload Resume
                    </button>
                    <p className="hint">PDF or Word document (Max 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h3>Portfolio & Social Links</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="linkedin">
                    <span className="icon">💼</span> LinkedIn
                  </label>
                  <input
                    id="linkedin"
                    type="url"
                    className="input"
                    value={portfolioLinks.linkedin}
                    onChange={(e) => setPortfolioLinks({...portfolioLinks, linkedin: e.target.value})}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="github">
                    <span className="icon">💻</span> GitHub
                  </label>
                  <input
                    id="github"
                    type="url"
                    className="input"
                    value={portfolioLinks.github}
                    onChange={(e) => setPortfolioLinks({...portfolioLinks, github: e.target.value})}
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="portfolio">
                    <span className="icon">🌐</span> Portfolio Website
                  </label>
                  <input
                    id="portfolio"
                    type="url"
                    className="input"
                    value={portfolioLinks.portfolio}
                    onChange={(e) => setPortfolioLinks({...portfolioLinks, portfolio: e.target.value})}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="other">
                    <span className="icon">🔗</span> Other Link
                  </label>
                  <input
                    id="other"
                    type="url"
                    className="input"
                    value={portfolioLinks.other}
                    onChange={(e) => setPortfolioLinks({...portfolioLinks, other: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={publicProfile} 
                    onChange={(e) => setPublicProfile(e.target.checked)} 
                  />
                  <span>Make my profile visible to employers</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* JOB PREFERENCES TAB */}
        {activeTab === 'preferences' && (
          <div className="tab-content">
            <div className="profile-section">
              <h3>Job Types</h3>
              <div className="checkbox-grid">
                {allJobTypes.map(t => (
                  <label key={t} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={jobTypes.includes(t)} 
                      onChange={() => toggleJobType(t)} 
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <h3>Preferred Industries</h3>
              <div className="checkbox-grid">
                {allIndustries.map(ind => (
                  <label key={ind} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={industries.includes(ind)} 
                      onChange={() => toggleIndustry(ind)} 
                    />
                    <span>{ind}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <h3>Location Preferences</h3>
              <div className="form-group">
                <label htmlFor="preferred-locations">Preferred Work Locations</label>
                <input
                  id="preferred-locations"
                  type="text"
                  className="input"
                  value={preferredLocations}
                  onChange={(e) => setPreferredLocations(e.target.value)}
                  placeholder="e.g., Manila, Cebu, Remote"
                />
                <p className="hint">Separate multiple locations with commas</p>
              </div>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={willingToRelocate} 
                    onChange={(e) => setWillingToRelocate(e.target.checked)} 
                  />
                  <span>I'm willing to relocate for the right opportunity</span>
                </label>
              </div>
            </div>

            <div className="profile-section">
              <h3>Desired Roles & Salary</h3>
              <div className="form-group">
                <label htmlFor="desired-roles">Desired Job Titles</label>
                <input
                  id="desired-roles"
                  type="text"
                  className="input"
                  value={desiredRoles}
                  onChange={(e) => setDesiredRoles(e.target.value)}
                  placeholder="e.g., Software Engineer, Full Stack Developer"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="salary-min">Minimum Salary (₱)</label>
                  <input
                    id="salary-min"
                    type="number"
                    className="input"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="30000"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="salary-max">Maximum Salary (₱)</label>
                  <input
                    id="salary-max"
                    type="number"
                    className="input"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="60000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="availability">Available to Start</label>
                <input
                  id="availability"
                  type="date"
                  className="input"
                  value={availabilityDate}
                  onChange={(e) => setAvailabilityDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* EXPERIENCE & EDUCATION TAB */}
        {activeTab === 'experience' && (
          <div className="tab-content">
            <div className="profile-section">
              <div className="section-header">
                <h3>Work Experience</h3>
                <button 
                  type="button" 
                  className="btn-add"
                  onClick={() => setShowExpForm(!showExpForm)}
                >
                  + Add Experience
                </button>
              </div>

              {showExpForm && (
                <ExperienceForm 
                  onAdd={addExperience} 
                  onCancel={() => setShowExpForm(false)} 
                />
              )}

              <div className="items-list">
                {experience.length === 0 ? (
                  <p className="empty-state">No work experience added yet</p>
                ) : (
                  experience.map(exp => (
                    <div key={exp.id} className="list-item">
                      <div className="item-content">
                        <h4>{exp.title}</h4>
                        <p className="company">{exp.company}</p>
                        <p className="dates">
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </p>
                        {exp.description && <p className="description">{exp.description}</p>}
                      </div>
                      <button 
                        type="button" 
                        className="btn-remove"
                        onClick={() => removeExperience(exp.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="profile-section">
              <div className="section-header">
                <h3>Education</h3>
                <button 
                  type="button" 
                  className="btn-add"
                  onClick={() => setShowEduForm(!showEduForm)}
                >
                  + Add Education
                </button>
              </div>

              {showEduForm && (
                <EducationForm 
                  onAdd={addEducation} 
                  onCancel={() => setShowEduForm(false)} 
                />
              )}

              <div className="items-list">
                {education.length === 0 ? (
                  <p className="empty-state">No education added yet</p>
                ) : (
                  education.map(edu => (
                    <div key={edu.id} className="list-item">
                      <div className="item-content">
                        <h4>{edu.degree} in {edu.field}</h4>
                        <p className="company">{edu.institution}</p>
                        <p className="dates">{edu.startYear} - {edu.endYear || 'Present'}</p>
                      </div>
                      <button 
                        type="button" 
                        className="btn-remove"
                        onClick={() => removeEducation(edu.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* SKILLS & LANGUAGES TAB */}
        {activeTab === 'skills' && (
          <div className="tab-content">
            <div className="profile-section">
              <h3>Skills</h3>
              <div className="add-item-form">
                <input
                  type="text"
                  className="input"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Enter a skill (e.g., JavaScript, Project Management)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <select 
                  className="input select-small"
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                >
                  {skillLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn-add" onClick={addSkill}>
                  Add Skill
                </button>
              </div>

              <div className="skills-list">
                {skills.length === 0 ? (
                  <p className="empty-state">No skills added yet</p>
                ) : (
                  skills.map(skill => (
                    <div key={skill.name} className="skill-chip">
                      <span className="skill-name">{skill.name}</span>
                      <span className={`skill-level ${skill.level}`}>{skill.level}</span>
                      <button 
                        type="button" 
                        className="skill-remove"
                        onClick={() => removeSkill(skill.name)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="profile-section">
              <h3>Languages</h3>
              <div className="add-item-form">
                <input
                  type="text"
                  className="input"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Enter a language (e.g., English, Tagalog)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                />
                <select 
                  className="input select-small"
                  value={languageProficiency}
                  onChange={(e) => setLanguageProficiency(e.target.value)}
                >
                  {proficiencyLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn-add" onClick={addLanguage}>
                  Add Language
                </button>
              </div>

              <div className="skills-list">
                {languages.length === 0 ? (
                  <p className="empty-state">No languages added yet</p>
                ) : (
                  languages.map(lang => (
                    <div key={lang.name} className="skill-chip">
                      <span className="skill-name">{lang.name}</span>
                      <span className={`skill-level ${lang.proficiency}`}>{lang.proficiency}</span>
                      <button 
                        type="button" 
                        className="skill-remove"
                        onClick={() => removeLanguage(lang.name)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || isSaving}
          >
            {loading || isSaving ? (
              <>
                <span className="spinner-small"></span> Saving...
              </>
            ) : (
              <>Save Profile</>
            )}
          </button>
          {hasUnsavedChanges && !autoSaveEnabled && (
            <span className="unsaved-warning">You have unsaved changes</span>
          )}
        </div>
      </form>

      {/* Resume Preview Modal */}
      {showResumePreview && resume?.url && (
        <div className="modal-overlay" onClick={() => setShowResumePreview(false)}>
          <div className="modal-content resume-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Resume Preview</h2>
              <button 
                className="modal-close"
                onClick={() => setShowResumePreview(false)}
                aria-label="Close preview"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <iframe
                src={resume.url}
                title="Resume Preview"
                className="resume-iframe"
                frameBorder="0"
              />
            </div>
            <div className="modal-footer">
              <a 
                href={resume.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary"
              >
                📥 Download Resume
              </a>
              <button 
                className="btn-secondary"
                onClick={() => setShowResumePreview(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Experience Form Component
function ExperienceForm({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.title && formData.company && formData.startDate) {
      onAdd(formData)
    }
  }

  return (
    <div className="inline-form">
      <div className="form-grid">
        <div className="form-group">
          <label>Job Title *</label>
          <input
            type="text"
            className="input"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Company *</label>
          <input
            type="text"
            className="input"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Start Date *</label>
          <input
            type="month"
            className="input"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input
            type="month"
            className="input"
            value={formData.endDate}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            disabled={formData.current}
          />
        </div>
      </div>
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.current}
            onChange={(e) => setFormData({...formData, current: e.target.checked, endDate: ''})}
          />
          <span>I currently work here</span>
        </label>
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          className="input"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows="3"
          placeholder="Describe your role and achievements..."
        />
      </div>
      <div className="form-actions-inline">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn-primary" onClick={handleSubmit}>Add</button>
      </div>
    </div>
  )
}

// Education Form Component
function EducationForm({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    degree: '',
    field: '',
    institution: '',
    startYear: '',
    endYear: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.degree && formData.field && formData.institution && formData.startYear) {
      onAdd(formData)
    }
  }

  return (
    <div className="inline-form">
      <div className="form-grid">
        <div className="form-group">
          <label>Degree *</label>
          <input
            type="text"
            className="input"
            value={formData.degree}
            onChange={(e) => setFormData({...formData, degree: e.target.value})}
            placeholder="e.g., Bachelor's, Master's"
            required
          />
        </div>
        <div className="form-group">
          <label>Field of Study *</label>
          <input
            type="text"
            className="input"
            value={formData.field}
            onChange={(e) => setFormData({...formData, field: e.target.value})}
            placeholder="e.g., Computer Science"
            required
          />
        </div>
        <div className="form-group">
          <label>Institution *</label>
          <input
            type="text"
            className="input"
            value={formData.institution}
            onChange={(e) => setFormData({...formData, institution: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Start Year *</label>
          <input
            type="number"
            className="input"
            value={formData.startYear}
            onChange={(e) => setFormData({...formData, startYear: e.target.value})}
            placeholder="2018"
            min="1950"
            max="2030"
            required
          />
        </div>
        <div className="form-group">
          <label>End Year (or expected)</label>
          <input
            type="number"
            className="input"
            value={formData.endYear}
            onChange={(e) => setFormData({...formData, endYear: e.target.value})}
            placeholder="2022"
            min="1950"
            max="2035"
          />
        </div>
      </div>
      <div className="form-actions-inline">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn-primary" onClick={handleSubmit}>Add</button>
      </div>
    </div>
  )
}
