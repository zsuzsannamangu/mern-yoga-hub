const mongoose = require('mongoose');

const chocolateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    details: { type: String },
    description: { type: String },
    inventory: { type: Number, required: true, default: 0 }, // Track stock
});

module.exports = mongoose.model('Chocolate', chocolateSchema);
