import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASE_URL } from '@env';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';
import { storage } from '../utils/storage';

// Navigation reference
let navigationRef = null;
let logoutCallback = null;

export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    if (config.skipAuth) {
      return config;
    }

    const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced 401 handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {

      // Prevent infinite loops
      if (originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      // Clear storage
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER_DATA);

      // Call logout callback
      if (logoutCallback) {
        await logoutCallback();
      }

      // Show user-friendly alert
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please login again to continue.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to login after user dismisses alert
              if (navigationRef) {
                navigationRef.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            },
          },
        ],
        { cancelable: false }
      );

      return Promise.reject({
        ...error,
        message: 'Your session has expired. Please login again.',
        isAuthError: true,
      });
    }

    // Handle network errors
    if (!error.response) {
      console.error('❌ Network Error:', error.message);
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection.',
        isNetworkError: true,
      });
    }

    // Handle other errors
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    });

    return Promise.reject(error);
  }
);

export default apiClient;