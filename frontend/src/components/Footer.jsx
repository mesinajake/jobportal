import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <section className="grid">
        <div className="box">
          <h3>AppliTrak</h3>
          <p>
            AppliTrak is a Job Application Monitoring Portal designed to streamline the job application process for both job seekers and employers. It offers a user-friendly interface where job seekers can track their applications and get personalized job recommendations.
          </p>
          <div className="social-media">
            <a href="#"><i className="fa-brands fa-facebook"></i></a>
            <a href="#"><i className="fa-brands fa-instagram"></i></a>
            <a href="#"><i className="fa-brands fa-linkedin"></i></a>
            <a href="#"><i className="fa-brands fa-youtube"></i></a>
          </div>
        </div>

        <div className="footer-box">
          <h3>Extra Links</h3>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/dashboard">Post Job</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>

        <div className="footer-box">
          <h3>Explore</h3>
          <a href="#">Top Companies</a>
          <a href="#">Terms of Service</a>
          <a href="#">Careers</a>
        </div>

        <div className="footer-box">
          <h3>Company</h3>
          <Link to="/contact">Contact</Link>
          <Link to="/about">About Us</Link>
        </div>
      </section>
      <div className="credit">© 2024 AppliTrak. All Rights Reserved.</div>
    </footer>
  )
}
