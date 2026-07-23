import { create } from 'zustand';

// ── Types ──

export type ServiceType = 'Sunday' | 'Midweek' | 'Friday Jumu\'ah' | 'Devotion' | 'Special';
export type PrayerStatus = 'Open' | 'Answered' | 'In Progress';
export type PrayerVisibility = 'Public' | 'Confidential';
export type CounsellingType = 'Spiritual' | 'Moral' | 'Faith Crisis' | 'Pre-Marital' | 'Grief';
export type EventStatus = 'Planned' | 'Confirmed' | 'Completed' | 'Cancelled';
export type FellowshipDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type OutreachType = 'Charity' | 'Evangelism' | 'Community Service' | 'Donation' | 'Visit';
export type BaptismType = 'Baptism' | 'Dedication' | 'Confirmation' | 'First Communion';

export interface ServiceSchedule {
  id: string;
  type: ServiceType;
  day: string;
  time: string;
  venue: string;
  speaker: string;
  topic: string;
  attendance: number;
  notes: string;
}

export interface PrayerRequest {
  id: string;
  studentName: string;
  studentClass: string;
  request: string;
  status: PrayerStatus;
  visibility: PrayerVisibility;
  dateSubmitted: string;
  dateAnswered: string | null;
  notes: string;
}

export interface SpiritualCounselling {
  id: string;
  studentName: string;
  studentClass: string;
  type: CounsellingType;
  date: string;
  summary: string;
  followUpDate: string | null;
  status: 'Open' | 'Resolved' | 'Referred';
  notes: string;
}

export interface ReligiousEvent {
  id: string;
  title: string;
  type: ServiceType;
  date: string;
  venue: string;
  expectedAttendance: number;
  actualAttendance: number | null;
  status: EventStatus;
  coordinator: string;
  notes: string;
}

export interface FellowshipGroup {
  id: string;
  name: string;
  leader: string;
  day: FellowshipDay;
  time: string;
  venue: string;
  members: number;
  description: string;
}

export interface OutreachProgram {
  id: string;
  title: string;
  type: OutreachType;
  date: string;
  location: string;
  beneficiaries: number;
  coordinator: string;
  budget: number;
  status: EventStatus;
  notes: string;
}

export interface ChoirMember {
  id: string;
  name: string;
  voicePart: 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Instrumentalist';
  role: 'Member' | 'Lead' | 'Director' | 'Organist';
  class: string;
  attendance: number;
}

export interface BaptismRecord {
  id: string;
  name: string;
  type: BaptismType;
  date: string;
  officiant: string;
  class: string;
  parentGuardian: string;
  certificateIssued: boolean;
  notes: string;
}

// ── Constants ──

export const SERVICE_TYPES: ServiceType[] = ['Sunday', 'Midweek', 'Friday Jumu\'ah', 'Devotion', 'Special'];
export const PRAYER_STATUSES: PrayerStatus[] = ['Open', 'In Progress', 'Answered'];
export const COUNSELLING_TYPES: CounsellingType[] = ['Spiritual', 'Moral', 'Faith Crisis', 'Pre-Marital', 'Grief'];
export const EVENT_STATUSES: EventStatus[] = ['Planned', 'Confirmed', 'Completed', 'Cancelled'];
export const FELLOWSHIP_DAYS: FellowshipDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const OUTREACH_TYPES: OutreachType[] = ['Charity', 'Evangelism', 'Community Service', 'Donation', 'Visit'];
export const BAPTISM_TYPES: BaptismType[] = ['Baptism', 'Dedication', 'Confirmation', 'First Communion'];
export const VOICE_PARTS = ['Soprano', 'Alto', 'Tenor', 'Bass', 'Instrumentalist'] as const;
export const CHOIR_ROLES = ['Member', 'Lead', 'Director', 'Organist'] as const;

// ── Initial Data ──

