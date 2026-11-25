import api from './axiosInstance';

export const getOwners = () => api.get('/admin/owners');
export const getOwner = (id) => api.get(`/admin/owners/${id}`);
export const createOwner = (data) => api.post('/admin/owners', data);
export const updateOwner = (id, data) => api.put(`/admin/owners/${id}`, data);
export const deleteOwner = (id) => api.delete(`/admin/owners/${id}`);
