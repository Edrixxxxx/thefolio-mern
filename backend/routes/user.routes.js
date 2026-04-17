const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const upload = require('../middleware/upload');

//////////////////////////////////////////////////////
// ✅ PROTECT MIDDLEWARE (JWT)
//////////////////////////////////////////////////////
const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user (include password just in case)
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

//////////////////////////////////////////////////////
// ✅ GET CURRENT USER
// GET /api/users/me
//////////////////////////////////////////////////////
router.get('/me', protect, async (req, res) => {
  return res.json({
    user: {
      id: req.user._id,
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      bio: req.user.bio,
      profilePic: req.user.profilePic,
      role: req.user.role,
      status: req.user.status
    }
  });
});

//////////////////////////////////////////////////////
// ✅ GET MY POSTS
// GET /api/users/me/posts
//////////////////////////////////////////////////////
router.get('/me/posts', protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    console.error('Get my posts error:', err);
    return res.status(500).json({ error: 'Failed to load posts' });
  }
});

//////////////////////////////////////////////////////
// ✅ GET MY COMMENTS
// GET /api/users/me/comments
//////////////////////////////////////////////////////
router.get('/me/comments', protect, async (req, res) => {
  try {
    const comments = await Comment.find({ author: req.user._id })
      .populate('post', 'title')
      .sort({ createdAt: -1 });

    return res.json(comments);
  } catch (err) {
    console.error('Get my comments error:', err);
    return res.status(500).json({ error: 'Failed to load comments' });
  }
});

//////////////////////////////////////////////////////
// ✅ UPLOAD AVATAR
// PUT /api/users/me/avatar
// FormData field name: "avatar"
//////////////////////////////////////////////////////
router.put('/me/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    req.user.profilePic = req.file.filename;
    await req.user.save();

    return res.json({
      message: 'Avatar updated ✅',
      filename: req.file.filename,
      profilePic: req.file.filename
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

//////////////////////////////////////////////////////
// ✅ CHANGE PASSWORD
// PUT /api/users/me/password
// body: { currentPassword, newPassword }
//////////////////////////////////////////////////////
router.put('/me/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both fields required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Ensure we verify with real stored hash
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password incorrect' });
    }

    user.password = newPassword; // hashed by User.js pre('save')
    await user.save();

    return res.json({ message: 'Password changed ✅ (please log in again)' });
  } catch (err) {
    console.error('Password change error:', err);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

//////////////////////////////////////////////////////
// ✅ DELETE ACCOUNT
// DELETE /api/users/me
//////////////////////////////////////////////////////
router.delete('/me', protect, async (req, res) => {
  try {
    await Post.deleteMany({ author: req.user._id });
    await Comment.deleteMany({ author: req.user._id });
    await req.user.deleteOne();

    return res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;