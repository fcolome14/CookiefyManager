import React, { createContext, useState, useContext, useEffect } from 'react';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../config/constants';
import { auth } from '../api/endpoints';
import { setLogoutCallback } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Register logout callback with API client
  useEffect(() => {
    setLogoutCallback(handleAutoLogout);
  }, []);

  const checkLoginStatus = async () => {
    try {
      const storedToken = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await storage.getItem(STORAGE_KEYS.USER_DATA);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('🔐 Attempting login...');
      
      const response = await auth.login(username, password);

      console.log("RESPONSE: ", response.status)
      
      if (response.status === 'success' && response.data?.token) {
        const accessToken = response.data.token;
        const userData = response.data.username || { username };

        // Store token and user data
        await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
        await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

        // Update state
        setToken(accessToken);
        setUser(userData);

        console.log('✅ Login successful');
        return { success: true };
      } else {
        console.error('❌ Login failed:', response.message);
        return { 
          success: false, 
          error: response.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');

      // Try to logout from API (optional - may fail if token expired)
      try {
        await auth.logout();
      } catch (error) {
        console.log('⚠️ API logout failed (expected if token expired):', error.message);
      }

      // Clear local storage
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER_DATA);

      // Clear state
      setToken(null);
      setUser(null);

      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Force clear state even if logout fails
      setToken(null);
      setUser(null);
      
      throw error;
    }
  };

  // Auto-logout handler for 401 errors (called from API client)
  const handleAutoLogout = async () => {
    console.log('🔄 Auto-logout triggered by 401 error');
    
    // Clear local storage
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await storage.removeItem(STORAGE_KEYS.USER_DATA);

    // Clear state
    setToken(null);
    setUser(null);

    console.log('✅ Auto-logout completed');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;