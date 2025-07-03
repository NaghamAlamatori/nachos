import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../token";

const API = axios.create({
  baseURL: "https://nachos-backend-production.up.railway.app/api/v1",
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auto-refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          'https://nachos-backend-production.up.railway.app/api/v1/auth/token/refresh/',
          { refresh: refreshToken }
        );

        const { access } = response.data;
        setTokens(access, refreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return API(originalRequest);

      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clearTokens();
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;