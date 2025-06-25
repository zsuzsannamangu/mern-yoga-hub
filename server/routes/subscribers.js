const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Subscriber = require('../models/Subscriber');
const sgMail = require('@sendgrid/mail');

// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Rate limiter to prevent abuse
const subscriberLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 5,              // max 5 requests per IP per minute
    message: {
        status: 429,
        error: 'Too many subscription attempts from this IP, please try again later.',
    },
});

router.post('/subscribe', subscriberLimiter, async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Already subscribed' });
        }

        await Subscriber.create({ email });

        const msg = {
            to: email,
            from: {
                email: process.env.EMAIL_USER, // Make sure this is defined
                name: 'Zsuzsanna from Yoga & Chocolate'
            },
            subject: 'Welcome to Yoga & Chocolate!',
            html: `
            <p>Hello,</p>
            <p>Thank you for signing up for updates about Yoga & ReTreat Chocolates!</p>
            <p>I'm excited to share upcoming classes, events, and delicious new creations with you.</p>
            <p>With gratitude,<br/>Zsuzsanna</p>
            <br/><br/>
            <p>If you'd like to unsubscribe, click here: 
            <a href="https://yogaandchocolate.com/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a>
            </p>
            `,
        };

        // Send welcome email, but don’t fail if it breaks
        try {
            await sgMail.send(msg);
            console.log(`Welcome email sent to ${email}`);
        } catch (emailErr) {
            console.error('SendGrid error:', emailErr.response?.body || emailErr.message);
        }

        res.status(200).json({ message: 'Subscribed (email sent if possible)' });
    } catch (err) {
        console.error('Subscription error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/unsubscribe', async (req, res) => {
    const { email } = req.body;

    try {
        await Subscriber.deleteOne({ email });
        res.status(200).send('Unsubscribed successfully');
    } catch (err) {
        console.error('Unsubscribe error:', err);
        res.status(500).send('Error unsubscribing');
    }
});

module.exports = router;
