const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const sgMail = require('@sendgrid/mail');
const { DateTime } = require('luxon');

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
                }).select('date time firstName lastName email message sessionType title length location link isAdminCreated status');

                return res.status(200).json({
                    success: true,
                    message: 'Fetched booked slots for user',
                    bookedSlots,
                });
            }

            // Fetch all slots (available and booked) if no query params are provided
            const availableSlots = await Booking.find({ isBooked: false });
            const bookedSlots = await Booking.find({ isBooked: true })
                .select('date time firstName lastName email message sessionType title length location link isAdminCreated status');

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

            const formatTimeWithZone = (dateStr, timeStr) => {
                // Combine date and time into ISO-like string
                const [hour, minute] = timeStr.split(':');
                const dateTime = DateTime.fromObject(
                    {
                        year: Number(dateStr.split('-')[0]),
                        month: Number(dateStr.split('-')[1]),
                        day: Number(dateStr.split('-')[2]),
                        hour: Number(hour),
                        minute: Number(minute),
                    },
                    { zone: 'America/Los_Angeles' } // Force interpretation in this zone
                );
            
                return dateTime.toLocaleString(DateTime.TIME_SIMPLE) + ' ' + dateTime.offsetNameShort; // e.g., 9:00 AM PDT
            };
            
            const formattedTime = formatTimeWithZone(slot.date, slot.time);

            // Send emails
            const userEmail = {
                to: email,
                from: process.env.EMAIL_USER,
                subject: `Booking Confirmation: Yoga Session on ${slot.date} at ${formattedTime}`,
                html: `
                  <p>Dear ${firstName},</p>
              
                  <p>Your booking has been successfully made!</p>
              
                  <p><strong>Session Details:</strong><br/>
                  Date: ${slot.date}<br/>
                  Time: ${formattedTime}<br/>
                  Session Type: ${slot.sessionType}<br/>
                  Location: We can meet at my home in North Portland, Arbor Lodge area or use Google Meets. I'll email you to confirm.</p>
              
                  <p>Before your first session, please fill out this form:<br/>
                  <a href="https://docs.google.com/forms/d/e/1FAIpQLScvgtnQnBdWWTJqwQbqo98X_vNYpjuH9x-YpsAlced_xKjbSA/viewform?usp=header" target="_blank">New Client Form</a></p>
              
                  <p>I'm looking forward to working with you!</p>
                  <p>As a thank-you for booking a yoga session with me, you’re welcome to **10% off** any chocolate order of $15 or more using the code **YOGAXCHOCOLATE**.</p>
                  <p>Warm regards,<br/>Zsuzsanna</p>
                `,
            };

            const adminEmail = {
                to: process.env.EMAIL_RECEIVER,
                from: process.env.EMAIL_USER,
                subject: `New Booking: ${firstName} ${lastName} on ${slot.date} at ${formattedTime}`,
                text: `A new booking has been made:\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nSession Type: ${slot.sessionType}\nMessage: ${slot.message}\nDate: ${slot.date}\nTime: ${formattedTime}`,
            };

            // Send email notification
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

    // PUT: Reschedule an appointment
    router.put('/:id/reschedule', authMiddleware, async (req, res) => {
        const { id } = req.params;
        const { newSlotId, newDate, newTime } = req.body;

        try {
            // Find the current booking
            const currentBooking = await Booking.findById(id);
            if (!currentBooking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Find the new slot
            const newSlot = await Booking.findById(newSlotId);
            if (!newSlot) {
                return res.status(404).json({
                    success: false,
                    message: 'New time slot not found'
                });
            }

            if (newSlot.isBooked) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected time slot is no longer available'
                });
            }

            // Update the current booking with new date/time
            currentBooking.date = newDate;
            currentBooking.time = newTime;
            currentBooking.status = 'rescheduled';
            await currentBooking.save();

            // Mark the new slot as booked
            newSlot.isBooked = true;
            newSlot.userId = currentBooking.userId;
            newSlot.firstName = currentBooking.firstName;
            newSlot.lastName = currentBooking.lastName;
            newSlot.email = currentBooking.email;
            newSlot.sessionType = currentBooking.sessionType;
            newSlot.title = currentBooking.title;
            newSlot.length = currentBooking.length;
            newSlot.duration = currentBooking.duration;
            newSlot.location = currentBooking.location;
            newSlot.link = currentBooking.link;
            newSlot.message = currentBooking.message;
            newSlot.isAdminCreated = currentBooking.isAdminCreated;
            newSlot.status = 'scheduled';
            await newSlot.save();

            // Format time for email
            const [hour, minute] = newTime.split(':');
            const newDateTime = new Date(`${newDate}T${newTime}`);
            const formattedTime = newDateTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZoneName: 'short'
            });

            // Send reschedule confirmation email to user
            const userEmailAddress = currentBooking.email || 'mzsuzsanna10@gmail.com';
            const fromEmailAddress = process.env.SENDGRID_FROM_EMAIL || 'mzsuzsanna10@gmail.com';
            
            console.log('User email address:', userEmailAddress);
            console.log('From email address:', fromEmailAddress);
            
            const userEmail = {
                to: userEmailAddress,
                from: fromEmailAddress,
                subject: 'Appointment Rescheduled - Yoga with Zsuzsanna',
                text: `Dear ${currentBooking.firstName},\n\nYour appointment has been rescheduled to ${newDate} at ${formattedTime}.\n\nIf you have any questions, please don't hesitate to contact me.\n\nWarm regards,\nZsuzsanna`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <p>Dear ${currentBooking.firstName},</p>
                        <p>Your appointment has been rescheduled to <strong>${newDate} at ${formattedTime}</strong>.</p>
                        <p>If you have any questions, please don't hesitate to contact me.</p>
                        <p>Warm regards,<br>Zsuzsanna</p>
                    </div>
                `
            };

            // Send reschedule notification email to admin
            const adminEmailAddress = process.env.SENDGRID_FROM_EMAIL || 'mzsuzsanna10@gmail.com';
            
            console.log('Admin email address:', adminEmailAddress);
            
            const adminEmail = {
                to: adminEmailAddress,
                from: adminEmailAddress,
                subject: 'Appointment Rescheduled - Yoga with Zsuzsanna',
                text: `Appointment rescheduled:\n\nClient: ${currentBooking.firstName} ${currentBooking.lastName}\nEmail: ${currentBooking.email}\nSession Type: ${currentBooking.title || currentBooking.sessionType}\nNew Date: ${newDate}\nNew Time: ${formattedTime}\n\nPrevious Date: ${currentBooking.date}\nPrevious Time: ${currentBooking.time}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h3>Appointment Rescheduled</h3>
                        <p><strong>Client:</strong> ${currentBooking.firstName} ${currentBooking.lastName}</p>
                        <p><strong>Email:</strong> ${currentBooking.email}</p>
                        <p><strong>Session Type:</strong> ${currentBooking.title || currentBooking.sessionType}</p>
                        <p><strong>New Date:</strong> ${newDate}</p>
                        <p><strong>New Time:</strong> ${formattedTime}</p>
                        <p><strong>Previous Date:</strong> ${currentBooking.date}</p>
                        <p><strong>Previous Time:</strong> ${currentBooking.time}</p>
                    </div>
                `
            };

            // Send emails with validation
            try {
                console.log('Attempting to send user email to:', userEmailAddress);
                await sgMail.send(userEmail);
                console.log('User reschedule email sent successfully');
            } catch (error) {
                console.error('Error sending user reschedule email:', error.message);
                console.error('Full error:', error);
            }

            try {
                console.log('Attempting to send admin email to:', adminEmailAddress);
                await sgMail.send(adminEmail);
                console.log('Admin reschedule email sent successfully');
            } catch (error) {
                console.error('Error sending admin reschedule email:', error.message);
                console.error('Full error:', error);
            }

            // Emit socket event for real-time updates
            io.emit('slotRescheduled', {
                oldSlotId: currentBooking._id,
                newSlotId: newSlot._id,
                userId: currentBooking.userId
            });

            // Emit additional event to refresh user bookings
            io.emit('bookingUpdated', {
                userId: currentBooking.userId
            });

            return res.status(200).json({
                success: true,
                message: 'Appointment rescheduled successfully',
                booking: currentBooking
            });

        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reschedule appointment',
                error: error.message
            });
        }
    });

    return router;
};
