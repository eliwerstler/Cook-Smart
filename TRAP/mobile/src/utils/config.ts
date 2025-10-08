// API Configuration
// Change this to your computer's local IP for testing on physical device
// Or use localhost for iOS simulator
export const API_URL = __DEV__
  ? 'http://localhost:3000/api'  // For iOS simulator
  // ? 'http://192.168.1.XXX:3000/api'  // For physical device - replace XXX with your IP
  : 'https://your-production-api.com/api';  // Production API

export const SOCKET_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://your-production-api.com';
