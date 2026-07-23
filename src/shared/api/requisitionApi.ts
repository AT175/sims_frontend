import { apiClient } from './apiClient';

export interface RequisitionDto {
  id: string; date: string; itemName: string; quantity: number; unit: string | null;
  department: string; status: string; requestedBy: string; priority: string;
  notes: string; house: string | null;
}

export const requisitionApi = {
  async getAll(department?: string): Promise<RequisitionDto[]> {
    const q = department ? `?department=${encodeURIComponent(department)}` : '';
    return apiClient.get<RequisitionDto[]>(`/requisitions${q}`);
  },
  async create(data: any): Promise<RequisitionDto> { return apiClient.post<RequisitionDto>('/requisitions', data); },
  async updateStatus(id: string, status: string): Promise<RequisitionDto> {
    return apiClient.put<RequisitionDto>(`/requisitions/${id}/status`, { status });
  },
};
