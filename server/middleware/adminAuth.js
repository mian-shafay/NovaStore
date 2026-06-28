// =============================================
// ADMIN AUTHORIZATION MIDDLEWARE
// =============================================
// This middleware runs AFTER the auth middleware.
// It checks if the authenticated user has the "admin" role.
//
// Usage in routes:
//   router.get('/admin-only', auth, adminAuth, handler)
//                              ↑       ↑
//                         check token  check role
//
// The auth middleware must run first (to set req.user),
// then this middleware checks the role.

const adminAuth = (req, res, next) => {
  // req.user was set by the auth middleware
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, let them through
  } else {
    res.status(403).json({
      message: 'Access denied. Admin privileges required.',
    });
  }
};

module.exports = adminAuth;
