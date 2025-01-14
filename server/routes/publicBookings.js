const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set your SendGrid API key here

// POST: Handle public booking requests
router.post('/request', async (req, res) => {
    const { name, email, phone, sessionType, message } = req.body;

    if (!name || !email || !phone || !sessionType) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Email to admin
        const adminEmail = {
            to: process.env.EMAIL_RECEIVER, // Replace with your admin email
            from: process.env.EMAIL_USER,  // Your verified SendGrid sender email
            subject: 'New Public Booking Request',
            html: `
                <h2>New Public Booking Request</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Phone:</b> ${phone}</p>
                <p><b>Session Type:</b> ${sessionType}</p>
                <p><b>Message:</b> ${message || 'N/A'}</p>
            `,
        };

        // Email to user
        const userEmail = {
            to: email,
            from: process.env.EMAIL_USER, // Your verified SendGrid sender email
            subject: 'Booking Request Received',
            html: `
                <h2>Thank You for Your Booking Request</h2>
                <p>Hi ${name},</p>
                <p>Thank you for reaching out! I’ve received your request for a ${sessionType} yoga session. I’ll review your message and get back to you within 24 hours.</p>
                <p>Best regards,</p>
                <p>Zsuzsanna Mangu</p>
            `,
        };

        // Send emails
        await sgMail.send(adminEmail);
        await sgMail.send(userEmail);

        res.status(200).json({ message: 'Booking request submitted successfully.' });
    } catch (error) {
        console.error('Error sending email:', error.response?.body || error.message);
        res.status(500).json({ error: 'Failed to send booking request emails.' });
    }
});

module.exports = router;
