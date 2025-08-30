import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role_name?: string;
  }) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  refreshToken: () => api.post('/auth/refresh'),
};

export const rolesAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/roles', { params }),
  getById: (id: number) => api.get(`/roles/${id}`),
  create: (roleData: {
    name: string;
    description: string;
    level: number;
    permission_ids?: number[];
  }) => api.post('/roles', roleData),
  update: (id: number, roleData: any) => api.put(`/roles/${id}`, roleData),
  delete: (id: number) => api.delete(`/roles/${id}`),
};

export const permissionsAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; module?: string }) =>
    api.get('/permissions', { params }),
  getByModule: () => api.get('/permissions/by-module'),
  getModules: () => api.get('/permissions/modules'),
  create: (permissionData: {
    name: string;
    description: string;
    module: string;
    action: string;
    resource?: string;
  }) => api.post('/permissions', permissionData),
  update: (id: number, permissionData: any) => api.put(`/permissions/${id}`, permissionData),
  delete: (id: number) => api.delete(`/permissions/${id}`),
};

export const usersAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/users', { params }),
  assignRole: (userId: number, roleId: number) =>
    api.post(`/users/${userId}/roles/${roleId}`),
  removeRole: (userId: number, roleId: number) =>
    api.delete(`/users/${userId}/roles/${roleId}`),
};

export const cashlessAPI = {
  getBalance: (userId: number) => api.get(`/cashless/balance/${userId}`),
  createTransaction: (transactionData: {
    user_id: number;
    amount: number;
    type: string;
    description: string;
  }) => api.post('/cashless/transaction', transactionData),
};
