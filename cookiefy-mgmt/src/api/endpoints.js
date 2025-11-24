import apiClient from './client';
import { STORAGE_KEYS } from '../config/constants';
import { storage } from '../utils/storage';

// Authentication
export const auth = {
  login: async (username, password) => {
    // Create form data directly using URLSearchParams
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', String(username || '').trim().toLowerCase());
    formData.append('password', password);
    formData.append('scope', '');
    formData.append('client_id', 'string');
    formData.append('client_secret', '********');

    console.log('Login Request to:', apiClient.defaults.baseURL + '/auth/login');
    console.log('Form Data:', formData.toString());

    const response = await apiClient.post('/auth/login', formData.toString(), {
      skipAuth: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    });
    
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

// Search
export const search = {
  searchAll: async (params = {}) => {
    const {
      input,
      is_site,
      is_list,
      is_user,
      lat,
      lon,
      city,
    } = params;

    // Get token from storage (same place as interceptor)
    const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    // Base query matching your FastAPI SearchRead model
    const query = {
      input: String(input ?? '').trim(),
      is_site: !!is_site,
      is_list: !!is_list,
      is_user: !!is_user,
    };

    // Optional geo filters
    if (typeof lat === 'number') {
      query.lat = lat;
    }
    if (typeof lon === 'number') {
      query.lon = lon;
    }

    // Optional city
    if (city && city.trim()) {
      query.city = city.trim();
    }

    if (token) {
      query.token = token;
    }

    console.log('📤 Search Request params:', query);

    const response = await apiClient.get('/posts/search', {
      params: query,
      // Do NOT set skipAuth: we want the interceptor to also send Authorization header
    });

    return response.data;
  },
};

// Restaurants
export const restaurants = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/restaurants', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/restaurants/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await apiClient.post('/restaurants', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await apiClient.put(`/restaurants/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/restaurants/${id}`);
    return response.data;
  },
};

// Users
export const users = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
};

// Statistics
export const stats = {
  getOverview: async () => {
    const response = await apiClient.get('/stats/overview');
    return response.data;
  },
  
  getRestaurantStats: async (restaurantId) => {
    const response = await apiClient.get(`/stats/restaurants/${restaurantId}`);
    return response.data;
  },
};

// Add more endpoint groups as needed