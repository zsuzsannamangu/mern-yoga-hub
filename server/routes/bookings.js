const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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
                const query = { isBooked: true };
                
                if (email) {
                    // Try exact match first, then case-insensitive
                    // Also search for partial matches in case of typos
                    const exactMatch = await Booking.find({ 
                        isBooked: true, 
                        email: email 
                    });
                    
                    const caseInsensitiveMatch = await Booking.find({ 
                        isBooked: true, 
                        email: { $regex: new RegExp(`^${email}$`, 'i') } 
                    });
                    
                    // Combine and deduplicate
                    const allMatches = [...exactMatch, ...caseInsensitiveMatch];
                    const uniqueMatches = allMatches.filter((booking, index, self) => 
                        index === self.findIndex(b => b._id.toString() === booking._id.toString())
                    );
                    
                    if (uniqueMatches.length > 0) {
                        const bookedSlots = uniqueMatches
                            .map(b => ({
                                _id: b._id,
                                date: b.date,
                                time: b.time,
                                firstName: b.firstName,
                                lastName: b.lastName,
                                email: b.email,
                                userId: b.userId,
                                sessionType: b.sessionType,
                                message: b.message,
                                isAdminCreated: b.isAdminCreated,
                                status: b.status
                            }))
                            .sort((a, b) => {
                                const dateCompare = a.date.localeCompare(b.date);
                                return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
                            });
                        
                        console.log(`Found ${bookedSlots.length} bookings for email ${email}:`, bookedSlots);
                        
                        return res.status(200).json({
                            success: true,
                            message: 'Fetched booked slots for user',
                            bookedSlots,
                        });
                    }
                    
                    // If no matches found, log all bookings with similar emails for debugging
                    console.log(`No bookings found for email: ${email}`);
                    const allBookings = await Booking.find({ isBooked: true }).select('email date time firstName lastName');
                    console.log('All booked emails in database:', allBookings.map(b => b.email));
                    
                    query.email = { $regex: new RegExp(`^${email}$`, 'i') };
                }
                
                if (userId) {
                    // Handle both string and ObjectId formats
                    if (mongoose.Types.ObjectId.isValid(userId)) {
                        query.userId = new mongoose.Types.ObjectId(userId);
                    } else {
                        query.userId = userId;
                    }
                }
                
                // If we get here, it means userId was provided but no email matches
                // Still execute the query for userId
                const bookedSlots = await Booking.find(query)
                    .select('date time firstName lastName email message sessionType title length location link isAdminCreated status userId')
                    .sort({ date: 1, time: 1 }); // Sort by date and time
                
                console.log(`Found ${bookedSlots.length} bookings for query:`, { 
                    email, 
                    userId, 
                    query,
                    bookings: bookedSlots.map(b => ({
                        id: b._id,
                        date: b.date,
                        time: b.time,
                        email: b.email,
                        userId: b.userId,
                        firstName: b.firstName,
                        lastName: b.lastName
                    }))
                });

                return res.status(200).json({
                    success: true,
                    message: 'Fetched booked slots for user',
                    bookedSlots,
                });
            }

            // Fetch all slots (available and booked) if no query params are provided
            const availableSlots = await Booking.find({ isBooked: false });
            const bookedSlots = await Booking.find({ isBooked: true })
                .select('date time firstName lastName email message sessionType title length location link isAdminCreated status userId')
                .populate('userId', 'firstName lastName email') // Populate user details if needed
                .sort({ date: 1, time: 1 }); // Sort by date and time
            
            console.log(`Admin fetch: Found ${bookedSlots.length} booked slots`);
            
            // Log all unique emails for debugging
            const uniqueEmails = [...new Set(bookedSlots.map(b => b.email))];
            console.log(`All booked emails (${uniqueEmails.length} unique):`, uniqueEmails);

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
            console.error('Booking validation failed:', { userId, firstName, lastName, email });
            return res.status(400).json({
                success: false,
                error: 'User ID, first name, last name, and email are required for booking',
            });
        }

        try {
            const slot = await Booking.findById(id);
            if (!slot) {
                console.error('Slot not found:', id);
                return res.status(404).json({
                    success: false,
                    error: 'Slot not found',
                });
            }

            if (slot.isBooked) {
                console.warn('Attempted to book already booked slot:', id);
                return res.status(400).json({
                    success: false,
                    error: 'Slot is already booked',
                });
            }

            // Convert userId to ObjectId if it's a string (for consistency)
            let userIdObjectId = userId;
            if (mongoose.Types.ObjectId.isValid(userId)) {
                userIdObjectId = new mongoose.Types.ObjectId(userId);
            } else {
                console.warn('Invalid userId format:', userId, typeof userId);
            }

            // Update slot details
            slot.isBooked = true;
            slot.userId = userIdObjectId; //store user's ID as ObjectId
            slot.firstName = firstName;
            slot.lastName = lastName;
            slot.email = email;
            slot.sessionType = sessionType || 'Yoga Session';
            slot.message = message || '';
            
            const savedSlot = await slot.save();
            
            // Verify the booking was saved
            if (!savedSlot || !savedSlot.isBooked) {
                throw new Error('Failed to save booking');
            }
            
            console.log('Booking saved successfully:', {
                bookingId: savedSlot._id,
                userId: savedSlot.userId,
                email: savedSlot.email,
                date: savedSlot.date,
                time: savedSlot.time
            });

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
                  Location: We can meet in North Portland or use Google Meet. I'll email you to confirm.</p>
              
                  <p>Before your first session, please fill out this form:<br/>
                  <a href="https://docs.google.com/forms/d/e/1FAIpQLScvgtnQnBdWWTJqwQbqo98X_vNYpjuH9x-YpsAlced_xKjbSA/viewform?usp=header" target="_blank">New Client Form</a></p>
              
                  <p>I'm looking forward to working with you!</p>
                  <p>As a thank-you for booking a yoga session with me, you’re welcome to **10% off** any chocolate order of $15 or more using the code **YOGAXCHOCOLATE**.</p>
                  <p>Warm regards,<br/>Zsuzsanna</p>
                `,
            };

            const adminEmail = {
                to: process.env.EMAIL_RECEIVER || 'mzsuzsanna10@gmail.com',
                from: process.env.EMAIL_USER,
                subject: `New Booking: ${firstName} ${lastName} on ${slot.date} at ${formattedTime}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2>New Booking Received</h2>
                        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>User ID:</strong> ${userId}</p>
                        <p><strong>Session Type:</strong> ${slot.sessionType}</p>
                        <p><strong>Date:</strong> ${slot.date}</p>
                        <p><strong>Time:</strong> ${formattedTime}</p>
                        ${slot.message ? `<p><strong>Message:</strong> ${slot.message}</p>` : ''}
                        <p><strong>Booking ID:</strong> ${slot._id}</p>
                        <p>You can view this booking in the admin dashboard.</p>
                    </div>
                `,
                text: `A new booking has been made:\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nUser ID: ${userId}\nSession Type: ${slot.sessionType}\nMessage: ${slot.message || 'None'}\nDate: ${slot.date}\nTime: ${formattedTime}\nBooking ID: ${slot._id}`,
            };

            // Send email notifications (but don't fail booking if email fails)
            let emailErrors = [];
            
            try {
                await sgMail.send(userEmail);
                console.log(`User confirmation email sent successfully to ${email}`);
            } catch (error) {
                console.error('Error sending user email:', {
                    message: error.message,
                    response: error.response?.body,
                    email: email
                });
                emailErrors.push('user email');
            }

            try {
                await sgMail.send(adminEmail);
                console.log(`Admin notification email sent successfully to ${process.env.EMAIL_RECEIVER || 'mzsuzsanna10@gmail.com'}`);
            } catch (error) {
                console.error('Error sending admin email:', {
                    message: error.message,
                    response: error.response?.body,
                    adminEmail: process.env.EMAIL_RECEIVER || 'mzsuzsanna10@gmail.com',
                    sendGridError: error.response?.body?.errors
                });
                emailErrors.push('admin email');
            }

            // Log booking success even if emails failed
            console.log(`Booking saved successfully:`, {
                bookingId: slot._id,
                userId: userId,
                email: email,
                date: slot.date,
                time: slot.time,
                sessionType: slot.sessionType,
                emailErrors: emailErrors.length > 0 ? emailErrors : 'none'
            });

            return res.status(200).json({
                success: true,
                message: 'Slot booked successfully',
                slot,
                emailSent: emailErrors.length === 0,
                emailErrors: emailErrors.length > 0 ? emailErrors : undefined
            });
        } catch (error) {
            console.error('Error booking slot:', {
                error: error.message,
                stack: error.stack,
                slotId: id,
                userId: userId,
                email: email
            });
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

            // Format time for email using Luxon to avoid timezone issues
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
                    { zone: 'America/Los_Angeles' } // Force interpretation in Pacific timezone
                );
            
                return dateTime.toLocaleString(DateTime.TIME_SIMPLE) + ' ' + dateTime.offsetNameShort; // e.g., 9:00 AM PDT
            };
            
            const formattedTime = formatTimeWithZone(newDate, newTime);

            // Send reschedule confirmation email to user
            const userEmailAddress = currentBooking.email || 'mzsuzsanna10@gmail.com';
            const fromEmailAddress = process.env.EMAIL_USER || 'mzsuzsanna10@gmail.com';
            
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
            const adminEmailAddress = process.env.EMAIL_RECEIVER || 'mzsuzsanna10@gmail.com';
            const adminFromAddress = process.env.EMAIL_USER || 'mzsuzsanna10@gmail.com';
            
            console.log('Admin email address:', adminEmailAddress);
            console.log('Admin from address:', adminFromAddress);
            
            const adminEmail = {
                to: adminEmailAddress,
                from: adminFromAddress,
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
                if (error.response && error.response.body) {
                    console.error('SendGrid error details:', JSON.stringify(error.response.body, null, 2));
                }
            }

            try {
                console.log('Attempting to send admin email to:', adminEmailAddress);
                await sgMail.send(adminEmail);
                console.log('Admin reschedule email sent successfully');
            } catch (error) {
                console.error('Error sending admin reschedule email:', error.message);
                console.error('Full error:', error);
                if (error.response && error.response.body) {
                    console.error('SendGrid error details:', JSON.stringify(error.response.body, null, 2));
                }
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
