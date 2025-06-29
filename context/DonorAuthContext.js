import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';

// Create the context for donor authentication
const DonorAuthContext = createContext();

// Define the DonorAuthProvider component
export const DonorAuthProvider = ({ children }) => {
  // State to hold the currently logged-in donor object
  const [currentDonor, setCurrentDonor] = useState(null);

  // Dummy login function for demonstration purposes
  const login = (phone, password) => {
    // In a real-world application, this would involve:
    // 1. Making an API call to your backend with the provided phone and password.
    // 2. The backend would verify credentials and return authenticated donor data (e.g., token + donor profile).
    // 3. You would then store the token securely (e.g., AsyncStorage) and the donor data in state.

    // For this dummy example, we're using hardcoded credentials.
    // If the phone and password match, we simulate a successful login
    // by setting a predefined dummy donor object.
    if (phone === '01710000001' && password === 'donor123') {
      const dummyLoggedInDonor = {
        id: '1',
        name: 'Ali Rahman',
        bloodGroup: 'A+',
        phone: '01710000001',
        location: 'Dhanmondi, Dhaka',
        lastDonated: '2024-05-10', // Example date, considering current date is June 29, 2025
        age: 28,
        availability: 'Available',
        donationCount: 12,
        verified: true,
        emergencyContact: '01810000001',
        medicalHistory: 'No major health issues. Regular donor with consistent health checkups.',
        preferredTime: 'Morning (9 AM - 12 PM)',
        notes: 'Available for emergency donations. Prefer to donate at Dhaka Medical College Hospital.',
        registeredSince: '2022-01-15',
        weight: '70 kg',
        bloodPressure: '120/80',
        lastCheckup: '2024-11-15' // Example future date for next checkup
      };
      setCurrentDonor(dummyLoggedInDonor); // Set the dummy donor as logged in
      Alert.alert('Login Success', `Welcome back, ${dummyLoggedInDonor.name}!`);
      return true; // Indicate successful login
    } else {
      // If credentials don't match, show an error alert
      Alert.alert('Login Failed', 'Invalid phone number or password.');
      return false; // Indicate failed login
    }
  };

  // Function to log out the current donor
  const logout = () => {
    setCurrentDonor(null); // Clear the current donor from state
    Alert.alert('Logout Success', 'You have been logged out.');
  };

  // Function to update donor information
  // This can be used, for example, from an "Edit Profile" screen
  const updateDonorInfo = (updatedInfo) => {
    // Merge the updated information with the existing currentDonor data
    setCurrentDonor(prevDonor => ({ ...prevDonor, ...updatedInfo }));
    Alert.alert('Profile Updated', 'Your profile information has been saved.');
  };

  return (
    // Provide the current donor state and the login/logout/update functions
    // to all children components wrapped by this provider.
    <DonorAuthContext.Provider value={{ currentDonor, login, logout, updateDonorInfo }}>
      {children}
    </DonorAuthContext.Provider>
  );
};

// Custom hook to easily consume the DonorAuthContext in any component
export const useDonorAuth = () => {
  return useContext(DonorAuthContext);
};