const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Event = require('../models/Event');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth'); // Import middlewares
const router = express.Router();
const dotenv = require('dotenv');
const User = require('../models/User');
const fetch = require('node-fetch'); // For reCAPTCHA validation
const Subscriber = require('../models/Subscriber');
const Booking = require('../models/Booking');
const sgMail = require('@sendgrid/mail');
const { DateTime } = require('luxon');
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// POST create new client (Admin only)
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
  const { firstName, lastName, email, phone, pronoun, city, zipcode } = req.body;

  try {
    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone: phone || null,
      pronoun: pronoun || null,
      city: city || null,
      zipcode: zipcode || null,
      isVerified: true, // Mark as verified so they can log in immediately
    });

    await newUser.save();

    // Send welcome email
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const emailContent = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Welcome to Yoga with Zsuzsanna - Your Account is Ready!',
      text: `Dear ${firstName}, \n\nYour account has been created to work with Zsuzsanna Mangu. You can now log in to view upcoming sessions and book appointments.\n\nTo log in, visit: ${loginUrl}\n\nSimply enter your email address and request a login link.\n\nWarm regards,\nZsuzsanna`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Dear ${firstName},</p>
          <p>Your account has been created to work with Zsuzsanna Mangu! You can now log in to view upcoming sessions and book appointments.</p>
          <p>To log in, click the button below:</p>
          <p>
            <a href="${loginUrl}" style="
              display: inline-block;
              color: #ffffff;
              background-color: #007BFF;
              padding: 8px 16px;
              text-decoration: none;
              border-radius: 4px;
              font-size: 14px;
              font-weight: normal;
            ">
              Log In to Your Account
            </a>
          </p>
          <p>Simply enter your email address (${email}) and request a login link.</p>
          <p>Warm regards,<br>Zsuzsanna</p>
        </div>
      `,
    };

    await sgMail.send(emailContent);

    res.status(201).json({ 
      message: 'Client created successfully and welcome email sent.', 
      user: newUser 
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Server error occurred while creating client.' });
  }
});

// PUT update a specific user by ID (Admin only)
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, pronoun, city, zipcode } = req.body;

  try {
    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required.' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already taken by another user.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, phone, pronoun, city, zipcode },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ 
      message: 'User updated successfully.', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error occurred while updating user.' });
  }
});

// DELETE a specific user by ID (Admin only)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user.' });
  }
});

// PUT update intake form completion status for a user (Admin only)
router.put('/users/:id/intake-form', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { intakeFormCompleted } = req.body;
  
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { intakeFormCompleted },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.status(200).json({ 
      message: 'Intake form status updated successfully.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        intakeFormCompleted: user.intakeFormCompleted
      }
    });
  } catch (error) {
    console.error('Error updating intake form status:', error);
    res.status(500).json({ message: 'Server error while updating intake form status.' });
  }
});

// GET all newsletter subscribers (Admin only)
router.get('/subscribers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.status(200).json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Failed to fetch subscribers.' });
  }
});

// DELETE a newsletter subscriber by ID (Admin only)
router.delete('/subscribers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subscriber.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Subscriber not found.' });
    }
    res.status(200).json({ message: 'Subscriber deleted successfully.' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ message: 'Failed to delete subscriber.' });
  }
});

// POST create appointment for client (Admin only)
router.post('/appointments', authMiddleware, adminMiddleware, async (req, res) => {
  const { userId, title, date, time, length, location, link } = req.body;

  try {
    // Validate required fields
    if (!userId || !title || !date || !time || !length) {
      return res.status(400).json({ message: 'User ID, title, date, time, and length are required.' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create new appointment
    const newAppointment = new Booking({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      date,
      time,
      title,
      length,
      location: location || '',
      link: link || '',
      isBooked: true,
      isAdminCreated: true,
      status: 'scheduled'
    });

    await newAppointment.save();

    // Format time with timezone
    const formatTimeWithZone = (dateStr, timeStr) => {
      const [hour, minute] = timeStr.split(':');
      const dateTime = DateTime.fromObject(
        {
          year: Number(dateStr.split('-')[0]),
          month: Number(dateStr.split('-')[1]),
          day: Number(dateStr.split('-')[2]),
          hour: Number(hour),
          minute: Number(minute),
        },
        { zone: 'America/Los_Angeles' }
      );
      return dateTime.toLocaleString(DateTime.TIME_SIMPLE) + ' ' + dateTime.offsetNameShort;
    };

    const formattedTime = formatTimeWithZone(date, time);

    // Prepare location/link information for email
    let locationInfoText = '';
    let locationInfoHtml = '';
    
    if (location && link) {
      locationInfoText = `Location: ${location}\nJoin Meeting: ${link}`;
      locationInfoHtml = `Location: ${location}<br><a href="${link}" style="color: #007BFF; text-decoration: none; font-weight: bold;">Join Meeting</a>`;
    } else if (location) {
      locationInfoText = `Location: ${location}`;
      locationInfoHtml = `Location: ${location}`;
    } else if (link) {
      locationInfoText = `Join Meeting: ${link}`;
      locationInfoHtml = `<a href="${link}" style="color: #007BFF; text-decoration: none; font-weight: bold;">Join Meeting</a>`;
    } else {
      locationInfoText = 'Location: TBD';
      locationInfoHtml = 'Location: TBD';
    }

    // Send appointment confirmation email
    const emailContent = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'New Appointment Scheduled with Zsuzsanna',
      text: `Dear ${user.firstName}, \n\nYour "${title}" session with Zsuzsanna Mangu at ${new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })} ${formattedTime} (${length}) has been scheduled.\n\n${locationInfoText}\n\nPlease log in to your account or 
      email me to make changes.\n\nSessions are $10-$80 sliding scale through June 2026, while I'm in training. Payments are accepted via Venmo @Zsuzsanna-Mangu.\n\nI'm looking forward to working with you!\n\nWarm regards,\nZsuzsanna`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Dear ${user.firstName},</p>
          <p>Your "${title}" session with Zsuzsanna Mangu at ${new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })} ${formattedTime} (${length}) has been scheduled.</p>
          <p><strong>${locationInfoHtml}</strong></p>
          <p>Please log in to your account or email me to make changes.</p>
          <p>Sessions are $10-$80 sliding scale through June 2026, while I'm in training. Payments are accepted via Venmo @Zsuzsanna-Mangu.</p>
          <p>I'm looking forward to working with you!</p>
          <p>Warm regards,<br>Zsuzsanna</p>
        </div>
      `,
    };

    await sgMail.send(emailContent);

    res.status(201).json({ 
      message: 'Appointment created successfully and confirmation email sent.', 
      appointment: newAppointment 
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error occurred while creating appointment.' });
  }
});

