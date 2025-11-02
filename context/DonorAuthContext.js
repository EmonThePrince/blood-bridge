import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

// Create the context for donor authentication
const DonorAuthContext = createContext();

export const DonorAuthProvider = ({ children }) => {
  const [currentDonor, setCurrentDonor] = useState(null);
  const [loading, setLoading] = useState(true);


  // Load token and donor data on app start
  useEffect(() => {
    const loadDonorData = async () => {
      try {
        const storedDonor = await AsyncStorage.getItem('donor');
        if (storedDonor) {
          setCurrentDonor(JSON.parse(storedDonor));
        }
      } catch (error) {
        console.error('Failed to load donor data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDonorData();
  }, []);

  const login = async (phone, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/donors/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const donorWithToken = { ...data.donor, token: data.token };
        setCurrentDonor(donorWithToken);
        await AsyncStorage.setItem('donor', JSON.stringify(donorWithToken));
        Alert.alert('Login Success', `Welcome back, ${data.donor.name}!`);
        return true;
      } else {
        Alert.alert('Login Failed', data.detail || 'Invalid login.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Server error.');
      return false;
    }
  };

  const logout = async () => {
    try {
      // Optionally call your backend logout endpoint here if you have one
      // await fetch(`${API_BASE_URL}/api/donors/logout/`, { method: 'POST', headers: { Authorization: `Token ${currentDonor.token}` }});

      await AsyncStorage.removeItem('donor'); // Remove from storage
      setCurrentDonor(null); // Clear state
      Alert.alert('Logout Success', 'You have been logged out.');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Unable to log out properly.');
    }
  };

  const updateDonorInfo = async (updatedInfo) => {
    try {
      const updatedDonor = { ...currentDonor, ...updatedInfo };
      setCurrentDonor(updatedDonor);
      await AsyncStorage.setItem('donor', JSON.stringify(updatedDonor));
      Alert.alert('Profile Updated', 'Your profile information has been saved.');
    } catch (error) {
      console.error('Update donor info error:', error);
    }
  };

  return (
    <DonorAuthContext.Provider value={{ currentDonor, login, logout, updateDonorInfo, loading }}>
      {children}
    </DonorAuthContext.Provider>
  );
};

export const useDonorAuth = () => useContext(DonorAuthContext);
