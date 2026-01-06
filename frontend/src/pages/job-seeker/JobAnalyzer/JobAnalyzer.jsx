import { useState } from 'react';
import './JobAnalyzer.css';

// API Base URL - use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const JobAnalyzer = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setUploadedFileName(file.name);
    setError('');
    
    console.log('File selected:', file.name);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    // Validation - need either file OR text
    if (!resumeFile && !resumeText.trim()) {
      setError('Please upload a resume file or paste resume text');
      return;
    }
    
    if (!jobDescription.trim()) {
      setError('Please enter job description');
      return;
    }

    if (jobDescription.length < 50) {
      setError('Job description is too short. Please provide a complete job description.');
      return;
    }

    setError('');
    setLoading(true);
    setAnalysis(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to use AI features');
        setLoading(false);
        return;
      }

      // Create FormData - send file + jobDescription together
      const formData = new FormData();
      
      if (resumeFile) {
        formData.append('resume', resumeFile);
      } else {
        formData.append('resumeText', resumeText.trim());
      }
      
      formData.append('jobDescription', jobDescription.trim());

      console.log('Sending request to backend...');
      console.log('API URL:', `${API_URL}/ai/analyze`);
      console.log('Has file:', !!resumeFile);
      console.log('Has text:', !!resumeText);

      // Call the API - ONE request with file + job description
      const response = await fetch(`${API_URL}/ai/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - browser sets it with boundary for FormData
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze resume');
      }

      if (data.success) {
        setAnalysis(data.data);
        console.log('Analysis result:', data.data);
      } else {
        throw new Error(data.message || 'Analysis failed');
      }

    } catch (err) {
      console.error('Error analyzing resume:', err);
      setError(err.message || 'Failed to analyze resume. Please ensure Ollama is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResumeFile(null);
    setResumeText('');
    setJobDescription('');
    setAnalysis(null);
    setError('');
    setUploadedFileName('');
    
    // Clear file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-700';
    if (score >= 75) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return '🎯 Excellent Match - Highly Recommended';
    if (score >= 75) return '✅ Strong Match - Recommended';
    if (score >= 60) return '👍 Good Match - Consider Interview';
    if (score >= 40) return '⚠️ Fair Match - Has Potential';
    return '❌ Poor Match - Significant Gaps';
  };

  const getScoreDescription = (score) => {
    if (score >= 90) return 'This candidate meets or exceeds all key requirements';
    if (score >= 75) return 'This candidate meets most requirements with minor gaps';
    if (score >= 60) return 'This candidate meets core requirements but lacks some skills';
    if (score >= 40) return 'This candidate has potential but needs development in key areas';
    return 'This candidate is missing critical requirements for this role';
  };

  return (
    <div className="job-analyzer-container">
      <div className="job-analyzer-wrapper">
        <div className="job-analyzer-card">
          <div className="analyzer-header">
            <h1 className="analyzer-title">
              AI Resume Analyzer
            </h1>
            <p className="analyzer-subtitle">
              Analyze how well a resume matches a job description using AI
            </p>
          </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <strong>Error: </strong>
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="analyzer-form">
        <div className="form-grid">
          {/* Resume Text Input */}
          <div className="input-section">
            <div className="input-label-row">
              <label htmlFor="resumeText" className="input-label-candidate">
                Resume (File or Text) *
              </label>
              <label 
                htmlFor="file-upload"
                className="upload-button"
              >
                📎 Upload Resume
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden-input"
              />
            </div>

            {/* Uploaded File Name */}
            {uploadedFileName && (
              <div className="uploaded-file-badge">
                <span>📄 {uploadedFileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFileName('');
                    setResumeFile(null);
                    const fileInput = document.getElementById('file-upload');
                    if (fileInput) fileInput.value = '';
                  }}
                  className="remove-file-btn"
                >
                  ✕
                </button>
              </div>
            )}

            <textarea
              id="resumeText"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the candidate's resume here OR upload a file above...

Example:
John Doe
Software Engineer

EXPERIENCE:
- 5 years of React development
- Node.js and Express backend
- MongoDB database design
..."
              className="resume-textarea"
              disabled={loading || !!resumeFile}
            />
            <div className="textarea-info">
              <p className="char-count">
                {resumeFile ? `File selected: ${uploadedFileName}` : `${resumeText.length} characters`}
              </p>
              <p className="file-support-text">
                Upload PDF/DOCX/TXT OR paste text
              </p>
            </div>
          </div>

          {/* Job Description Input */}
          <div className="input-section">
            <label htmlFor="jobDescription" className="input-label-jobdesc">
              Job Description *
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here...

Example:
Full Stack Developer

We are seeking a talented Full Stack Developer with:
- 3+ years React experience
- Strong Node.js/Express skills
- MongoDB expertise
- RESTful API design
..."
              className="resume-textarea"
              disabled={loading}
            />
            <p className="char-count">
              {jobDescription.length} characters
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            type="submit"
            disabled={loading}
            className="analyze-button"
          >
            {loading ? (
              <span className="upload-button-content">
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{opacity: 0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{opacity: 0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              '🤖 Analyze Resume'
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="clear-button"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="loading-box">
          <div className="loading-content">
            <p className="loading-title">
              🤖 AI is analyzing the resume...
            </p>
            <p className="loading-subtitle">
              Comparing skills, experience, and qualifications with job requirements
            </p>
            <p className="loading-subtitle" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
              This may take 30-90 seconds depending on resume length
            </p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <div className="results-card">
          {/* Match Score Header */}
          <div className="results-header">
            <div className="results-header-content">
              <div>
                <h2 className="results-title">Analysis Results</h2>
                <p className="results-subtitle">AI-powered resume evaluation</p>
              </div>
              <div className="score-display">
                <div className="score-number">
                  {analysis.matchScore}%
                </div>
                <div className="score-label">
                  {getScoreLabel(analysis.matchScore)}
                </div>
              </div>
            </div>
          </div>

          {/* Match Score Visual */}
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className={`progress-fill ${
                  analysis.matchScore >= 90
                    ? 'excellent'
                    : analysis.matchScore >= 75
                    ? 'strong'
                    : analysis.matchScore >= 60
                    ? 'good'
                    : analysis.matchScore >= 40
                    ? 'fair'
                    : 'poor'
                }`}
                style={{ width: `${analysis.matchScore}%` }}
              ></div>
            </div>
            <p className="score-description">
              {getScoreDescription(analysis.matchScore)}
            </p>
          </div>

          {/* Summary */}
          <div className="summary-section">
            <h3 className="section-title-analyzer">
              <span className="section-icon">📋</span>
              Summary
            </h3>
            <p className="summary-text">
              {analysis.summary}
            </p>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="strengths-weaknesses-grid">
            {/* Strengths */}
            <div className="strengths-section">
              <h3 className="section-title-analyzer">
                <span className="section-icon">✅</span>
                Strengths
              </h3>
              {analysis.strengths && analysis.strengths.length > 0 ? (
                <ul className="items-list">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="strength-item">
                      <span className="strength-bullet">●</span>
                      <span className="item-text">{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-items-text">No strengths identified</p>
              )}
            </div>

            {/* Weaknesses */}
            <div className="weaknesses-section">
              <h3 className="section-title-analyzer">
                <span className="section-icon">⚠️</span>
                Areas for Improvement
              </h3>
              {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                <ul className="items-list">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="weakness-item">
                      <span className="weakness-bullet">●</span>
                      <span className="item-text">{weakness}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-items-text">No weaknesses identified</p>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="results-footer">
            <p className="powered-by">
              💡 Powered by Ollama llama3.2
            </p>
            <button
              onClick={handleClear}
              className="another-analysis-btn"
            >
              Analyze Another Resume
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      {!analysis && !loading && (
        <div className="info-box">
          <h3 className="info-title">
            <span className="section-icon">💡</span>
            How it works
          </h3>
          <ul className="info-list">
            <li>
              <span>1.</span>
              <span><strong>Upload a resume file</strong> (PDF, DOCX, TXT) <strong>OR</strong> paste resume text</span>
            </li>
            <li>
              <span>2.</span>
              <span>Paste the job description in the right box</span>
            </li>
            <li>
              <span>3.</span>
              <span>Click "Analyze Resume" - backend will extract text from file (if uploaded) and analyze with AI</span>
            </li>
            <li>
              <span>4.</span>
              <span>Review the match score, strengths, and areas for improvement</span>
            </li>
          </ul>
          <div className="info-notes">
            <p className="info-note">
              📎 Supported file types: PDF, DOCX, TXT
            </p>
            <p className="info-note">
              ⚡ Note: Make sure Ollama is running on your local machine
            </p>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default JobAnalyzer;
