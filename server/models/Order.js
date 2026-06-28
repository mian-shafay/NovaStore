// =============================================
// ORDER MODEL
// =============================================
// When a customer places an order, we:
// 1. Copy items from their cart into the order (with prices frozen at purchase time)
// 2. Save shipping address
// 3. Calculate total amount
// 4. Clear their cart
//
// We store the price in the order because product prices can change later,
// but the customer should be charged what they saw at checkout.

const mongoose = require('mongoose');

// Sub-schema for items within an order
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true, // Price at time of purchase
  },
});

// Main order schema
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'Pakistan' },
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
