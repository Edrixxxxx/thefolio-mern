import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <Link to="/" className="logo">EJ Mabalot</Link>
          <span className="tagline">design • learn • build</span>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          <ul>
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
            <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link></li>
            <li><Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link></li>
            <li><Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>Register</Link></li>
            <li><Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link></li>
            <button id="theme-toggle" className="btn">🌗Dark/Light Mode</button>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;