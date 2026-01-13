import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1>About JobPortal</h1>
        <p>Connecting talented professionals with their dream careers</p>
      </section>

      <section className="about-content">
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            We're on a mission to revolutionize the job search experience by leveraging 
            cutting-edge technology and AI to match the right candidates with the right 
            opportunities. Our platform simplifies the hiring process for both job seekers 
            and employers.
          </p>
        </div>

        <div className="about-section">
          <h2>What We Offer</h2>
          <ul className="features-list">
            <li>AI-powered job matching and recommendations</li>
            <li>Resume analysis and optimization</li>
            <li>One-click application process</li>
            <li>Real-time application tracking</li>
            <li>Direct communication with employers</li>
            <li>Career insights and analytics</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Innovation</h3>
              <p>Constantly improving our platform with the latest technology</p>
            </div>
            <div className="value-card">
              <h3>Transparency</h3>
              <p>Clear communication and honest practices</p>
            </div>
            <div className="value-card">
              <h3>Success</h3>
              <p>Dedicated to your career growth and satisfaction</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
