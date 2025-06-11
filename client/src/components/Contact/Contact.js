import React, { useState } from 'react';
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

    //Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.3,
            }
        }
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
        <motion.div
            className='contact-form-container'
            initial="hidden"
            whileInView="visible"
            animate="visible"
            variants={containerVariants}
        >
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
        </motion.div>
    );
}

export default Contact;
