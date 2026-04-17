require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const contactRoutes = require('./routes/contact.routes');

const app = express();

// ✅ CORS — allow localhost, production, and ALL Vercel previews
const allowedOrigins = [
  'http://localhost:3000',
  'https://thefolio-mern.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    console.warn(`❌ Blocked by CORS: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ✅ Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/contact', contactRoutes);

// ✅ Health check
app.get('/', (req, res) => res.send('TheFolio API is running...'));

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// ✅ Connect DB first, THEN start server
(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
})();