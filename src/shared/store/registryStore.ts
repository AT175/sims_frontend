import { create } from 'zustand';

// ── Types ──

export type StudentStatus = 'Active' | 'Graduated' | 'Withdrawn' | 'Transferred';
export type AdmissionStatus = 'Received' | 'Under Review' | 'Approved' | 'Rejected';
export type CertificateType = 'Transcript' | 'Testimonial' | 'Transfer Letter' | 'Character Reference' | 'Other';
export type CorrespondenceDirection = 'Incoming' | 'Outgoing';
export type CorrespondencePriority = 'Normal' | 'Important' | 'Urgent';
export type StaffStatus = 'Active' | 'On Leave' | 'Retired' | 'Resigned';
export type DocumentChecklistItem = 'Birth Certificate' | 'JHS Result' | 'CSSPS Placement' | 'Medical Form' | 'Passport Photo' | 'Previous Report Card';
export type Programme = 'Science' | 'Arts' | 'Business';
export type FormFieldType = 'text' | 'date' | 'gender' | 'programme' | 'phone' | 'email' | 'address' | 'photo' | 'cssps_ref';

export interface AdmissionFormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  enabled: boolean;
}

export interface AdmissionFormConfig {
  fields: AdmissionFormField[];
  requiredDocuments: DocumentChecklistItem[];
  photoRequired: boolean;
  academicYear: string;
}

export interface StudentRecord {
  id: string;
  admNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  programme: Programme;
  class: string;
  house: string;
  guardianName: string;
  guardianPhone: string;
  guardianAddress: string;
  admissionDate: string;
  status: StudentStatus;
  photoUrl: string | null;
  csspsRef: string | null;
}

export interface PlacementRecord {
  id: string;
  fullName: string;
  csspsRef: string;
  intendedClass: string;
  programme: Programme;
  preloadedBy: string;
  datePreloaded: string;
  matched: boolean;
}

export interface ParentAccount {
  id: string;
  username: string;
  password: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  wardName: string;
  wardAdmNo: string;
  wardClass: string;
  wardHouse: string;
  wardProgramme: Programme;
  createdAt: string;
  admissionId: string;
}

export interface Prospectus {
  id: string;
  title: string;
  academicYear: string;
  content: string;
  publishedBy: string;
  datePublished: string;
  targetedAdmissionIds: string[];
}

export type PaymentMethod = 'Mobile Money' | 'Scratch Card';
export type FeeStatus = 'Unpaid' | 'Paid' | 'Verified';

export interface ApplicationFee {
  amount: number;
  method: PaymentMethod | null;
  status: FeeStatus;
  reference: string | null;
  paidAt: string | null;
  verifiedBy: string | null;
}

export interface ScratchCard {
  id: string;
  pin: string;
  serial: string;
  amount: number;
  used: boolean;
  usedBy: string | null;
  usedAt: string | null;
  batchId: string;
  generatedAt: string;
}

export interface AdmissionApplication {
  id: string;
  applicantName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  dateApplied: string;
  status: AdmissionStatus;
  documentsVerified: boolean;
  documents: { type: DocumentChecklistItem; submitted: boolean }[];
  processedBy?: string;
  notes: string;
  programme: Programme;
  photoUrl: string | null;
  csspsRef: string | null;
  fee: ApplicationFee;
  credentialsExpired: boolean;
}

export interface Certificate {
  id: string;
  studentName: string;
  admNo: string;
  type: CertificateType;
  dateIssued: string;
  issuedBy: string;
  purpose: string;
}

export interface Correspondence {
  id: string;
  date: string;
  direction: CorrespondenceDirection;
  subject: string;
  counterparty: string;
  priority: CorrespondencePriority;
  loggedBy: string;
  notes: string;
}

export interface RegistryStaffRecord {
  id: string;
  name: string;
  position: string;
  role: string;
  department: string;
  dateOfEmployment: string;
  qualifications: string;
  phone: string;
  status: StaffStatus;
}

// ── Constants ──

export const STUDENT_STATUSES: StudentStatus[] = ['Active', 'Graduated', 'Withdrawn', 'Transferred'];
export const ADMISSION_STATUSES: AdmissionStatus[] = ['Received', 'Under Review', 'Approved', 'Rejected'];
export const CERTIFICATE_TYPES: CertificateType[] = ['Transcript', 'Testimonial', 'Transfer Letter', 'Character Reference', 'Other'];
export const CORRESPONDENCE_DIRECTIONS: CorrespondenceDirection[] = ['Incoming', 'Outgoing'];
export const CORRESPONDENCE_PRIORITIES: CorrespondencePriority[] = ['Normal', 'Important', 'Urgent'];
export const STAFF_STATUSES: StaffStatus[] = ['Active', 'On Leave', 'Retired', 'Resigned'];
export const DOCUMENT_CHECKLIST: DocumentChecklistItem[] = ['Birth Certificate', 'JHS Result', 'CSSPS Placement', 'Medical Form', 'Passport Photo', 'Previous Report Card'];

