// src/lib/api.ts
import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://nachos-backend-production.up.railway.app/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Bearer token to every request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
