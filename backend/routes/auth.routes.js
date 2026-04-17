const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

//////////////////////////////////////////////////////
// REGISTER MEMBER
//////////////////////////////////////////////////////
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ error: 'Please fill out all required fields.' });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'User with that email already exists.' });
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'member'
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

//////////////////////////////////////////////////////
// REGISTER ADMIN (SECRET KEY REQUIRED)
//////////////////////////////////////////////////////
router.post('/register-admin', async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;

    if (!name || !email || !password || !adminKey) {
      return res.status(400).json({ error: 'All fields required.' });
    }

    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: 'Invalid admin key.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'admin'
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Admin register error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

//////////////////////////////////////////////////////
// LOGIN
//////////////////////////////////////////////////////
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    if (user.status === 'deactivated') {
      return res.status(403).json({ error: 'Account is deactivated. Contact admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

//////////////////////////////////////////////////////
// FORGOT PASSWORD (send reset link)
//////////////////////////////////////////////////////
router.post('/forgot-password', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    console.log('✅ FORGOT PASSWORD HIT');
    console.log('EMAIL:', email);

    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await User.findOne({ email });
    console.log('User found?', !!user);

    // Always respond the same message (prevents email enumeration)
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link was sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHashed = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHashed;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendBase}/reset-password/${resetToken}`;

    console.log('RESET LINK:', resetLink);
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_USER set?:', !!process.env.SMTP_USER);

    // ✅ Do NOT crash if email fails (important for dev/testing)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        text:
          `You requested a password reset.\n\n` +
          `Reset your password using this link (valid 15 minutes):\n${resetLink}\n\n` +
          `If you didn’t request this, ignore this email.`
      });
    } catch (e) {
      console.error('Email send failed:', e.message);
    }

    // ✅ Dev helper: return link so you can test without real email
    return res.json({
      message: 'If that email exists, a reset link was sent.',
      resetLink
    });
  } catch (err) {
    console.error('forgot-password error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

//////////////////////////////////////////////////////
// RESET PASSWORD (use token from link)
//////////////////////////////////////////////////////
router.post('/reset-password/:token', async (req, res) => {
  try {
    const rawToken = req.params.token;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const tokenHashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: tokenHashed,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    user.password = password; // hashed by User.js pre-save
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    console.error('reset-password error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// ADMIN LOGIN (same credentials, but must be role=admin)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    if (user.status === 'deactivated') {
      return res.status(403).json({ error: 'Account is deactivated. Contact admin.' });
    }

    // ✅ MUST be admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;