export const CLASS_SECTIONS = [
  'SHS1 Sci A', 'SHS1 Sci B', 'SHS1 Arts A', 'SHS1 Arts B', 'SHS1 Bus A',
  'SHS2 Sci A', 'SHS2 Sci B', 'SHS2 Arts A', 'SHS2 Arts B', 'SHS2 Bus A',
  'SHS3 Sci A', 'SHS3 Sci B', 'SHS3 Arts A', 'SHS3 Arts B', 'SHS3 Bus A',
];

export const HOUSES = ['Aggrey', 'Mensah', 'Sarbah', 'Barton'];
export const PROGRAMMES: Programme[] = ['Science', 'Arts', 'Business'];

export const PROGRAMME_CLASS_MAP: Record<Programme, string[]> = {
  Science: ['SHS1 Sci A', 'SHS1 Sci B', 'SHS2 Sci A', 'SHS2 Sci B', 'SHS3 Sci A', 'SHS3 Sci B'],
  Arts: ['SHS1 Arts A', 'SHS1 Arts B', 'SHS2 Arts A', 'SHS2 Arts B', 'SHS3 Arts A', 'SHS3 Arts B'],
  Business: ['SHS1 Bus A', 'SHS2 Bus A', 'SHS3 Bus A'],
};

export const DEFAULT_ADMISSION_FORM_CONFIG: AdmissionFormConfig = {
  academicYear: '2026/2027',
  photoRequired: false,
  requiredDocuments: ['Birth Certificate', 'JHS Result', 'CSSPS Placement', 'Medical Form', 'Passport Photo', 'Previous Report Card'],
  fields: [
    { id: 'firstName', label: 'First Name', type: 'text', required: true, enabled: true },
    { id: 'lastName', label: 'Last Name', type: 'text', required: true, enabled: true },
    { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, enabled: true },
    { id: 'gender', label: 'Gender', type: 'gender', required: true, enabled: true },
    { id: 'programme', label: 'Programme of Study', type: 'programme', required: true, enabled: true },
    { id: 'csspsRef', label: 'CSSPS Placement Reference', type: 'cssps_ref', required: true, enabled: true },
    { id: 'photo', label: 'Student Photo', type: 'photo', required: false, enabled: true },
    { id: 'parentName', label: 'Parent/Guardian Name', type: 'text', required: true, enabled: true },
    { id: 'parentPhone', label: 'Parent/Guardian Phone', type: 'phone', required: true, enabled: true },
    { id: 'parentEmail', label: 'Parent/Guardian Email', type: 'email', required: false, enabled: true },
    { id: 'guardianAddress', label: 'Guardian Address', type: 'address', required: false, enabled: true },
  ],
};

export function autoAssignHouse(existingCount: number): string {
  return HOUSES[existingCount % HOUSES.length];
}

export function autoAssignClass(programme: Programme, existingCount: number): string {
  const classes = PROGRAMME_CLASS_MAP[programme];
  const shs1Classes = classes.filter((c) => c.startsWith('SHS1'));
  if (shs1Classes.length === 0) return classes[0];
  return shs1Classes[existingCount % shs1Classes.length];
}

export function generateAdmissionNumber(students: StudentRecord[], year: string): string {
  const prefix = year.split('/')[0];
  const count = students.filter((s) => s.admNo.startsWith(prefix)).length + 1;
  return `${prefix}/${String(count).padStart(3, '0')}`;
}

// ── Helpers ──

