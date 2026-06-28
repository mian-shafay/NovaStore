// =============================================
// ADMIN ROUTES
// =============================================
// All routes here require both auth AND adminAuth middleware

const express = require('express');
const {
  getStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  deleteUser,
  getAuditLogs,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Every route needs: auth (verify token) → adminAuth (verify admin role)
router.get('/stats', auth, adminAuth, getStats);               // GET /api/admin/stats
router.get('/orders', auth, adminAuth, getAllOrders);           // GET /api/admin/orders
router.put('/orders/:id', auth, adminAuth, updateOrderStatus); // PUT /api/admin/orders/:id
router.get('/users', auth, adminAuth, getAllUsers);             // GET /api/admin/users
router.delete('/users/:id', auth, adminAuth, deleteUser);      // DELETE /api/admin/users/:id
router.get('/audit-logs', auth, adminAuth, getAuditLogs);      // GET /api/admin/audit-logs

module.exports = router;
