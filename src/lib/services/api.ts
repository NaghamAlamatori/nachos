import axios from 'axios';

// Log BEFORE creating the API instance
console.log("🧪 API Base URL:", import.meta.env.VITE_API_URL);

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // If Django needs auth cookies
});

export default API;
