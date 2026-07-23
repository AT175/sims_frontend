import { Model } from '@nozbe/watermelondb';
import { field, text, readonly, date, json } from '@nozbe/watermelondb/decorators';

/**
 * Base model with sync envelope fields shared by all entities.
 * WatermelonDB provides `id`, `created_at`, `updated_at` natively.
 * We add tenant_id, synced_at, and deleted_at for the sync envelope.
 */
export abstract class SyncedModel extends Model {
  @text('tenant_id') tenantId!: string;
  @readonly @date('synced_at') syncedAt!: Date | null;
  @readonly @date('deleted_at') deletedAt!: Date | null;

  /** True if this record has not yet been pushed to the server */
  get isPending(): boolean {
    return this.syncedAt === null;
  }
}

// ── Registry models ──────────────────────────────────────────

export class StudentModel extends SyncedModel {
  static table = 'students';
  @text('admission_number') admissionNumber!: string;
  @text('first_name') firstName!: string;
  @text('last_name') lastName!: string;
  @text('date_of_birth') dateOfBirth!: string;
  @text('gender') gender!: string;
  @text('class_section_id') classSectionId!: string;
  @text('house_id') houseId!: string | null;
  @text('guardian_name') guardianName!: string;
  @text('guardian_phone') guardianPhone!: string;
  @text('guardian_address') guardianAddress!: string;
  @text('admission_date') admissionDate!: string;
  @text('status') status!: string;
}

export class PlacementModel extends SyncedModel {
  static table = 'placements';
  @text('full_name') fullName!: string;
  @text('cssps_placement_ref') csspsPlacementRef!: string | null;
  @text('intended_class_section_id') intendedClassSectionId!: string | null;
  @text('preloaded_by_staff_id') preloadedByStaffId!: string;
  @field('matched') matched!: boolean;
}

export class AdmissionApplicationModel extends SyncedModel {
  static table = 'admission_applications';
  @text('placement_record_id') placementRecordId!: string;
  @text('applicant_name') applicantName!: string;
  @text('parent_name') parentName!: string;
  @text('parent_phone') parentPhone!: string;
  @text('parent_email') parentEmail!: string | null;
  @field('documents_verified') documentsVerified!: boolean;
  @text('processed_by_staff_id') processedByStaffId!: string | null;
  @text('status') status!: string;
  @text('resulting_student_record_id') resultingStudentRecordId!: string | null;
  @text('resulting_parent_account_id') resultingParentAccountId!: string | null;
}

export class ParentAccountModel extends SyncedModel {
  static table = 'parent_accounts';
  @text('full_name') fullName!: string;
  @text('phone') phone!: string;
  @text('email') email!: string | null;
  @json('ward_student_ids', (raw: string) => JSON.parse(raw || '[]') as string[]) wardStudentIds!: string[];
}

export class CertificateModel extends SyncedModel {
  static table = 'certificates';
  @text('student_id') studentId!: string;
  @text('type') type!: string;
  @text('issued_by_staff_id') issuedByStaffId!: string;
  @text('issued_at') issuedAt!: string;
  @text('file_local_path') fileLocalPath!: string | null;
  @text('file_remote_url') fileRemoteUrl!: string | null;
}

export class CorrespondenceLogModel extends SyncedModel {
  static table = 'correspondence_logs';
  @text('direction') direction!: string;
  @text('subject') subject!: string;
  @text('counterparty') counterparty!: string;
  @text('logged_by_staff_id') loggedByStaffId!: string;
  @text('logged_at') loggedAt!: string;
}

export class StaffModel extends SyncedModel {
  static table = 'staff';
  @text('first_name') firstName!: string;
  @text('last_name') lastName!: string;
  @text('position') position!: string;
  @text('role') role!: string;
  @text('date_of_employment') dateOfEmployment!: string;
  @json('qualifications', (raw: string) => JSON.parse(raw || '[]') as string[]) qualifications!: string[];
  @text('status') status!: string;
}

// ── Teaching models ──────────────────────────────────────────

export class SubjectModel extends SyncedModel {
  static table = 'subjects';
  @text('name') name!: string;
  @text('code') code!: string;
  @text('department_id') departmentId!: string;
}

