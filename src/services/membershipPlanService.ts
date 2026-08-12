import api from './api';
import type { ApiResponse, MembershipPlan } from '../types';

export interface MembershipPlanPayload {
  name?: string;
  price?: number;
  duration?: number;
  description?: string | null;
  features?: string[];
  isActive?: boolean;
}

export const membershipPlanService = {
  list: (onlyActive = false) =>
    api
      .get<ApiResponse<MembershipPlan[]>>('/membership-plans', {
        params: onlyActive ? { active: 'true' } : undefined,
      })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<MembershipPlan>>(`/membership-plans/${id}`).then((r) => r.data),

  create: (payload: MembershipPlanPayload) =>
    api.post<ApiResponse<MembershipPlan>>('/membership-plans', payload).then((r) => r.data),

  update: (id: string, payload: MembershipPlanPayload) =>
    api.put<ApiResponse<MembershipPlan>>(`/membership-plans/${id}`, payload).then((r) => r.data),

  setActive: (id: string, isActive: boolean) =>
    api
      .patch<ApiResponse<MembershipPlan>>(`/membership-plans/${id}/active`, { isActive })
      .then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiResponse<MembershipPlan | null>>(`/membership-plans/${id}`).then((r) => r.data),
};
