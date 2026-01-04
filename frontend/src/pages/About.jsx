import { Link } from 'react-router-dom'
import './About.css'

export default function About() {
  return (
    <>
      <div className="section-title-about">About Us</div>
      <section className="about">
        <img src="/images/Job-offers.png" alt="Job Hiring" />
        <div className="box">
          <h3>Why we’re the right fit.</h3>
          <p>Welcome to our Job Application Monitoring Portal! This cutting-edge platform is crafted to simplify your job search and application process, ensuring you stay organized and ahead of your career opportunities.</p>
          <p>Our user-friendly interface makes navigating the platform a breeze, allowing you to focus on finding and applying for the perfect job without the hassle of managing multiple tools and spreadsheets. Additionally, our detailed analytics provide valuable insights into your application trends, helping you identify successful strategies and areas for improvement.</p>
          <Link to="/contact" className="btn">Contact Us</Link>
        </div>
      </section>

      <div className="section-title-about">Top Reviews</div>
      <section className="reviews">
        <div className="box-container">
          <div className="box">
            <div className="stars">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <h3 className="title">Amazing Results</h3>
            <p>This portal has been a game-changer for me! It's so convenient to have all my job applications tracked in one place. No more forgetting which positions I've applied for</p>
            <div className="user">
              <img src="/images/pic-1.jpg" alt="" />
              <div>
                <h3>Kevin Carl Mulingbayan</h3>
                <span>System Designer</span>
              </div>
            </div>
          </div>

          <div className="box">
            <div className="stars">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <h3 className="title">Easy to use</h3>
            <p>I love the real-time updates feature! It's incredibly helpful to receive notifications about changes in my application status or upcoming interview schedules.</p>
            <div className="user">
              <img src="/images/pic-2.jpg" alt="" />
              <div>
                <h3>Erica Estopia</h3>
                <span>Requirement Analyst</span>
              </div>
            </div>
          </div>

          <div className="box">
            <div className="stars">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <h3 className="title">Got a new job</h3>
            <p>The user interface is clean and intuitive. Navigating the portal is a breeze, and I appreciate the simplicity of managing my applications without feeling overwhelmed.</p>
            <div className="user">
              <img src="/images/pic-3.jpg" alt="" />
              <div>
                <h3>Kathlene Gazer</h3>
                <span>Requirement Analyst</span>
              </div>
            </div>
          </div>

          <div className="box">
            <div className="stars">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <h3 className="title">Exciting experience</h3>
            <p>The customer support team has been fantastic! They're responsive, knowledgeable, and always willing to assist with any questions or issues I encounter. </p>
            <div className="user">
              <img src="/images/Formal Picture.jpg" alt="" />
              <div>
                <h3>Jake Mesina</h3>
                <span>Programmer</span>
              </div>
            </div>
          </div>

          <div className="box">
            <div className="stars">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <h3 className="title">Many variety of jobs</h3>
            <p>I've recommended this portal to all my job-seeking friends and colleagues. It's been an invaluable tool in my job search, and I'm confident it can help others achieve success.</p>
            <div className="user">
              <img src="/images/pic-4.jpg" alt="" />
              <div>
                <h3>Andrei Terrible</h3>
                <span>Tester</span>
              </div>
            </div>
          </div>

          <div className="box">
            <div className="stars">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <h3 className="title">Excellent jobs you can find</h3>
            <p>I've been using this portal for several months now, and I've already secured multiple job offers thanks to its organization and efficiency. I couldn't be happier with the results!</p>
            <div className="user">
              <img src="/images/pic-5.jpg" alt="" />
              <div>
                <h3>David Joe</h3>
                <span>Graphic Designer</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
