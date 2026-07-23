import { apiClient } from './apiClient';

export interface ExeatDto {
  id: string; exeatNo: string; date: string; studentName: string; admissionNo: string;
  house: string | null; class: string | null; reason: string; reasonDetail: string;
  destination: string | null; departureDate: string; returnDate: string;
  guardianName: string | null; guardianPhone: string | null; transportMode: string | null;
  status: string; issuedBy: string | null; approvedBy: string | null; approvedDate: string | null;
}

export interface RollCallDto {
  id: string; date: string; house: string; studentName: string; room: string | null;
  status: string; notes: string | null; recordedBy: string;
}

export interface BoardingDisciplineDto {
  id: string; date: string; house: string; studentName: string; incident: string;
  severity: string; actionTaken: string; recordedBy: string; escalated: boolean;
}

export const boardingApi = {
  async getExeats(): Promise<ExeatDto[]> { return apiClient.get<ExeatDto[]>('/boarding/exeats'); },
  async createExeat(data: any): Promise<ExeatDto> { return apiClient.post<ExeatDto>('/boarding/exeats', data); },
  async updateExeatStatus(id: string, status: string): Promise<ExeatDto> {
    return apiClient.put<ExeatDto>(`/boarding/exeats/${id}/status`, { status });
  },
  async getRollCalls(house?: string): Promise<RollCallDto[]> {
    const q = house ? `?house=${encodeURIComponent(house)}` : '';
    return apiClient.get<RollCallDto[]>(`/boarding/roll-call${q}`);
  },
  async createRollCall(data: any): Promise<RollCallDto> { return apiClient.post<RollCallDto>('/boarding/roll-call', data); },
  async getDisciplineLogs(): Promise<BoardingDisciplineDto[]> { return apiClient.get<BoardingDisciplineDto[]>('/boarding/discipline'); },
  async createDisciplineLog(data: any): Promise<BoardingDisciplineDto> { return apiClient.post<BoardingDisciplineDto>('/boarding/discipline', data); },
};
