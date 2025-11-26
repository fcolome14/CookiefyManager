import apiClient from './client';
import { STORAGE_KEYS } from '../config/constants';
import { storage } from '../utils/storage';

// Helper function to add token to params
const addTokenToParams = async (params = {}) => {
  const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    return { ...params, token };
  }
  return params;
};

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
    // const params = await addTokenToParams();
    // const response = await apiClient.post('/auth/logout', null, { params });
    // return response.data;
    return {status: "success"}
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
      cuisine,
      is_admin,
    } = params;

    // Get token from storage
    const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    // Base query matching your FastAPI SearchRead model
    const query = {
      input: String(input ?? '').trim(),
      is_site: !!is_site,
      is_list: !!is_list,
      is_user: !!is_user,
      is_admin: !!is_admin,
    };

    // Optional filters
    if (typeof lat === 'number') query.lat = lat;
    if (typeof lon === 'number') query.lon = lon;
    if (city && city.trim()) query.city = city.trim();
    if (cuisine && cuisine.trim()) query.cuisine = cuisine.trim();
    if (is_admin) query.is_admin = is_admin;

    // Add token
    if (token) query.token = token;

    const response = await apiClient.get('/posts/search', {
      params: query,
    });

    return response.data;
  },
};

// Images
export const images = {
  uploadSiteImage: async (siteId, imageUri) => {
    const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    // Create FormData for multipart upload
    const formData = new FormData();
    
    // Add the image file
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: type,
    });
    
    // Add site_id to form data
    formData.append('site_id', siteId);

    const response = await apiClient.post('/images/site/upload-image/', formData, {
      params: { token },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

// Sites
export const sites = {
  // getAll: async (params = {}) => {
  //   const paramsWithToken = await addTokenToParams(params);
  //   const response = await apiClient.get('/restaurants', { 
  //     params: paramsWithToken 
  //   });
  //   return response.data;
  // },
  
  getById: async (id) => {
    const params = await addTokenToParams();
    const response = await apiClient.get(`/posts/get-site/${id}`, { params });
    return response.data;
  },
  
  // create: async (data) => {
  //   const params = await addTokenToParams();
  //   const response = await apiClient.post('/restaurants', data, { params });
  //   return response.data;
  // },
  
  update: async (id, data) => {
    const params = await addTokenToParams();
    const payload = {
      id,
      ...data,
    };
    const response = await apiClient.put('/posts/update-site', payload, { params });
    return response.data;
  },
  
  // delete: async (id) => {
  //   const params = await addTokenToParams();
  //   const response = await apiClient.delete(`/restaurants/${id}`, { params });
  //   return response.data;
  // },
};

// Users
export const users = {
  getAll: async (params = {}) => {
    const paramsWithToken = await addTokenToParams(params);
    const response = await apiClient.get('/users', { 
      params: paramsWithToken 
    });
    return response.data;
  },
  
  getById: async (id) => {
    const params = await addTokenToParams();
    const response = await apiClient.get(`/users/${id}`, { params });
    return response.data;
  },
  
  create: async (data) => {
    const params = await addTokenToParams();
    const response = await apiClient.post('/users', data, { params });
    return response.data;
  },
  
  update: async (id, data) => {
    const params = await addTokenToParams();
    const response = await apiClient.put(`/users/${id}`, data, { params });
    return response.data;
  },
  
  delete: async (id) => {
    const params = await addTokenToParams();
    const response = await apiClient.delete(`/users/${id}`, { params });
    return response.data;
  },
};

// Statistics
export const stats = {
  getOverview: async () => {
    const params = await addTokenToParams();
    const response = await apiClient.get('/stats/overview', { params });
    return response.data;
  },
  
  getRestaurantStats: async (restaurantId) => {
    const params = await addTokenToParams();
    const response = await apiClient.get(`/stats/restaurants/${restaurantId}`, { 
      params 
    });
    return response.data;
  },
};

// Lists
export const lists = {
  getAll: async (params = {}) => {
    const paramsWithToken = await addTokenToParams(params);
    const response = await apiClient.get('/lists', { 
      params: paramsWithToken 
    });
    return response.data;
  },
  
  getById: async (id) => {
    const params = await addTokenToParams();
    const response = await apiClient.get(`/lists/${id}`, { params });
    return response.data;
  },
  
  create: async (data) => {
    const params = await addTokenToParams();
    const response = await apiClient.post('/lists', data, { params });
    return response.data;
  },
  
  update: async (id, data) => {
    const params = await addTokenToParams();
    const response = await apiClient.put(`/lists/${id}`, data, { params });
    return response.data;
  },
  
  delete: async (id) => {
    const params = await addTokenToParams();
    const response = await apiClient.delete(`/lists/${id}`, { params });
    return response.data;
  },
};

// Hashtags
export const hashtags = {
  getAll: async (params = {}) => {
    const paramsWithToken = await addTokenToParams(params);
    const response = await apiClient.get('/hashtags', { 
      params: paramsWithToken 
    });
    return response.data;
  },
  
  getById: async (id) => {
    const params = await addTokenToParams();
    const response = await apiClient.get(`/hashtags/${id}`, { params });
    return response.data;
  },
};