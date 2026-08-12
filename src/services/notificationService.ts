import api from './api';
import type { ApiResponse, Notification } from '../types';

export const notificationService = {
  listMine: () =>
    api.get<ApiResponse<Notification[]>>('/notifications/me').then((r) => r.data),

  markRead: (id: string) =>
    api.put<ApiResponse<null>>(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.put<ApiResponse<null>>(`/notifications/read-all`).then((r) => r.data),
};
