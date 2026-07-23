import { apiClient } from './apiClient';

export interface VoterIdResponse {
  voterId: string | null;
  hasVoted: boolean;
  isCandidate: boolean;
  candidateInfo?: {
    position: string;
    manifesto: string;
    status: string;
    votes: number;
  };
}

export interface GenerateVoterIdsResponse {
  success: boolean;
  count: number;
  voterIds: Array<{
    id: string;
    name: string;
    admissionNumber: string;
    voterId: string;
  }>;
}

export interface TempCredentialsResponse {
  success: boolean;
  username: string;
  password: string;
  expiresAt: string;
}

export interface VerifyVoterResponse {
  success: boolean;
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
    class: string;
    house: string;
    photoUrl: string | null;
    voterId: string;
  };
}

export interface SeedStudentsResponse {
  success: boolean;
  count: number;
  message: string;
  voterIds: Array<{
    name: string;
    voterId: string;
    class: string;
  }>;
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  manifesto: string;
  photoUrl: string | null;
  votes: number;
}

export const electionApi = {
  async getMyVoterId(): Promise<VoterIdResponse> {
    return apiClient.get<VoterIdResponse>('/students/my-voter-id');
  },

  async castVote(voterId: string, candidateId: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>('/students/cast-vote', { voterId, candidateId });
  },

  async getCandidates(): Promise<Candidate[]> {
    return apiClient.get<Candidate[]>('/students/candidates');
  },

  async generateVoterIds(): Promise<GenerateVoterIdsResponse> {
    return apiClient.post<GenerateVoterIdsResponse>('/students/generate-voter-ids');
  },

  async generateTempCredentials(studentId: string): Promise<TempCredentialsResponse> {
    return apiClient.post<TempCredentialsResponse>('/students/generate-temp-credentials', { studentId });
  },

  async verifyVoter(voterId: string): Promise<VerifyVoterResponse> {
    return apiClient.post<VerifyVoterResponse>('/students/verify-voter', { voterId });
  },

  async seedStudents(): Promise<SeedStudentsResponse> {
    return apiClient.post<SeedStudentsResponse>('/students/seed');
  },
};
