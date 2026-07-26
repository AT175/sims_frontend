import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn?: string;
  totalCopies: number;
  availableCopies: number;
}

export type CirculationStatus = 'Borrowed' | 'Returned' | 'Overdue';

export interface CirculationRecord {
  id: string;
  date: string;
  bookId: string;
  bookTitle: string;
  borrowerName: string;
  borrowerClass: string;
  dueDate: string;
  returnDate?: string;
  status: CirculationStatus;
}

export type LabStatus = 'Booked' | 'Completed' | 'Cancelled';

export interface ICTBooking {
  id: string;
  date: string;
  timeSlot: string;
  className: string;
  teacherName: string;
  lab: string;
  purpose: string;
  status: LabStatus;
}

export type EquipmentCondition = 'Good' | 'Fair' | 'Poor' | 'Needs Repair';

export interface Equipment {
  id: string;
  item: string;
  quantity: number;
  condition: EquipmentCondition;
  location: string;
  lastServiceDate: string;
  notes?: string;
}

export type DigitalResourceType = 'E-Book' | 'Past Questions' | 'Video Tutorial' | 'Software' | 'Audio Book';

export interface DigitalResource {
  id: string;
  title: string;
  type: DigitalResourceType;
  downloads: number;
  uploadDate: string;
  fileSize: string;
}

export type AccessRole = 'Librarian' | 'ICT Coordinator' | 'Teacher' | 'Student' | 'Admin Staff';

export interface AccessRecord {
  id: string;
  personName: string;
  role: AccessRole;
  resource: string;
  accessLevel: 'Full' | 'Read Only' | 'Restricted' | 'No Access';
  grantedDate: string;
  grantedBy: string;
  notes?: string;
}

// ── Constants ──

export const BOOK_CATEGORIES = [
  'Mathematics', 'Science', 'Literature', 'Business', 'History',
  'Geography', 'Religious Studies', 'Languages', 'ICT', 'Arts', 'Reference',
];

export const LABS = ['ICT Lab 1', 'ICT Lab 2', 'Library Computer Room'];

export const TIME_SLOTS = [
  '08:00 - 09:20',
  '09:20 - 10:40',
  '11:00 - 12:20',
  '13:00 - 14:20',
  '14:20 - 15:40',
];

export const EQUIPMENT_CONDITIONS: EquipmentCondition[] = ['Good', 'Fair', 'Poor', 'Needs Repair'];

export const DIGITAL_RESOURCE_TYPES: DigitalResourceType[] = [
  'E-Book', 'Past Questions', 'Video Tutorial', 'Software', 'Audio Book',
];

export const ACCESS_ROLES: AccessRole[] = ['Librarian', 'ICT Coordinator', 'Teacher', 'Student', 'Admin Staff'];

export const ACCESS_LEVELS = ['Full', 'Read Only', 'Restricted', 'No Access'] as const;

let idCounter = 200;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const INITIAL_BOOKS: Book[] = [];

const INITIAL_CIRCULATION: CirculationRecord[] = [];

const INITIAL_BOOKINGS: ICTBooking[] = [];

const INITIAL_EQUIPMENT: Equipment[] = [];

const INITIAL_DIGITAL: DigitalResource[] = [];

const INITIAL_ACCESS: AccessRecord[] = [];

// ── Store ──

interface LibraryState {
  books: Book[];
  circulation: CirculationRecord[];
  bookings: ICTBooking[];
  equipment: Equipment[];
  digitalResources: DigitalResource[];
  accessRecords: AccessRecord[];

