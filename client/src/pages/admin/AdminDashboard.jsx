// =============================================
// ADMIN DASHBOARD PAGE
// =============================================
// Shows summary stats and recent orders for the admin.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiUsers, HiCube, HiShoppingBag, HiCurrencyDollar } from 'react-icons/hi';
import api from '../../utils/api';
import AdminNav from '../../components/AdminNav';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
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
        {/* Admin Navigation */}
        <AdminNav />

        {/* Header */}
        <div className="admin-page-header animate-fadeIn">
          <h1>Admin Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card" style={{ animationDelay: '0.1s' }}>
            <div className="stat-card-icon purple"><HiUsers /></div>
            <div className="stat-card-value">{stats?.totalUsers || 0}</div>
            <div className="stat-card-label">Total Users</div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.2s' }}>
            <div className="stat-card-icon cyan"><HiCube /></div>
            <div className="stat-card-value">{stats?.totalProducts || 0}</div>
            <div className="stat-card-label">Total Products</div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.3s' }}>
            <div className="stat-card-icon orange"><HiShoppingBag /></div>
            <div className="stat-card-value">{stats?.totalOrders || 0}</div>
            <div className="stat-card-label">Total Orders</div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.4s' }}>
            <div className="stat-card-icon green"><HiCurrencyDollar /></div>
            <div className="stat-card-value">Rs. {(stats?.totalRevenue || 0).toLocaleString()}</div>
            <div className="stat-card-label">Total Revenue</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="data-table-wrapper animate-fadeIn">
          <div className="data-table-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm">View All</Link>
          </div>

          {stats?.recentOrders?.length === 0 ? (
            <div className="empty-state">
              <h3>No orders yet</h3>
              <p>Orders will appear here when customers start purchasing</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentOrders?.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td>
                        <div>{order.user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                          {order.user?.email}
                        </div>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td style={{ fontWeight: 700 }}>Rs. {order.totalAmount.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
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

export default AdminDashboard;
