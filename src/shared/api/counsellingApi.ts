import { apiClient } from './apiClient';

export interface CounsellingCaseDto {
  id: string; caseId: string | null; studentName: string; studentClass: string | null;
  category: string | null; type: string; description: string; openedDate: string;
  status: string; priority: string; assignedCounsellor: string | null;
  notes: string; followUpDate: string | null; confidential: boolean;
}

export const counsellingApi = {
  async getCases(): Promise<CounsellingCaseDto[]> { return apiClient.get<CounsellingCaseDto[]>('/counselling/cases'); },
  async createCase(data: any): Promise<CounsellingCaseDto> { return apiClient.post<CounsellingCaseDto>('/counselling/cases', data); },
  async updateCaseStatus(id: string, status: string): Promise<CounsellingCaseDto> {
    return apiClient.put<CounsellingCaseDto>(`/counselling/cases/${id}/status`, { status });
  },
};
