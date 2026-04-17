// one-time script to create an admin user
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const createAdmin = async () => {
  try {
    await connectDB();
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (admin) {
      console.log('Admin already exists');
      process.exit();
    }
    admin = new User({
      name: 'Administrator',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();
    console.log('Admin created');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
