import api from './api';
import type { ApiResponse, Member, PaginatedResponse } from '../types';

export const memberService = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string }) =>
    api.get<PaginatedResponse<Member>>('/members', { params }).then((r) => r.data),

  me: () =>
    api.get<ApiResponse<Member>>('/members/me').then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Member>>(`/members/${id}`).then((r) => r.data),

  create: (payload: Partial<Member>) =>
    api.post<ApiResponse<Member>>('/members', payload).then((r) => r.data),

  update: (id: string, payload: Partial<Member>) =>
    api.put<ApiResponse<Member>>(`/members/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiResponse<null>>(`/members/${id}`).then((r) => r.data),
};
