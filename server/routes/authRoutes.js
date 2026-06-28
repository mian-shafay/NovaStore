// =============================================
// AUTH ROUTES
// =============================================
// Routes define URL patterns and connect them to controller functions.
// They also define validation rules using express-validator.

const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { signup, login, getProfile, verifyEmail, resendVerification, forgotPassword, resetPassword } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 signups per IP per hour
  message: { message: 'Too many signup attempts, please try again later.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per IP per 15 minutes
  message: { message: 'Too many login attempts, please try again later.' }
});

const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, 
  message: { message: 'Too many resend attempts, please try again later.' }
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Too many password reset requests, please try again later.' }
});

// ---- POST /api/auth/signup ----
// The array of body() calls are validation middlewares.
// They run before the controller and check each field.
router.post(
  '/signup',
  signupLimiter,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/\d/).withMessage('Password must contain at least one number'),
  ],
  signup
);

// ---- POST /api/auth/login ----
router.post(
  '/login',
  loginLimiter,
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required'),
  ],
  login
);

// ---- GET /api/auth/profile ----
// "auth" middleware runs first to verify the token
router.get('/profile', auth, getProfile);

// ---- POST /api/auth/verify-email ----
router.post('/verify-email', verifyEmail);

// ---- POST /api/auth/resend-verification ----
router.post('/resend-verification', resendLimiter, resendVerification);

// ---- POST /api/auth/forgot-password ----
router.post('/forgot-password', forgotLimiter, forgotPassword);

// ---- POST /api/auth/reset-password ----
router.post(
  '/reset-password',
  [
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/\d/).withMessage('Password must contain at least one number'),
  ],
  resetPassword
);

module.exports = router;
