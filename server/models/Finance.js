const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Format: HH:MM (24-hour)
    class: { type: String, required: true }, // Class name/type
    location: { type: String, required: true }, // Where the class is held
    rate: { type: Number, required: true }, // Payment amount
    paymentFrequency: { 
        type: String, 
        required: true,
        enum: ['per-class', 'weekly', 'monthly', 'biweekly'],
        default: 'per-class'
    },
    paymentMethod: { 
        type: String, 
        required: true,
        enum: ['cash', 'check', 'venmo', 'paypal', 'zelle', 'card'],
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
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Index for efficient querying by date
financeSchema.index({ date: 1, time: 1 });

module.exports = mongoose.model('Finance', financeSchema);
