const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    durationMinutes: { type: Number, default: 60, min: 5, max: 600 },
    location: { type: String },
    signUpLink: { type: String, default: '/signup' },
    isExternal: { type: Boolean, default: false },
});

module.exports = mongoose.model('Event', eventSchema);
