import axios from 'axios';

// Cards are a static file today (written by the scheduled generator).
// Point VITE_API_URL at the Rust API later without touching the hooks.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error ?? error.message ?? 'Unknown error';
    return Promise.reject(new Error(message));
  },
);
