/* global grecaptcha */
import React, { useEffect, useState } from 'react';
import './Home.scss';
import '../../App.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { getRecaptchaToken } from '../../utils/recaptcha';
import { motion } from 'framer-motion';

function Home({ showAlert }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Swal.fire({
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/subscribers/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const result = await response.json(); // parse the response JSON

      if (response.status === 409) {
        Swal.fire({
          title: 'Already Subscribed',
          text: 'This email is already on our list.',
          icon: 'info',
          confirmButtonText: 'OK'
        });
        setEmail('');
        e.target.reset();
      } else if (response.ok) {
        Swal.fire({
          title: 'Subscribed!',
          text: 'Thanks for signing up! 🎉',
          icon: 'success',
          confirmButtonText: 'Awesome'
        });
        setEmail('');
        e.target.reset();
      } else {
        throw new Error(result?.error || 'Subscription failed');
      }
    } catch (error) {
      Swal.fire({
        title: 'Oops!',
        text: 'We couldn’t process your subscription.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      setEmail(''); //clears email input field
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="homepage">
      <motion.div
        className="home-hero-banner"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* <motion.div
          className="hero-overlay"
          initial={{ opacity: 0, y: 20 }}
        >
          <div className="hero-buttons">
            <button onClick={() => document.getElementById('book-section').scrollIntoView({ behavior: 'smooth' })}>
              Book a Free Session
            </button>
            <button>
              <a href="/chocolates">Buy Chocolate</a>
            </button>
          </div>
        </motion.div> */}
      </motion.div>

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
            <p>In my work, I create a space for gentle exploration and grounded presence. Together, we’ll journey through practices of movement and stillness, attuning to the wisdom within the body.</p>
            <p>I weave together somatic practices, breathwork, Ayurvedic wisdom, meditation, sensory experiences, and movement to support holistic well-being. I teach gentle slow flow, hatha, restorative and adaptive yoga, and mindfulness practices, creating space for self-compassion
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
                  <option value="yoga therapy">Therapeutic Yoga</option>
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
      </div>
      <motion.section
        className="newsletter"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <p>Get updates about yoga classes, workshops, events, and new chocolates.</p>
        <form onSubmit={handleNewsletterSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Subscribe'}
          </button>
        </form>
      </motion.section>
    </div >
  );
}

export default Home;


