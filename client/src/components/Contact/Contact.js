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
            console.error('reCAPTCHA site key is missing.');
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
                    console.log('reCAPTCHA ready');
                });
            } else {
                console.error('reCAPTCHA library not loaded.');
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
                title: 'reCAPTCHA Not Ready',
                text: 'Please wait a moment and try again.',
            });
            return;
        }

        try {
            // Execute reCAPTCHA v3 to get the token
            console.log('Executing reCAPTCHA...');
            const recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'contact_form_submit' });

            // Log the token to the console for debugging
            console.log('reCAPTCHA token generated:', recaptchaToken);

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
                console.error('Error Details:', errorData);

                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: errorData.message || 'Failed to send the message. Please try again later.',
                });
            }
        } catch (error) {
            console.error('Error sending message:', error.message);

            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to send the message. Please try again later.',
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
