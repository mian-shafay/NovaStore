// =============================================
// ADMIN CONTROLLER
// =============================================
// Admin-only operations: dashboard stats, manage all orders, view all users.
// All these endpoints require both auth + adminAuth middleware.

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../utils/audit');

// ---- DASHBOARD STATS ----
// Returns summary statistics for the admin dashboard
const getStats = async (req, res) => {
  try {
    // Count documents in each collection
    // Promise.all runs all queries simultaneously (faster than one-by-one)
    const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find(), // Get all orders to calculate revenue
    ]);

    // Calculate total revenue from all orders
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get recent orders (last 5)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      recentOrders,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
};

// ---- GET ALL ORDERS (Admin) ----
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};

// ---- UPDATE ORDER STATUS (Admin) ----
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // If changing TO Cancelled from something else, restock
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        // Handle case where product might have been deleted (item.product is null)
        if (item.product) {
          await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: item.quantity } });
        }
      }
    }

    order.status = status;
    await order.save();

    logAudit({
      actor: req.user._id,
      action: 'ORDER_STATUS_UPDATED',
      targetType: 'Order',
      targetId: order._id.toString(),
      metadata: { newStatus: status },
      ip: req.ip,
    });

    res.json({
      message: `Order status updated to "${status}"!`,
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order.' });
  }
};

// ---- GET ALL USERS (Admin) ----
const getAllUsers = async (req, res) => {
  try {
    // Exclude passwords from the response
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

// ---- DELETE USER (Admin) ----
// Only allows deleting customer accounts, not other admins
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts.' });
    }

    // Clean up user's cart
    await Cart.findOneAndDelete({ user: user._id });

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    logAudit({
      actor: req.user._id,
      action: 'USER_DELETED',
      targetType: 'User',
      targetId: user._id.toString(),
      metadata: { deletedUserName: user.name, deletedUserEmail: user.email },
      ip: req.ip,
    });

    res.json({ message: `User "${user.name}" has been deleted successfully.` });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
};

// ---- GET AUDIT LOGS (Admin) ----
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('actor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      logs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error fetching audit logs.' });
  }
};

module.exports = { getStats, getAllOrders, updateOrderStatus, getAllUsers, deleteUser, getAuditLogs };
