import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
    showPasswords: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }

    if (errors.submit) {
      setErrors((prev) => ({
        ...prev,
        submit: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'The email address is invalid.';
    }

    if (!formData.password) {
      newErrors.password = 'Please create a password.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.agree) {
      newErrors.agree = 'You must agree to receive occasional emails.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      const { data } = await axios.post('/auth/register', payload);

      console.log('Registration success:', data);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess(true);

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agree: false,
        showPasswords: false
      });

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.log('FULL ERROR:', err);
      console.log('ERROR RESPONSE:', err.response);
      console.log('ERROR DATA:', err.response?.data);

      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';

      setErrors((prev) => ({
        ...prev,
        submit: msg
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <section className="register-main">
        <div className="content-section register-column">
          <h1>Sign Up for Updates</h1>
          <p>
            Sign-ups will receive a monthly note with short tips, a small resource list,
            and announcements about new examples or tutorials. We keep things short and useful.
          </p>

          <form id="registerForm" className="register-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-item name">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <div className="error">{errors.name}</div>}
              </div>

              <div className="form-item email">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <div className="error">{errors.email}</div>}
              </div>

              <div className="form-item password">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type={formData.showPasswords ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <div className="error">{errors.password}</div>}
              </div>

              <div className="form-item confirm">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={formData.showPasswords ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <div className="error">{errors.confirmPassword}</div>
                )}
              </div>

              <label className="terms" style={{ alignItems: 'center', gap: '0.5rem' }}>
                <input
                  id="show-passwords"
                  name="showPasswords"
                  type="checkbox"
                  checked={formData.showPasswords}
                  onChange={handleChange}
                />
                <span>Show passwords</span>
              </label>

              <div className="form-item agree">
                <label className="terms">
                  <input
                    id="agree"
                    name="agree"
                    type="checkbox"
                    checked={formData.agree}
                    onChange={handleChange}
                  />{' '}
                  I agree to receive occasional emails
                </label>
                {errors.agree && <div className="error">{errors.agree}</div>}
              </div>
            </div>

            {errors.submit && <div className="error submit-error">{errors.submit}</div>}
            {success && (
              <div className="success">
                Registration successful! Redirecting to login...
              </div>
            )}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        </div>

        <aside className="decorative-image" aria-hidden="true">
          <figure>
            <img src="/Reg.jpg" alt="Registration" />
          </figure>
        </aside>
      </section>
    </main>
  );
};

export default Register;