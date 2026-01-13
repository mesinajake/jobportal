import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Your Dream Job</h1>
          <p>Connect with top employers and discover opportunities that match your skills</p>
          <div className="hero-buttons">
            <a href="/jobs" className="btn btn-primary">Browse Jobs</a>
            <a href="/register" className="btn btn-secondary">Sign Up</a>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Why Choose Us</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🎯 Smart Matching</h3>
            <p>AI-powered job recommendations based on your profile</p>
          </div>
          <div className="feature-card">
            <h3>⚡ Quick Apply</h3>
            <p>Apply to multiple jobs with one click</p>
          </div>
          <div className="feature-card">
            <h3>📊 Track Progress</h3>
            <p>Monitor your applications in real-time</p>
          </div>
          <div className="feature-card">
            <h3>🤝 Top Employers</h3>
            <p>Connect with leading companies</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
