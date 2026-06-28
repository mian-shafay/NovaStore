import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMail, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || 'Reset link sent!');
      setIsSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-page page-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-header">
            <h1>Check Your Email</h1>
            <p>If an account exists for <strong>{email}</strong>, we've sent a password reset link.</p>
          </div>
          <p style={{ margin: 'var(--space-md) 0' }}>
            Please check your inbox and spam folder.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reset-email">
              <HiMail style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              Email Address
            </label>
            <input
              type="email"
              id="reset-email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
            />
            {error && (
              <span className="form-error">
                <HiExclamationCircle /> {error}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
