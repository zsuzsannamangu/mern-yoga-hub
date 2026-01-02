const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Define the User schema
const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true, // Ensure email is unique
        },
        phone:
        {
            type: String,
            default: null // Ensure it’s optional

        },
        preferredName: {
            type: String,
        },
        pronoun: {
            type: String,
        },
        city: {
            type: String,
        },
        zipcode: {
            type: String,
        },
        googleId: {
            type: String, // For Google OAuth users
        },
        isAdmin: {
            type: Boolean,
            default: false, // Default to regular users
        },
        isVerified: {
            type: Boolean,
            default: false, // New users are not verified by default
        },
        verificationToken: {
            type: String, // Token for email verification
        },
        tokenExpires: {
            type: Date, // Expiration date for the verification token
        },
        intakeFormCompleted: {
            type: Boolean,
            default: false, // Track if user has completed the intake form
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);

// Generate a verification token for email verification

UserSchema.methods.generateVerificationToken = function () {
    const token = jwt.sign(
        { email: this.email }, // Include the email in the payload
        process.env.JWT_SECRET, // Use your JWT secret
        { expiresIn: '24h' } // Set token expiration
    );
    this.verificationToken = token;
    return token;
};

module.exports = mongoose.model('User', UserSchema);
