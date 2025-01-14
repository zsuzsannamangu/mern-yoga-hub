const mongoose = require("mongoose");

const waiverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    classTitle: { type: String, required: true },
    date: { type: Date, required: true },
    signature: { type: String, required: true }, // Store base64 image
    createdAt: { type: Date, default: Date.now },
  });  

module.exports = mongoose.model("Waiver", waiverSchema);
