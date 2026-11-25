import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './VerifyOTP.css';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendOTPCode, loading, user } = useAuth();
  
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const mobile = location.state?.mobile;

  // Redirect if no mobile number or already logged in
  useEffect(() => {
    if (!mobile) {
      navigate('/login', { replace: true });
    }
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [mobile, user, navigate]);

  // Verify OTP and Login
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await login(mobile, otp);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Display the actual error message from API
      const errorMessage = err?.message || err?.error || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      console.error('Verify OTP Error:', err);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setOTP('');
    try {
      await sendOTPCode(mobile);
    } catch (err) {
      setError(err?.message || 'Failed to resend OTP');
    }
  };

  // Go back to login
  const handleBack = () => {
    navigate('/login');
  };

  if (!mobile) {
    return null;
  }

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-card">
        <div className="verify-otp-header">
          <div className="verify-otp-logo">🔐</div>
          <h1 className="verify-otp-title">Verify OTP</h1>
          <p className="verify-otp-subtitle">
            Enter the 6-digit code sent to
          </p>
          <p className="verify-otp-mobile">{mobile}</p>
        </div>

        <form onSubmit={handleVerifyOTP} className="verify-otp-form">
          <div className="form-group">
            <label htmlFor="otp" className="form-label">
              OTP Code
            </label>
            <input
              type="text"
              id="otp"
              className="form-input otp-input"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              autoFocus
              maxLength={6}
            />
            <small className="form-hint">
              Enter the 6-digit OTP code
            </small>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>

          <div className="verify-otp-actions">
            <button
              type="button"
              className="btn-link"
              onClick={handleResendOTP}
              disabled={loading}
            >
              Resend OTP
            </button>
            <span className="separator">•</span>
            <button
              type="button"
              className="btn-link"
              onClick={handleBack}
              disabled={loading}
            >
              Change Number
            </button>
          </div>

          <div className="verify-otp-footer">
            <p className="test-credentials">
              <strong>Test OTP Code:</strong><br />
              123456<br />
              <small style={{ color: '#94a3b8', marginTop: '8px', display: 'block' }}>
                (Admin access only)
              </small>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
