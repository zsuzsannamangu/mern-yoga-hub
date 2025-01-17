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
});

module.exports = mongoose.model('Booking', bookingSchema);