let idCounter = 700;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const INITIAL_STUDENTS: StudentRecord[] = [
  { id: '1', admNo: '2026/001', firstName: 'Kwame', lastName: 'Asante', dateOfBirth: '2008-05-14', gender: 'Male', programme: 'Science', class: 'SHS2 Sci A', house: 'Aggrey', guardianName: 'Mr. Kofi Asante', guardianPhone: '024-555-1001', guardianAddress: 'Kumasi, Ashanti Region', admissionDate: '2025-09-10', status: 'Active', photoUrl: null, csspsRef: 'CSSPS/2025/0123' },
  { id: '2', admNo: '2026/002', firstName: 'Ama', lastName: 'Owusu', dateOfBirth: '2009-03-22', gender: 'Female', programme: 'Arts', class: 'SHS1 Arts B', house: 'Mensah', guardianName: 'Mrs. Akosua Owusu', guardianPhone: '027-555-1002', guardianAddress: 'Accra, Greater Accra', admissionDate: '2026-09-10', status: 'Active', photoUrl: null, csspsRef: 'CSSPS/2026/0456' },
  { id: '3', admNo: '2026/003', firstName: 'Yao', lastName: 'Mensah', dateOfBirth: '2007-11-08', gender: 'Male', programme: 'Business', class: 'SHS3 Bus A', house: 'Aggrey', guardianName: 'Mr. Daniel Mensah', guardianPhone: '020-555-1003', guardianAddress: 'Tema, Greater Accra', admissionDate: '2024-09-10', status: 'Active', photoUrl: null, csspsRef: 'CSSPS/2024/0789' },
  { id: '4', admNo: '2025/145', firstName: 'Efua', lastName: 'Darko', dateOfBirth: '2008-07-19', gender: 'Female', programme: 'Science', class: 'SHS2 Sci B', house: 'Mensah', guardianName: 'Mrs. Grace Darko', guardianPhone: '055-555-1004', guardianAddress: 'Cape Coast, Central', admissionDate: '2025-09-10', status: 'Active', photoUrl: null, csspsRef: 'CSSPS/2025/0234' },
  { id: '5', admNo: '2025/146', firstName: 'Kofi', lastName: 'Boateng', dateOfBirth: '2007-09-03', gender: 'Male', programme: 'Science', class: 'SHS3 Sci A', house: 'Sarbah', guardianName: 'Mr. Samuel Boateng', guardianPhone: '024-555-1005', guardianAddress: 'Sekondi, Western', admissionDate: '2024-09-10', status: 'Active', photoUrl: null, csspsRef: 'CSSPS/2024/0567' },
  { id: '6', admNo: '2025/147', firstName: 'Adwoa', lastName: 'Frimpong', dateOfBirth: '2009-01-15', gender: 'Female', programme: 'Science', class: 'SHS1 Sci A', house: 'Barton', guardianName: 'Mr. Yaw Frimpong', guardianPhone: '027-555-1006', guardianAddress: 'Koforidua, Eastern', admissionDate: '2026-09-10', status: 'Active', photoUrl: null, csspsRef: 'CSSPS/2026/0382' },
  { id: '7', admNo: '2024/098', firstName: 'Kojo', lastName: 'Addo', dateOfBirth: '2006-12-01', gender: 'Male', programme: 'Arts', class: 'SHS3 Arts A', house: 'Sarbah', guardianName: 'Mr. Peter Addo', guardianPhone: '020-555-1007', guardianAddress: 'Accra, Greater Accra', admissionDate: '2024-09-10', status: 'Active', photoUrl: null, csspsRef: 'CSSPS/2024/0901' },
  { id: '8', admNo: '2024/099', firstName: 'Grace', lastName: 'Opoku', dateOfBirth: '2006-08-25', gender: 'Female', programme: 'Business', class: 'SHS3 Bus A', house: 'Barton', guardianName: 'Mrs. Linda Opoku', guardianPhone: '055-555-1008', guardianAddress: 'Sunyani, Bono', admissionDate: '2024-09-10', status: 'Graduated', photoUrl: null, csspsRef: 'CSSPS/2024/0678' },
];

const INITIAL_PLACEMENTS: PlacementRecord[] = [
  { id: '1', fullName: 'Kofi Asante', csspsRef: 'CSSPS/2026/0451', intendedClass: 'SHS1 Sci A', programme: 'Science', preloadedBy: 'Registry Clerk', datePreloaded: '2026-07-01', matched: true },
  { id: '2', fullName: 'Adwoa Frimpong', csspsRef: 'CSSPS/2026/0382', intendedClass: 'SHS1 Sci A', programme: 'Science', preloadedBy: 'Registry Clerk', datePreloaded: '2026-07-01', matched: true },
  { id: '3', fullName: 'Selina Adjei', csspsRef: 'CSSPS/2026/0519', intendedClass: 'SHS1 Arts B', programme: 'Arts', preloadedBy: 'Registry Clerk', datePreloaded: '2026-07-02', matched: false },
  { id: '4', fullName: 'Daniel Osei', csspsRef: 'CSSPS/2026/0633', intendedClass: 'SHS1 Bus A', programme: 'Business', preloadedBy: 'Registry Clerk', datePreloaded: '2026-07-03', matched: false },
];

const DEFAULT_FEE: ApplicationFee = { amount: 50, method: null, status: 'Unpaid', reference: null, paidAt: null, verifiedBy: null };

