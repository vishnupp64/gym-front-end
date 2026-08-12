import api from './api';
import type { ApiResponse, Payment, PaymentStatus } from '../types';

export interface SubmitPaymentPayload {
  membershipPlanId: string;
  transactionId: string;
  screenshotUrl?: string;
}

export interface CreatePaymentPayload extends Partial<Payment> {
  memberId?: string;
  amount?: number;
}

export const paymentService = {
  list: (params?: { status?: PaymentStatus }) =>
    api.get<ApiResponse<Payment[]>>('/payments', { params }).then((r) => r.data),

  listMine: () => api.get<ApiResponse<Payment[]>>('/payments/me').then((r) => r.data),

  submit: (payload: SubmitPaymentPayload) =>
    api.post<ApiResponse<Payment>>('/payments/submit', payload).then((r) => r.data),

  create: (payload: CreatePaymentPayload) =>
    api.post<ApiResponse<Payment>>('/payments', payload).then((r) => r.data),

  update: (id: string, payload: Partial<Payment>) =>
    api.put<ApiResponse<Payment>>(`/payments/${id}`, payload).then((r) => r.data),

  approve: (id: string) =>
    api.post<ApiResponse<Payment>>(`/payments/${id}/approve`).then((r) => r.data),

  reject: (id: string, rejectionReason: string) =>
    api
      .post<ApiResponse<Payment>>(`/payments/${id}/reject`, { rejectionReason })
      .then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiResponse<null>>(`/payments/${id}`).then((r) => r.data),
};
