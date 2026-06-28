// =============================================
// ORDER CONTROLLER
// =============================================
// Handles placing orders and viewing order history.
// When a customer places an order:
// 1. Get items from their cart
// 2. Create an order with those items (prices frozen)
// 3. Reduce product stock
// 4. Clear the cart

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { logAudit } = require('../utils/audit');

// ---- PLACE ORDER ----
const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, totalAmount: clientTotal } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city ||
        !shippingAddress.state || !shippingAddress.zipCode) {
      return res.status(400).json({ message: 'Complete shipping address is required.' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Build order items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      // Check if product still exists
      if (!product) {
        return res.status(400).json({
          message: 'One of the products in your cart is no longer available.',
        });
      }

      // Check stock availability
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `"${product.name}" only has ${product.stock} items in stock.`,
        });
      }

      // Add to order items with CURRENT price (frozen at purchase time)
      orderItems.push({
        product: product._id,
        quantity: cartItem.quantity,
        price: product.price,
      });

      totalAmount += product.price * cartItem.quantity;

      // Reduce stock atomically
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -cartItem.quantity } });
    }

    // Check if client provided total amount matches server calculated amount
    if (clientTotal !== undefined && Math.abs(clientTotal - totalAmount) > 0.01) {
      return res.status(400).json({ message: 'Order total mismatch. Please try again.' });
    }

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      shippingAddress,
    });

    // Clear the cart after successful order
    await Cart.findOneAndDelete({ user: req.user._id });

    // Populate product details for the response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name image');

    res.status(201).json({
      message: 'Order placed successfully!',
      order: populatedOrder,
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ message: 'Server error placing order.' });
  }
};

// ---- GET USER'S ORDERS ----
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 }); // Newest first

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};

// ---- GET SINGLE ORDER ----
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image price')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Make sure the order belongs to this user (or user is admin)
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order.' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error fetching order.' });
  }
};

// ---- CANCEL ORDER ----
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order.' });
    }

    if (!['Pending', 'Processing'].includes(order.status)) {
      return res.status(400).json({ message: 'This order can no longer be cancelled.' });
    }

    // Restock each item
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.status = 'Cancelled';
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name image price')
      .populate('user', 'name email');

    logAudit({
      actor: req.user._id,
      action: 'ORDER_CANCELLED',
      targetType: 'Order',
      targetId: order._id.toString(),
      metadata: { totalAmount: order.totalAmount },
      ip: req.ip,
    });

    res.json({ message: 'Order cancelled successfully.', order: populatedOrder });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error cancelling order.' });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder };
