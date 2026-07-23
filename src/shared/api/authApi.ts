import { apiClient } from './apiClient';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    tenantId: string;
    schoolName: string | null;
    schoolLogoUrl: string | null;
    profilePictureUrl: string | null;
    username: string;
    displayName: string;
    roles: string[];
    activeRole: string;
  };
  isTempLogin?: boolean;
}

export interface UserProfile {
  id: string;
  tenantId: string;
  schoolName: string | null;
  schoolLogoUrl: string | null;
  profilePictureUrl: string | null;
  username: string;
  displayName: string;
  roles: string[];
  activeRole: string;
}

export const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', { username, password });
  },

  async loginTemp(username: string, password: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login-temp', { username, password });
  },

  async switchRole(role: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/switch-role', { role });
  },

  async updateProfile(updates: { displayName?: string; profilePictureUrl?: string }): Promise<UserProfile> {
    return apiClient.post<UserProfile>('/auth/update-profile', updates);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/change-password', { currentPassword, newPassword });
  },

  async uploadProfilePicture(image: string): Promise<UserProfile> {
    return apiClient.post<UserProfile>('/auth/upload-profile-picture', { image });
  },

  async submitAdmissionApplication(data: {
    applicantName: string;
    parentName: string;
    parentPhone: string;
    parentEmail?: string;
    csspsPlacementRef?: string;
  }): Promise<{ id: string; status: string }> {
    return apiClient.post('/admissions/apply', data);
  },
};
