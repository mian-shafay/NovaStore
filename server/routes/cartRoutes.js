// =============================================
// CART ROUTES
// =============================================
// All cart routes require authentication (user must be logged in)

const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes use auth middleware - must be logged in to use cart
router.get('/', auth, getCart);                    // GET /api/cart
router.post('/', auth, addToCart);                 // POST /api/cart
router.put('/:itemId', auth, updateCartItem);      // PUT /api/cart/:itemId
router.delete('/:itemId', auth, removeCartItem);   // DELETE /api/cart/:itemId
router.delete('/', auth, clearCart);               // DELETE /api/cart

module.exports = router;
