import { apiClient } from './apiClient';

export interface PTAAnnouncementDto {
  id: string; title: string; body: string; date: string; author: string;
}

export interface PTAMeetingDto {
  id: string; date: string; time: string; topic: string; location: string | null; rsvp: string;
}

export const ptaApi = {
  async getAnnouncements(): Promise<PTAAnnouncementDto[]> { return apiClient.get<PTAAnnouncementDto[]>('/pta/announcements'); },
  async createAnnouncement(data: any): Promise<PTAAnnouncementDto> { return apiClient.post<PTAAnnouncementDto>('/pta/announcements', data); },
  async getMeetings(): Promise<PTAMeetingDto[]> { return apiClient.get<PTAMeetingDto[]>('/pta/meetings'); },
  async createMeeting(data: any): Promise<PTAMeetingDto> { return apiClient.post<PTAMeetingDto>('/pta/meetings', data); },
  async updateRSVP(id: string, rsvp: string): Promise<PTAMeetingDto> {
    return apiClient.put<PTAMeetingDto>(`/pta/meetings/${id}/rsvp`, { rsvp });
  },
};
