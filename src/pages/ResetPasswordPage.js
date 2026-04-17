import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (password !== confirm) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const res = await axios.post(`/auth/reset-password/${token}`, { password });
      setMsg(res.data.message || 'Password reset successful. Redirecting to login...');

      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <section className="register-main">
        <div className="content-section register-column">
          <h1>Reset Password</h1>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {msg && <p style={{ color: 'green' }}>{msg}</p>}

          <form onSubmit={submit}>
            <label>New Password</label>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default ResetPasswordPage;