export class ClassSectionModel extends SyncedModel {
  static table = 'class_sections';
  @text('name') name!: string;
  @text('level') level!: string;
  @text('programme') programme!: string;
}

export class TeacherAssignmentModel extends SyncedModel {
  static table = 'teacher_assignments';
  @text('teacher_id') teacherId!: string;
  @text('subject_id') subjectId!: string;
  @text('class_section_id') classSectionId!: string;
  @text('assigned_by_hod_id') assignedByHodId!: string;
  @field('active') active!: boolean;
}

export class EnrollmentModel extends SyncedModel {
  static table = 'enrollments';
  @text('student_id') studentId!: string;
  @text('subject_id') subjectId!: string;
  @text('class_section_id') classSectionId!: string;
}

export class LessonMaterialModel extends SyncedModel {
  static table = 'lesson_materials';
  @text('subject_id') subjectId!: string;
  @text('class_section_id') classSectionId!: string;
  @text('teacher_id') teacherId!: string;
  @text('type') type!: string;
  @text('title') title!: string;
  @text('topic') topic!: string;
  @text('local_file_path') localFilePath!: string | null;
  @text('remote_file_url') remoteFileUrl!: string | null;
  @field('duration_seconds') durationSeconds!: number | null;
}

export class LiveClassSessionModel extends SyncedModel {
  static table = 'live_class_sessions';
  @text('subject_id') subjectId!: string;
  @text('class_section_id') classSectionId!: string;
  @text('teacher_id') teacherId!: string;
  @text('scheduled_at') scheduledAt!: string;
  @text('status') status!: string;
  @text('recording_material_id') recordingMaterialId!: string | null;
}

export class AssignmentModel extends SyncedModel {
  static table = 'assignments';
  @text('subject_id') subjectId!: string;
  @text('class_section_id') classSectionId!: string;
  @text('teacher_id') teacherId!: string;
  @text('title') title!: string;
  @text('instructions') instructions!: string;
  @text('due_at') dueAt!: string;
  @json('attachment_material_ids', (raw: string) => JSON.parse(raw || '[]') as string[]) attachmentMaterialIds!: string[];
}

export class SubmissionModel extends SyncedModel {
  static table = 'submissions';
  @text('assignment_id') assignmentId!: string;
  @text('student_id') studentId!: string;
  @text('text_response') textResponse!: string | null;
  @json('attachment_local_paths', (raw: string) => JSON.parse(raw || '[]') as string[]) attachmentLocalPaths!: string[];
  @json('attachment_remote_urls', (raw: string) => JSON.parse(raw || '[]') as string[]) attachmentRemoteUrls!: string[];
  @text('status') status!: string;
  @field('score') score!: number | null;
  @field('max_score') maxScore!: number | null;
  @text('feedback') feedback!: string | null;
  @text('graded_by_teacher_id') gradedByTeacherId!: string | null;
  @text('graded_at') gradedAt!: string | null;
}

export class AssessmentModel extends SyncedModel {
  static table = 'assessments';
  @text('subject_id') subjectId!: string;
  @text('class_section_id') classSectionId!: string;
  @text('student_id') studentId!: string;
  @text('teacher_id') teacherId!: string;
  @text('term') term!: string;
  @text('type') type!: string;
  @field('score') score!: number;
  @field('max_score') maxScore!: number;
}

export class ClassAttendanceModel extends SyncedModel {
  static table = 'class_attendance';
  @text('subject_id') subjectId!: string;
  @text('class_section_id') classSectionId!: string;
  @text('student_id') studentId!: string;
  @text('date') date!: string;
  @text('status') status!: string;
  @text('recorded_by_teacher_id') recordedByTeacherId!: string;
}

// ── Bursary models ───────────────────────────────────────────

export class StudentFeeLedgerModel extends SyncedModel {
  static table = 'student_fee_ledgers';
  @text('student_id') studentId!: string;
  @text('term') term!: string;
  @text('academic_year') academicYear!: string;
  @field('total_due') totalDue!: number;
  @field('amount_paid') amountPaid!: number;
  @field('balance') balance!: number;
}

export class FeePaymentModel extends SyncedModel {
  static table = 'fee_payments';
  @text('student_id') studentId!: string;
  @text('ledger_id') ledgerId!: string;
  @field('amount') amount!: number;
  @text('method') method!: string;
  @text('reference') reference!: string | null;
  @text('recorded_by_staff_id') recordedByStaffId!: string;
  @text('paid_at') paidAt!: string;
}

