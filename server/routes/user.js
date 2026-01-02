const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
const router = express.Router();
const dotenv = require('dotenv');
const passport = require('passport');
const path = require('path');
const crypto = require('crypto');
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Configure SendGrid API key

// User Register
router.post('/register', async (req, res) => {
    const { firstName, lastName, email } = req.body;

    try {
        if (!firstName || !lastName || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        // Create a new user
        const newUser = new User({ firstName, lastName, email });

        // Generate the verification token and save it in the user document
        const verificationToken = newUser.generateVerificationToken();

        newUser.verificationToken = verificationToken;
        await newUser.save();

        // Construct the verification URL - ensure FRONTEND_URL is included
        const frontendUrl = process.env.FRONTEND_URL || 'https://www.yogaandchocolate.com';
        const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

        // Prepare the email content
        const emailContent = {
            to: email,
            from: process.env.EMAIL_USER, // Ensure this is correctly set in .env
            subject: 'Complete Your Registration',
            text: `Dear ${firstName}, \n\nThank you for registering for an account. Please complete your registration and sign in by clicking the following link: \n\n${verificationUrl}\n\nIf the link doesn't work, copy and paste it into your browser.\n\nWarm regards,\nZsuzsanna`,
            html: `
                <p>Dear ${firstName},</p>
                <p>Thank you for registering for an account.</p>
                <p>Please complete your registration and sign in by clicking the link below:</p>
                <p><a href="${verificationUrl}" style="color: #007BFF; text-decoration: none; font-weight: bold;">Verify Your Account</a></p>
                <p>If the link above doesn't work, copy and paste this URL into your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 12px;">${verificationUrl}</p>
                <p>Warm regards,<br>Zsuzsanna</p>
            `,
        };

        // Send the email using SendGrid
        try {
            await sgMail.send(emailContent);
            console.log(`Verification email sent successfully to ${email}`);
            res.status(201).json({ message: 'Registration email sent. Please check your inbox (and spam folder) to verify your email.' });
        } catch (emailError) {
            console.error('SendGrid error during registration:', {
                message: emailError.message,
                response: emailError.response?.body,
                code: emailError.code
            });
            // Still save the user, but inform them about email issue
            res.status(201).json({ 
                message: 'Account created, but verification email could not be sent. Please use "Resend Verification Email" on the login page.',
                emailSent: false
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error occurred during registration. Please try again.' });
    }
});

// Resend Verification Email
router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found. Please register first.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Your email is already verified. You can log in now.' });
        }

        // Generate a new verification token
        const verificationToken = user.generateVerificationToken();
        user.verificationToken = verificationToken;
        await user.save();

        // Construct the verification URL - ensure FRONTEND_URL is included
        const frontendUrl = process.env.FRONTEND_URL || 'https://www.yogaandchocolate.com';
        const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

        // Prepare the email content
        const emailContent = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: 'Complete Your Registration - Verification Email',
            text: `Dear ${user.firstName}, \n\nPlease complete your registration by clicking the following link: \n\n${verificationUrl}\n\nIf the link doesn't work, copy and paste it into your browser.`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <p>Dear ${user.firstName},</p>
                <p>You requested a new verification email. Please complete your registration by clicking the link below:</p>
                <p><a href="${verificationUrl}" style="
                    display: inline-block;
                    color: #ffffff;
                    background-color: #007BFF;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                ">Verify Your Account</a></p>
                <p>If the link above doesn't work, copy and paste this URL into your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 12px;">${verificationUrl}</p>
                <p>If you didn't request this email, you can safely ignore it.</p>
                <p>Warm regards,<br>Zsuzsanna</p>
                </div>
            `,
        };

        // Send the email using SendGrid
        try {
            await sgMail.send(emailContent);
            console.log(`Resend verification email sent successfully to ${email}`);
            res.status(200).json({ message: 'Verification email sent. Please check your inbox and spam folder.' });
        } catch (emailError) {
            console.error('SendGrid error during resend verification:', {
                message: emailError.message,
                response: emailError.response?.body,
                code: emailError.code,
                email: email
            });
            
            // Provide more helpful error message
            let errorMessage = 'Failed to send verification email. ';
            if (emailError.response?.body?.errors) {
                const sendGridError = emailError.response.body.errors[0];
                if (sendGridError.message) {
                    errorMessage += sendGridError.message;
                }
            } else {
                errorMessage += 'Please check that your email address is correct and try again later.';
            }
            
            res.status(500).json({ message: errorMessage });
        }
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
    }
});

// Email Verification
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Verification token is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
        //If the user is already verified, this block generates a JWT and returns it immediately:
        if (user.isVerified) {
            const loginToken = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                token: loginToken,
                userId: user._id,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                },
            });
        }

        if (user.verificationToken !== token) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        // This block generates a JWT and returns it after verifying the user's email, marking them as verified (this is used after registration) and automatically logs user in
        const loginToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return token and success message
        return res.status(200).json({
            message: 'Email verified successfully.',
            token: loginToken,
            userId: user._id,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
            },
        });

    } catch (error) {
        console.error('Email verification error:', error);
        
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ 
                message: 'Your verification link has expired. Please request a new verification email from the login page.',
                expired: true
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ 
                message: 'Invalid verification link. Please request a new verification email from the login page.',
                invalid: true
            });
        }
        
        res.status(500).json({ message: 'Server error occurred during verification. Please try again or request a new verification email.' });
    }
});

//backend endpoint to validate the JWT
router.post('/validate-token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('id firstName lastName email phone preferredName pronoun city zipcode');

        if (!user) {
            return res.status(401).json({ isValid: false });
        }
        // Dynamically build the user object
        const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };

        // Only include these fields if they exist
        if (user.phone) {
            userResponse.phone = user.phone;
        }
        if (user.preferredName) {
            userResponse.preferredName = user.preferredName;
        }
        if (user.pronoun) {
            userResponse.pronoun = user.pronoun;
        }
        if (user.city) {
            userResponse.city = user.city;
        }
        if (user.zipcode) {
            userResponse.zipcode = user.zipcode;
        }

        res.status(200).json({
            isValid: true, user: userResponse,
        });
    } catch (error) {
        res.status(401).json({ isValid: false });
    }
});


// User Login
router.post('/login', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found. Please register first.' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ 
                message: 'Please verify your email before logging in. Check your inbox for the verification email, or request a new one.',
                needsVerification: true 
            });
        }

        const loginToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        const loginUrl = `${process.env.FRONTEND_URL}/verify-login?token=${loginToken}`;

        const userName = user.firstName || 'there';

        const emailContent = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: 'Welcome Back! Access Your Account Now',
            text: `Hello ${userName}, \n\nClick the link below to securely log in to your account: \n\n${loginUrl} \n\nIf you didn’t request this email, please ignore it.`,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>Hello ${userName},</p>
            <p>I'm excited to have you back! Click the button below to securely log in to your account:</p>
            <p>
                <a href="${loginUrl}" style="
                            display: inline-block;
                            color: #ffffff;
                            background-color: #007BFF;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-size: 16px;
                        ">
                    Log In
                </a>
            </p>
            <p>If you didn’t request this email, you can safely ignore it.</p>
            <p>Warm regards,<br>Zsuzsanna</p>
            </div>
            `,
        };
        await sgMail.send(emailContent);
        res.status(200).json({
            message: 'Login email sent successfully. Check your inbox to log in.',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

//This endpoint verifies the token sent in the login email and redirects user to the UserBookings.js page
router.get('/verify-login', async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid login token.' });
        }

        // Generate a new token for the user session
        const newToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data and the new token
        res.status(200).json({
            token: newToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                preferredName: user.preferredName,
                pronoun: user.pronoun,
                city: user.city,
                zipcode: user.zipcode,

            },
        });
    } catch (error) {
        console.error('Login verification error:', error.message);
        
        // Check if it's a JWT expiration error
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ 
                message: 'Your login link has expired. Please request a new one.',
                expired: true 
            });
        }
        
        // Check if it's a JWT verification error
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ 
                message: 'Invalid login link. Please request a new one.',
                invalid: true 
            });
        }
        
        // Generic error
        res.status(400).json({ message: 'Invalid or expired login token.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
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

        const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

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

router.get('/user/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

//update user information
router.put('/:userId/update', async (req, res) => {
    const { userId } = req.params;
    const updateData = req.body; // Accept all fields dynamically

    try {
        // Ensure the user exists and update with incoming data
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true } // Return updated document and validate input
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User updated successfully.', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error occurred while updating user.' });
    }
});

//OAuth
// Initiate Google OAuth
router.get('/auth/google', (req, res, next) => {
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        session: false, // 🔥 disables session!
        failureRedirect: '/login',
    }),
    async (req, res) => {
        try {
            const user = req.user;

            // Create JWT manually (instead of req.login())
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            const redirectUrl = new URL(`${process.env.SERVER_URL}/user/oauth`);
            redirectUrl.searchParams.set('token', token);
            redirectUrl.searchParams.set('userId', user._id.toString());
            res.redirect(redirectUrl.toString());

        } catch (err) {
            console.error("Google login error:", err);
            res.status(500).send("OAuth login failed.");
        }
    }
);

module.exports = router;