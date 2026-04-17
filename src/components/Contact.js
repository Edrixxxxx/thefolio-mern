import React, { useState } from 'react';
import axios from '../api/axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' }); // success | error
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Clear status message when typing
    if (status.text) setStatus({ type: '', text: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Please input a name.';

    if (!formData.email.trim()) {
      newErrors.email = 'Please input an email address.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please input a valid email address.';
    }

    if (!formData.message.trim()) newErrors.message = 'Please input a message.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus({ type: '', text: '' });

    if (!validateForm()) return;

    setLoading(true);
    try {
      // ✅ Send to backend: POST http://localhost:5000/api/contact
      const res = await axios.post('/contact', {
        name: formData.name,
        email: formData.email,
        message: formData.message
      });

      setStatus({
        type: 'success',
        text: res.data?.message || 'Message sent successfully!'
      });

      setFormData({ name: '', email: '', message: '' });
      setErrors({});
    } catch (err) {
      setStatus({
        type: 'error',
        text: err.response?.data?.error || 'Failed to send message.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <section className="content-section">
        <h1>Send a Message</h1>
        <p>
          If you have a project idea or a question about front-end development, drop a
          message below. This page also lists reliable resources for learning and
          continuing practice.
        </p>

        {/* ✅ STATUS MESSAGE */}
        {status.text && (
          <p
            style={{
              marginTop: '1rem',
              marginBottom: '1rem',
              color: status.type === 'success' ? 'green' : 'red'
            }}
          >
            {status.text}
          </p>
        )}

        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="contact-name">Full Name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <span className="error">{errors.name}</span>}

          <label htmlFor="contact-email">Email Address</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error">{errors.email}</span>}

          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            rows="6"
            placeholder="How can I help you?"
            value={formData.message}
            onChange={handleChange}
          />
          {errors.message && <span className="error">{errors.message}</span>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <h2>External Links Recommended</h2>
        <table className="resources" summary="Helpful resources for learning web development">
          <thead>
            <tr>
              <th>Resource Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <a href="https://developer.mozilla.org/en-US/" target="_blank" rel="noopener noreferrer">
                  MDN Web Docs
                </a>
              </td>
              <td>In-depth reference and tutorials on HTML, CSS, and JavaScript.</td>
            </tr>
            <tr>
              <td>
                <a href="https://www.freecodecamp.org/" target="_blank" rel="noopener noreferrer">
                  freeCodeCamp
                </a>
              </td>
              <td>Hands-on exercises and projects to practice web development skills.</td>
            </tr>
            <tr>
              <td>
                <a href="https://www.w3schools.com/" target="_blank" rel="noopener noreferrer">
                  W3Schools
                </a>
              </td>
              <td>Beginner-friendly examples and quick references for HTML/CSS basics.</td>
            </tr>
            <tr>
              <td>
                <a href="https://www.chess.com/" target="_blank" rel="noopener noreferrer">
                  Chess.com
                </a>
              </td>
              <td>Play chess online.</td>
            </tr>
          </tbody>
        </table>

        <h2>Location</h2>
        <div className="map-wrapper" aria-label="Map showing placeholder location">
          <iframe
            id="mapFrame"
            title="Location Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=DMMMSU+South+La+Union+Campus&output=embed"
          />
        </div>
      </section>
    </main>
  );
};

export default Contact;