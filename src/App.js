import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PostsPage from './pages/PostsPage';
import AdminPage from './pages/AdminPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import Profile from './components/Profile';

function App() {
  const PageLayout = (Component) => (
    <>
      <Navbar />
      <Component />
      <Footer />
    </>
  );

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={PageLayout(HomePage)} />
          <Route path="/about" element={PageLayout(AboutPage)} />
          <Route path="/contact" element={PageLayout(ContactPage)} />
          <Route path="/register" element={PageLayout(RegisterPage)} />
          <Route path="/login" element={PageLayout(LoginPage)} />
          <Route path="/admin-register" element={PageLayout(AdminRegisterPage)} />
          <Route path="/forgot-password" element={PageLayout(ForgotPasswordPage)} />
          <Route path="/reset-password/:token" element={PageLayout(ResetPasswordPage)} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/posts"
            element={
              <ProtectedRoute>
                {PageLayout(PostsPage)}
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                {PageLayout(Profile)}
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTE */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                {PageLayout(AdminPage)}
              </ProtectedRoute>
            }
          />

          <Route path="/loading" element={<Loading />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;