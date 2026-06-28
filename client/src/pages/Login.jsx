// =============================================
// LOGIN PAGE
// =============================================
// Features:
// - Email & password fields with validation
// - Error messages for invalid input
// - Loading state while submitting
// - Redirect to dashboard/admin after login
// - Link to signup page

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ---- FORM STATE ----
  // Each field has its own state variable
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);

  // ---- HANDLE INPUT CHANGE ----
  // This function updates the state when the user types in any field.
  // [e.target.name] uses the input's "name" attribute as the key.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // ---- VALIDATE FORM ----
  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    // Return true if no errors (object has no keys)
    return Object.keys(newErrors).length === 0;
  };

  // ---- HANDLE SUBMIT ----
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload (default form behavior)

    if (!validate()) return;

    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${data.user.name}!`);

      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      // Show server error or validation errors
      const msg = error.response?.data?.message
        || error.response?.data?.errors?.[0]?.msg
        || 'Login failed. Please try again.';
      toast.error(msg);
      
      if (error.response?.status === 403 && msg.includes('verify')) {
        setShowResend(true);
      } else {
        setShowResend(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address above.');
      return;
    }
    setResending(true);
    try {
      const res = await api.post('/auth/resend-verification', { email: formData.email });
      toast.success(res.data.message || 'Verification email sent!');
      setShowResend(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} id="login-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="login-email">
              <HiMail style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              Email Address
            </label>
            <input
              type="email"
              id="login-email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="form-error">
                <HiExclamationCircle /> {errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="login-password">
              <HiLockClosed style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              Password
            </label>
            <input
              type="password"
              id="login-password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="form-error">
                <HiExclamationCircle /> {errors.password}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Resend Verification */}
          {showResend && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}
        </form>

        {/* Footer Link */}
        <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div><Link to="/forgot-password">Forgot password?</Link></div>
          <div>Don't have an account? <Link to="/signup">Create one</Link></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