const INITIAL_SERVICES: ServiceSchedule[] = [
  { id: '1', type: 'Sunday', day: 'Sunday', time: '08:00', venue: 'Main Chapel', speaker: 'Rev. Fr. Owusu', topic: 'Faith and Perseverance', attendance: 850, notes: 'Whole school service' },
  { id: '2', type: 'Devotion', day: 'Monday', time: '07:00', venue: 'Assembly Hall', speaker: 'Chaplain Mensah', topic: 'Weekly Devotion', attendance: 900, notes: 'Morning devotion' },
  { id: '3', type: 'Friday Jumu\'ah', day: 'Friday', time: '12:30', venue: 'Prayer Room', speaker: 'Imam Yusuf', topic: 'Friday Prayers', attendance: 120, notes: 'Muslim students' },
  { id: '4', type: 'Midweek', day: 'Wednesday', time: '18:00', venue: 'Chapel', speaker: 'Rev. Fr. Owusu', topic: 'Midweek Service', attendance: 300, notes: 'Optional evening service' },
];

const INITIAL_PRAYER_REQUESTS: PrayerRequest[] = [
  { id: '1', studentName: 'Kwesi Mensah', studentClass: 'Form 2A', request: 'Prayers for exams success', status: 'Answered', visibility: 'Public', dateSubmitted: '2026-06-15', dateAnswered: '2026-07-01', notes: 'Student passed all subjects' },
  { id: '2', studentName: 'Ama Serwaa', studentClass: 'Form 3B', request: 'Healing for mother', status: 'In Progress', visibility: 'Confidential', dateSubmitted: '2026-07-05', dateAnswered: null, notes: 'Mother is recovering' },
  { id: '3', studentName: 'Yaw Boateng', studentClass: 'Form 1A', request: 'Guidance for career choice', status: 'Open', visibility: 'Public', dateSubmitted: '2026-07-10', dateAnswered: null, notes: '' },
];

const INITIAL_COUNSELLING: SpiritualCounselling[] = [
  { id: '1', studentName: 'Akosua Frimpong', studentClass: 'Form 2C', type: 'Faith Crisis', date: '2026-07-08', summary: 'Doubting faith after family loss', followUpDate: '2026-07-22', status: 'Open', notes: 'Needs ongoing support' },
  { id: '2', studentName: 'Kofi Asante', studentClass: 'Form 3A', type: 'Moral', date: '2026-06-20', summary: 'Behavioral guidance session', followUpDate: null, status: 'Resolved', notes: 'Student showed improvement' },
];

const INITIAL_EVENTS: ReligiousEvent[] = [
  { id: '1', title: 'Annual Spiritual Renewal Week', type: 'Special', date: '2026-08-15', venue: 'Main Chapel', expectedAttendance: 1000, actualAttendance: null, status: 'Planned', coordinator: 'Chaplain Mensah', notes: 'Week-long program' },
  { id: '2', title: 'Easter Cantata', type: 'Special', date: '2026-04-05', venue: 'Assembly Hall', expectedAttendance: 900, actualAttendance: 870, status: 'Completed', coordinator: 'Choir Director', notes: 'Very successful' },
  { id: '3', title: 'Ramadan Iftar Gathering', type: 'Special', date: '2026-03-20', venue: 'Dining Hall', expectedAttendance: 150, actualAttendance: 140, status: 'Completed', coordinator: 'Imam Yusuf', notes: 'Muslim community event' },
];

const INITIAL_FELLOWSHIPS: FellowshipGroup[] = [
  { id: '1', name: 'Scripture Union', leader: 'Grace Adjei', day: 'Friday', time: '18:00', venue: 'Classroom Block A', members: 45, description: 'Bible study and fellowship' },
  { id: '2', name: 'Muslim Students Association', leader: 'Imam Yusuf', day: 'Friday', time: '12:30', venue: 'Prayer Room', members: 120, description: 'Islamic fellowship and Quran study' },
  { id: '3', name: 'Catholic Students Movement', leader: 'Rev. Fr. Owusu', day: 'Sunday', time: '09:30', venue: 'Chapel', members: 80, description: 'Catholic faith formation' },
  { id: '4', name: 'Pentecost Students Union', leader: 'Daniel Tuffour', day: 'Saturday', time: '16:00', venue: 'Assembly Hall', members: 60, description: 'Pentecostal fellowship' },
];

