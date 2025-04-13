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

    console.log('Connected to MongoDB.');

    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (adminExists) {
      console.log('Admin already exists:', adminExists.email);
      process.exit();
    }

    const admin = new Admin({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });

    await admin.save();
    console.log('Admin created:', admin.email);
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
