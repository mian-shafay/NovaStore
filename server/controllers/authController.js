// =============================================
// AUTH CONTROLLER
// =============================================
// Controllers contain the actual logic for handling requests.
// Routes just define the URL patterns and connect them to controllers.
//
// This controller handles:
// - POST /api/auth/signup  → Register a new user
// - POST /api/auth/login   → Login and get JWT token
// - GET  /api/auth/profile → Get logged-in user's profile

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const tokenUtils = require('../utils/tokens');
const sendEmail = require('../utils/sendEmail');
const { logAudit } = require('../utils/audit');

// ---- HELPER: Generate JWT Token ----
const generateToken = (userId, role) => {
  // jwt.sign(payload, secret, options)
  // payload = data to store in the token
  // expiresIn = when the token becomes invalid
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token valid for 7 days
  );
};

// ---- SIGNUP ----
const signup = async (req, res) => {
  try {
    // Check for validation errors (set by express-validator in routes)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, adminCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // If trying to register as admin, verify the secret code
    let userRole = 'customer';
    if (role === 'admin') {
      if (adminCode !== process.env.ADMIN_SECRET_CODE) {
        return res.status(400).json({ message: 'Invalid admin registration code.' });
      }
      userRole = 'admin';
    }

    // Generate verification token
    const verificationTokenObj = tokenUtils.generateToken();

    // Create new user (password hashing happens automatically in the model's pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      isVerified: false,
      verificationToken: verificationTokenObj.hashed,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Send verification email
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationTokenObj.raw}`;
    const message = `Welcome to NovaStore!\n\nPlease verify your email by clicking the link below:\n\n${verifyUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - NovaStore',
      message,
    });

    // Send response (exclude password)
    res.status(201).json({
      message: 'Check your email to verify your account.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
};

// ---- LOGIN ----
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    if (user.isVerified === false) {
      return res.status(403).json({ message: 'Please verify your email first.' });
    }

    // Check password using the model's comparePassword method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// ---- GET PROFILE ----
const getProfile = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

// ---- VERIFY EMAIL ----
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required.' });

    const hashedToken = tokenUtils.hashToken(token);

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error during email verification.' });
  }
};

// ---- RESEND VERIFICATION ----
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User with this email not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified.' });
    }

    const verificationTokenObj = tokenUtils.generateToken();
    user.verificationToken = verificationTokenObj.hashed;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationTokenObj.raw}`;
    const message = `Please verify your email by clicking the link below:\n\n${verifyUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - NovaStore',
      message,
    });

    res.json({ message: 'Verification email sent!' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error resending verification.' });
  }
};

// ---- FORGOT PASSWORD ----
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email });
    if (!user) {
      // Always respond 200 with generic message to prevent account enumeration
      return res.json({ message: 'If that email exists in our system, a password reset link has been sent.' });
    }

    const resetTokenObj = tokenUtils.generateToken();
    user.resetPasswordToken = resetTokenObj.hashed;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 mins
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetTokenObj.raw}`;
    const message = `You requested a password reset.\n\nPlease click the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 30 minutes.`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - NovaStore',
      message,
    });

    res.json({ message: 'If that email exists in our system, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error processing password reset.' });
  }
};

// ---- RESET PASSWORD ----
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password are required.' });

    const hashedToken = tokenUtils.hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    // Set new password, pre-save hook will hash it automatically
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logAudit({
      actor: user._id,
      action: 'PASSWORD_RESET',
      targetType: 'User',
      targetId: user._id.toString(),
      metadata: { email: user.email },
      ip: req.ip,
    });

    res.json({ message: 'Password has been reset successfully! You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password.' });
  }
};

module.exports = { 
  signup, 
  login, 
  getProfile, 
  verifyEmail, 
  resendVerification,
  forgotPassword,
  resetPassword 
};
