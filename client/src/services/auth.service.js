// =============================================
// Service: Auth API Calls
// =============================================

import api from './api';
import { API_ROUTES } from '../utils/constants';

const AuthService = {
  signup: async (data) => {
    const response = await api.post(API_ROUTES.SIGNUP, data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post(API_ROUTES.LOGIN, data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post(API_ROUTES.LOGOUT);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get(API_ROUTES.PROFILE);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put(API_ROUTES.PROFILE, data);
    return response.data;
  },
};

export default AuthService;
