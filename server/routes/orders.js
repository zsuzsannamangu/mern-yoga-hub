const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Chocolate = require("../models/Chocolate");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Handle new order creation
router.post("/orders", async (req, res) => {
    const { orderId, payerName, payerEmail, transactionAmount, cartItems } = req.body;

    if (!orderId || !payerName || !payerEmail || !transactionAmount || !cartItems.length) {
        return res.status(400).json({ error: "Missing order details." });
    }

    try {
        // Check inventory before processing order
        for (const item of cartItems) {
            const chocolate = await Chocolate.findById(item._id);
            if (!chocolate || chocolate.inventory < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for ${item.name}` });
            }
        }

        // Deduct stock from inventory
        for (const item of cartItems) {
            await Chocolate.findByIdAndUpdate(item._id, {
                $inc: { inventory: -item.quantity },
            });
        }

        // Save order in database
        const newOrder = new Order({
            orderId,
            payerName,
            payerEmail,
            transactionAmount,
            cartItems,
        });
        await newOrder.save();

        // Send confirmation email to user
        const orderEmailToUser = {
            to: payerEmail,
            from: process.env.EMAIL_USER,
            subject: "Chocolate Order Confirmation",
            html: `
                <p>Dear ${payerName},</p>
                <p>Thank you for your order! Below are the details:</p>
                <ul>
                    ${cartItems
                    .map(
                        (item) =>
                            `<li>${item.quantity} x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>`
                    )
                    .join("")}
                </ul>
                <p><b>Total amount paid including shipping:</b> $${transactionAmount}</p>
                <p>Your chocolates are being lovingly prepared and will ship within 4–6 days. You'll receive an email when your order is on its way.</p>
                <p>I appreciate your support!</p>
                <p>As a small gift, you're invited to book a <b>free 60-minute therapeutic yoga session</b> with me. 
                Just use the code <b>YOURJOURNEY</b> when scheduling, after registering for an account.</p>

                <p>Feel free to email me with any questions.</p>

                <p>Best regards,<br>Zsuzsanna,<br>Owner of ReTreat Chocolates</p>
            `,
        };

        // Email to admin
        const orderEmailToAdmin = {
            to: process.env.EMAIL_RECEIVER,
            from: process.env.EMAIL_USER,
            subject: "Chocolate Order",
            html: `
                <h2>Chocolate Order Received</h2>
                <p><b>Name:</b> ${payerName}</p>
                <p><b>Email:</b> ${payerEmail}</p>
                <p><b>Order ID:</b> ${orderId}</p>
                <p><b>Total Amount:</b> ${transactionAmount}</p>
                <p><b>Order details:</p>
                <ul>
                    ${cartItems
                    .map(
                        (item) =>
                            `<li>${item.quantity} x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>`
                    )
                    .join("")}
                </ul>
            `,
        };

        await sgMail.send(orderEmailToUser);
        await sgMail.send(orderEmailToAdmin);

        res.status(200).json({ message: "Order saved and email sent." });
    } catch (error) {
        res.status(500).json({ error: "Failed to process order", details: error.message });
    }
});

// GET all orders (for admin)
router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

module.exports = router;
