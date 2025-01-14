const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String },
    signUpLink: { type: String, default: '/signup' },
    isExternal: { type: Boolean, default: false },
});

module.exports = mongoose.model('Event', eventSchema);
