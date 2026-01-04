import './Contact.css'

export default function Contact() {
  return (
    <>
      <div className="section-title-contact">Contact Us</div>
      <section className="contact">
        <div className="box-container">
          <div className="box">
            <i className="fa-solid fa-location-dot"></i>
            <a href="#">Calamba, Laguna, Philippines</a>
          </div>

          <div className="box">
            <i className="fa-solid fa-phone"></i>
            <a href="#">63+ 9109876543</a>
          </div>

          <div className="box">
            <i className="fa-solid fa-envelope-open"></i>
            <a href="#">info@gmail.com</a>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <h3>Data Entry Form</h3>
          <div className="flex">
            <div className="box">
              <p>Full Name <span>*</span></p>
              <input type="text" name="name" required maxLength={40} placeholder="Enter your full name" className="input" />
            </div>

            <div className="box">
              <p>Email Address <span>*</span></p>
              <input type="email" name="email" required maxLength={50} placeholder="Enter your email" className="input" />
            </div>

            <div className="box">
              <p>Date of Birth <span>*</span></p>
              <input type="date" name="date" required className="input" />
            </div>

            <div className="box">
              <p>Phone Number <span>*</span></p>
              <input type="tel" id="phone" name="phone" placeholder="Enter your phone number" className="input" />
            </div>

            <div className="box">
              <p>Gender <span>*</span></p>
              <div className="gender">
                <div id="male">
                  <input type="radio" name="gender" id="male" value="Male" required />
                  <label htmlFor="male">Male</label>
                </div>
                <div id="female">
                  <input type="radio" name="gender" id="female" value="Female" required />
                  <label htmlFor="female">Female</label>
                </div>
              </div>
            </div>

            <div className="box">
              <p>Country <span>*</span></p>
              <select name="country" required className="input" defaultValue="">
                <option value="" disabled>Select a country</option>
                <option value="Philippines">Philippines</option>
                <option value="South Korea">South Korea</option>
                <option value="Japan">Japan</option>
                <option value="China">China</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Indonesia">Indonesia</option>
              </select>
            </div>
          </div>

          <p>Notes <span>*</span></p>
          <textarea name="message" className="input" required maxLength={1000} placeholder="Any additional information you want to provide" cols={30} rows={10}></textarea>
          <input type="submit" value="Submit" name="send" className="btn" />
        </form>
      </section>
    </>
  )
}
