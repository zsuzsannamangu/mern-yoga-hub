const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Subscriber = require('../models/Subscriber');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Apply limiter to this POST route
const subscriberLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    status: 429,
    error: 'Too many subscription attempts from this IP, please try again later.',
  },
});

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Already subscribed' });

    await Subscriber.create({ email });

    // Send welcome email
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL, // must be a verified sender in SendGrid
      subject: 'Welcome to Yoga & Chocolate!',
      html: `
        <p>Hello,</p>
        <p>Thank you for signing up for updates about Yoga & ReTreat Chocolates!</p>
        <p>I'm excited to share upcoming classes, events, and delicious new creations with you.</p>
        <p>With gratitude,<br/>Zsuzsanna</p>
      `
    };

    await sgMail.send(msg);

    res.status(200).json({ message: 'Subscribed and email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/unsubscribe', async (req, res) => {
  const { email } = req.body;
  try {
    await Subscriber.deleteOne({ email });
    res.status(200).send('Unsubscribed successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error unsubscribing');
  }
});

module.exports = router;
