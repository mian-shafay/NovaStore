// =============================================
// MANAGE USERS PAGE (Admin)
// =============================================
// Shows all registered users with their roles.
// Admin can delete customer accounts.

import { useState, useEffect } from 'react';
import { HiUsers, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import AdminNav from '../../components/AdminNav';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/users/${userId}`);
      toast.success(res.data.message);
      // Remove the user from the list
      setUsers(users.filter((u) => u._id !== userId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

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
        <AdminNav />
        <div className="admin-page-header">
          <h1>
            <HiUsers style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Manage Users
          </h1>
          <span style={{ color: 'var(--text-secondary)' }}>
            {users.length} total users
          </span>
        </div>

        <div className="data-table-wrapper animate-fadeIn">
          {users.length === 0 ? (
            <div className="empty-state">
              <h3>No users found</h3>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: u.role === 'admin'
                              ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                              : 'linear-gradient(135deg, var(--accent), #0891b2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: 'white',
                            fontSize: 'var(--font-sm)',
                          }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {u.name}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        {u.role === 'customer' ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            title={`Delete ${u.name}`}
                          >
                            <HiTrash /> Remove
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
                            Protected
                          </span>
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

export default ManageUsers;
