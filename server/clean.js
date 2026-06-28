// =============================================
// DATABASE CLEAN SCRIPT
// =============================================
// Run this script to clear all data from the database.
// Usage: npm run clean (or: node clean.js)

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const cleanDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared all collections successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Clean error:', error);
    process.exit(1);
  }
};

cleanDB();
