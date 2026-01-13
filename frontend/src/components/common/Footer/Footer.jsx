import { Link } from 'react-router-dom';
import './Footer.css';

/**
 * Footer - Main footer component
 * Displays site info, links, and social media
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <i className="fa-solid fa-users"></i>
              <span>AppliTrak</span>
            </Link>
            <p>
              AppliTrak is a Job Application Monitoring Portal designed to streamline 
              the job application process for both job seekers and employers.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook"></i></a>
              <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fa-brands fa-linkedin"></i></a>
              <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h3>Quick Links</h3>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>

          {/* Explore */}
          <div className="footer-links">
            <h3>Explore</h3>
            <a href="#">Top Companies</a>
            <a href="#">Career Resources</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>

          {/* Company */}
          <div className="footer-links">
            <h3>Company</h3>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} AppliTrak. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
