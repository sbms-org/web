import api from '../axiosInstance';

/**
 * Authentication Service
 * Handles OTP-based authentication flow
 */

/**
 * Send OTP to mobile number
 * @param {string} mobile - Mobile number with country code (e.g., +251900000000)
 * @returns {Promise} Response with success message
 */
export const sendOTP = async (mobile) => {
  // Ensure mobile number is properly formatted
  // Remove any spaces, dashes, or parentheses
  const cleanMobile = mobile.replace(/[\s\-\(\)]/g, '');
  
  console.log('Sending OTP request:', { mobile: cleanMobile });
  
  return api.post('/auth/send-otp', { mobile: cleanMobile });
};

/**
 * Verify OTP and login
 * @param {string} mobile - Mobile number with country code
 * @param {string} otp - OTP code received
 * @returns {Promise} Response with token and user data
 */
export const verifyOTP = async (mobile, otp) => {
  // Ensure mobile number is properly formatted
  const cleanMobile = mobile.replace(/[\s\-\(\)]/g, '');
  
  console.log('Verifying OTP request:', { mobile: cleanMobile, otp });
  
  const response = await api.post('/auth/verify-otp', { 
    mobile: cleanMobile, 
    otp: otp.toString() 
  });
  
  // Store token and user data
  if (response.success && response.data) {
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

/**
 * Logout user
 * Clears local storage and redirects to login
 */
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

export default {
  sendOTP,
  verifyOTP,
  logout,
  getCurrentUser,
  isAuthenticated,
};
