import { apiClient } from './apiClient';

export interface SecurityIncidentDto {
  id: string; incidentId: string | null; date: string; time: string; type: string;
  location: string | null; description: string; severity: string; status: string;
  reportedBy: string; assignedTo: string | null; resolution: string | null;
}

export interface GateLogDto {
  id: string; date: string; time: string; visitorName: string; vehiclePlate: string | null;
  purpose: string; host: string | null; status: string; checkInTime: string | null;
  checkOutTime: string | null; notes: string | null;
}

export const securityApi = {
  async getIncidents(): Promise<SecurityIncidentDto[]> { return apiClient.get<SecurityIncidentDto[]>('/security/incidents'); },
  async createIncident(data: any): Promise<SecurityIncidentDto> { return apiClient.post<SecurityIncidentDto>('/security/incidents', data); },
  async getGateLogs(): Promise<GateLogDto[]> { return apiClient.get<GateLogDto[]>('/security/gate-logs'); },
  async createGateLog(data: any): Promise<GateLogDto> { return apiClient.post<GateLogDto>('/security/gate-logs', data); },
};
