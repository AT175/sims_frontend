import { apiClient } from './apiClient';

export interface TimetableEntryDto {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string | null;
  room: string | null;
  classSection: string;
}

export interface ExamResultDto {
  id: string;
  studentName: string;
  admNo: string;
  subject: string;
  term: string;
  examType: string | null;
  marks: number;
  grade: string | null;
  remarks: string | null;
}

export interface AttendanceRecordDto {
  id: string;
  studentName: string;
  admNo: string;
  date: string;
  status: string;
  classSection: string | null;
  remarks: string | null;
}

export const academicApi = {
  async getTimetable(classSection?: string): Promise<TimetableEntryDto[]> {
    const query = classSection ? `?class=${encodeURIComponent(classSection)}` : '';
    return apiClient.get<TimetableEntryDto[]>(`/academic/timetable${query}`);
  },

  async createTimetableEntry(data: {
    day: string;
    startTime: string;
    endTime: string;
    subject: string;
    teacher?: string;
    room?: string;
    classSection: string;
  }): Promise<TimetableEntryDto> {
    return apiClient.post<TimetableEntryDto>('/academic/timetable', data as any);
  },

  async getResults(studentName?: string, term?: string): Promise<ExamResultDto[]> {
    const params = new URLSearchParams();
    if (studentName) params.append('student', studentName);
    if (term) params.append('term', term);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<ExamResultDto[]>(`/academic/results${query}`);
  },

  async createResult(data: {
    studentName: string;
    admNo: string;
    subject: string;
    term: string;
    examType?: string;
    marks: number;
    grade?: string;
    remarks?: string;
  }): Promise<ExamResultDto> {
    return apiClient.post<ExamResultDto>('/academic/results', data as any);
  },

  async getAttendance(studentName?: string, date?: string): Promise<AttendanceRecordDto[]> {
    const params = new URLSearchParams();
    if (studentName) params.append('student', studentName);
    if (date) params.append('date', date);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<AttendanceRecordDto[]>(`/academic/attendance${query}`);
  },

  async createAttendance(data: {
    studentName: string;
    admNo: string;
    date: string;
    status: string;
    classSection?: string;
    remarks?: string;
  }): Promise<AttendanceRecordDto> {
    return apiClient.post<AttendanceRecordDto>('/academic/attendance', data as any);
  },
};
