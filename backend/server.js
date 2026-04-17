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

// ✅ CORS Configuration — Allow localhost, production, and ALL Vercel previews
const allowedOrigins = [
  'http://localhost:3000',
  'https://thefolio-mern.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    try {
      const hostname = new URL(origin).hostname;

      // Allow whitelisted origins OR any *.vercel.app subdomain
      if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(hostname)) {
        return callback(null, true);
      }

      console.warn(`❌ Blocked by CORS: ${origin}`);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    } catch (err) {
      console.error('CORS origin parse error:', err.message);
      return callback(new Error('Invalid origin'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));



// ✅ Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/contact', contactRoutes);

// ✅ Health check routes
app.get('/', (req, res) => res.send('TheFolio API is running...'));
app.get('/api', (req, res) =>
  res.json({ status: 'ok', message: 'TheFolio API root' })
);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB, then start server
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