// GET appointments for a specific user (Admin only)
router.get('/users/:userId/appointments', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await Booking.find({ 
      userId, 
      isAdminCreated: true 
    }).sort({ date: 1, time: 1 });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments.' });
  }
});

// PUT reschedule appointment (Admin only)
router.put('/appointments/:id/reschedule', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { date, time, location } = req.body;

  try {
    const appointment = await Booking.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    appointment.date = date || appointment.date;
    appointment.time = time || appointment.time;
    appointment.location = location !== undefined ? location : appointment.location;
    appointment.status = 'rescheduled';

    await appointment.save();

    res.status(200).json({ message: 'Appointment rescheduled successfully.', appointment });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ message: 'Failed to reschedule appointment.' });
  }
});

// PUT update appointment (Admin only)
router.put('/appointments/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, date, time, length, location, link } = req.body;

  try {
    // Validate required fields
    if (!title || !date || !time || !length) {
      return res.status(400).json({ message: 'Title, date, time, and length are required.' });
    }

    const appointment = await Booking.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Update appointment fields
    appointment.title = title;
    appointment.sessionType = title; // Also update sessionType for user-created appointments
    appointment.date = date;
    appointment.time = time;
    appointment.length = length;
    appointment.duration = length; // Also update duration for user-created appointments
    appointment.location = location || '';
    appointment.link = link || '';
    appointment.status = 'rescheduled'; // Mark as rescheduled when edited

    await appointment.save();

    res.status(200).json({ 
      message: 'Appointment updated successfully.', 
      appointment 
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Failed to update appointment.' });
  }
});

// PUT cancel appointment (Admin only)
router.put('/appointments/:id/cancel', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Booking.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ message: 'Appointment cancelled successfully.', appointment });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Failed to cancel appointment.' });
  }
});

// DELETE appointment (Admin only) - permanently remove from database
router.delete('/appointments/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Booking.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    await Booking.findByIdAndDelete(id);

    res.status(200).json({ message: 'Appointment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Failed to delete appointment.' });
  }
});

module.exports = router;
