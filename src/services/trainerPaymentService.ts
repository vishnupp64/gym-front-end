import api from './api';
import type { ApiResponse, TrainerPayment, TrainerPaymentStatus } from '../types';

export interface TrainerPaymentPayload {
  trainerId?: string;
  amount?: number;
  status?: TrainerPaymentStatus;
  paymentDate?: string;
  notes?: string;
}

export const trainerPaymentService = {
  list: (params?: { trainerId?: string; status?: TrainerPaymentStatus }) =>
    api.get<ApiResponse<TrainerPayment[]>>('/trainer-payments', { params }).then((r) => r.data),

  listMine: () =>
    api.get<ApiResponse<TrainerPayment[]>>('/trainer-payments/me').then((r) => r.data),

  create: (payload: TrainerPaymentPayload) =>
    api.post<ApiResponse<TrainerPayment>>('/trainer-payments', payload).then((r) => r.data),

  update: (id: string, payload: TrainerPaymentPayload) =>
    api.put<ApiResponse<TrainerPayment>>(`/trainer-payments/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiResponse<null>>(`/trainer-payments/${id}`).then((r) => r.data),
};
