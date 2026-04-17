require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // EITHER set the admin email here:
  const adminEmail = 'admin@test.com'; // <-- change to your admin email

  const newPassword = 'Admin12345'; // <-- set new password

  const admin = await User.findOne({ email: adminEmail.toLowerCase() });
  if (!admin) {
    console.log('Admin not found:', adminEmail);
    process.exit(1);
  }

  if (admin.role !== 'admin') {
    console.log('This user is not admin. Current role:', admin.role);
    process.exit(1);
  }

  admin.password = newPassword; // will be hashed by pre('save')
  await admin.save();

  console.log('✅ Admin password reset successfully for:', admin.email);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});