import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { setNavigationRef } from './src/api/client';
import TabNavigator from './src/navigation/TabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { COLORS } from './src/config/constants';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigationRef = useRef(null);

  // Set navigation reference for API client (for auto-logout on 401)
  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
      console.log('📍 Navigation reference set for auto-logout');
    }
  }, []);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated ? (
        <TabNavigator />
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});