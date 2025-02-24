//This script was used to add an admin to the database
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
        if (adminExists) {
            process.exit();
        }

        const admin = new Admin({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
        });

        await admin.save();
        process.exit();
    } catch (error) {
        process.exit(1);
    }
};

createAdmin();
