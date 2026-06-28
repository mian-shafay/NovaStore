// =============================================
// FOOTER COMPONENT
// =============================================

import { Link } from 'react-router-dom';
import { HiShoppingCart } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand info */}
          <div className="footer-brand">
            <h3>
              <HiShoppingCart style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary-light)' }} />
              NovaStore
            </h3>
            <p>
              Your premium destination for quality products at great prices.
              Built with the MERN stack as a learning project.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/dashboard">My Account</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-links">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/signup">Create Account</Link></li>
              <li><Link to="/dashboard">Order History</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} NovaStore. Built with MERN Stack 💜</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
