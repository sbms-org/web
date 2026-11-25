import api from '../axiosInstance';

/**
 * User Service
 * Handles CRUD operations for all user types (admin, owner, property_manager, tenant)
 */

/**
 * Get all users with optional role filter
 * @param {string} role - Optional role filter (admin, owner, property_manager, tenant)
 * @returns {Promise} List of users
 */
export const getUsers = async (role = null) => {
  const params = role ? { role } : {};
  return api.get('/admin/users', { params });
};

/**
 * Get single user by ID
 * @param {string} id - User ID
 * @returns {Promise} User details
 */
export const getUser = async (id) => {
  return api.get(`/admin/users/${id}`);
};

/**
 * Create new user
 * @param {Object} userData - User data
 * @param {string} userData.fullname - Full name
 * @param {string} userData.mobile - Mobile number with country code
 * @param {string} userData.email - Email (optional)
 * @param {string} userData.role - Role (admin, owner, property_manager, tenant)
 * @param {string} userData.otp_code - Initial OTP/password (optional, defaults to 123456)
 * @returns {Promise} Created user
 */
export const createUser = async (userData) => {
  return api.post('/admin/users', userData);
};

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise} Updated user
 */
export const updateUser = async (id, userData) => {
  return api.put(`/admin/users/${id}`, userData);
};

/**
 * Delete user (soft delete - sets account_status to false)
 * @param {string} id - User ID
 * @returns {Promise} Success response
 */
export const deleteUser = async (id) => {
  return api.delete(`/admin/users/${id}`);
};

/**
 * Get owners only
 * @returns {Promise} List of owners
 */
export const getOwners = async () => {
  return getUsers('owner');
};

/**
 * Get tenants only
 * @returns {Promise} List of tenants
 */
export const getTenants = async () => {
  return getUsers('tenant');
};

/**
 * Get property managers only
 * @returns {Promise} List of property managers
 */
export const getPropertyManagers = async () => {
  return getUsers('property_manager');
};

/**
 * Get admins only
 * @returns {Promise} List of admins
 */
export const getAdmins = async () => {
  return getUsers('admin');
};

/**
 * Toggle user account status
 * @param {string} id - User ID
 * @param {boolean} status - New status
 * @returns {Promise} Updated user
 */
export const toggleUserStatus = async (id, status) => {
  return updateUser(id, { account_status: status });
};

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getOwners,
  getTenants,
  getPropertyManagers,
  getAdmins,
  toggleUserStatus,
};