export class PayrollRecordModel extends SyncedModel {
  static table = 'payroll_records';
  @text('staff_id') staffId!: string;
  @text('month') month!: string;
  @field('gross_pay') grossPay!: number;
  @field('deductions') deductions!: number;
  @field('net_pay') netPay!: number;
  @text('status') status!: string;
}

export class ExpenditureEntryModel extends SyncedModel {
  static table = 'expenditure_entries';
  @text('category') category!: string;
  @text('description') description!: string;
  @field('amount') amount!: number;
  @text('linked_requisition_id') linkedRequisitionId!: string | null;
  @text('approved_by_staff_id') approvedByStaffId!: string;
  @text('spent_at') spentAt!: string;
}

export class BudgetLineModel extends SyncedModel {
  static table = 'budget_lines';
  @text('term') term!: string;
  @text('academic_year') academicYear!: string;
  @text('department') department!: string;
  @field('allocated_amount') allocatedAmount!: number;
  @field('spent_amount') spentAmount!: number;
  @text('approval_status') approvalStatus!: string;
}

// ── Boarding models ──────────────────────────────────────────

export class HouseModel extends SyncedModel {
  static table = 'houses';
  @text('name') name!: string;
  @text('gender') gender!: string;
  @field('capacity') capacity!: number;
  @text('housemaster_staff_id') housemasterStaffId!: string;
  @text('senior_supervisor_staff_id') seniorSupervisorStaffId!: string;
}

export class RoomAllocationModel extends SyncedModel {
  static table = 'room_allocations';
  @text('student_id') studentId!: string;
  @text('house_id') houseId!: string;
  @text('room_number') roomNumber!: string;
  @text('bed_number') bedNumber!: string;
  @text('term') term!: string;
  @text('academic_year') academicYear!: string;
}

export class RollCallEntryModel extends SyncedModel {
  static table = 'roll_call_entries';
  @text('house_id') houseId!: string;
  @text('student_id') studentId!: string;
  @text('date') date!: string;
  @text('status') status!: string;
  @text('recorded_by_staff_id') recordedByStaffId!: string;
}

export class HouseDisciplineLogModel extends SyncedModel {
  static table = 'house_discipline_logs';
  @text('student_id') studentId!: string;
  @text('house_id') houseId!: string;
  @text('description') description!: string;
  @text('action_taken') actionTaken!: string | null;
  @text('recorded_by_staff_id') recordedByStaffId!: string;
  @text('occurred_at') occurredAt!: string;
}

export class WelfareCheckLogModel extends SyncedModel {
  static table = 'welfare_check_logs';
  @text('student_id') studentId!: string;
  @text('house_id') houseId!: string;
  @text('note') note!: string;
  @text('recorded_by_staff_id') recordedByStaffId!: string;
  @text('checked_at') checkedAt!: string;
}

// ── Sync queue model (not synced itself) ─────────────────────

export class SyncQueueModel extends Model {
  static table = 'sync_queue';
  @text('entity_id') entityId!: string;
  @text('entity_type') entityType!: string;
  @text('operation') operation!: string;
  @text('payload') payload!: string;
  @readonly @date('timestamp') timestamp!: Date;
  @text('device_id') deviceId!: string;
  @field('attempts') attempts!: number;
  @text('last_error') lastError!: string | null;
}

export const modelClasses = [
  StudentModel,
  PlacementModel,
  AdmissionApplicationModel,
  ParentAccountModel,
  CertificateModel,
  CorrespondenceLogModel,
  StaffModel,
  SubjectModel,
  ClassSectionModel,
  TeacherAssignmentModel,
  EnrollmentModel,
  LessonMaterialModel,
  LiveClassSessionModel,
  AssignmentModel,
  SubmissionModel,
  AssessmentModel,
  ClassAttendanceModel,
  StudentFeeLedgerModel,
  FeePaymentModel,
  PayrollRecordModel,
  ExpenditureEntryModel,
  BudgetLineModel,
  HouseModel,
  RoomAllocationModel,
  RollCallEntryModel,
  HouseDisciplineLogModel,
  WelfareCheckLogModel,
  SyncQueueModel,
];
