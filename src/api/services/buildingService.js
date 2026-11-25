import api from '../axiosInstance';

/**
 * Building Service
 * Handles building management and approval workflow
 */

/**
 * Get all pending buildings awaiting approval
 * @returns {Promise} List of pending buildings
 */
export const getPendingBuildings = async () => {
  return api.get('/admin/buildings/pending');
};

/**
 * Get building details by ID
 * @param {string} id - Building ID
 * @returns {Promise} Building details with owner info
 */
export const getBuilding = async (id) => {
  return api.get(`/admin/buildings/${id}`);
};

/**
 * Approve a building
 * @param {string} id - Building ID
 * @param {Object} approvalData - Approval data
 * @param {number} approvalData.confirmedTotalUnits - Confirmed number of units
 * @param {string} approvalData.notes - Approval notes (optional)
 * @returns {Promise} Approved building
 */
export const approveBuilding = async (id, approvalData) => {
  return api.post(`/admin/buildings/${id}/approve`, approvalData);
};

/**
 * Reject a building
 * @param {string} id - Building ID
 * @param {Object} rejectionData - Rejection data
 * @param {string} rejectionData.reason - Rejection reason
 * @returns {Promise} Rejected building
 */
export const rejectBuilding = async (id, rejectionData) => {
  return api.post(`/admin/buildings/${id}/reject`, rejectionData);
};

/**
 * Get all buildings (Future implementation)
 * @param {Object} filters - Filter options
 * @returns {Promise} List of buildings
 */
export const getAllBuildings = async (filters = {}) => {
  // TODO: Implement when API endpoint is available
  // return api.get('/admin/buildings', { params: filters });
  throw new Error('Not implemented yet');
};

/**
 * Get buildings by owner
 * @param {string} ownerId - Owner ID
 * @returns {Promise} List of buildings
 */
export const getBuildingsByOwner = async (ownerId) => {
  // TODO: Implement when API endpoint is available
  // return api.get(`/admin/buildings?owner_id=${ownerId}`);
  throw new Error('Not implemented yet');
};

/**
 * Get building statistics
 * @param {string} id - Building ID
 * @returns {Promise} Building statistics
 */
export const getBuildingStats = async (id) => {
  // TODO: Implement when API endpoint is available
  // return api.get(`/admin/buildings/${id}/stats`);
  throw new Error('Not implemented yet');
};

export default {
  getPendingBuildings,
  getBuilding,
  approveBuilding,
  rejectBuilding,
  getAllBuildings,
  getBuildingsByOwner,
  getBuildingStats,
};
