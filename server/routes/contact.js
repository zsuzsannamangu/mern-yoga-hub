const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    try {
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
        console.error('Error sending email:', error.response ? error.response.body : error.message);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
});

module.exports = router;
