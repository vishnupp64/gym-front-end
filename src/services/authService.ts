import api from './api';
import type { ApiResponse, User } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', payload).then((r) => r.data),

  register: (payload: LoginPayload & { name: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/register', payload).then((r) => r.data),

  me: () => api.get<ApiResponse<User>>('/auth/me').then((r) => r.data),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse<null>>('/auth/password', payload).then((r) => r.data),
};
