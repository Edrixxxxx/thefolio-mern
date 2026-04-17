import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AdminRegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/auth/register-admin', {
        name,
        email,
        password,
        adminKey
      });

      setSuccess(
        `✅ Admin account created! Welcome ${res.data.user.name}! Redirecting to login...`
      );

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to create admin account.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <section className="register-main">
        <div className="content-section register-column">
          <h1>🔐 Admin Registration</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Only authorized personnel with the admin secret key can register here.
          </p>

          {/* ✅ ERROR MESSAGE */}
          {error && (
            <div style={{
              color: 'red',
              background: '#fdecea',
              padding: '0.75rem',
              borderRadius: '6px',
              marginBottom: '1rem'
            }}>
              ❌ {error}
            </div>
          )}

          {/* ✅ SUCCESS MESSAGE */}
          {success && (
            <div style={{
              color: 'green',
              background: '#e8f5e9',
              padding: '0.75rem',
              borderRadius: '6px',
              marginBottom: '1rem'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* NAME */}
            <label>Name</label>
            <input
              type="text"
              placeholder="Admin name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {/* EMAIL */}
            <label>Email</label>
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* PASSWORD */}
            <label>Password</label>
            <input
              type="password"
              placeholder="Strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* SECRET KEY */}
            <label>🔑 Admin Secret Key</label>
            <input
              type="password"
              placeholder="Enter secret admin key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              required
            />

            {/* SUBMIT BUTTON */}
            <button 
              className="btn" 
              type="submit"
              disabled={loading}
            >
              {loading ? '⏳ Creating...' : '✅ Create Admin Account'}
            </button>
          </form>

          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ 
                color: '#4a1060', 
                cursor: 'pointer',
                textDecoration: 'underline' 
              }}
            >
              Login here
            </span>
          </p>
        </div>
      </section>
    </main>
  );
};

export default AdminRegisterPage;