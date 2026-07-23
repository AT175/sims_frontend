import { apiClient } from './apiClient';

export interface CleaningTaskDto {
  id: string; task: string; area: string | null; frequency: string;
  assignedTo: string | null; done: boolean; date: string | null; priority: string;
}

export interface MaintenanceIssueDto {
  id: string; date: string; location: string | null; issue: string;
  priority: string; status: string; reportedBy: string; notes: string;
}

export const cleaningApi = {
  async getTasks(): Promise<CleaningTaskDto[]> { return apiClient.get<CleaningTaskDto[]>('/cleaning/tasks'); },
  async createTask(data: any): Promise<CleaningTaskDto> { return apiClient.post<CleaningTaskDto>('/cleaning/tasks', data); },
  async toggleTaskDone(id: string): Promise<CleaningTaskDto> { return apiClient.put<CleaningTaskDto>(`/cleaning/tasks/${id}/toggle`, {}); },
  async getIssues(): Promise<MaintenanceIssueDto[]> { return apiClient.get<MaintenanceIssueDto[]>('/cleaning/issues'); },
  async createIssue(data: any): Promise<MaintenanceIssueDto> { return apiClient.post<MaintenanceIssueDto>('/cleaning/issues', data); },
};
