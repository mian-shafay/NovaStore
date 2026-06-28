// =============================================
// SERVER ENTRY POINT
// =============================================
// This is the main file that starts our Express server.
// It sets up middleware, connects routes, and starts listening.

// Load environment variables from .env file FIRST
// This makes process.env.MONGO_URI, process.env.JWT_SECRET, etc. available
require('dotenv').config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import route files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Create Express app
const app = express();

// ---- MIDDLEWARE ----
// Middleware are functions that run BEFORE your route handlers.

// cors() controls which frontend origins may call this API.
// In production set CLIENT_URL (the canonical site, also used for email links).
// Add any extra origins (e.g. the www variant) via ALLOWED_ORIGINS, a
// comma-separated list. Requests with no Origin header (curl, server-to-server)
// are allowed through.
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

// express.json() parses incoming JSON request bodies
// Without this, req.body would be undefined when the frontend sends JSON data
app.use(express.json());

// ---- ROUTES ----
// Each route file handles a group of related endpoints
// The first argument is the base path - all routes in the file are prefixed with it
app.use('/api/auth', authRoutes);         // /api/auth/login, /api/auth/signup, etc.
app.use('/api/products', productRoutes);  // /api/products, /api/products/:id, etc.
app.use('/api/cart', cartRoutes);         // /api/cart, etc.
app.use('/api/orders', orderRoutes);      // /api/orders, etc.
app.use('/api/admin', adminRoutes);       // /api/admin/stats, /api/admin/users, etc.

// ---- HEALTH CHECK ----
// A simple endpoint to verify the server is running
app.get('/', (req, res) => {
  res.json({ message: '🛒 E-Commerce API is running!' });
});

// ---- ERROR HANDLING ----
// This catches any errors that weren't handled in the routes
// Express knows this is an error handler because it has 4 parameters
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

// ---- START SERVER ----
const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
