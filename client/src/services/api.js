import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// Centralized error normalization so components can just read err.message.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error?.message || 'Something went wrong. Please try again.';
    return Promise.reject(Object.assign(new Error(message), { status: err.response?.status, details: err.response?.data?.error?.details }));
  }
);
