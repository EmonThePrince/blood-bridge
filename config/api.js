// API Configuration
// For local development, use your computer's IP address
// You can find your IP by running 'ipconfig' in PowerShell

// IMPORTANT: Replace this with your actual local IP address
// To find your IP: Open PowerShell and run 'ipconfig'
// Look for "IPv4 Address" under your active network adapter

// For localhost (when using Android emulator)
// const API_BASE_URL = 'http://10.0.2.2:8000';

// For physical device on same network, use your computer's local IP
// Example: 'http://192.168.1.XXX:8000'
export const API_BASE_URL = 'http://localhost:8000';

// Alternative configuration based on environment
export const getApiUrl = () => {
  // You can uncomment and use this if you want different URLs for different environments
  // if (__DEV__) {
  //   return 'http://10.0.2.2:8000'; // Android Emulator
  //   // OR
  //   // return 'http://192.168.1.XXX:8000'; // Physical device - replace with your IP
  // }
  // return 'https://bloodbridge-1sqo.onrender.com'; // Production
  
  return API_BASE_URL;
};

export default {
  API_BASE_URL,
  getApiUrl,
};
