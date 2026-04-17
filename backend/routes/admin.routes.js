const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const ContactMessage = require('../models/ContactMessage');

//////////////////////////////////////////////////////
// ✅ PROTECT MIDDLEWARE (JWT)
//////////////////////////////////////////////////////
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

//////////////////////////////////////////////////////
// ✅ ADMIN ONLY MIDDLEWARE
//////////////////////////////////////////////////////
const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

//////////////////////////////////////////////////////
// ✅ GET ALL USERS (FIXED)
// GET /api/admin/users
//////////////////////////////////////////////////////
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    // Select all fields EXCEPT password
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('GET users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// ✅ TOGGLE USER STATUS
//////////////////////////////////////////////////////
router.put('/users/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot modify admin status' });
    }

    user.status = user.status === 'active' ? 'deactivated' : 'active';
    await user.save();

    res.json({ message: `User ${user.status}`, user });
  } catch (err) {
    console.error('Toggle status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// ✅ DELETE USER
//////////////////////////////////////////////////////
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin' });
    }

    await Post.deleteMany({ author: user._id });
    await Comment.deleteMany({ author: user._id });
    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// ✅ GET ALL POSTS
//////////////////////////////////////////////////////
router.get('/posts', protect, adminOnly, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('GET posts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// ✅ DELETE POST
//////////////////////////////////////////////////////
router.delete('/posts/:id', protect, adminOnly, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.json({ message: 'Post removed successfully' });
  } catch (err) {
    console.error('DELETE post error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// ✅ GET ALL COMMENTS
//////////////////////////////////////////////////////
router.get('/comments', protect, adminOnly, async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('author', 'name email role')
      .populate('post', 'title')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error('GET comments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// ✅ DELETE COMMENT
//////////////////////////////////////////////////////
router.delete('/comments/:id', protect, adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('DELETE comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// ✅ GET ALL CONTACT MESSAGES
//////////////////////////////////////////////////////
router.get('/contacts', protect, adminOnly, async (req, res) => {
  try {
    const msgs = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(msgs);
  } catch (err) {
    console.error('GET contacts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// ✅ MARK CONTACT AS READ
//////////////////////////////////////////////////////
router.put('/contacts/:id/read', protect, adminOnly, async (req, res) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    msg.status = 'read';
    await msg.save();

    res.json({ message: 'Marked as read', msg });
  } catch (err) {
    console.error('PUT contact read error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// ✅ DELETE CONTACT MESSAGE
//////////////////////////////////////////////////////
router.delete('/contacts/:id', protect, adminOnly, async (req, res) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    await msg.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('DELETE contact error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;