import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import SiteDetailsScreen from '../screens/SiteDetailsScreen';
import { COLORS } from '../config/constants';

const Stack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{
          title: 'Search',
          headerShown: false, // Hide header for home since tab navigator has one
        }}
      />
      <Stack.Screen 
        name="SiteDetails" 
        component={SiteDetailsScreen}
        options={{
          title: 'Restaurant Details',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;