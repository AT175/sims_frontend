/**
 * SyncEnvelope — shared by every synced record in the system.
 * Do not duplicate per-entity; extend this interface instead.
 */
export interface SyncEnvelope {
  id: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
  deletedAt: string | null;
}

/** Generic helper: any entity that extends SyncEnvelope */
export type SyncedEntity = SyncEnvelope;

/** Sync status for the UI indicator */
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

/** Pending change in the sync queue */
export interface PendingChange {
  id: string;
  entityId: string;
  entityType: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  timestamp: string;
  deviceId: string;
}

/** Role identifiers mapping to dashboards */
export type RoleId =
  | 'governing_board'
  | 'pta'
  | 'headmaster'
  | 'staff'
  | 'welfare_committee'
  | 'src'
  | 'electoral_commission'
  | 'asst_headmaster_academic'
  | 'subject_hod'
  | 'counselling'
  | 'library_ict'
  | 'sports_clubs'
  | 'plc'
  | 'teacher'
  | 'asst_headmaster_admin'
  | 'bursary'
  | 'accountant'
  | 'stores'
  | 'registry'
  | 'security'
  | 'asst_headmaster_domestic'
  | 'senior_housemaster'
  | 'senior_housemistress'
  | 'housemaster'
  | 'housemistress'
  | 'catering'
  | 'health'
  | 'transport'
  | 'cleaning'
  | 'student'
  | 'parent'
  | 'chaplain'
  | 'academic_board'
  | 'dining_hall_master'
  | 'exam_committee'
  | 'safe_space'
  | 'internal_auditor'
  | 'headmaster_secretary'
  | 'system_admin';

/** Authenticated user session */
export interface AuthUser {
  id: string;
  tenantId: string;
  schoolName: string;
  schoolLogoUrl: string | null;
  profilePictureUrl: string | null;
  username: string;
  displayName: string;
  roles: RoleId[];
  activeRole: RoleId;
  token: string;
  refreshToken: string;
}

/** Term enum used across many entities */
export type Term = 'Term 1' | 'Term 2' | 'Term 3';

/** SHS level */
export type SHSLevel = 'SHS1' | 'SHS2' | 'SHS3';

/** Programme of study */
export type Programme =
  | 'Science'
  | 'Arts'
  | 'Business'
  | 'Technical'
  | 'Agriculture'
  | 'Visual Arts'
  | 'Home Economics';