const INITIAL_ADMISSIONS: AdmissionApplication[] = [
  { id: '1', applicantName: 'Kofi Asante', parentName: 'Mr. Kofi Asante Sr.', parentPhone: '024-555-2001', parentEmail: 'kofi.asante@email.com', dateApplied: '2026-07-06', status: 'Received', documentsVerified: false, documents: [
    { type: 'Birth Certificate', submitted: true }, { type: 'JHS Result', submitted: true }, { type: 'CSSPS Placement', submitted: true }, { type: 'Medical Form', submitted: false }, { type: 'Passport Photo', submitted: true }, { type: 'Previous Report Card', submitted: false },
  ], notes: 'Awaiting medical form and previous report card.', programme: 'Science', photoUrl: null, csspsRef: 'CSSPS/2026/0451', fee: { ...DEFAULT_FEE, status: 'Paid', method: 'Mobile Money', reference: 'MM-REF-001', paidAt: '2026-07-06' }, credentialsExpired: false },
  { id: '2', applicantName: 'Adwoa Frimpong', parentName: 'Mrs. Frimpong', parentPhone: '027-555-2002', parentEmail: 'frimpong@email.com', dateApplied: '2026-07-05', status: 'Under Review', documentsVerified: false, documents: [
    { type: 'Birth Certificate', submitted: true }, { type: 'JHS Result', submitted: true }, { type: 'CSSPS Placement', submitted: true }, { type: 'Medical Form', submitted: true }, { type: 'Passport Photo', submitted: true }, { type: 'Previous Report Card', submitted: false },
  ], notes: 'All docs except report card received. Reviewing.', programme: 'Science', photoUrl: null, csspsRef: 'CSSPS/2026/0382', fee: { ...DEFAULT_FEE, status: 'Paid', method: 'Scratch Card', reference: 'SC-001', paidAt: '2026-07-05' }, credentialsExpired: false },
  { id: '3', applicantName: 'Kojo Addo', parentName: 'Mr. Addo', parentPhone: '020-555-2003', parentEmail: 'addo@email.com', dateApplied: '2026-07-04', status: 'Approved', documentsVerified: true, documents: [
    { type: 'Birth Certificate', submitted: true }, { type: 'JHS Result', submitted: true }, { type: 'CSSPS Placement', submitted: true }, { type: 'Medical Form', submitted: true }, { type: 'Passport Photo', submitted: true }, { type: 'Previous Report Card', submitted: true },
  ], processedBy: 'Registrar', notes: 'All documents verified. Admission approved.', programme: 'Arts', photoUrl: null, csspsRef: 'CSSPS/2024/0901', fee: { ...DEFAULT_FEE, status: 'Verified', method: 'Mobile Money', reference: 'MM-REF-002', paidAt: '2026-07-04', verifiedBy: 'Registrar' }, credentialsExpired: false },
  { id: '4', applicantName: 'Selina Adjei', parentName: 'Mrs. Adjei', parentPhone: '055-555-2004', parentEmail: 'adjei@email.com', dateApplied: '2026-07-08', status: 'Received', documentsVerified: false, documents: [
    { type: 'Birth Certificate', submitted: true }, { type: 'JHS Result', submitted: false }, { type: 'CSSPS Placement', submitted: false }, { type: 'Medical Form', submitted: false }, { type: 'Passport Photo', submitted: true }, { type: 'Previous Report Card', submitted: false },
  ], notes: 'Only birth certificate and photo submitted. Placement not yet matched.', programme: 'Arts', photoUrl: null, csspsRef: 'CSSPS/2026/0519', fee: { ...DEFAULT_FEE, status: 'Unpaid' }, credentialsExpired: false },
];

const INITIAL_SCRATCH_CARDS: ScratchCard[] = [
  { id: 'sc1', pin: '1234-5678', serial: 'SC-001', amount: 50, used: true, usedBy: 'Adwoa Frimpong', usedAt: '2026-07-05', batchId: 'batch1', generatedAt: '2026-06-01' },
  { id: 'sc2', pin: '2345-6789', serial: 'SC-002', amount: 50, used: false, usedBy: null, usedAt: null, batchId: 'batch1', generatedAt: '2026-06-01' },
  { id: 'sc3', pin: '3456-7890', serial: 'SC-003', amount: 50, used: false, usedBy: null, usedAt: null, batchId: 'batch1', generatedAt: '2026-06-01' },
  { id: 'sc4', pin: '4567-8901', serial: 'SC-004', amount: 50, used: false, usedBy: null, usedAt: null, batchId: 'batch1', generatedAt: '2026-06-01' },
  { id: 'sc5', pin: '5678-9012', serial: 'SC-005', amount: 50, used: false, usedBy: null, usedAt: null, batchId: 'batch1', generatedAt: '2026-06-01' },
];

