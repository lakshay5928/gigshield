import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('gs_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gs_token');
      localStorage.removeItem('gs_worker');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default API;
