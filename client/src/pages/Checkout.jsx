// =============================================
// CHECKOUT PAGE
// =============================================
// Collects shipping address and places the order.
// Shows order summary on the right side.

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiLocationMarker, HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { updateCartCount } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState({});

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
  });

  // Fetch cart items for the summary
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        if (!res.data.items || res.data.items.length === 0) {
          toast.error('Your cart is empty');
          navigate('/cart');
          return;
        }
        setCartItems(res.data.items);
        setTotalAmount(res.data.totalAmount);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!address.street.trim()) newErrors.street = 'Street address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.state.trim()) newErrors.state = 'State is required';
    if (!address.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setPlacing(true);
    try {
      const res = await api.post('/orders', { shippingAddress: address });
      toast.success('Order placed successfully! 🎉');
      updateCartCount(0);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
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
      <div className="container checkout-page">
        <h1 style={{ fontSize: 'var(--font-3xl)', marginBottom: 'var(--space-xl)' }}>
          <HiCheckCircle style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary-light)' }} />
          Checkout
        </h1>

        <div className="checkout-layout">
          {/* Shipping Form */}
          <div className="checkout-form-card">
            <h2>
              <HiLocationMarker style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              Shipping Address
            </h2>

            <form onSubmit={handlePlaceOrder} id="checkout-form">
              <div className="form-group">
                <label htmlFor="checkout-street">Street Address</label>
                <input
                  type="text"
                  id="checkout-street"
                  name="street"
                  placeholder="123 Main Street, Apt 4B"
                  value={address.street}
                  onChange={handleChange}
                />
                {errors.street && (
                  <span className="form-error"><HiExclamationCircle /> {errors.street}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="checkout-city">City</label>
                  <input
                    type="text"
                    id="checkout-city"
                    name="city"
                    placeholder="Lahore"
                    value={address.city}
                    onChange={handleChange}
                  />
                  {errors.city && (
                    <span className="form-error"><HiExclamationCircle /> {errors.city}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-state">State / Province</label>
                  <input
                    type="text"
                    id="checkout-state"
                    name="state"
                    placeholder="Punjab"
                    value={address.state}
                    onChange={handleChange}
                  />
                  {errors.state && (
                    <span className="form-error"><HiExclamationCircle /> {errors.state}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="checkout-zip">ZIP Code</label>
                  <input
                    type="text"
                    id="checkout-zip"
                    name="zipCode"
                    placeholder="54000"
                    value={address.zipCode}
                    onChange={handleChange}
                  />
                  {errors.zipCode && (
                    <span className="form-error"><HiExclamationCircle /> {errors.zipCode}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-country">Country</label>
                  <input
                    type="text"
                    id="checkout-country"
                    name="country"
                    value={address.country}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 'var(--space-md)' }}
                disabled={placing}
              >
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>

            {cartItems.map((item) => (
              <div key={item._id} className="summary-row" style={{ fontSize: 'var(--font-sm)' }}>
                <span>{item.product?.name} × {item.quantity}</span>
                <span>Rs. {((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
              </div>
            ))}

            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: 'var(--success)' }}>Free</span>
            </div>

            <div className="summary-row total">
              <span>Total</span>
              <span>Rs. {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
