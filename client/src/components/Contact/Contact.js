import React, { useState, useEffect } from 'react';
import './Contact.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    useEffect(() => {
        // Dynamically add reCAPTCHA script
        const siteKey = process.env.REACT_APP_CAPTCHA_SITE_KEY; // Replace with your site key
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
                });
            } else {
                // Show a user-friendly alert if reCAPTCHA fails to load
                Swal.fire({
                    icon: 'error',
                    title: 'Security Check Failed',
                    text: 'We couldn’t load the reCAPTCHA service. Please refresh the page or check your internet connection.',
                    confirmButtonText: 'OK'
                });
            }
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const siteKey = process.env.REACT_APP_CAPTCHA_SITE_KEY;
        if (!window.grecaptcha || !siteKey) {
            Swal.fire({
                icon: 'warning',
                title: 'Verification Not Ready',
                text: 'reCAPTCHA is still loading. Please wait a moment and try again.',
                confirmButtonText: 'Got it'
            });
            return;
        }

        try {
            // Execute reCAPTCHA v3 to get the token
            const recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'contact_form_submit' });

            // Send the form data along with the reCAPTCHA token to the backend
            const response = await fetch('http://localhost:5001/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, recaptchaToken }),
            });

            if (response.ok) {
                const responseData = await response.json();
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: responseData.message,
                });
                setFormData({ name: '', email: '', message: '' });
            } else {
                const errorData = await response.json();

                Swal.fire({
                    icon: 'error',
                    title: 'Something went wrong!',
                    text: errorData.message || 'Failed to send message. Please try again later.',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Something went wrong!',
                text: 'Failed to send message. Please try again later.',
            });
        }
    };

    return (
        <div className="contact-form-container">
            <div className="contact-left">
                <h1 className="section-title">Contact</h1>
                <div className="title-line"></div>
            </div>
            <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-row">
                    <label>
                        <input
                            type="text"
                            placeholder="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <label>
                    <textarea
                        name="message"
                        placeholder="Message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="10"
                        required
                    />
                </label>
                <button type="submit">Send Message</button>
            </form>
        </div>
    );
}

export default Contact;
