import { SyncEnvelope } from '@shared/types';

// --- Registry entities (Section 7.3) ---

export type StudentStatus = 'active' | 'graduated' | 'withdrawn' | 'transferred';

export interface StudentRecord extends SyncEnvelope {
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  classSectionId: string;
  houseId: string | null;
  guardianName: string;
  guardianPhone: string;
  guardianAddress: string;
  admissionDate: string;
  status: StudentStatus;
}

export interface PlacementRecord extends SyncEnvelope {
  fullName: string;
  csspsPlacementRef: string | null;
  intendedClassSectionId: string | null;
  preloadedByStaffId: string;
  matched: boolean;
}

export type AdmissionStatus = 'received' | 'under_review' | 'approved' | 'rejected';

export interface AdmissionApplication extends SyncEnvelope {
  placementRecordId: string;
  applicantName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  documentsVerified: boolean;
  processedByStaffId: string | null;
  status: AdmissionStatus;
  resultingStudentRecordId: string | null;
  resultingParentAccountId: string | null;
}

export interface ParentAccount extends SyncEnvelope {
  fullName: string;
  phone: string;
  email: string | null;
  wardStudentIds: string[];
}

export type CertificateType = 'transcript' | 'testimonial' | 'other';

export interface Certificate extends SyncEnvelope {
  studentId: string;
  type: CertificateType;
  issuedByStaffId: string;
  issuedAt: string;
  fileLocalPath: string | null;
  fileRemoteUrl: string | null;
}

export interface CorrespondenceLog extends SyncEnvelope {
  direction: 'incoming' | 'outgoing';
  subject: string;
  counterparty: string;
  loggedByStaffId: string;
  loggedAt: string;
}

export type StaffStatus = 'active' | 'on_leave' | 'retired' | 'resigned';

export interface StaffRecord extends SyncEnvelope {
  firstName: string;
  lastName: string;
  position: string;
  role: string;
  dateOfEmployment: string;
  qualifications: string[];
  status: StaffStatus;
}
