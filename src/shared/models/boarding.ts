import { SyncEnvelope, Term } from '@shared/types';

// --- Boarding Houses entities (Section 7.4) ---

export interface House extends SyncEnvelope {
  name: string;
  gender: 'boys' | 'girls';
  capacity: number;
  housemasterStaffId: string;
  seniorSupervisorStaffId: string;
}

export interface RoomAllocation extends SyncEnvelope {
  studentId: string;
  houseId: string;
  roomNumber: string;
  bedNumber: string;
  term: Term;
  academicYear: string;
}

export type RollCallStatus = 'present' | 'absent' | 'excused';

export interface RollCallEntry extends SyncEnvelope {
  houseId: string;
  studentId: string;
  date: string;
  status: RollCallStatus;
  recordedByStaffId: string;
}

export interface HouseDisciplineLog extends SyncEnvelope {
  studentId: string;
  houseId: string;
  description: string;
  actionTaken: string | null;
  recordedByStaffId: string;
  occurredAt: string;
}

export interface WelfareCheckLog extends SyncEnvelope {
  studentId: string;
  houseId: string;
  note: string;
  recordedByStaffId: string;
  checkedAt: string;
}
