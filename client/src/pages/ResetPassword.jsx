import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { HiLockClosed, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        password: formData.password,
      });
      toast.success(res.data.message || 'Password reset successful!');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.message
        || error.response?.data?.errors?.[0]?.msg
        || 'Failed to reset password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Set New Password</h1>
          <p>Please enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Password */}
          <div className="form-group">
            <label htmlFor="reset-password">
              <HiLockClosed style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              New Password
            </label>
            <input
              type="password"
              id="reset-password"
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
            <label htmlFor="reset-confirm">
              <HiLockClosed style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              Confirm Password
            </label>
            <input
              type="password"
              id="reset-confirm"
              name="confirmPassword"
              placeholder="Re-enter your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <span className="form-error"><HiExclamationCircle /> {errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
