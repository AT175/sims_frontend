import { apiClient } from './apiClient';

export interface PrayerRequestDto {
  id: string; studentName: string; studentClass: string | null; request: string;
  status: string; visibility: string; dateSubmitted: string; dateAnswered: string | null; notes: string;
}

export interface SpiritualCounsellingDto {
  id: string; studentName: string; studentClass: string | null; type: string;
  date: string; summary: string; followUpDate: string | null; status: string; notes: string;
}

export const chaplainApi = {
  async getPrayerRequests(): Promise<PrayerRequestDto[]> { return apiClient.get<PrayerRequestDto[]>('/chaplain/prayer-requests'); },
  async createPrayerRequest(data: any): Promise<PrayerRequestDto> { return apiClient.post<PrayerRequestDto>('/chaplain/prayer-requests', data); },
  async getCounselling(): Promise<SpiritualCounsellingDto[]> { return apiClient.get<SpiritualCounsellingDto[]>('/chaplain/counselling'); },
  async createCounselling(data: any): Promise<SpiritualCounsellingDto> { return apiClient.post<SpiritualCounsellingDto>('/chaplain/counselling', data); },
};
