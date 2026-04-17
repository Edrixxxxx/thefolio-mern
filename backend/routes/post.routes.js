const express = require('express');
const router = express.Router();

const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth.middleware');

//////////////////////////////////////////////////////
// ✅ GET ALL POSTS
// GET /api/posts
//////////////////////////////////////////////////////
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email role profilePic')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error('GET /posts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// ✅ CREATE POST (logged in)
// POST /api/posts
//////////////////////////////////////////////////////
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, image } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const post = await Post.create({
      title: title.trim(),
      content,
      image: image || '',
      author: req.user._id
    });

    const populated = await Post.findById(post._id).populate(
      'author',
      'name email role profilePic'
    );

    res.status(201).json(populated);
  } catch (err) {
    console.error('POST /posts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// ✅ DELETE POST (owner OR admin)
// DELETE /api/posts/:id
//////////////////////////////////////////////////////
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete comments for this post
    await Comment.deleteMany({ post: post._id });

    // Delete post
    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('DELETE /posts/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;