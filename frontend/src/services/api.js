import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  // Attach shared API key — required by backend for all non-health requests
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) {
    config.headers["X-API-Key"] = apiKey;
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -- Security: on 401 (expired / invalid token) clear session and redirect to login --
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.replace("/login");
    }
    return Promise.reject(error);
  },
);
