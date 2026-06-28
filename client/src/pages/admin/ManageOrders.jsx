// =============================================
// MANAGE ORDERS PAGE (Admin)
// =============================================
// Shows all orders with the ability to update their status.

import { useState, useEffect } from 'react';
import { HiShoppingBag } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import AdminNav from '../../components/AdminNav';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      toast.success(`Order status updated to "${newStatus}"`);
      fetchOrders(); // Refresh
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
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
      <div className="container admin-page">
        <AdminNav />
        <div className="admin-page-header">
          <h1>
            <HiShoppingBag style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Manage Orders
          </h1>
          <span style={{ color: 'var(--text-secondary)' }}>
            {orders.length} total orders
          </span>
        </div>

        <div className="data-table-wrapper animate-fadeIn">
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No orders yet</h3>
              <p>Orders will appear here when customers make purchases</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {order.user?.name || 'Unknown'}
                        </div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                          {order.user?.email}
                        </div>
                      </td>
                      <td>
                        {order.items.map((item, i) => (
                          <div key={i} style={{ fontSize: 'var(--font-xs)' }}>
                            {item.product?.name || 'Product'} × {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        Rs. {order.totalAmount.toLocaleString()}
                      </td>
                      <td style={{ fontSize: 'var(--font-xs)' }}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
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

export default ManageOrders;
