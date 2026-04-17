import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useContext(AuthContext);

  const [mode, setMode] = useState('member'); // 'member' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password, mode);

    if (!result.success) {
      setError(result.error || 'Invalid credentials.');
      return;
    }

    if (result.user.role === 'admin') navigate('/admin');
    else navigate('/posts');
  };

  return (
    <main className="container">
      <section className="register-main">
        <div className="content-section register-column">
          <h1>Log in</h1>

          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <label>Login as</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="member">Normal User</option>
              <option value="admin">Admin</option>
            </select>

            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div style={{ margin: '10px 0' }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((s) => !s)}
              />{' '}
              Show password
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p style={{ marginTop: '12px' }}>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;