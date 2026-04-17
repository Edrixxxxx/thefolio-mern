import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // ✅ Initialize theme state from localStorage
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // ✅ Apply theme class to body whenever state changes
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <Link to="/" className="logo">EJ Mabalot</Link>
          <span className="tagline">design • learn • build</span>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <ul>
            <li>
              <Link to="/" className={isActive('/')}>Home</Link>
            </li>
            <li>
              <Link to="/about" className={isActive('/about')}>About</Link>
            </li>
            <li>
              <Link to="/contact" className={isActive('/contact')}>Contact</Link>
            </li>

            {/* POSTS - LOGGED IN ONLY */}
            {user && (
              <li>
                <Link to="/posts" className={isActive('/posts')}>Posts</Link>
              </li>
            )}

            {/* ADMIN LINK - ADMIN ONLY */}
            {user?.role === 'admin' && (
              <li>
                <Link to="/admin" className={isActive('/admin')}>Admin</Link>
              </li>
            )}

            {/* REGISTER - NOT LOGGED IN */}
            {!user && (
              <li>
                <Link to="/register" className={isActive('/register')}>Register</Link>
              </li>
            )}

            {/* PROFILE OR LOGIN */}
            <li>
              {user ? (
                <Link to="/profile" className={isActive('/profile')}>My Profile</Link>
              ) : (
                <Link to="/login" className={isActive('/login')}>Login</Link>
              )}
            </li>

            {/* LOGOUT - aligned like links */}
            {user && (
              <li>
                <button type="button" onClick={handleLogout} className="nav-link-btn">
                  Logout
                </button>
              </li>
            )}

            {/* DARK/LIGHT MODE TOGGLE */}
            <li>
              <button 
                onClick={toggleTheme} 
                className="btn" 
                style={{ width: 'auto' }}
                title="Toggle Dark Mode"
              >
                {isDark ? '🌞 Light Mode' : '🌗 Dark Mode'}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;