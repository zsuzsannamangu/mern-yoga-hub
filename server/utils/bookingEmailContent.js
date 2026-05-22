const mongoose = require('mongoose');
const Booking = require('../models/Booking');

const INTAKE_FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLScvgtnQnBdWWTJqwQbqo98X_vNYpjuH9x-YpsAlced_xKjbSA/viewform';

/**
 * True when the client has no other booked sessions (excluding excludeBookingId).
 */
async function isFirstSessionBooking({ userId, email, excludeBookingId }) {
    const orConditions = [];

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        orConditions.push({ userId: new mongoose.Types.ObjectId(userId) });
    }

    if (email && String(email).trim()) {
        const escaped = String(email).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        orConditions.push({ email: { $regex: new RegExp(`^${escaped}$`, 'i') } });
    }

    if (orConditions.length === 0) {
        return true;
    }

    const query = {
        isBooked: true,
        $or: orConditions,
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const priorCount = await Booking.countDocuments(query);
    return priorCount === 0;
}

function getIntakeFormEmailHtml() {
    return `
              <p>If this will be your first session with me, please take a few minutes to complete our
              <a href="${INTAKE_FORM_URL}" target="_blank" rel="noopener noreferrer" style="color: #007BFF; text-decoration: none; font-weight: bold;">Private Client Intake Form</a>
              before we meet. Your responses help me prepare thoughtfully for our time together, and everything you share is kept confidential.</p>
            `.trim();
}

function getIntakeFormEmailText() {
    return `If this will be your first session with me, please complete our Private Client Intake Form before we meet (${INTAKE_FORM_URL}). Your responses help me prepare thoughtfully for our time together, and everything you share is kept confidential.`;
}

module.exports = {
    INTAKE_FORM_URL,
    isFirstSessionBooking,
    getIntakeFormEmailHtml,
    getIntakeFormEmailText,
};
