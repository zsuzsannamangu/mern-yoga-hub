const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Format: HH:MM (24-hour)
    class: { type: String, required: true }, // Class name/type
    location: { type: String, required: true }, // Where the class is held
    category: {
        type: String,
        required: true,
        enum: ['chocolate', 'yoga teaching', 'yoga therapy', 'workshop', 'other'],
        default: 'other'
    },
    rate: { type: Number, required: false }, // Payment amount (kept for backward compatibility)
    grossRate: { type: Number, required: true }, // Gross payment amount
    receivedRate: { type: Number, required: true }, // Actual received payment amount
    paymentFrequency: { 
        type: String, 
        required: true,
        enum: ['per-class', 'weekly', 'monthly', 'biweekly'],
        default: 'per-class'
    },
    paymentMethod: { 
        type: String, 
        required: true,
        enum: ['cash', 'check', 'venmo', 'paypal', 'zelle', 'deposit', 'card'],
        default: 'cash'
    },
    paymentRequestSent: { 
        type: String, 
        required: true,
        enum: ['yes', 'no', 'n/a'],
        default: 'no'
    },
    paid: { 
        type: String, 
        required: true,
        enum: ['yes', 'no'],
        default: 'no'
    },
    taxed: { 
        type: String, 
        required: true,
        enum: ['yes', 'no'],
        default: 'no'
    },
    /** Regular slot vs substitute teaching */
    teachingRole: {
        type: String,
        enum: ['regular', 'sub'],
        default: 'regular',
    },
    // Round-trip miles for this row (tax deduction help); from home → studio × 2 when saved
    tripMiles: { type: Number, required: false, default: null },
    // Estimated gas $ for this trip (personal tracking); MPG + $/gal from client when saved
    tripGasCost: { type: Number, required: false, default: null }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Index for efficient querying by date
financeSchema.index({ date: 1, time: 1 });

module.exports = mongoose.model('Finance', financeSchema);
