import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export type StudentStatus = 'Active' | 'Graduated' | 'Withdrawn' | 'Transferred';
export type AdmissionStatus = 'Received' | 'Under Review' | 'Approved' | 'Rejected';
export type CertificateType = 'Transcript' | 'Testimonial' | 'Transfer Letter' | 'Character Reference' | 'Other';
export type CorrespondenceDirection = 'Incoming' | 'Outgoing';
export type CorrespondencePriority = 'Normal' | 'Important' | 'Urgent';
export type StaffStatus = 'Active' | 'On Leave' | 'Retired' | 'Resigned';
export type DocumentChecklistItem = 'Birth Certificate' | 'JHS Result' | 'CSSPS Placement' | 'Medical Form' | 'Passport Photo' | 'Previous Report Card';
export type Programme = 'General Science' | 'General Arts' | 'Business' | 'Agriculture' | 'Home Economics' | 'Visual Art';
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
  'SHS1 Sci A', 'SHS1 Sci B', 'SHS1 Arts A', 'SHS1 Arts B', 'SHS1 Bus A', 'SHS1 Agr A', 'SHS1 HE A', 'SHS1 VA A',
  'SHS2 Sci A', 'SHS2 Sci B', 'SHS2 Arts A', 'SHS2 Arts B', 'SHS2 Bus A', 'SHS2 Agr A', 'SHS2 HE A', 'SHS2 VA A',
  'SHS3 Sci A', 'SHS3 Sci B', 'SHS3 Arts A', 'SHS3 Arts B', 'SHS3 Bus A', 'SHS3 Agr A', 'SHS3 HE A', 'SHS3 VA A',
];

export const HOUSES = ['Aggrey', 'Mensah', 'Sarbah', 'Barton'];
export const PROGRAMMES: Programme[] = ['General Science', 'General Arts', 'Business', 'Agriculture', 'Home Economics', 'Visual Art'];

export const PROGRAMME_CLASS_MAP: Record<Programme, string[]> = {
  'General Science': ['SHS1 Sci A', 'SHS1 Sci B', 'SHS2 Sci A', 'SHS2 Sci B', 'SHS3 Sci A', 'SHS3 Sci B'],
  'General Arts': ['SHS1 Arts A', 'SHS1 Arts B', 'SHS2 Arts A', 'SHS2 Arts B', 'SHS3 Arts A', 'SHS3 Arts B'],
  'Business': ['SHS1 Bus A', 'SHS2 Bus A', 'SHS3 Bus A'],
  'Agriculture': ['SHS1 Agr A', 'SHS2 Agr A', 'SHS3 Agr A'],
  'Home Economics': ['SHS1 HE A', 'SHS2 HE A', 'SHS3 HE A'],
  'Visual Art': ['SHS1 VA A', 'SHS2 VA A', 'SHS3 VA A'],
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

const INITIAL_STUDENTS: StudentRecord[] = [];

const INITIAL_PLACEMENTS: PlacementRecord[] = [];

// @ts-expect-error - kept for future use
const _DEFAULT_FEE: ApplicationFee = { amount: 50, method: null, status: 'Unpaid', reference: null, paidAt: null, verifiedBy: null };

const INITIAL_ADMISSIONS: AdmissionApplication[] = [];

const INITIAL_SCRATCH_CARDS: ScratchCard[] = [];

const INITIAL_PARENT_ACCOUNTS: ParentAccount[] = [];

const INITIAL_PROSPECTUS: Prospectus[] = [];

const INITIAL_CERTIFICATES: Certificate[] = [];

const INITIAL_CORRESPONDENCE: Correspondence[] = [];

const INITIAL_STAFF: RegistryStaffRecord[] = [];

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

  // Backend load methods
  loadStudents: () => Promise<void>;
  loadAdmissions: () => Promise<void>;
  loadPlacements: () => Promise<void>;
  loadAll: () => Promise<void>;
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

  loadStudents: async () => {
    try {
      const data = await apiClient.get<any[]>('/registry/students');
      set({ students: (data || []).map((d) => ({ ...d, id: d.id || `reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })) });
    } catch {}
  },
  loadAdmissions: async () => {
    try {
      const data = await apiClient.get<any[]>('/registry/admissions');
      set({ admissions: (data || []).map((d) => ({ ...d, id: d.id || `reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })) });
    } catch {}
  },
  loadPlacements: async () => {
    try {
      const data = await apiClient.get<any[]>('/registry/placements');
      set({ placements: (data || []).map((d) => ({ ...d, id: d.id || `reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadAdmissions(),
      get().loadPlacements(),
      get().loadStudents(),
    ]);
  },

}));
