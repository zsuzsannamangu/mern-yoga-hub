const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Event = require('../models/Event');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth'); // Import middlewares
const router = express.Router();
const dotenv = require('dotenv');
const User = require('../models/User');
dotenv.config();

// Admin Login
router.post('/login', async (req, res) => {
    const { email, password, recaptchaToken } = req.body;

    // Step 1: Verify reCAPTCHA
    if (!recaptchaToken) {
        return res.status(400).json({ message: 'reCAPTCHA token is missing' });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

    try {
        const recaptchaRes = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: secretKey,
                response: recaptchaToken,
            }),
        });

        const recaptchaData = await recaptchaRes.json();

        if (!recaptchaData.success || recaptchaData.score < 0.5) {
            return res.status(403).json({
                message: 'Failed reCAPTCHA verification. Please try again.',
                score: recaptchaData.score,
            });
        }
        
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const accessToken = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: admin._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        const adminData = {
            id: admin._id,
            email: admin.email,
        };

        return res.status(200).json({ message: 'Login successful', admin: adminData, accessToken });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/refresh-token', (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(403).json({ message: 'Refresh token required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const newAccessToken = jwt.sign({ id: decoded.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// Verify Admin
router.get('/verify', authMiddleware, adminMiddleware, (req, res) => {
    res.status(200).json({ message: 'Admin verified successfully' });
});

// Post events
router.post('/events', authMiddleware, adminMiddleware, async (req, res) => {
    const { title, date, time, location, signUpLink } = req.body;

    if (!title || !date || !time || !location) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const newEvent = new Event({ title, date, time, location, signUpLink });
        const savedEvent = await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: savedEvent });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event', details: error.message });
    }
});

router.delete('/bookings/cleanup', async (req, res) => {
    try {
        const now = new Date();

        // Delete all available slots that have passed
        const result = await Booking.deleteMany({
            date: { $lt: now.toISOString().split('T')[0] }, // Slots with dates before today
            time: { $lt: now.toTimeString().split(' ')[0] }, // Slots with times before now
            isBooked: false, // Ensure we only delete unbooked slots
        });

        res.status(200).json({ message: `${result.deletedCount} passed slots removed.` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to clean up passed slots.' });
    }
});

// GET all users for the admin page
router.get('/users', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users, use model: User
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users." });
    }
});

module.exports = router;
