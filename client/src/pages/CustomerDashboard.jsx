// =============================================
// CUSTOMER DASHBOARD PAGE
// =============================================
// Shows:
// - Welcome message with user info
// - Quick stats (total orders, etc.)
// - Order history table with status badges

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiShoppingBag, HiCurrencyDollar, HiClock, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.patch(`/orders/${orderId}/cancel`);
      toast.success(res.data.message || 'Order cancelled successfully!');
      // Update order status in state
      setOrders((prevOrders) => 
        prevOrders.map((o) => (o._id === orderId ? { ...o, status: 'Cancelled' } : o))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order.');
    }
  };

  // Calculate stats from orders
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

  // Format date helper
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
      <div className="container dashboard-page">
        {/* Header */}
        <div className="dashboard-header animate-fadeIn">
          <h1>Welcome back, {user?.name} 👋</h1>
          <p>Here's an overview of your orders and account</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card" style={{ animationDelay: '0.1s' }}>
            <div className="stat-card-icon purple">
              <HiShoppingBag />
            </div>
            <div className="stat-card-value">{totalOrders}</div>
            <div className="stat-card-label">Total Orders</div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.2s' }}>
            <div className="stat-card-icon cyan">
              <HiCurrencyDollar />
            </div>
            <div className="stat-card-value">Rs. {totalSpent.toLocaleString()}</div>
            <div className="stat-card-label">Total Spent</div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.3s' }}>
            <div className="stat-card-icon orange">
              <HiClock />
            </div>
            <div className="stat-card-value">{pendingOrders}</div>
            <div className="stat-card-label">Pending Orders</div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.4s' }}>
            <div className="stat-card-icon green">
              <HiCheckCircle />
            </div>
            <div className="stat-card-value">{deliveredOrders}</div>
            <div className="stat-card-label">Delivered</div>
          </div>
        </div>

        {/* Order History */}
        <div className="data-table-wrapper animate-fadeIn">
          <div className="data-table-header">
            <h2>Order History</h2>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No orders yet</h3>
              <p>Start shopping to see your orders here</p>
              <Link to="/" className="btn btn-primary">Browse Products</Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        {order.items.map((item) => (
                          <div key={item._id} style={{ fontSize: 'var(--font-xs)' }}>
                            {item.product?.name || 'Product'} × {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td style={{ fontWeight: 700 }}>Rs. {order.totalAmount.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {(order.status === 'Pending' || order.status === 'Processing') && (
                          <button 
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
