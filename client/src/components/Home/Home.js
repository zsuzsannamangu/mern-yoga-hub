/* global grecaptcha */
import React, { useEffect } from 'react';
import './Home.scss';
import '../../App.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { getRecaptchaToken } from '../../utils/recaptcha';
import { motion } from 'framer-motion';

function Home({ showAlert }) {
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
        text: 'We couldn’t verify that you’re human. Please try again.',
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
        text: 'We couldn’t submit your form. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="main-section">
      <motion.div
        className="mainTitle"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Yoga Teacher and Chocolatier
      </motion.div>
      <motion.div
        className="BookAFreeConsultation_Button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <button onClick={() => document.getElementById('book-section').scrollIntoView({ behavior: 'smooth' })}>
          Book a Free Session
        </button>
      </motion.div>
      <motion.div
        className="images-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <img src="./images/yoga/Zsuzsi_Home_111.jpg" alt="Yoga Vertical" className="left-image" id="homeimage-1" />
        <img src="./images/yoga/Zsuzsi_Home_22.jpg" alt="Yoga Horizontal" className="left-image" id="homeimage-2" />
        <img src="./images/yoga/Zsuzsi_Home_44.jpg" alt="Yoga Horizontal" className="left-image" id="homeimage-3" />
      </motion.div>
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
          <p>In my work, I create a space for gentle exploration and grounded presence. Together, we’ll journey through practices of movement and stillness, attuning to the wisdom within the body.</p>
          <p>I weave together somatic practices, breathwork, Ayurvedic wisdom, meditation, sensory experiences, and movement to support holistic well-being. I teach gentle slow flow, restorative and adaptive yoga, and mindfulness practices, creating space for self-compassion
            and a deeper connection to the present moment.</p>
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
          <p>Book a free 30-minute online session where we’ll take time to connect and talk about you and any goals you might have. </p>
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
                <option value="yoga therapy">Yoga Therapy Session</option>
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
    </div >
  );
}

export default Home;


