const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) throw new Error('MONGO_URI is missing in .env');

    // helpful (safe) debug: show only host part
    const safe = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log('MONGO_URI (safe):', safe);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10s then throw error
      connectTimeoutMS: 10000,
    });

    console.log('MongoDB Connected:', conn.connection.host);
    console.log('MongoDB Database:', conn.connection.name);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;