import React, { useState } from 'react';
import './Footer.scss';
import { FaGithub, FaInstagram } from 'react-icons/fa';
import { SiEtsy } from 'react-icons/si';
import Swal from 'sweetalert2';

function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
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

      const result = await response.json();

      if (response.status === 409) {
        Swal.fire({
          title: 'Already Subscribed',
          text: 'This email is already on our list.',
          icon: 'info',
          confirmButtonText: 'OK'
        });
      } else if (response.ok) {
        Swal.fire({
          title: 'Subscribed!',
          text: 'Thanks for signing up! 🎉',
          icon: 'success',
          confirmButtonText: 'Awesome'
        });
      } else {
        throw new Error(result?.error || 'Subscription failed');
      }

      setEmail('');
    } catch (error) {
      Swal.fire({
        title: 'Oops!',
        text: 'We couldn’t process your subscription.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="footer">
      <div className="footer-content">
        <p>
          Website developed by &copy; Zsuzsanna Mangu 2025
          <a
            href="https://github.com/zsuzsannamangu/MERN-yoga-hub/tree/main"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            <FaGithub style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
          </a>
        </p>

        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/calendar">Calendar</a>
          <a href="/contact">Contact</a>
          <a href="/chocolates">Chocolates</a>
          <a
            href="https://www.instagram.com/zsuzsannacreates/"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-link"
          >
            <FaInstagram style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          </a>
          <a
            href="https://www.etsy.com/shop/retreatcreations"
            target="_blank"
            rel="noopener noreferrer"
            className="etsy-link"
          >
            <SiEtsy style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          </a>
        </div>

        {/* Newsletter Signup */}
        <div className="newsletter">
          <p>Get updates about yoga classes, workshops, events, and new chocolates.</p>
          <form onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Footer;

