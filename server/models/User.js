// =============================================
// USER MODEL (Schema)
// =============================================
// A "model" defines the structure of documents in a MongoDB collection.
// Think of it like defining the columns of a table in SQL.
//
// This model stores both customers and admins.
// The "role" field determines what kind of user they are.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the shape of a User document
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],  // Custom error message
    trim: true,        // Removes whitespace from both ends
    minlength: [3, 'Name must be at least 3 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,      // No two users can have the same email
    lowercase: true,   // Automatically converts to lowercase
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],  // Only these two values are allowed
    default: 'customer',          // New users are customers by default
  },
  isVerified: { 
    type: Boolean, 
    default: true 
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  // This option automatically adds "createdAt" and "updatedAt" fields
  timestamps: true,
});

// ---- PRE-SAVE HOOK (Middleware) ----
// This function runs BEFORE every .save() call.
// We use it to hash the password so we never store plain text passwords.
userSchema.pre('save', async function (next) {
  // Only hash the password if it's new or has been changed
  // "this" refers to the document being saved
  if (!this.isModified('password')) {
    return next(); // Skip hashing, move to the next middleware
  }

  // Generate a "salt" (random data added to password before hashing)
  // The number 10 is the "cost factor" - higher = more secure but slower
  const salt = await bcrypt.genSalt(10);

  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---- INSTANCE METHOD ----
// This adds a custom method to every User document.
// We use it to check if a login password matches the stored hash.
userSchema.methods.comparePassword = async function (candidatePassword) {
  // bcrypt.compare() hashes the candidate and compares with stored hash
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
// "User" → MongoDB will create a collection called "users" (lowercase + plural)
module.exports = mongoose.model('User', userSchema);
