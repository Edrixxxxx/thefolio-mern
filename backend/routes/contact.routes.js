const express = require('express');
const router = express.Router();

const ContactMessage = require('../models/ContactMessage');
const sendEmail = require('../utils/sendEmail');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const doc = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    });

    // Optional email to admin (won’t break if SMTP fails)
    try {
      const adminEmail = process.env.ADMIN_CONTACT_EMAIL;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `New Contact Message from ${doc.name}`,
          text: `From: ${doc.name} <${doc.email}>\n\n${doc.message}`
        });
      }
    } catch (e) {
      console.error('Contact email send failed:', e.message);
    }

    return res.status(201).json({ message: 'Message sent successfully ✅' });
  } catch (err) {
    console.error('Contact route error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;