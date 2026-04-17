const jwt = require('jsonwebtoken');
const User = require('../models/User');

// verifies JWT and attaches user object to req.user
const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    console.error('auth.middleware error', err);
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
