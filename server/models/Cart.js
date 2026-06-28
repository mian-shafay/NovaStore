// =============================================
// CART MODEL
// =============================================
// Each user has ONE cart. The cart contains an array of items.
// Each item references a product and has a quantity.
//
// Think of it like a shopping bag — one bag per person,
// with multiple products inside.

const mongoose = require('mongoose');

// Sub-schema for individual cart items
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',     // Links to the Product collection
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
});

// Main cart schema
const cartSchema = new mongoose.Schema({
  // Each cart belongs to one user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,  // One cart per user
  },
  // Array of cart items (uses the sub-schema defined above)
  items: [cartItemSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Cart', cartSchema);
