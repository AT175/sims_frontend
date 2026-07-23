import { apiClient } from './apiClient';

export interface FixtureDto {
  id: string; date: string; sport: string; match: string; venue: string | null;
  status: string; scoreHome: string | null; scoreAway: string | null; result: string | null;
}

export interface ClubDto {
  id: string; name: string; category: string | null; patron: string | null;
  memberCount: number; meetingDay: string | null; description: string | null;
}

export const sportsApi = {
  async getFixtures(): Promise<FixtureDto[]> { return apiClient.get<FixtureDto[]>('/sports/fixtures'); },
  async createFixture(data: any): Promise<FixtureDto> { return apiClient.post<FixtureDto>('/sports/fixtures', data); },
  async getClubs(): Promise<ClubDto[]> { return apiClient.get<ClubDto[]>('/sports/clubs'); },
  async createClub(data: any): Promise<ClubDto> { return apiClient.post<ClubDto>('/sports/clubs', data); },
};
