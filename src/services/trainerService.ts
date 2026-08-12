import api from './api';
import type { ApiResponse, Trainer } from '../types';

export interface TrainerPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  specialization?: string;
  salary?: number;
  experience?: number;
}

export const trainerService = {
  list: () => api.get<ApiResponse<Trainer[]>>('/trainers').then((r) => r.data),
  me: () => api.get<ApiResponse<Trainer>>('/trainers/me').then((r) => r.data),
  get: (id: string) => api.get<ApiResponse<Trainer>>(`/trainers/${id}`).then((r) => r.data),
  create: (payload: TrainerPayload) =>
    api.post<ApiResponse<Trainer>>('/trainers', payload).then((r) => r.data),
  update: (id: string, payload: TrainerPayload) =>
    api.put<ApiResponse<Trainer>>(`/trainers/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete<ApiResponse<null>>(`/trainers/${id}`).then((r) => r.data),
};
