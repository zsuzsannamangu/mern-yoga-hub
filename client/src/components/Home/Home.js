/* global grecaptcha */
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
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
      <Helmet>
        <title>Yoga and Chocolate | Mindful Movement & Sustainable Treats</title>
        <meta
          name="description"
          content="Explore trauma-informed yoga, yoga therapy and handcrafted, plant-based chocolate by Zsuzsanna Mangu."
        />
        <link rel="canonical" href="https://www.yogaandchocolate.com/" />
      </Helmet>
      <motion.div
        className="home-hero-banner"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <a href="/yoga" className="hero-link left" aria-label="Go to Yoga page"></a>
        <a href="/chocolates" className="hero-link right" aria-label="Go to Chocolate page"></a>
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
            <p>
              I’m Zsuzsanna Mangu, a trauma-informed yoga teacher, yoga therapist-in-training, and chocolatier based in Portland, Oregon. I create space for gentle exploration and grounded presence through a 
              unique blend of yoga, mindfulness, and sensory experiences.
            </p>
            <p>
              My offerings include therapeutic yoga, adaptive yoga, gentle slow flow, hatha, and restorative yoga—woven with somatic movement, breathwork, meditation, and Ayurvedic wisdom. I work with individuals and 
              groups, supporting each student in deepening their connection to body, breath, and self-compassion.
            </p>
            <p>
              In addition to yoga, I handcraft plant-based, small-batch chocolates using organic, fair-trade ingredients and low-waste packaging. Whether through mindful movement or sustainable treats, my work is rooted 
              in care, presence, and holistic well-being.
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
    </div >
  );
}

export default Home;


