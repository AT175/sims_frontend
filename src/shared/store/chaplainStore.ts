import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

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

const INITIAL_SERVICES: ServiceSchedule[] = [];

const INITIAL_PRAYER_REQUESTS: PrayerRequest[] = [];

const INITIAL_COUNSELLING: SpiritualCounselling[] = [];

const INITIAL_EVENTS: ReligiousEvent[] = [];

const INITIAL_FELLOWSHIPS: FellowshipGroup[] = [];

const INITIAL_OUTREACH: OutreachProgram[] = [];

const INITIAL_CHOIR: ChoirMember[] = [];

const INITIAL_BAPTISMS: BaptismRecord[] = [];

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

  // API
  loadPrayerRequests: () => Promise<void>;
  loadCounselling: () => Promise<void>;
  loadAll: () => Promise<void>;
}

const genId = (arr: { id: string }[]) => String(arr.length + 1);

export const useChaplainStore = create<ChaplainState>((set, get) => ({
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

  addPrayerRequest: async (r) => {
    try {
      const created = await apiClient.post<any>('/chaplain/prayer-requests', r);
      set((st) => ({ prayerRequests: [{ ...r, id: created.id || genId(st.prayerRequests) }, ...st.prayerRequests] }));
    } catch {
      set((st) => ({ prayerRequests: [{ ...r, id: genId(st.prayerRequests) }, ...st.prayerRequests] }));
    }
  },
  updatePrayerStatus: (id, status) => set((st) => ({
    prayerRequests: st.prayerRequests.map((x) =>
      x.id === id ? { ...x, status, dateAnswered: status === 'Answered' ? new Date().toISOString().slice(0, 10) : x.dateAnswered } : x
    ),
  })),
  deletePrayerRequest: (id) => set((st) => ({ prayerRequests: st.prayerRequests.filter((x) => x.id !== id) })),

  addCounselling: async (c) => {
    try {
      const created = await apiClient.post<any>('/chaplain/counselling', c);
      set((st) => ({ counselling: [{ ...c, id: created.id || genId(st.counselling) }, ...st.counselling] }));
    } catch {
      set((st) => ({ counselling: [{ ...c, id: genId(st.counselling) }, ...st.counselling] }));
    }
  },
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

  loadPrayerRequests: async () => {
    try {
      const data = await apiClient.get<any[]>('/chaplain/prayer-requests');
      set({ prayerRequests: (data || []).map((d) => ({ ...d, id: d.id || String(Math.random()) })) });
    } catch {}
  },
  loadCounselling: async () => {
    try {
      const data = await apiClient.get<any[]>('/chaplain/counselling');
      set({ counselling: (data || []).map((d) => ({ ...d, id: d.id || String(Math.random()) })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadCounselling(),
      get().loadPrayerRequests(),
    ]);
  },

}));
