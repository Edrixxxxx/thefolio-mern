import axios from 'axios';

const baseURL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, '') || // strip trailing slash
  'http://localhost:5000/api';

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: log baseURL during dev
if (process.env.NODE_ENV !== 'production') {
  console.log('🌐 API baseURL:', baseURL);
}

export default instance;