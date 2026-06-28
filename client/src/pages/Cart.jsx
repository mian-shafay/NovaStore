// =============================================
// CART PAGE
// =============================================
// Shows all items in the user's cart.
// Features: quantity controls, remove items, cart summary, checkout button.

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiShoppingCart, HiTrash, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const navigate = useNavigate();
  const { updateCartCount } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch cart on load
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCartItems(res.data.items || []);
      setTotalAmount(res.data.totalAmount || 0);
      // Update cart count in navbar
      const count = res.data.items
        ? res.data.items.reduce((sum, item) => sum + item.quantity, 0)
        : 0;
      updateCartCount(count);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    // Client-side stock validation
    const item = cartItems.find((i) => i._id === itemId);
    if (item && item.product && newQuantity > item.product.stock) {
      toast.error(`Only ${item.product.stock} items available in stock`);
      return;
    }

    try {
      const res = await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      setCartItems(res.data.items);
      setTotalAmount(res.data.totalAmount);
      const count = res.data.items.reduce((sum, item) => sum + item.quantity, 0);
      updateCartCount(count);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      setCartItems(res.data.items);
      setTotalAmount(res.data.totalAmount);
      const count = res.data.items
        ? res.data.items.reduce((sum, item) => sum + item.quantity, 0)
        : 0;
      updateCartCount(count);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    try {
      await api.delete('/cart');
      setCartItems([]);
      setTotalAmount(0);
      updateCartCount(0);
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container cart-page">
        <h1 style={{ fontSize: 'var(--font-3xl)', marginBottom: 'var(--space-xl)' }}>
          <HiShoppingCart style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added any items yet</p>
            <Link to="/" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Cart with items */
          <div className="cart-layout">
            {/* Cart Items List */}
            <div className="cart-items">
              {cartItems.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}

              {/* Clear Cart Button */}
              <button className="btn btn-danger btn-sm" onClick={handleClearCart}>
                <HiTrash /> Clear Cart
              </button>
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
                <span>Rs. {totalAmount.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span style={{ color: 'var(--success)' }}>Free</span>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span>Rs. {totalAmount.toLocaleString()}</span>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 'var(--space-lg)' }}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <HiArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
