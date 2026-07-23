import { apiClient } from './apiClient';

export interface StudentDto {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  classSectionId: string;
  houseId: string | null;
  guardianName: string;
  guardianPhone: string;
  guardianAddress: string;
  admissionDate: string;
  status: string;
}

export interface AdmissionApplicationDto {
  id: string;
  applicantName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  csspsPlacementRef: string | null;
  programme: string | null;
  documentsVerified: boolean;
  status: string;
  createdAt: string;
}

export const registryApi = {
  async getStudents(): Promise<StudentDto[]> {
    return apiClient.get<StudentDto[]>('/students');
  },

  async getStudent(id: string): Promise<StudentDto> {
    return apiClient.get<StudentDto>(`/students/${id}`);
  },

  async createStudent(data: Partial<StudentDto>): Promise<StudentDto> {
    return apiClient.post<StudentDto>('/students', data);
  },

  async updateStudent(id: string, data: Partial<StudentDto>): Promise<StudentDto> {
    return apiClient.put<StudentDto>(`/students/${id}`, data);
  },

  async deleteStudent(id: string): Promise<void> {
    return apiClient.delete(`/students/${id}`);
  },

  async getAdmissionApplications(): Promise<AdmissionApplicationDto[]> {
    return apiClient.get<AdmissionApplicationDto[]>('/admissions');
  },

  async updateAdmissionStatus(id: string, status: string, documentsVerified?: boolean): Promise<AdmissionApplicationDto> {
    return apiClient.put<AdmissionApplicationDto>(`/admissions/${id}/status`, {
      status,
      documentsVerified: documentsVerified?.toString(),
    });
  },
};