const INITIAL_PARENT_ACCOUNTS: ParentAccount[] = [
  { id: '1', username: 'parent_addo', password: 'parent123', parentName: 'Mr. Addo', parentPhone: '020-555-2003', parentEmail: 'addo@email.com', wardName: 'Kojo Addo', wardAdmNo: '2024/098', wardClass: 'SHS3 Arts A', wardHouse: 'Sarbah', wardProgramme: 'Arts', createdAt: '2024-09-12', admissionId: '3' },
];

const INITIAL_PROSPECTUS: Prospectus[] = [
  { id: '1', title: 'Welcome Prospectus 2026/2027', academicYear: '2026/2027', content: 'Dear Parent,\n\nWelcome to Ghana Senior High School! Your ward has been successfully admitted.\n\nKey Information:\n- School Fees: GH₵3,500 per term (boarding), GH₵2,000 (day)\n- Reporting Date: 10th September 2026\n- Items Required: Bedding, cutlery, toiletries, school uniform (2 sets), PE kit\n- House assignment and class allocation have been completed\n- First PTA meeting: 25th September 2026 at 10:00 AM\n\nPlease report to the school office on the reporting date with this prospectus and all required documents.\n\nRegards,\nHeadmaster', publishedBy: 'Headmaster', datePublished: '2026-07-10', targetedAdmissionIds: ['3'] },
];

const INITIAL_CERTIFICATES: Certificate[] = [
  { id: '1', studentName: 'Yao Mensah', admNo: '2026/003', type: 'Transcript', dateIssued: '2026-06-28', issuedBy: 'Registrar', purpose: 'University application' },
  { id: '2', studentName: 'Grace Opoku', admNo: '2024/099', type: 'Testimonial', dateIssued: '2026-06-15', issuedBy: 'Registrar', purpose: 'Graduation testimonial' },
  { id: '3', studentName: 'Kofi Boateng', admNo: '2025/146', type: 'Transfer Letter', dateIssued: '2026-05-20', issuedBy: 'Registrar', purpose: 'School transfer' },
  { id: '4', studentName: 'Kojo Addo', admNo: '2024/098', type: 'Character Reference', dateIssued: '2026-06-30', issuedBy: 'Headmaster', purpose: 'Scholarship application' },
];

const INITIAL_CORRESPONDENCE: Correspondence[] = [
  { id: '1', date: '2026-07-06', direction: 'Incoming', subject: 'GES Circular — Term 3 Calendar', counterparty: 'GES HQ', priority: 'Important', loggedBy: 'Registry Clerk', notes: 'Circular received via email. Circulated to all HODs.' },
  { id: '2', date: '2026-07-04', direction: 'Outgoing', subject: 'Term 2 Academic Report', counterparty: 'Regional Education Office', priority: 'Normal', loggedBy: 'Registrar', notes: 'Submitted via regional portal.' },
  { id: '3', date: '2026-06-28', direction: 'Incoming', subject: 'Scholarship Nomination Letter', counterparty: 'Ghana Scholarship Secretariat', priority: 'Urgent', loggedBy: 'Registry Clerk', notes: 'Nomination for 2 students. Forwarded to Headmaster.' },
  { id: '4', date: '2026-06-20', direction: 'Outgoing', subject: 'Student Transfer Request — Kofi Boateng', counterparty: 'Mfantsipim School', priority: 'Normal', loggedBy: 'Registrar', notes: 'Transfer documents sent. Acknowledgment pending.' },
  { id: '5', date: '2026-06-15', direction: 'Incoming', subject: 'Parent Appeal — Fee Adjustment', counterparty: 'PTA Chairman', priority: 'Important', loggedBy: 'Registry Clerk', notes: 'Appeal received and forwarded to Bursary.' },
];

const INITIAL_STAFF: RegistryStaffRecord[] = [
  { id: '1', name: 'J. Mensah', position: 'Senior Teacher', role: 'hod_academic', department: 'Mathematics', dateOfEmployment: '2018-09-01', qualifications: 'B.Ed Mathematics, M.Ed Curriculum', phone: '024-100-2001', status: 'Active' },
  { id: '2', name: 'G. Adjei', position: 'HOD Science', role: 'subject_hod', department: 'Science', dateOfEmployment: '2016-09-01', qualifications: 'B.Sc Chemistry, PGDE', phone: '027-100-2002', status: 'Active' },
  { id: '3', name: 'A. Tetteh', position: 'Accountant', role: 'bursary', department: 'Finance', dateOfEmployment: '2015-01-15', qualifications: 'B.Com, ACA', phone: '055-100-2004', status: 'On Leave' },
  { id: '4', name: 'R. Amponsah', position: 'Asst. Headmaster (Academic)', role: 'admin', department: 'Administration', dateOfEmployment: '2012-09-01', qualifications: 'B.Ed, M.Ed Administration', phone: '027-100-2010', status: 'Active' },
  { id: '5', name: 'L. Frimpong', position: 'Librarian', role: 'library', department: 'Library', dateOfEmployment: '2019-09-01', qualifications: 'B.A Information Studies, MLIS', phone: '055-100-2008', status: 'Active' },
];

