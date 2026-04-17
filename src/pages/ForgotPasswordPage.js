import React, { useState } from 'react';
import axios from '../api/axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);

    try {
      const res = await axios.post('/auth/forgot-password', { email });
      setMsg(res.data.message || 'If that email exists, a reset link was sent.');
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
          <h1>Forgot Password</h1>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {msg && <p style={{ color: 'green' }}>{msg}</p>}

          <form onSubmit={submit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p style={{ marginTop: '12px' }}>
            (Dev tip: if SMTP isn’t configured, the reset link prints in the backend terminal)
          </p>
        </div>
      </section>
    </main>
  );
};

export default ForgotPasswordPage;