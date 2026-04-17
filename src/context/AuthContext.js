import React, { createContext, useEffect, useState } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshMe = async () => {
    try {
      const res = await axios.get('/users/me');
      const updatedUser = res.data?.user;

      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      return updatedUser;
    } catch (err) {
      if (err.response?.status === 401) logout();
      return null;
    }
  };

  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t || null);

    const u = localStorage.getItem('user');
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (token && !user) refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ✅ mode: 'member' | 'admin'
  const login = async (email, password, mode = 'member') => {
    setLoading(true);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const endpoint = mode === 'admin' ? '/auth/admin-login' : '/auth/login';
      const res = await axios.post(endpoint, { email, password });

      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setUser, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};