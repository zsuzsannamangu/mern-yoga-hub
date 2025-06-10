const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    classTitle: { type: String, required: true },
    date: { type: String, required: true }, // Keep as string for simplicity
    signatureUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Signup", signupSchema); // Use "Signup" as the model name

