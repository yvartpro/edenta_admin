import apiClient from '../apiClient';

export const authAPI = {
  register: async (userData) => {
    const response = await apiClient.post('/user', userData);
    return response;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/user/login', credentials);
    return response;
  },

  me: async () => {
    const response = await apiClient.get('/user/me');
    return response;
  }
};
