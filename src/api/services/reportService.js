import api from '../axiosInstance';

/**
 * Report Service
 * Handles various reports and analytics
 */

/**
 * Get overdue payments report
 * @returns {Promise} List of overdue units with tenant and building info
 */
export const getOverdueReport = async () => {
  return api.get('/admin/overdue-report');
};

/**
 * Get rent collection report (Future implementation)
 * @param {string} period - Period in YYYY-MM format
 * @returns {Promise} Rent collection report
 */
export const getRentCollectionReport = async (period) => {
  // TODO: Implement when API endpoint is available
  // return api.get(`/admin/reports/rent-collection?period=${period}`);
  throw new Error('Not implemented yet');
};

/**
 * Get occupancy report (Future implementation)
 * @param {string} period - Period in YYYY-MM format
 * @returns {Promise} Occupancy report
 */
export const getOccupancyReport = async (period) => {
  // TODO: Implement when API endpoint is available
  // return api.get(`/admin/reports/occupancy?period=${period}`);
  throw new Error('Not implemented yet');
};

/**
 * Get owner activity report (Future implementation)
 * @param {string} period - Period in YYYY-MM format
 * @returns {Promise} Owner activity report
 */
export const getOwnerActivityReport = async (period) => {
  // TODO: Implement when API endpoint is available
  // return api.get(`/admin/reports/owner-activity?period=${period}`);
  throw new Error('Not implemented yet');
};

/**
 * Get income by building report (Future implementation)
 * @param {string} period - Period in YYYY-MM format
 * @returns {Promise} Income by building report
 */
export const getIncomeByBuildingReport = async (period) => {
  // TODO: Implement when API endpoint is available
  // return api.get(`/admin/reports/income-by-building?period=${period}`);
  throw new Error('Not implemented yet');
};

/**
 * Export report to PDF (Future implementation)
 * @param {string} reportType - Type of report
 * @param {Object} data - Report data
 * @returns {Promise} PDF file
 */
export const exportReportToPDF = async (reportType, data) => {
  // TODO: Implement PDF generation
  throw new Error('Not implemented yet');
};

/**
 * Export report to Excel (Future implementation)
 * @param {string} reportType - Type of report
 * @param {Object} data - Report data
 * @returns {Promise} Excel file
 */
export const exportReportToExcel = async (reportType, data) => {
  // TODO: Implement Excel generation
  throw new Error('Not implemented yet');
};

export default {
  getOverdueReport,
  getRentCollectionReport,
  getOccupancyReport,
  getOwnerActivityReport,
  getIncomeByBuildingReport,
  exportReportToPDF,
  exportReportToExcel,
};
