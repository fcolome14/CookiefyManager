import axios from 'axios';
import { API_BASE_URL } from '@env';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';
import { storage } from '../utils/storage';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Skip auth for login requests
    if (config.skipAuth) {
      return config;
    }

    try {
      const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        // Navigate to login or show alert
      }
      
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        endpoint: error.config.url,
      });
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Custom post method for form-urlencoded
apiClient.postFormUrlEncoded = async (url, data, config = {}) => {
  return apiClient.post(url, objectToFormData(data), {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export default apiClient;