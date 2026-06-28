// =============================================
// NAVBAR COMPONENT
// =============================================
// The navigation bar that appears at the top of every page.
// It shows different links based on:
//   - Whether the user is logged in
//   - Whether the user is a customer or admin

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiShoppingCart, HiUser, HiHome, HiViewGrid, HiLogout, HiMenu, HiX, HiShoppingBag, HiClipboardList } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, cartCount, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <div className="container">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand">
          <HiShoppingCart className="brand-icon" />
          <span>Nova<span className="brand-highlight">Store</span></span>
        </Link>

        {/* Hamburger for mobile */}
        <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>

        {/* Nav Menu */}
        <div className={`nav-menu ${mobileOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li>
              <NavLink to="/" onClick={closeMobile}>
                <HiHome /> Home
              </NavLink>
            </li>

            <li>
              <NavLink to="/#products" onClick={(e) => {
                closeMobile();
                // If already on home page, scroll to products section
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}>
                <HiShoppingBag /> Products
              </NavLink>
            </li>

            {/* Show cart & dashboard only for logged-in customers */}
            {user && user.role === 'customer' && (
              <>
                <li>
                  <NavLink to="/cart" onClick={closeMobile} className="nav-cart">
                    <HiShoppingCart /> Cart
                    {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard" onClick={closeMobile}>
                    <HiClipboardList /> My Orders
                  </NavLink>
                </li>
              </>
            )}

            {/* Admin links */}
            {user && user.role === 'admin' && (
              <li>
                <NavLink to="/admin" onClick={closeMobile}>
                  <HiViewGrid /> Admin Panel
                </NavLink>
              </li>
            )}
          </ul>

          {/* User section */}
          <div className="nav-user-section">
            {user ? (
              <>
                <NavLink
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="nav-user-info"
                  onClick={closeMobile}
                >
                  <div className="nav-user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </NavLink>
                <button className="btn-logout" onClick={handleLogout}>
                  <HiLogout /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm" onClick={closeMobile}>
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm" onClick={closeMobile}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