const INITIAL_OUTREACH: OutreachProgram[] = [
  { id: '1', title: 'Orphanage Visit - Hope Home', type: 'Visit', date: '2026-07-20', location: 'Hope Children\'s Home', beneficiaries: 50, coordinator: 'Chaplain Mensah', budget: 500, status: 'Planned', notes: 'Donation of food and clothing' },
  { id: '2', title: 'Community Cleanup', type: 'Community Service', date: '2026-06-15', location: 'Tema Community 5', beneficiaries: 0, coordinator: 'SRC + Chaplaincy', budget: 100, status: 'Completed', notes: '50 students participated' },
  { id: '3', title: 'Christmas Charity Drive', type: 'Donation', date: '2025-12-18', location: 'Various', beneficiaries: 200, coordinator: 'Chaplain Mensah', budget: 1500, status: 'Completed', notes: 'Distributed to 3 orphanages' },
];

const INITIAL_CHOIR: ChoirMember[] = [
  { id: '1', name: 'Ama Serwaa', voicePart: 'Soprano', role: 'Lead', class: 'Form 3B', attendance: 95 },
  { id: '2', name: 'Kwesi Mensah', voicePart: 'Tenor', role: 'Member', class: 'Form 2A', attendance: 88 },
  { id: '3', name: 'Akosua Frimpong', voicePart: 'Alto', role: 'Member', class: 'Form 2C', attendance: 90 },
  { id: '4', name: 'Yaw Boateng', voicePart: 'Bass', role: 'Director', class: 'Form 1A', attendance: 92 },
  { id: '5', name: 'Kofi Asante', voicePart: 'Instrumentalist', role: 'Organist', class: 'Form 3A', attendance: 85 },
]

const INITIAL_BAPTISMS: BaptismRecord[] = [
  { id: '1', name: 'Kwabena Osei', type: 'Baptism', date: '2026-05-12', officiant: 'Rev. Fr. Owusu', class: 'Form 2B', parentGuardian: 'Mr. Osei', certificateIssued: true, notes: 'Water baptism' },
  { id: '2', name: 'Adwoa Nyamekye', type: 'Dedication', date: '2026-06-01', officiant: 'Chaplain Mensah', class: 'Form 1A', parentGuardian: 'Mrs. Nyamekye', certificateIssued: true, notes: 'Child dedication' },
  { id: '3', name: 'Nana Kwame', type: 'Confirmation', date: '2026-04-20', officiant: 'Bishop Addo', class: 'Form 3C', parentGuardian: 'Mr. Kwame Sr.', certificateIssued: true, notes: 'Confirmation sacrament' },
]

// ── Store ──

interface ChaplainState {
  services: ServiceSchedule[];
  prayerRequests: PrayerRequest[];
  counselling: SpiritualCounselling[];
  events: ReligiousEvent[];
  fellowships: FellowshipGroup[];
  outreach: OutreachProgram[];
  choir: ChoirMember[];
  baptisms: BaptismRecord[];

  addService: (s: Omit<ServiceSchedule, 'id'>) => void;
  updateService: (id: string, s: Partial<ServiceSchedule>) => void;
  deleteService: (id: string) => void;

  addPrayerRequest: (r: Omit<PrayerRequest, 'id'>) => void;
  updatePrayerStatus: (id: string, status: PrayerStatus) => void;
  deletePrayerRequest: (id: string) => void;

  addCounselling: (c: Omit<SpiritualCounselling, 'id'>) => void;
  updateCounselling: (id: string, c: Partial<SpiritualCounselling>) => void;
  deleteCounselling: (id: string) => void;

  addEvent: (e: Omit<ReligiousEvent, 'id'>) => void;
  updateEvent: (id: string, e: Partial<ReligiousEvent>) => void;
  deleteEvent: (id: string) => void;

  addFellowship: (f: Omit<FellowshipGroup, 'id'>) => void;
  updateFellowship: (id: string, f: Partial<FellowshipGroup>) => void;
  deleteFellowship: (id: string) => void;

