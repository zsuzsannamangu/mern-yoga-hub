const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');

const emailToFind = 'mistymansolilli@yahoo.com';

async function findBooking() {
    try {
        // Check if MONGODB_URI is loaded
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI not found in environment variables');
            console.log('Current working directory:', process.cwd());
            console.log('Looking for .env file at:', path.resolve(__dirname, '../../.env'));
            process.exit(1);
        }

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Search for user by email
        console.log(`\n=== Searching for user with email: ${emailToFind} ===`);
        const user = await User.findOne({ email: emailToFind });
        
        if (user) {
            console.log('User found:');
            console.log('  ID:', user._id);
            console.log('  Name:', user.firstName, user.lastName);
            console.log('  Email:', user.email);
            console.log('  Verified:', user.isVerified);
            
            // Search bookings by userId
            console.log(`\n=== Searching bookings by userId: ${user._id} ===`);
            const bookingsByUserId = await Booking.find({ userId: user._id });
            console.log(`Found ${bookingsByUserId.length} bookings by userId`);
            bookingsByUserId.forEach((booking, index) => {
                console.log(`\nBooking ${index + 1}:`);
                console.log('  ID:', booking._id);
                console.log('  Date:', booking.date);
                console.log('  Time:', booking.time);
                console.log('  Is Booked:', booking.isBooked);
                console.log('  Session Type:', booking.sessionType);
                console.log('  First Name:', booking.firstName);
                console.log('  Last Name:', booking.lastName);
                console.log('  Email:', booking.email);
                console.log('  Message:', booking.message);
                console.log('  Created At:', booking.createdAt);
            });
        } else {
            console.log('User not found with that email');
        }

        // Search bookings by email (exact match)
        console.log(`\n=== Searching bookings by email (exact): ${emailToFind} ===`);
        const bookingsByEmailExact = await Booking.find({ 
            email: emailToFind,
            isBooked: true 
        });
        console.log(`Found ${bookingsByEmailExact.length} bookings with exact email match`);
        bookingsByEmailExact.forEach((booking, index) => {
            console.log(`\nBooking ${index + 1}:`);
            console.log('  ID:', booking._id);
            console.log('  Date:', booking.date);
            console.log('  Time:', booking.time);
            console.log('  UserId:', booking.userId);
            console.log('  Session Type:', booking.sessionType);
            console.log('  First Name:', booking.firstName);
            console.log('  Last Name:', booking.lastName);
            console.log('  Email:', booking.email);
            console.log('  Is Booked:', booking.isBooked);
        });

        // Search bookings by email (case-insensitive)
        console.log(`\n=== Searching bookings by email (case-insensitive): ${emailToFind} ===`);
        const bookingsByEmailCaseInsensitive = await Booking.find({ 
            email: { $regex: new RegExp(`^${emailToFind}$`, 'i') },
            isBooked: true 
        });
        console.log(`Found ${bookingsByEmailCaseInsensitive.length} bookings with case-insensitive email match`);
        bookingsByEmailCaseInsensitive.forEach((booking, index) => {
            console.log(`\nBooking ${index + 1}:`);
            console.log('  ID:', booking._id);
            console.log('  Date:', booking.date);
            console.log('  Time:', booking.time);
            console.log('  UserId:', booking.userId);
            console.log('  Session Type:', booking.sessionType);
        });

        // Search for similar emails (in case of typo)
        console.log(`\n=== Searching for similar emails (typo check) ===`);
        const emailParts = emailToFind.split('@');
        const username = emailParts[0];
        const domain = emailParts[1];
        
        // Search for emails with similar username
        const similarBookings = await Booking.find({
            email: { $regex: username, $options: 'i' },
            isBooked: true
        });
        console.log(`Found ${similarBookings.length} bookings with similar email`);
        similarBookings.forEach((booking, index) => {
            console.log(`\nSimilar Booking ${index + 1}:`);
            console.log('  Email:', booking.email);
            console.log('  Date:', booking.date);
            console.log('  Time:', booking.time);
            console.log('  Name:', booking.firstName, booking.lastName);
        });

        // Get ALL booked slots to see what's in the database
        console.log(`\n=== All booked slots in database ===`);
        const allBookings = await Booking.find({ isBooked: true })
            .sort({ date: 1, time: 1 })
            .limit(50); // Limit to recent 50
        console.log(`Total booked slots: ${allBookings.length}`);
        console.log('\nRecent bookings:');
        allBookings.forEach((booking, index) => {
            if (index < 20) { // Show first 20
                console.log(`  ${booking.email} - ${booking.date} ${booking.time} - ${booking.firstName} ${booking.lastName}`);
            }
        });

        // Check if there are any bookings with yahoo.com domain
        console.log(`\n=== All bookings with yahoo.com email ===`);
        const yahooBookings = await Booking.find({
            email: { $regex: '@yahoo.com', $options: 'i' },
            isBooked: true
        }).sort({ date: -1 });
        console.log(`Found ${yahooBookings.length} bookings with yahoo.com email`);
        yahooBookings.forEach((booking, index) => {
            console.log(`\nYahoo Booking ${index + 1}:`);
            console.log('  Email:', booking.email);
            console.log('  Date:', booking.date);
            console.log('  Time:', booking.time);
            console.log('  Name:', booking.firstName, booking.lastName);
            console.log('  UserId:', booking.userId);
            console.log('  Session Type:', booking.sessionType);
        });

        await mongoose.disconnect();
        console.log('\n=== Search complete ===');
    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

findBooking();
