import axios from "axios";
import { store } from "../store";

// Create an axios instance with default config
export const api = axios.create({
  baseURL: "http://localhost:3001", // Make sure this matches your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    // Get token from Redux store instead of localStorage
    const token = store.getState().auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log("API Request Config:", { 
      url: config.url, 
      method: config.method,
      hasToken: !!token 
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", { 
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - could redirect to login
      console.error("Authentication error - redirecting to login");
      // You could dispatch a logout action here or redirect
    }

    return Promise.reject(error);
  }
);

export default api;
