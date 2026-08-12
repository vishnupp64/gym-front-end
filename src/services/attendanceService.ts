import api from './api';
import type { ApiResponse, AttendanceRecord } from '../types';

export const attendanceService = {
  list: (params?: { memberId?: string; date?: string }) =>
    api
      .get<ApiResponse<AttendanceRecord[]>>('/attendance', { params })
      .then((r) => r.data),

  listMine: () =>
    api.get<ApiResponse<AttendanceRecord[]>>('/attendance/me').then((r) => r.data),

  checkIn: (payload: { memberId: string; notes?: string; date?: string }) =>
    api.post<ApiResponse<AttendanceRecord>>('/attendance', payload).then((r) => r.data),

  update: (
    id: string,
    payload: { checkInTime?: string; checkOutTime?: string | null; notes?: string; date?: string },
  ) => api.put<ApiResponse<AttendanceRecord>>(`/attendance/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.delete<ApiResponse<null>>(`/attendance/${id}`).then((r) => r.data),
};
