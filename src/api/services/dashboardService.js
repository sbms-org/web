import api from '../axiosInstance';

/**
 * Dashboard Service
 * Handles dashboard statistics and overview data
 */

/**
 * Get dashboard statistics
 * @returns {Promise} Dashboard data with system-wide statistics
 */
export const getDashboardStats = async () => {
  return api.get('/admin/dashboard');
};

/**
 * Get recent activities (Future implementation)
 * @param {number} limit - Number of activities to fetch
 * @returns {Promise} Recent activities
 */
export const getRecentActivities = async (limit = 10) => {
  // TODO: Implement when API endpoint is available
  // return api.get(`/admin/activities?limit=${limit}`);
  
  // Mock data for now
  return {
    success: true,
    data: [
      {
        id: 1,
        icon: '🏢',
        title: 'New building approved',
        meta: 'Sunrise Apartments • 2 hours ago',
      },
      {
        id: 2,
        icon: '👤',
        title: 'New owner registered',
        meta: 'John Doe • 5 hours ago',
      },
      {
        id: 3,
        icon: '💰',
        title: 'Payment received',
        meta: 'Unit 101 • 1 day ago',
      },
    ],
  };
};

export default {
  getDashboardStats,
  getRecentActivities,
};
