import api from './axiosInstance';

export const getReports = () => api.get('/reports');