// ── Store ──

interface RegistryState {
  students: StudentRecord[];
  placements: PlacementRecord[];
  admissions: AdmissionApplication[];
  certificates: Certificate[];
  correspondence: Correspondence[];
  staff: RegistryStaffRecord[];
  admissionFormConfig: AdmissionFormConfig;
  parentAccounts: ParentAccount[];
  prospectus: Prospectus[];

  // Students
  addStudent: (s: Omit<StudentRecord, 'id'>) => void;
  bulkAddStudents: (students: Omit<StudentRecord, 'id'>[]) => number;
  updateStudent: (id: string, s: Partial<StudentRecord>) => void;
  deleteStudent: (id: string) => void;
  searchStudents: (query: string) => StudentRecord[];

  // Placements
  addPlacement: (p: Omit<PlacementRecord, 'id' | 'datePreloaded' | 'matched'>) => void;
  bulkAddPlacements: (placements: Omit<PlacementRecord, 'id' | 'datePreloaded' | 'matched'>[]) => number;
  matchPlacement: (id: string) => void;
  deletePlacement: (id: string) => void;
  searchPlacement: (nameOrRef: string) => PlacementRecord | null;

  // Admissions
  addAdmission: (a: Omit<AdmissionApplication, 'id' | 'dateApplied' | 'status' | 'documentsVerified' | 'documents'>) => void;
  updateAdmissionStatus: (id: string, status: AdmissionStatus, processedBy: string) => void;
  toggleDocument: (admissionId: string, docType: DocumentChecklistItem) => void;
  verifyDocuments: (id: string) => void;
  deleteAdmission: (id: string) => void;
  getPendingAdmissions: () => AdmissionApplication[];

  // Admission Form Config
  updateAdmissionFormConfig: (config: AdmissionFormConfig) => void;
  toggleFormField: (fieldId: string) => void;
  toggleRequiredDoc: (doc: DocumentChecklistItem) => void;

  // Application Fees & Scratch Cards
  applicationFeeAmount: number;
  scratchCards: ScratchCard[];
  setApplicationFeeAmount: (amount: number) => void;
  generateScratchCards: (count: number, amount: number) => ScratchCard[];
  validateScratchCard: (pin: string, serial: string, usedBy: string) => ScratchCard | null;
  payApplicationFee: (admissionId: string, method: PaymentMethod, reference: string) => void;
  verifyApplicationFee: (admissionId: string, verifiedBy: string) => void;
  expireAdmissionCredentials: (admissionId: string) => void;
  getAdmissionByCredentials: (applicantName: string, csspsRef: string) => AdmissionApplication | null;

  // Parent Accounts
  addParentAccount: (p: Omit<ParentAccount, 'id' | 'createdAt'>) => ParentAccount;
  getParentAccount: (username: string, password: string) => ParentAccount | null;
  getParentAccountByAdmission: (admissionId: string) => ParentAccount | null;
  getProspectusForParent: (parentUsername: string) => Prospectus[];

  // Prospectus
  publishProspectus: (p: Omit<Prospectus, 'id' | 'datePublished'>) => void;
  deleteProspectus: (id: string) => void;

  // Certificates
  issueCertificate: (c: Omit<Certificate, 'id' | 'dateIssued'>) => void;
  deleteCertificate: (id: string) => void;

  // Correspondence
  logCorrespondence: (c: Omit<Correspondence, 'id' | 'date' | 'loggedBy'>) => void;
  deleteCorrespondence: (id: string) => void;

  // Staff
  addStaff: (s: Omit<RegistryStaffRecord, 'id'>) => void;
  updateStaff: (id: string, s: Partial<RegistryStaffRecord>) => void;
  deleteStaff: (id: string) => void;
}

