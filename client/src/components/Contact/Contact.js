import React, { useState } from 'react';
import './Contact.scss';
import '../Home/Home.scss';
import '../../App.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

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
            const response = await fetch('http://localhost:5001/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const responseData = await response.json(); // Read the response body once

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: responseData.message, // Use the message from the backend
                });
                setFormData({ name: '', email: '', message: '' }); // Reset the form
            } else {
                const errorData = await response.json(); // Read error details if response is not OK
                console.error('Error Details:', errorData);

                throw new Error(`Failed with status: ${response.status}`);
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
                <h1 className='section-title'>Contact</h1>
                <div className="title-line"></div>
            </div>
            <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-row">
                    <label>
                        <input
                            type="text"
                            placeholder='Name'
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        <input
                            type="email"
                            placeholder='Email'
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
                        placeholder='Message'
                        value={formData.message}
                        onChange={handleChange}
                        rows="10"
                        required
                    />
                </label>
                <button type="submit">Send Message</button>
            </form>
        </div >
    );
}

export default Contact;