const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = (io) => {
    // GET: Fetch all slots (available and booked)
    router.get('/', async (req, res) => {
        const { email, userId } = req.query;

        try {
            if (email || userId) {
                // Fetch bookings for a specific user
                const bookedSlots = await Booking.find({
                    isBooked: true,
                    ...(email && { email }),
                    ...(userId && { userId }),
                }).select('date time firstName lastName email message sessionType');

                return res.status(200).json({
                    success: true,
                    message: 'Fetched booked slots for user',
                    bookedSlots,
                });
            }

            // Fetch all slots (available and booked) if no query params are provided
            const availableSlots = await Booking.find({ isBooked: false });
            const bookedSlots = await Booking.find({ isBooked: true })
                .select('date time firstName lastName email message sessionType');

            return res.status(200).json({
                success: true,
                message: 'Fetched all slots',
                availableSlots,
                bookedSlots,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch slots',
                details: error.message,
            });
        }
    });

    // POST: Add a new slot (admin only)
    router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
        const { slots } = req.body;

        if (!slots || slots.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Slots data is required',
            });
        }

        try {
            const createdSlots = await Booking.insertMany(slots);
            return res.status(201).json({
                success: true,
                message: `${createdSlots.length} slot(s) added successfully`,
                slots: createdSlots,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to add slot(s)',
                details: error.message,
            });
        }
    });


    // DELETE: Remove a slot (admin only)
    router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
        const { id } = req.params;

        try {
            const slot = await Booking.findByIdAndDelete(id);
            if (!slot) {
                return res.status(404).json({
                    success: false,
                    error: 'Slot not found',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Slot deleted successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to delete slot',
                details: error.message,
            });
        }
    });

    // PUT: Book a slot
    router.put('/:id/book', async (req, res) => {
        const { id } = req.params;
        const { userId, firstName, lastName, email, sessionType, message } = req.body;

        // Validate input
        if (!userId || !firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                error: 'User ID, first name, last name, and email are required for booking',
            });
        }

        try {
            const slot = await Booking.findById(id);
            if (!slot) {
                return res.status(404).json({
                    success: false,
                    error: 'Slot not found',
                });
            }

            if (slot.isBooked) {
                return res.status(400).json({
                    success: false,
                    error: 'Slot is already booked',
                });
            }

            // Update slot details
            slot.isBooked = true;
            slot.userId = userId; //store user's ID
            slot.firstName = firstName;
            slot.lastName = lastName;
            slot.email = email;
            slot.sessionType = sessionType || 'Yoga Session';
            slot.message = message || '';
            await slot.save();

            // Emit real-time updates
            io.emit('slotBooked', {
                slotId: id,
                date: slot.date,
                time: slot.time,
            });

            // Send emails
            const userEmail = {
                to: email,
                from: process.env.EMAIL_USER,
                subject: `Booking Confirmation: Yoga Session on ${slot.date} at ${slot.time}`,
                text: `Dear ${firstName},\n\nYour booking has been successfully made!\n\nSession Details:\nDate: ${slot.date}\nTime: ${slot.time}\nSession Type: ${slot.sessionType}\n\nWarm regards,\nZsuzsanna`,
            };

            const adminEmail = {
                to: process.env.EMAIL_RECEIVER,
                from: process.env.EMAIL_USER,
                subject: `New Booking: ${firstName} ${lastName} on ${slot.date} at ${slot.time}`,
                text: `A new booking has been made:\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nSession Type: ${slot.sessionType}\nMessage: ${slot.message}\nDate: ${slot.date}\nTime: ${slot.time}`,
            };

            // Send email notifications
            try {
                await sgMail.send(userEmail);
            } catch (error) {
                console.error('Error sending user email:', error.message);
            }

            try {
                await sgMail.send(adminEmail);
            } catch (error) {
                console.error('Error sending admin email:', error.message);
            }

            return res.status(200).json({
                success: true,
                message: 'Slot booked successfully',
                slot,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to book slot',
                details: error.message,
            });
        }
    });

    return router;
};
