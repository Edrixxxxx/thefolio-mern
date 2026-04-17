require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'YOUR_NORMAL_EMAIL_HERE'.trim().toLowerCase();
  const newPassword = 'NewPass123!';

  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found:', email);
    process.exit(1);
  }

  user.password = newPassword; // will hash in pre('save')
  await user.save();

  console.log('Password reset OK for', email);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});