import React, { useEffect } from 'react';
import './Home.scss';
import '../../App.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { motion } from 'framer-motion';

function Home() {
  useEffect(() => {
    // Dynamically add reCAPTCHA script
    const siteKey = process.env.REACT_APP_CAPTCHA_SITE_KEY;
    if (!siteKey) {
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, { action: 'submit' })
            .then((token) => {
              localStorage.setItem('captchaToken', token);
            })
            .catch((error) => console.error('Error generating token:', error));
        });
      } else {
        console.error('reCAPTCHA library not loaded.');
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target; // Reference to the form element

    const captchaToken = localStorage.getItem('captchaToken');
    if (!captchaToken) {
      Swal.fire({
        title: 'Verification Failed',
        text: 'We couldn\'t verify that you\'re human. Please try again.',
        icon: 'warning',
        confirmButtonText: 'Retry'
      });
      return;
    }

    const formData = {
      name: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      phone: e.target.phone.value.trim(),
      sessionType: e.target['session-type'].value,
      message: e.target.message.value.trim(),
      captchaToken, // Include the token in your request
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/publicBookings/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit the form');
      }
      Swal.fire({
        title: 'Success!',
        text: 'Your form has been submitted successfully.',
        icon: 'success',
        confirmButtonText: 'Great!'
      });
      form.reset(); // Clear the form fields after successful submission
    } catch (error) {
      Swal.fire({
        title: 'Oops! Something went wrong!',
        text: 'We couldn\'t submit your form. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="homepage">
      {/* Workshop Announcement Bar - Top */}
      <div className="workshop-announcement newyear-announcement">
        <div className="announcement-content">
          <span className="announcement-text">
            ✨ <strong>Awaken the Senses: Chocolate, chakras and restorative yoga on Valentine's Day</strong>
          </span>
          <a href="/yoga?section=classDescriptions" className="announcement-link">
            View Workshops
          </a>
        </div>
      </div>

      <motion.div
        className="split-banner"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <img
          src="/images/Zsuzsi_homepage.jpg"
          alt="Yoga and Chocolate"
          className="split-banner__image"
        />

        {/* Left half → Yoga */}
        <a
          href="/yoga"
          aria-label="Go to Yoga"
          className="split-banner__link split-banner__link--left"
        />

        {/* Right half → Chocolates */}
        <a
          href="/chocolates"
          aria-label="Go to Chocolates"
          className="split-banner__link split-banner__link--right"
        />
      </motion.div>

      {/* Rest of the content sections */}
      <div className='main-section'>
        <motion.div
          className="main-row"
          id="about-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="main-left">
            <h1 className="section-title">About</h1>
            <div className="title-line"></div>
          </div>
          <div className="right-section">
            <p>
              I'm a trauma-informed yoga teacher, yoga therapist-in-training, and chocolatier based in Portland, Oregon. I create space for exploration of body and mind through a
              unique blend of yoga, mindfulness, and sensory experiences.
            </p>
            <p>
              My offerings include therapeutic yoga, adaptive yoga, gentle slow flow, hatha, and restorative yoga, somatic movement, breathwork, meditation, and Ayurvedic wisdom. I work with individuals and
              groups, supporting each student in deepening their connection to body, breath, and self-compassion.
            </p>
            <p>
              Alongside my yoga practice, I create handcrafted, plant-based chocolates made fresh with organic, fair-trade ingredients. Each batch is intentionally made in small quantities and packaged in low-waste, reusable tins.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="main-row"
          id="book-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="main-left">
            <h1 className="section-title">Book</h1>
            <div className="title-line"></div>
          </div>
          <div className="right-section">
            <p>If you are interested in working with me through yoga therapy, yoga classes or anything chocolate related, and want to learn more, book a free 30-minute online meeting with me to answer any questions you have.</p>

            <form className="booking-form" onSubmit={handleSubmit}>
              <label>
                <input type="text" name="name" placeholder="Name" required />
              </label>
              <label>
                <input type="email" name="email" placeholder="Email" required />
              </label>
              <label>
                <input type="tel" name="phone" placeholder="Phone" required />
              </label>
              <label>
                What are you interested in?
                <select name="session-type" required>
                  <option value="private yoga">Individual Yoga Class</option>
                  <option value="group yoga">Group Yoga Class</option>
                  <option value="yoga therapy">Yoga Therapy</option>
                  <option value="chocolates">Chocolates</option>
                </select>
              </label>
              <label>
                Message
                <textarea name="message" rows="10" placeholder="Anything you want me to know? (No sensitive information here please!)" />
              </label>
              <div id="recaptcha-container" className="g-recaptcha"></div>
              <button type="submit">Submit</button>
            </form>
          </div>
        </motion.div>

        <motion.div
          className="main-row"
          id="sample-class-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="main-left">
            <h1 className="section-title">Sample Class</h1>
            <div className="title-line"></div>
          </div>
          <div className="right-section">
            <p>
              This 60-minute Level 1 Slow Flow class focuses on hip mobility and gentle strength building. It includes a few playful challenges, like Warrior III, to help you explore balance and stability.
            </p>
            <div className="video-container">
              <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/IEjzJZVx9g8?start=4086&mute=1&loop=1&playlist=IEjzJZVx9g8&controls=1&modestbranding=1&rel=0"
                title="Sample Slow Flow Class"
                frameBorder="0"
                allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

            </div>
          </div>
        </motion.div>
      </div>
    </div >
  );
}

export default Home;


