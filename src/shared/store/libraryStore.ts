import { create } from 'zustand';

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

const INITIAL_BOOKS: Book[] = [
  { id: '1', title: 'Advanced Mathematics', author: 'K.A. Stroud', category: 'Mathematics', isbn: '9781352005981', totalCopies: 5, availableCopies: 3 },
  { id: '2', title: 'Organic Chemistry', author: 'Morrison & Boyd', category: 'Science', isbn: '9780136436690', totalCopies: 3, availableCopies: 1 },
  { id: '3', title: 'Things Fall Apart', author: 'Chinua Achebe', category: 'Literature', isbn: '9780385474542', totalCopies: 10, availableCopies: 8 },
  { id: '4', title: 'Economics for SHS', author: 'G. Antwi', category: 'Business', totalCopies: 8, availableCopies: 5 },
  { id: '5', title: 'A History of Ghana', author: 'F.K. Buah', category: 'History', totalCopies: 6, availableCopies: 6 },
  { id: '6', title: 'Senior High Physics', author: 'A.A. Adjei', category: 'Science', totalCopies: 4, availableCopies: 2 },
];

const INITIAL_CIRCULATION: CirculationRecord[] = [
  { id: '1', date: '2026-07-06', bookId: '1', bookTitle: 'Advanced Mathematics', borrowerName: 'K. Asante', borrowerClass: 'SHS2 Sci A', dueDate: '2026-07-20', status: 'Borrowed' },
  { id: '2', date: '2026-07-05', bookId: '2', bookTitle: 'Organic Chemistry', borrowerName: 'G. Opoku', borrowerClass: 'SHS2 Sci B', dueDate: '2026-07-19', status: 'Borrowed' },
  { id: '3', date: '2026-07-03', bookId: '3', bookTitle: 'Things Fall Apart', borrowerName: 'A. Owusu', borrowerClass: 'SHS1 Arts A', dueDate: '2026-07-17', returnDate: '2026-07-10', status: 'Returned' },
  { id: '4', date: '2026-06-28', bookId: '6', bookTitle: 'Senior High Physics', borrowerName: 'M. Tetteh', borrowerClass: 'SHS3 Sci A', dueDate: '2026-07-12', status: 'Overdue' },
];

const INITIAL_BOOKINGS: ICTBooking[] = [
  { id: '1', date: '2026-07-08', timeSlot: '08:00 - 09:20', className: 'SHS2 Sci A', teacherName: 'Mr. Adjei', lab: 'ICT Lab 1', purpose: 'Practical: Spreadsheets', status: 'Booked' },
  { id: '2', date: '2026-07-08', timeSlot: '10:00 - 11:20', className: 'SHS1 Arts B', teacherName: 'Mrs. Boateng', lab: 'ICT Lab 1', purpose: 'Intro to Word Processing', status: 'Booked' },
  { id: '3', date: '2026-07-09', timeSlot: '08:00 - 09:20', className: 'SHS3 Sci A', teacherName: 'Mr. Owusu', lab: 'ICT Lab 2', purpose: 'Online Research', status: 'Booked' },
];

const INITIAL_EQUIPMENT: Equipment[] = [
  { id: '1', item: 'Desktop PCs (Lab 1)', quantity: 30, condition: 'Good', location: 'ICT Lab 1', lastServiceDate: '2026-05-15' },
  { id: '2', item: 'Desktop PCs (Lab 2)', quantity: 25, condition: 'Fair', location: 'ICT Lab 2', lastServiceDate: '2026-03-20' },
  { id: '3', item: 'Projectors', quantity: 4, condition: 'Good', location: 'Store Room A', lastServiceDate: '2026-06-10' },
  { id: '4', item: 'Printers', quantity: 3, condition: 'Needs Repair', location: 'Library Office', lastServiceDate: '2026-06-05', notes: '1 unit needs drum replacement' },
  { id: '5', item: 'Library Scanner', quantity: 2, condition: 'Good', location: 'Library Front Desk', lastServiceDate: '2026-04-12' },
];

const INITIAL_DIGITAL: DigitalResource[] = [
  { id: '1', title: 'Core Math Past Questions (2015-2025)', type: 'Past Questions', downloads: 342, uploadDate: '2026-01-15', fileSize: '12.4 MB' },
  { id: '2', title: 'Chemistry E-Book (SHS)', type: 'E-Book', downloads: 218, uploadDate: '2026-02-01', fileSize: '8.7 MB' },
  { id: '3', title: 'English Literature Anthology', type: 'E-Book', downloads: 156, uploadDate: '2026-02-10', fileSize: '5.2 MB' },
  { id: '4', title: 'Physics Past Questions (2018-2025)', type: 'Past Questions', downloads: 289, uploadDate: '2026-01-20', fileSize: '10.1 MB' },
  { id: '5', title: 'ICT Practical Video Series', type: 'Video Tutorial', downloads: 97, uploadDate: '2026-03-05', fileSize: '245 MB' },
];

const INITIAL_ACCESS: AccessRecord[] = [
  { id: '1', personName: 'Mrs. Asante', role: 'Librarian', resource: 'Library Catalogue', accessLevel: 'Full', grantedDate: '2026-01-05', grantedBy: 'Headmaster' },
  { id: '2', personName: 'Mr. Adjei', role: 'ICT Coordinator', resource: 'ICT Lab Bookings', accessLevel: 'Full', grantedDate: '2026-01-05', grantedBy: 'Headmaster' },
  { id: '3', personName: 'Mr. Adjei', role: 'ICT Coordinator', resource: 'Equipment Inventory', accessLevel: 'Full', grantedDate: '2026-01-05', grantedBy: 'Headmaster' },
  { id: '4', personName: 'Mrs. Asante', role: 'Librarian', resource: 'Digital Resources', accessLevel: 'Full', grantedDate: '2026-01-05', grantedBy: 'Headmaster' },
  { id: '5', personName: 'All Teaching Staff', role: 'Teacher', resource: 'ICT Lab Bookings', accessLevel: 'Read Only', grantedDate: '2026-01-10', grantedBy: 'ICT Coordinator' },
  { id: '6', personName: 'All Students', role: 'Student', resource: 'Digital Resources', accessLevel: 'Read Only', grantedDate: '2026-01-10', grantedBy: 'Librarian' },
  { id: '7', personName: 'All Students', role: 'Student', resource: 'Equipment Inventory', accessLevel: 'No Access', grantedDate: '2026-01-10', grantedBy: 'ICT Coordinator' },
];

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
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: INITIAL_BOOKS,
  circulation: INITIAL_CIRCULATION,
  bookings: INITIAL_BOOKINGS,
  equipment: INITIAL_EQUIPMENT,
  digitalResources: INITIAL_DIGITAL,
  accessRecords: INITIAL_ACCESS,

  addBook: (book) => {
    const newBook: Book = { ...book, id: nextId(), availableCopies: book.totalCopies };
    set((s) => ({ books: [newBook, ...s.books] }));
  },

  updateBook: (id, updates) => {
    set((s) => ({
      books: s.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  },

  deleteBook: (id) => {
    set((s) => ({ books: s.books.filter((b) => b.id !== id) }));
  },

  borrowBook: (bookId, borrowerName, borrowerClass, dueDate) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book || book.availableCopies <= 0) return;
    const record: CirculationRecord = {
      id: nextId(),
      date: todayISO(),
      bookId,
      bookTitle: book.title,
      borrowerName,
      borrowerClass,
      dueDate,
      status: 'Borrowed',
    };
    set((s) => ({
      circulation: [record, ...s.circulation],
      books: s.books.map((b) =>
        b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b
      ),
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
}));
