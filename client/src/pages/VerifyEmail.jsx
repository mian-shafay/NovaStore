import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.post('/auth/verify-email', { token });
        toast.success(res.data.message || 'Email verified successfully!');
        setStatus('success');
      } catch (error) {
        setStatus('error');
        toast.error(error.response?.data?.message || 'Verification failed.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-header">
          <h1>Email Verification</h1>
        </div>
        
        {status === 'verifying' && (
          <div style={{ padding: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ padding: '1rem 0' }}>
            <p style={{ color: 'var(--success)', fontSize: '1.2rem', marginBottom: '1rem' }}>
              ✓ Email Verified
            </p>
            <p>Your account is now active and you can log in.</p>
            <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ marginTop: '1.5rem' }}>
              Go to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ padding: '1rem 0' }}>
            <p style={{ color: 'var(--error)', fontSize: '1.2rem', marginBottom: '1rem' }}>
              ✗ Verification Failed
            </p>
            <p>The verification link is invalid or has expired.</p>
            <button className="btn btn-secondary" onClick={() => navigate('/login')} style={{ marginTop: '1.5rem' }}>
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
