import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Attach token if present
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Auto-handle expired/invalid token
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // token bad/expired → clear and force re-login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // optional: redirect
      // window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default instance;