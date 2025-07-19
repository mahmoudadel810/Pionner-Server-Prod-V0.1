import axios from "axios";

// Centralized API configuration
const API_CONFIG = {
  // Use environment variable or fallback to production URL
  baseURL: import.meta.env.VITE_API_URL || 'https://pionner-server-prod-v0-1.onrender.com/api/v1',
  timeout: 10000, // 10 second timeout
  withCredentials: true, // send cookies to the server
};

const axiosInstance = axios.create(API_CONFIG);

// Request interceptor for logging and auth headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear user data and redirect to login
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.status, error.response?.data, error.config?.url);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
