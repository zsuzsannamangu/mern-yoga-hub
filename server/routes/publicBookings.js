const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const fetch = require('node-fetch');

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set your SendGrid API key here

// POST: Handle public booking requests
router.post('/request', async (req, res) => {
    const { name, email, phone, sessionType, message, captchaToken } = req.body;

    // Validate input fields
    if (!name || !email || !phone || !sessionType || !captchaToken) {
        return res.status(400).json({ error: 'All fields, including CAPTCHA, are required.' });
    }

    // Verify the reCAPTCHA token with Google's API
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    try {
        const captchaResponse = await fetch(verificationUrl, { method: 'POST' });
        const captchaData = await captchaResponse.json();

        // Check if reCAPTCHA was successful
        if (!captchaData.success) {
            return res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
        }

        // Verify the score to block suspicious requests
        const minScore = 0.5;
        if (captchaData.score < minScore) {
            return res.status(400).json({ error: 'CAPTCHA score too low. Request blocked.' });
        }

        // Validate the action to prevent abuse
        if (captchaData.action !== 'submit') {
            return res.status(400).json({ error: 'Invalid CAPTCHA action.' });
        }

        // If all checks pass, process the booking request
        const adminEmail = {
            to: process.env.EMAIL_RECEIVER,
            from: process.env.EMAIL_USER, // The verified SendGrid sender email
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

        const userEmail = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: 'Booking Request Received',
            html: `
                <h2>Thank You for Your Booking Request</h2>
                <p>Hi ${name},</p>
                <p>Thank you for reaching out! I’ve received your request for a ${sessionType} session. I’ll review your message and get back to you within 24 hours.</p>
                <p>Warmly,</p>
                <p>Zsuzsanna Mangu</p>
            `,
        };

        // Send emails using SendGrid
        await sgMail.send(adminEmail);
        await sgMail.send(userEmail);

        // Respond with success
        res.status(200).json({ message: 'Booking request submitted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process booking request.' });
    }
});

module.exports = router;
