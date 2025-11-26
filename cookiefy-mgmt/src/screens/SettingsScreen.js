import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '../config/constants';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info Section */}
      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Information</Text>
          
          {/* <View style={styles.item}>
            <Text style={styles.itemText}>Name</Text>
            <Text style={styles.itemValue}>{user.name}</Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.itemText}>Username</Text>
            <Text style={styles.itemValue}>{user.username}</Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.itemText}>Email</Text>
            <Text style={styles.itemValue}>{user.email}</Text>
          </View> */}

          <View style={styles.item}>
            <Text style={styles.itemText}>Role</Text>
            <Text style={styles.itemValue}>
              {/* {user.is_admin ? 'Administrator' : 'User'} */}
              Administrator
            </Text>
          </View>
        </View>
      )}

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.item} onPress={handleLogout}>
          <Text style={[styles.itemText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Data Section */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        
        <TouchableOpacity style={styles.item} onPress={handleClearCache}>
          <Text style={styles.itemText}>Clear Cache</Text>
        </TouchableOpacity>
      </View> */}

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.item}>
          <Text style={styles.itemText}>Version</Text>
          <Text style={styles.itemValue}>1.0.0.1</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.itemText}>Environment</Text>
          <Text style={styles.itemValue}>Production</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  itemValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: '600',
  },
});

export default SettingsScreen;