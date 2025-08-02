import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import './Contact.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { getRecaptchaToken } from '../../utils/recaptcha';
import { motion } from 'framer-motion';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const recaptchaToken = await getRecaptchaToken('contact_form_submit');

            if (!recaptchaToken) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Verification Not Ready',
                    text: 'We couldn’t verify you’re human. Please try again.',
                    confirmButtonText: 'Got it',
                });
                return;
            }

            const response = await fetch(`${process.env.REACT_APP_API}/api/contact`, {
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
            console.error('reCAPTCHA or network error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Something went wrong!',
                text: 'Failed to send message. Please try again later.',
            });
        }
    };

    return (
        <div className='contact-form-container'>
            <Helmet>
                <title>Contact | Yoga and Chocolate by Zsuzsanna Mangu</title>
                <meta
                    name="description"
                    content="Get in touch with Zsuzsanna Mangu for yoga classes, yoga therapy sessions, chocolate orders, or collaboration inquiries. Reach out with questions or booking requests."
                />
                <link rel="canonical" href="https://www.yogaandchocolate.com/contact" />
            </Helmet>
            <motion.div
                className="contact-left"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <h1 className="section-title">Contact</h1>
                <div className="title-line"></div>
            </motion.div>

            <motion.form
                onSubmit={handleSubmit}
                className="contact-form"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
            >
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
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    Send Message
                </motion.button>
            </motion.form>
        </div>
    );
}

export default Contact;
