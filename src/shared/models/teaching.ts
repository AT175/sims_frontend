import { SyncEnvelope, Term, SHSLevel, Programme } from '@shared/types';

// --- Teaching Platform entities (Section 7.1) ---

export interface Subject extends SyncEnvelope {
  name: string;
  code: string;
  departmentId: string;
}

export interface ClassSection extends SyncEnvelope {
  name: string;
  level: SHSLevel;
  programme: Programme;
}

export interface TeacherAssignment extends SyncEnvelope {
  teacherId: string;
  subjectId: string;
  classSectionId: string;
  assignedByHodId: string;
  active: boolean;
}

export interface Enrollment extends SyncEnvelope {
  studentId: string;
  subjectId: string;
  classSectionId: string;
}

export type LessonMaterialType = 'note' | 'slide' | 'audio' | 'video' | 'pastQuestion';

export interface LessonMaterial extends SyncEnvelope {
  subjectId: string;
  classSectionId: string;
  teacherId: string;
  type: LessonMaterialType;
  title: string;
  topic: string;
  localFilePath: string | null;
  remoteFileUrl: string | null;
  durationSeconds: number | null;
}

export type LiveClassStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

export interface LiveClassSession extends SyncEnvelope {
  subjectId: string;
  classSectionId: string;
  teacherId: string;
  scheduledAt: string;
  status: LiveClassStatus;
  recordingMaterialId: string | null;
}

export interface Assignment extends SyncEnvelope {
  subjectId: string;
  classSectionId: string;
  teacherId: string;
  title: string;
  instructions: string;
  dueAt: string;
  attachmentMaterialIds: string[];
}

export type SubmissionStatus = 'draft' | 'submitted' | 'graded';

export interface Submission extends SyncEnvelope {
  assignmentId: string;
  studentId: string;
  textResponse: string | null;
  attachmentLocalPaths: string[];
  attachmentRemoteUrls: string[];
  status: SubmissionStatus;
  score: number | null;
  maxScore: number | null;
  feedback: string | null;
  gradedByTeacherId: string | null;
  gradedAt: string | null;
}

export type AssessmentType = 'classwork' | 'homework' | 'test' | 'exam';

export interface Assessment extends SyncEnvelope {
  subjectId: string;
  classSectionId: string;
  studentId: string;
  teacherId: string;
  term: Term;
  type: AssessmentType;
  score: number;
  maxScore: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface ClassAttendance extends SyncEnvelope {
  subjectId: string;
  classSectionId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  recordedByTeacherId: string;
}
