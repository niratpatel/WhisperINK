

// client/src/services/api.js
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native'; // <-- IMPORT PLATFORM

// --- Define Backend URLs ---

// URL for testing web locally (browser accessing local backend)
const WEB_DEV_API_URL = 'http://localhost:5001/api';

// URL for testing on mobile device (Expo Go accessing local backend via LAN IP)
// --- IMPORTANT: Replace YOUR_COMPUTER_IP with your actual local network IP ---
const NATIVE_DEV_API_URL = 'http://192.168.1.5:5001/api';

// URL for deployed production backend (replace later)
const PRODUCTION_API_URL = 'http://192.168.1.5:5001/api';

// --- Determine Correct URL ---
let finalApiUrl;
// Check if we're running in a development client (development build)
const isDevClient = Constants.appOwnership === 'standalone' && __DEV__;

// Modified logic to handle development builds correctly
if (process.env.NODE_ENV === 'production' && !isDevClient) {
  // True production build
  finalApiUrl = PRODUCTION_API_URL;
} else {
  // Development environment (including dev client builds)
  if (Platform.OS === 'web') {
    finalApiUrl = WEB_DEV_API_URL; // Use localhost for web dev
  } else {
    finalApiUrl = NATIVE_DEV_API_URL; // Use LAN IP for native dev
  }
}

// Log the final URL being used for verification
// Update this line
console.log(`Connecting to API (${Platform.OS} - ${process.env.NODE_ENV} - DevClient: ${isDevClient} - AppOwnership: ${Constants.appOwnership || 'undefined'}):`, finalApiUrl);

// --- Create Axios Instance ---
const apiClient = axios.create({
  baseURL: finalApiUrl, // Use the determined URL
});

// --- API Functions (remain the same) ---
export const getJournalEntries = async (filters = {}) => {
  try {
    const response = await apiClient.get('/journal-entries', { params: filters });
    return response.data; // Return only data on success
  } catch (error) {
    console.error(
      'API Error fetching entries:',
      error.response?.status, // Log status code
      error.response?.data || error.message
    );
    // Check if it's the HTML response again
    if (typeof error.response?.data === 'string' && error.response.data.includes('<html')) {
        console.error("!!! STILL RECEIVING HTML - Check API URL configuration and ensure backend server is running on the correct port (5001?) and accessible !!!");
    }
    throw error; // Re-throw to be caught by the calling component
  }
};

export const createJournalEntry = async (formData) => {
  try {
    const response = await apiClient.post('/journal-entries', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      'API Error creating entry:',
      error.response?.status,
      error.response?.data || error.message
    );
    // Check if it's the HTML response again
    if (typeof error.response?.data === 'string' && error.response.data.includes('<html')) {
         console.error("!!! STILL RECEIVING HTML - Check API URL configuration and ensure backend server is running on the correct port (5001?) and accessible !!!");
    }
    throw error;
  }
};

// --- ADD Delete Function ---
export const deleteJournalEntry = async (entryId) => {
  if (!entryId) {
      throw new Error("Entry ID is required for deletion.");
  }
  console.log(`Attempting to delete entry: ${entryId}`);
  try {
      // Use the DELETE HTTP method
      const response = await apiClient.delete(`/journal-entries/${entryId}`);
      return response.data; // Should return { success: true, data: {} }
  } catch (error) {
      console.error(
          'API Error deleting entry:', entryId,
          error.response?.status,
          error.response?.data || error.message
      );
      // Re-throw a more specific message if possible
      const message = error.response?.data?.message || error.message || 'Failed to delete entry.';
      throw new Error(message);
  }
}

// --- Default Export ---
// Note: No need for default export if you only export named functions
// export default {
//   getJournalEntries,
//   createJournalEntry,
// };