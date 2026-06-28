const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function verifyRecaptcha(recaptchaToken) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        throw new Error('RECAPTCHA_SECRET_KEY is not configured');
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            secret: secretKey,
            response: recaptchaToken,
        }),
    });

    return response.json();
}

router.post('/', async (req, res) => {
    const { recaptchaToken, name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    if (!recaptchaToken) {
        return res.status(400).json({ message: 'reCAPTCHA token is missing' });
    }

    try {
        const recaptchaData = await verifyRecaptcha(recaptchaToken);

        if (!recaptchaData.success || (recaptchaData.score != null && recaptchaData.score < 0.5)) {
            return res.status(400).json({
                message: 'Failed reCAPTCHA verification. Please try again.',
            });
        }

        const msg = {
            to: process.env.EMAIL_RECEIVER,
            from: process.env.EMAIL_USER,
            subject: `New Contact Form Submission from ${name}`,
            text: `You have received a new message:\n\n${message}\n\nFrom: ${name} (${email})`,
            html: `<p>You have received a new message:</p>
                   <p>${message}</p>
                   <p>From: ${name} (${email})</p>`,
        };

        await sgMail.send(msg);
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact form error:', error.message);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
});

module.exports = router;
