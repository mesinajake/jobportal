import './About.css'
import { useCompanyInfo } from '../../../hooks/useCompanyInfo'

export default function About() {
  const { companyInfo, loading } = useCompanyInfo();

  const testimonials = [
    { name: 'Team Member', role: 'Engineering', text: 'Great collaborative environment with growth opportunities.' },
    { name: 'Team Member', role: 'Marketing', text: 'The culture here truly values innovation and creativity.' },
    { name: 'Team Member', role: 'Operations', text: 'Supportive leadership and excellent work-life balance.' },
    { name: 'Team Member', role: 'HR', text: 'We truly care about our people and their development.' },
    { name: 'Team Member', role: 'Product', text: 'Exciting projects and a fantastic team to work with!' },
    { name: 'Team Member', role: 'Sales', text: 'Great opportunities for career advancement.' }
  ];

  if (loading) {
    return (
      <section className="about">
        <div className="loading">Loading...</div>
      </section>
    );
  }

  return (
    <>
      <section className="about">
        <h1 className="heading">About {companyInfo?.name || 'Us'}</h1>
        <div className="content">
          <div className="info">
            <h3>Welcome to {companyInfo?.name || 'Our Company'}</h3>
            <p>
              {companyInfo?.description || 
               `We are a dynamic organization committed to excellence and innovation. 
                Our team is dedicated to creating meaningful impact through our work, 
                and we believe in fostering an environment where every individual can thrive.`}
            </p>
            <p>
              {companyInfo?.careerPage?.aboutText ||
               `We're always looking for talented individuals who share our passion and values. 
                Join us and be part of something extraordinary.`}
            </p>
          </div>
          <div className="company-details">
            <div className="detail-item">
              <i className="fa-solid fa-industry"></i>
              <div>
                <h4>Industry</h4>
                <p>{companyInfo?.industry || 'Technology'}</p>
              </div>
            </div>
            <div className="detail-item">
              <i className="fa-solid fa-users"></i>
              <div>
                <h4>Company Size</h4>
                <p>{companyInfo?.companySize || '50-200'} employees</p>
              </div>
            </div>
            <div className="detail-item">
              <i className="fa-solid fa-calendar"></i>
              <div>
                <h4>Founded</h4>
                <p>{companyInfo?.founded || 'Established Company'}</p>
              </div>
            </div>
            <div className="detail-item">
              <i className="fa-solid fa-location-dot"></i>
              <div>
                <h4>Headquarters</h4>
                <p>{companyInfo?.locations?.[0]?.city || 'Philippines'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="values">
        <h2 className="heading">Our Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <i className="fa-solid fa-lightbulb"></i>
            <h4>Innovation</h4>
            <p>We embrace new ideas and continuously seek better ways to deliver value.</p>
          </div>
          <div className="value-card">
            <i className="fa-solid fa-handshake"></i>
            <h4>Integrity</h4>
            <p>We act with honesty and transparency in everything we do.</p>
          </div>
          <div className="value-card">
            <i className="fa-solid fa-users"></i>
            <h4>Collaboration</h4>
            <p>We believe in the power of teamwork and shared success.</p>
          </div>
          <div className="value-card">
            <i className="fa-solid fa-chart-line"></i>
            <h4>Excellence</h4>
            <p>We strive for the highest standards in all our endeavors.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {companyInfo?.benefits?.length > 0 && (
        <section className="benefits">
          <h2 className="heading">Benefits & Perks</h2>
          <div className="benefits-list">
            {companyInfo.benefits.map((benefit, index) => (
              <div className="benefit-item" key={index}>
                <i className="fa-solid fa-check-circle"></i>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="reviews testimonials">
        <h2 className="heading">What Our Team Says</h2>
        <div className="box-container">
          {testimonials.map((testimonial, index) => (
            <div className="box" key={index}>
              <div className="user">
                <i className="fa-solid fa-user-circle"></i>
                <div>
                  <h3>{testimonial.name}</h3>
                  <span>{testimonial.role}</span>
                </div>
              </div>
              <p>"{testimonial.text}"</p>
              <div className="stars">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
