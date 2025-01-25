const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const fetch = require('node-fetch'); // Required for making HTTP requests to reCAPTCHA API

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/', async (req, res) => {
    const { recaptchaToken, name, email, message } = req.body;

    if (!recaptchaToken) {
        return res.status(400).json({ message: 'reCAPTCHA token is missing' });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

    try {
        // Step 1: Verify reCAPTCHA token
        const recaptchaResponse = await fetch(verifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: secretKey,
                response: recaptchaToken,
            }),
        });

        const recaptchaData = await recaptchaResponse.json();

        // Check if reCAPTCHA validation was successful
        if (!recaptchaData.success || recaptchaData.score < 0.5) {
            return res.status(400).json({
                message: 'Failed reCAPTCHA verification. Please try again.',
                score: recaptchaData.score, // Optional for debugging
            });
        }

        // Step 2: Proceed to send the email
        const msg = {
            to: process.env.EMAIL_RECEIVER, // Your email address
            from: process.env.EMAIL_USER, // Verified SendGrid sender
            subject: `New Contact Form Submission from ${name}`,
            text: `You have received a new message:\n\n${message}\n\nFrom: ${name} (${email})`,
            html: `<p>You have received a new message:</p>
                   <p>${message}</p>
                   <p>From: ${name} (${email})</p>`,
        };

        await sgMail.send(msg);
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error:', error.response ? error.response.body : error.message);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
});

module.exports = router;
