// =============================================
// SIGNUP PAGE
// =============================================
// Features:
// - Name, email, password, confirm password fields
// - Role toggle (Customer / Admin)
// - Admin secret code field (shows only when admin role selected)
// - Client-side validation matching server rules
// - Auto-login after successful signup

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiUser, HiMail, HiLockClosed, HiShieldCheck, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    adminCode: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role, adminCode: '' });
  };

  // ---- VALIDATE ----
  const validate = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Admin code (only if admin role selected)
    if (formData.role === 'admin' && !formData.adminCode.trim()) {
      newErrors.adminCode = 'Admin registration code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.adminCode
      );
      toast.success(data.message || 'Account created!');
      setIsSubmitted(true);
    } catch (error) {
      const msg = error.response?.data?.message
        || error.response?.data?.errors?.[0]?.msg
        || 'Signup failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-page page-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-header">
            <h1>Verify Your Email</h1>
            <p>We've sent a verification link to <strong>{formData.email}</strong>.</p>
          </div>
          <p style={{ margin: 'var(--space-md) 0' }}>
            Please click the link in the email to verify your account before logging in.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join NovaStore and start shopping</p>
        </div>

        {/* Role Toggle */}
        <div className="form-group">
          <label>Account Type</label>
          <div className="role-toggle">
            <button
              type="button"
              className={formData.role === 'customer' ? 'active' : ''}
              onClick={() => handleRoleChange('customer')}
            >
              🛒 Customer
            </button>
            <button
              type="button"
              className={formData.role === 'admin' ? 'active' : ''}
              onClick={() => handleRoleChange('admin')}
            >
              🔐 Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} id="signup-form">
          {/* Name */}
          <div className="form-group">
            <label htmlFor="signup-name">
              <HiUser style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              Full Name
            </label>
            <input
              type="text"
              id="signup-name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <span className="form-error"><HiExclamationCircle /> {errors.name}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="signup-email">
              <HiMail style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              Email Address
            </label>
            <input
              type="email"
              id="signup-email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="form-error"><HiExclamationCircle /> {errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="signup-password">
              <HiLockClosed style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              Password
            </label>
            <input
              type="password"
              id="signup-password"
              name="password"
              placeholder="Min 6 characters, include a number"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="form-error"><HiExclamationCircle /> {errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="signup-confirm">
              <HiLockClosed style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              Confirm Password
            </label>
            <input
              type="password"
              id="signup-confirm"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <span className="form-error"><HiExclamationCircle /> {errors.confirmPassword}</span>
            )}
          </div>

          {/* Admin Code (conditional) */}
          {formData.role === 'admin' && (
            <div className="form-group">
              <label htmlFor="signup-admin-code">
                <HiShieldCheck style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                Admin Registration Code
              </label>
              <input
                type="password"
                id="signup-admin-code"
                name="adminCode"
                placeholder="Enter the admin secret code"
                value={formData.adminCode}
                onChange={handleChange}
              />
              {errors.adminCode && (
                <span className="form-error"><HiExclamationCircle /> {errors.adminCode}</span>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
