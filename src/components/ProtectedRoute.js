import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const auth = useContext(AuthContext);

  // context values
  const ctxUser = auth?.user ?? null;
  const ctxToken = auth?.token ?? null;

  // fallback to localStorage to avoid redirect issues on refresh
  const lsToken = localStorage.getItem('token');
  const lsUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const user = ctxUser || lsUser;
  const token = ctxToken || lsToken;

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;