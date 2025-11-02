import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Fetch fresh data from API
        try {
          const response = await fetch(`${API_BASE_URL}/api/donors/${parsedUser.id}/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
          
          if (response.ok) {
            const freshData = await response.json();
            const updatedUser = { ...parsedUser, ...freshData, token };
            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (apiError) {
          console.error('Error fetching fresh user data:', apiError);
          // Keep using cached data if API fetch fails
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (contact, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/donors/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = { ...data.donor, token: data.token };
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('token', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.detail || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/donors/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const updateUser = async (updates) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/donors/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.error || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, message: 'Network error' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
