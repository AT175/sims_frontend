import { apiClient } from './apiClient';

export interface StaffDto {
  id: string;
  name: string;
  role: string;
  position: string;
  department: string;
  phone: string | null;
  email: string | null;
  status: string;
}

export interface LeaveRequestDto {
  id: string;
  staffName: string;
  staffRole: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: string;
  reviewedBy: string | null;
  reviewDate: string | null;
  reviewNotes: string | null;
}

export const staffApi = {
  async getDirectory(): Promise<StaffDto[]> {
    return apiClient.get<StaffDto[]>('/staff');
  },

  async createStaff(data: {
    name: string;
    role: string;
    position: string;
    department: string;
    phone?: string;
    email?: string;
  }): Promise<StaffDto> {
    return apiClient.post<StaffDto>('/staff', data as any);
  },

  async getLeaveRequests(): Promise<LeaveRequestDto[]> {
    return apiClient.get<LeaveRequestDto[]>('/staff/leave');
  },

  async createLeaveRequest(data: {
    staffName: string;
    staffRole: string;
    startDate: string;
    endDate: string;
    type: string;
    reason?: string;
  }): Promise<LeaveRequestDto> {
    return apiClient.post<LeaveRequestDto>('/staff/leave', data as any);
  },

  async reviewLeaveRequest(id: string, status: 'Approved' | 'Rejected', reviewNotes?: string): Promise<LeaveRequestDto> {
    return apiClient.put<LeaveRequestDto>(`/staff/leave/${id}/review`, { status, reviewNotes } as any);
  },
};