  addOutreach: (o: Omit<OutreachProgram, 'id'>) => void;
  updateOutreach: (id: string, o: Partial<OutreachProgram>) => void;
  deleteOutreach: (id: string) => void;

  addChoirMember: (c: Omit<ChoirMember, 'id'>) => void;
  deleteChoirMember: (id: string) => void;

  addBaptism: (b: Omit<BaptismRecord, 'id'>) => void;
  deleteBaptism: (id: string) => void;
}

const genId = (arr: { id: string }[]) => String(arr.length + 1);

export const useChaplainStore = create<ChaplainState>((set) => ({
  services: INITIAL_SERVICES,
  prayerRequests: INITIAL_PRAYER_REQUESTS,
  counselling: INITIAL_COUNSELLING,
  events: INITIAL_EVENTS,
  fellowships: INITIAL_FELLOWSHIPS,
  outreach: INITIAL_OUTREACH,
  choir: INITIAL_CHOIR,
  baptisms: INITIAL_BAPTISMS,

  addService: (s) => set((st) => ({ services: [...st.services, { ...s, id: genId(st.services) }] })),
  updateService: (id, s) => set((st) => ({ services: st.services.map((x) => x.id === id ? { ...x, ...s } : x) })),
  deleteService: (id) => set((st) => ({ services: st.services.filter((x) => x.id !== id) })),

  addPrayerRequest: (r) => set((st) => ({ prayerRequests: [{ ...r, id: genId(st.prayerRequests) }, ...st.prayerRequests] })),
  updatePrayerStatus: (id, status) => set((st) => ({
    prayerRequests: st.prayerRequests.map((x) =>
      x.id === id ? { ...x, status, dateAnswered: status === 'Answered' ? new Date().toISOString().slice(0, 10) : x.dateAnswered } : x
    ),
  })),
  deletePrayerRequest: (id) => set((st) => ({ prayerRequests: st.prayerRequests.filter((x) => x.id !== id) })),

  addCounselling: (c) => set((st) => ({ counselling: [{ ...c, id: genId(st.counselling) }, ...st.counselling] })),
  updateCounselling: (id, c) => set((st) => ({ counselling: st.counselling.map((x) => x.id === id ? { ...x, ...c } : x) })),
  deleteCounselling: (id) => set((st) => ({ counselling: st.counselling.filter((x) => x.id !== id) })),

  addEvent: (e) => set((st) => ({ events: [{ ...e, id: genId(st.events) }, ...st.events] })),
  updateEvent: (id, e) => set((st) => ({ events: st.events.map((x) => x.id === id ? { ...x, ...e } : x) })),
  deleteEvent: (id) => set((st) => ({ events: st.events.filter((x) => x.id !== id) })),

  addFellowship: (f) => set((st) => ({ fellowships: [...st.fellowships, { ...f, id: genId(st.fellowships) }] })),
  updateFellowship: (id, f) => set((st) => ({ fellowships: st.fellowships.map((x) => x.id === id ? { ...x, ...f } : x) })),
  deleteFellowship: (id) => set((st) => ({ fellowships: st.fellowships.filter((x) => x.id !== id) })),

  addOutreach: (o) => set((st) => ({ outreach: [{ ...o, id: genId(st.outreach) }, ...st.outreach] })),
  updateOutreach: (id, o) => set((st) => ({ outreach: st.outreach.map((x) => x.id === id ? { ...x, ...o } : x) })),
  deleteOutreach: (id) => set((st) => ({ outreach: st.outreach.filter((x) => x.id !== id) })),

  addChoirMember: (c) => set((st) => ({ choir: [...st.choir, { ...c, id: genId(st.choir) }] })),
  deleteChoirMember: (id) => set((st) => ({ choir: st.choir.filter((x) => x.id !== id) })),

  addBaptism: (b) => set((st) => ({ baptisms: [{ ...b, id: genId(st.baptisms) }, ...st.baptisms] })),
  deleteBaptism: (id) => set((st) => ({ baptisms: st.baptisms.filter((x) => x.id !== id) })),
}));
