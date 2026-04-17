const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');

//////////////////////////////////////////////////////
// GET comments for a post
// GET /api/comments/post/:postId
//////////////////////////////////////////////////////
router.get('/post/:postId', async (req, res) => {
  try {
    // ✅ ADD THIS CHECK HERE (before querying MongoDB)
    if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
      return res.status(400).json({ error: 'Invalid postId' });
    }

    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name email role profilePic')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    console.error('GET comments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// CREATE comment
// POST /api/comments
// body: { postId, body }
//////////////////////////////////////////////////////
router.post('/', protect, async (req, res) => {
  try {
    // helpful debug
    // console.log('CREATE COMMENT BODY:', req.body);

    const { postId, body } = req.body;

    if (!postId || !body || !body.trim()) {
      return res.status(400).json({ error: 'postId and comment body are required.' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      body: body.trim()
    });

    const populated = await Comment.findById(comment._id).populate(
      'author',
      'name email role profilePic'
    );

    res.status(201).json(populated);
  } catch (err) {
    console.error('POST comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//////////////////////////////////////////////////////
// DELETE comment (owner OR admin)
// DELETE /api/comments/:id
//////////////////////////////////////////////////////
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('DELETE comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;