export const useRegistryStore = create<RegistryState>((set, get) => ({
  students: INITIAL_STUDENTS,
  placements: INITIAL_PLACEMENTS,
  admissions: INITIAL_ADMISSIONS,
  certificates: INITIAL_CERTIFICATES,
  correspondence: INITIAL_CORRESPONDENCE,
  staff: INITIAL_STAFF,
  admissionFormConfig: DEFAULT_ADMISSION_FORM_CONFIG,
  parentAccounts: INITIAL_PARENT_ACCOUNTS,
  prospectus: INITIAL_PROSPECTUS,
  applicationFeeAmount: 50,
  scratchCards: INITIAL_SCRATCH_CARDS,

  addStudent: (s) => {
    set((st) => ({ students: [{ ...s, id: nextId() }, ...st.students] }));
  },
  bulkAddStudents: (newStudents) => {
    let added = 0;
    set((st) => {
      const existing = st.students;
      const year = st.admissionFormConfig.academicYear;
      const created = newStudents.map((ns, idx) => {
        const count = existing.length + idx;
        const admNo = generateAdmissionNumber([...existing, ...created.slice(0, idx)], year);
        const house = autoAssignHouse(count);
        const cls = autoAssignClass(ns.programme, count);
        added++;
        return { ...ns, id: nextId(), admNo, house, class: cls };
      });
      return { students: [...created, ...existing] };
    });
    return added;
  },
  updateStudent: (id, s) => {
    set((st) => ({ students: st.students.map((x) => (x.id === id ? { ...x, ...s } : x)) }));
  },
  deleteStudent: (id) => {
    set((st) => ({ students: st.students.filter((x) => x.id !== id) }));
  },
  searchStudents: (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return get().students;
    return get().students.filter((s) =>
      s.admNo.toLowerCase().includes(q) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.class.toLowerCase().includes(q) ||
      s.house.toLowerCase().includes(q) ||
      s.guardianName.toLowerCase().includes(q)
    );
  },

  addPlacement: (p) => {
    set((st) => ({ placements: [{ ...p, id: nextId(), datePreloaded: todayISO(), matched: false }, ...st.placements] }));
  },
  matchPlacement: (id) => {
    set((st) => ({ placements: st.placements.map((p) => (p.id === id ? { ...p, matched: true } : p)) }));
  },
  deletePlacement: (id) => {
    set((st) => ({ placements: st.placements.filter((p) => p.id !== id) }));
  },
  bulkAddPlacements: (newPlacements) => {
    let added = 0;
    set((st) => {
      const created = newPlacements.map((np) => {
        added++;
        return { ...np, id: nextId(), datePreloaded: todayISO(), matched: false };
      });
      return { placements: [...created, ...st.placements] };
    });
    return added;
  },
  searchPlacement: (nameOrRef) => {
    const q = nameOrRef.toLowerCase().trim();
    if (!q) return null;
    return get().placements.find((p) =>
      p.fullName.toLowerCase().includes(q) ||
      p.csspsRef.toLowerCase().includes(q)
    ) || null;
  },

  addAdmission: (a) => {
    const config = get().admissionFormConfig;
    const newApp: AdmissionApplication = {
      ...a,
      id: nextId(),
      dateApplied: todayISO(),
      status: 'Received',
      documentsVerified: false,
      documents: config.requiredDocuments.map((d) => ({ type: d, submitted: false })),
      fee: a.fee ?? { amount: get().applicationFeeAmount, method: null, status: 'Unpaid', reference: null, paidAt: null, verifiedBy: null },
      credentialsExpired: false,
    };
    set((st) => ({ admissions: [newApp, ...st.admissions] }));
  },
  updateAdmissionStatus: (id, status, processedBy) => {
    set((st) => ({
      admissions: st.admissions.map((a) =>
        a.id === id ? { ...a, status, processedBy, documentsVerified: status === 'Approved' ? true : a.documentsVerified } : a
      ),
    }));
  },
  toggleDocument: (admissionId, docType) => {
    set((st) => ({
      admissions: st.admissions.map((a) =>
        a.id === admissionId
          ? { ...a, documents: a.documents.map((d) => (d.type === docType ? { ...d, submitted: !d.submitted } : d)) }
          : a
      ),
    }));
  },
  verifyDocuments: (id) => {
    set((st) => ({
      admissions: st.admissions.map((a) => (a.id === id ? { ...a, documentsVerified: true } : a)),
    }));
  },
  deleteAdmission: (id) => {
    set((st) => ({ admissions: st.admissions.filter((a) => a.id !== id) }));
  },
  getPendingAdmissions: () => {
    return get().admissions.filter((a) => a.status === 'Received' || a.status === 'Under Review');
  },

  updateAdmissionFormConfig: (config) => {
    set(() => ({ admissionFormConfig: config }));
  },
  toggleFormField: (fieldId) => {
    set((st) => ({
      admissionFormConfig: {
        ...st.admissionFormConfig,
        fields: st.admissionFormConfig.fields.map((f) =>
          f.id === fieldId ? { ...f, enabled: !f.enabled } : f
        ),
      },
    }));
  },
  toggleRequiredDoc: (doc) => {
    set((st) => {
      const docs = st.admissionFormConfig.requiredDocuments;
      const has = docs.includes(doc);
      return {
        admissionFormConfig: {
          ...st.admissionFormConfig,
          requiredDocuments: has ? docs.filter((d) => d !== doc) : [...docs, doc],
        },
      };
    });
  },

  addParentAccount: (p) => {
    const account: ParentAccount = { ...p, id: nextId(), createdAt: todayISO() };
    set((st) => ({ parentAccounts: [...st.parentAccounts, account] }));
    return account;
  },
  getParentAccount: (username, password) => {
    return get().parentAccounts.find((a) => a.username === username && a.password === password) || null;
  },
  getParentAccountByAdmission: (admissionId) => {
    return get().parentAccounts.find((a) => a.admissionId === admissionId) || null;
  },
  getProspectusForParent: (parentUsername) => {
    const account = get().parentAccounts.find((a) => a.username === parentUsername);
    if (!account) return [];
    return get().prospectus.filter((p) => p.targetedAdmissionIds.includes(account.admissionId));
  },

  setApplicationFeeAmount: (amount) => {
    set(() => ({ applicationFeeAmount: amount }));
  },
  generateScratchCards: (count, amount) => {
    const batchId = `batch_${Date.now()}`;
    const generatedAt = todayISO();
    const cards: ScratchCard[] = [];
    for (let i = 0; i < count; i++) {
      const num = String(get().scratchCards.length + i + 1).padStart(3, '0');
      const pin = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      cards.push({ id: `sc_${batchId}_${i}`, pin, serial: `SC-${num}`, amount, used: false, usedBy: null, usedAt: null, batchId, generatedAt });
    }
    set((st) => ({ scratchCards: [...st.scratchCards, ...cards] }));
    return cards;
  },
  validateScratchCard: (pin, serial, usedBy) => {
    const card = get().scratchCards.find((c) => c.pin === pin && c.serial === serial && !c.used);
    if (!card) return null;
    set((st) => ({
      scratchCards: st.scratchCards.map((c) =>
        c.id === card.id ? { ...c, used: true, usedBy, usedAt: todayISO() } : c
      ),
    }));
    return card;
  },
  payApplicationFee: (admissionId, method, reference) => {
    set((st) => ({
      admissions: st.admissions.map((a) =>
        a.id === admissionId
          ? { ...a, fee: { ...a.fee, method, reference, status: 'Paid', paidAt: todayISO() } }
          : a
      ),
    }));
  },
  verifyApplicationFee: (admissionId, verifiedBy) => {
    set((st) => ({
      admissions: st.admissions.map((a) =>
        a.id === admissionId
          ? { ...a, fee: { ...a.fee, status: 'Verified', verifiedBy } }
          : a
      ),
    }));
  },
  expireAdmissionCredentials: (admissionId) => {
    set((st) => ({
      admissions: st.admissions.map((a) =>
        a.id === admissionId ? { ...a, credentialsExpired: true, status: 'Rejected' } : a
      ),
    }));
  },
  getAdmissionByCredentials: (applicantName, csspsRef) => {
    const q = applicantName.toLowerCase().trim();
    const r = csspsRef.toLowerCase().trim();
    return get().admissions.find((a) =>
      a.applicantName.toLowerCase().includes(q) && (a.csspsRef ?? '').toLowerCase() === r
    ) || null;
  },

  publishProspectus: (p) => {
    set((st) => ({ prospectus: [{ ...p, id: nextId(), datePublished: todayISO() }, ...st.prospectus] }));
  },
  deleteProspectus: (id) => {
    set((st) => ({ prospectus: st.prospectus.filter((p) => p.id !== id) }));
  },

  issueCertificate: (c) => {
    set((st) => ({ certificates: [{ ...c, id: nextId(), dateIssued: todayISO() }, ...st.certificates] }));
  },
  deleteCertificate: (id) => {
    set((st) => ({ certificates: st.certificates.filter((c) => c.id !== id) }));
  },

  logCorrespondence: (c) => {
    set((st) => ({ correspondence: [{ ...c, id: nextId(), date: todayISO(), loggedBy: 'Registry Clerk' }, ...st.correspondence] }));
  },
  deleteCorrespondence: (id) => {
    set((st) => ({ correspondence: st.correspondence.filter((c) => c.id !== id) }));
  },

  addStaff: (s) => {
    set((st) => ({ staff: [{ ...s, id: nextId() }, ...st.staff] }));
  },
  updateStaff: (id, s) => {
    set((st) => ({ staff: st.staff.map((x) => (x.id === id ? { ...x, ...s } : x)) }));
  },
  deleteStaff: (id) => {
    set((st) => ({ staff: st.staff.filter((x) => x.id !== id) }));
  },
}));