  addBook: (book: Omit<Book, 'id' | 'availableCopies'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;

  borrowBook: (bookId: string, borrowerName: string, borrowerClass: string, dueDate: string) => void;
  returnBook: (circulationId: string) => void;

  addBooking: (booking: Omit<ICTBooking, 'id' | 'status'>) => void;
  cancelBooking: (id: string) => void;
  completeBooking: (id: string) => void;

  addEquipment: (equip: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  addDigitalResource: (res: Omit<DigitalResource, 'id' | 'downloads'>) => void;
  deleteDigitalResource: (id: string) => void;
  incrementDownload: (id: string) => void;

  grantAccess: (record: Omit<AccessRecord, 'id' | 'grantedDate'>) => void;
  revokeAccess: (id: string) => void;

  getOverdue: () => CirculationRecord[];
  getBookAvailability: (bookId: string) => Book | undefined;

  // API
  loadBooks: () => Promise<void>;
  loadCirculation: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: INITIAL_BOOKS,
  circulation: INITIAL_CIRCULATION,
  bookings: INITIAL_BOOKINGS,
  equipment: INITIAL_EQUIPMENT,
  digitalResources: INITIAL_DIGITAL,
  accessRecords: INITIAL_ACCESS,

  addBook: async (book) => {
    const newBook: Book = { ...book, id: nextId(), availableCopies: book.totalCopies };
    try {
      const created = await apiClient.post<any>('/library/books', book);
      set((s) => ({ books: [{ ...newBook, id: created.id || nextId() }, ...s.books] }));
    } catch {
      set((s) => ({ books: [newBook, ...s.books] }));
    }
  },

  updateBook: (id, updates) => {
    set((s) => ({
      books: s.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  },

  deleteBook: (id) => {
    set((s) => ({ books: s.books.filter((b) => b.id !== id) }));
  },

  borrowBook: async (bookId, borrowerName, borrowerClass, dueDate) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book || book.availableCopies <= 0) return;
    const record: CirculationRecord = {
      id: nextId(), date: todayISO(), bookId, bookTitle: book.title,
      borrowerName, borrowerClass, dueDate, status: 'Borrowed',
    };
    try {
      await apiClient.post<any>('/library/circulation', { bookId, borrowerName, borrowerClass, dueDate });
    } catch {}
    set((s) => ({
      circulation: [record, ...s.circulation],
      books: s.books.map((b) => b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b),
    }));
  },

  returnBook: (circulationId) => {
    const record = get().circulation.find((c) => c.id === circulationId);
    if (!record || record.status === 'Returned') return;
    set((s) => ({
      circulation: s.circulation.map((c) =>
        c.id === circulationId
          ? { ...c, status: 'Returned' as CirculationStatus, returnDate: todayISO() }
          : c
      ),
      books: s.books.map((b) =>
        b.id === record.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b
      ),
    }));
  },

  addBooking: (booking) => {
    const newBooking: ICTBooking = { ...booking, id: nextId(), status: 'Booked' };
    set((s) => ({ bookings: [newBooking, ...s.bookings] }));
  },

  cancelBooking: (id) => {
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, status: 'Cancelled' as LabStatus } : b
      ),
    }));
  },

  completeBooking: (id) => {
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, status: 'Completed' as LabStatus } : b
      ),
    }));
  },

  addEquipment: (equip) => {
    const newEquip: Equipment = { ...equip, id: nextId() };
    set((s) => ({ equipment: [newEquip, ...s.equipment] }));
  },

  updateEquipment: (id, updates) => {
    set((s) => ({
      equipment: s.equipment.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  },

  deleteEquipment: (id) => {
    set((s) => ({ equipment: s.equipment.filter((e) => e.id !== id) }));
  },

  addDigitalResource: (res) => {
    const newRes: DigitalResource = { ...res, id: nextId(), downloads: 0 };
    set((s) => ({ digitalResources: [newRes, ...s.digitalResources] }));
  },

  deleteDigitalResource: (id) => {
    set((s) => ({ digitalResources: s.digitalResources.filter((r) => r.id !== id) }));
  },

  incrementDownload: (id) => {
    set((s) => ({
      digitalResources: s.digitalResources.map((r) =>
        r.id === id ? { ...r, downloads: r.downloads + 1 } : r
      ),
    }));
  },

  grantAccess: (record) => {
    const newRecord: AccessRecord = { ...record, id: nextId(), grantedDate: todayISO() };
    set((s) => ({ accessRecords: [newRecord, ...s.accessRecords] }));
  },

  revokeAccess: (id) => {
    set((s) => ({ accessRecords: s.accessRecords.filter((a) => a.id !== id) }));
  },

  getOverdue: () => {
    return get().circulation.filter((c) => c.status === 'Overdue');
  },

  getBookAvailability: (bookId) => {
    return get().books.find((b) => b.id === bookId);
  },

  loadBooks: async () => {
    try {
      const data = await apiClient.get<any[]>('/library/books');
      set({ books: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadCirculation: async () => {
    try {
      const data = await apiClient.get<any[]>('/library/circulation');
      set({ circulation: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadBooks(),
      get().loadCirculation(),
    ]);
  },

}));
