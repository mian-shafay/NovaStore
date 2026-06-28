// =============================================
// AUTHENTICATION MIDDLEWARE
// =============================================
// Middleware = a function that runs BETWEEN the request arriving
// and your route handler executing.
//
// This middleware checks if the user sent a valid JWT token.
// If yes → attaches user info to req.user and lets them through.
// If no → sends back a 401 (Unauthorized) error.
//
// HOW JWT WORKS:
// 1. User logs in → server creates a token with user's ID inside
// 2. User sends this token in every request (in the Authorization header)
// 3. This middleware verifies the token and extracts the user ID

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Step 1: Get the token from the request header
    // The header looks like: "Authorization: Bearer eyJhbGciOiJ..."
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    // Extract just the token part (remove "Bearer ")
    const token = authHeader.replace('Bearer ', '');

    // Step 2: Verify the token
    // jwt.verify() checks if the token was signed with our secret
    // and hasn't expired. It returns the data we stored in the token.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: Find the user in the database
    // We use .select('-password') to exclude the password field
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found. Token invalid.' });
    }

    // Step 4: Attach user to the request object
    // Now any route handler after this can access req.user
    req.user = user;

    // Move to the next middleware or route handler
    next();
  } catch (error) {
    // Token is invalid or expired
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};

module.exports = auth;
