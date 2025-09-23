const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Associate booking with a user
    firstName: { type: String }, // Add user name for booked slots
    lastName: { type: String},
    email: { type: String }, // Add user email for booked slots
    sessionType: { type: String }, // Add session type
    message: { type: String }, // Message from the user
    // New fields for admin-created appointments
    title: { type: String }, // Yoga therapy or private yoga class
    length: { type: String }, // 60 min, 75 min, etc.
    location: { type: String }, // Physical address
    link: { type: String }, // Online meeting link
    isAdminCreated: { type: Boolean, default: false }, // Flag for admin-created appointments
    status: { type: String, enum: ['scheduled', 'rescheduled', 'cancelled'], default: 'scheduled' }
});

module.exports = mongoose.model('Booking', bookingSchema);
