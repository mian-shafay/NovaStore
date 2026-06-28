// =============================================
// ORDER ROUTES
// =============================================

const express = require('express');
const { placeOrder, getMyOrders, getOrderById, cancelOrder } = require('../controllers/orderController');
const auth = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.post('/', auth, placeOrder);        // POST /api/orders - Place new order
router.get('/', auth, getMyOrders);        // GET /api/orders - Get my orders
router.get('/:id', auth, getOrderById);    // GET /api/orders/:id - Get specific order
router.patch('/:id/cancel', auth, cancelOrder); // PATCH /api/orders/:id/cancel - Cancel order

module.exports = router;
