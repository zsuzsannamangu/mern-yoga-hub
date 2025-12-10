const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    payerName: { type: String, required: true },
    payerEmail: { type: String, required: true },
    transactionAmount: { type: Number, required: true },
    cartItems: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            _id: { type: mongoose.Schema.Types.ObjectId, ref: "Chocolate", required: true },
        },
    ],
    orderDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
