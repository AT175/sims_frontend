import { create } from 'zustand';

// ── Types ──

export interface KitchenStockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  category: string;
}

export interface IssueLog {
  id: string;
  date: string;
  itemName: string;
  quantity: number;
  unit: string;
  issuedTo: string;
  purpose: string;
}

export interface MenuDay {
  id: string;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface CustomMenu {
  id: string;
  personName: string;
  personRole: string;
  reason: string;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  active: boolean;
}

export type FinancialReqStatus = 'Pending' | 'Approved' | 'Rejected' | 'Disbursed';

export interface FinancialRequisition {
  id: string;
  date: string;
  amount: number;
  purpose: string;
  requestedBy: string;
  status: FinancialReqStatus;
  notes: string;
}

// ── Helpers ──

let idCounter = 200;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const INITIAL_STOCK: KitchenStockItem[] = [
  { id: '1', name: 'Maize bags', quantity: 80, unit: 'bags', reorderLevel: 30, category: 'Grains' },
  { id: '2', name: 'Rice', quantity: 35, unit: 'bags', reorderLevel: 20, category: 'Grains' },
  { id: '3', name: 'Cooking oil', quantity: 12, unit: 'gallons', reorderLevel: 15, category: 'Cooking' },
  { id: '4', name: 'Tomatoes', quantity: 8, unit: 'crates', reorderLevel: 10, category: 'Produce' },
  { id: '5', name: 'Onions', quantity: 6, unit: 'sacks', reorderLevel: 8, category: 'Produce' },
  { id: '6', name: 'Chicken', quantity: 20, unit: 'cartons', reorderLevel: 10, category: 'Protein' },
  { id: '7', name: 'Fish (tilapia)', quantity: 15, unit: 'boxes', reorderLevel: 10, category: 'Protein' },
  { id: '8', name: 'Salt', quantity: 5, unit: 'bags', reorderLevel: 3, category: 'Condiments' },
  { id: '9', name: 'Pepper', quantity: 4, unit: 'sacks', reorderLevel: 5, category: 'Produce' },
  { id: '10', name: 'Firewood', quantity: 25, unit: 'loads', reorderLevel: 15, category: 'Fuel' },
];

const INITIAL_ISSUES: IssueLog[] = [
  { id: '1', date: '2026-07-08', itemName: 'Maize bags', quantity: 10, unit: 'bags', issuedTo: 'Kitchen - Breakfast', purpose: 'Porridge preparation' },
  { id: '2', date: '2026-07-08', itemName: 'Cooking oil', quantity: 2, unit: 'gallons', issuedTo: 'Kitchen - Lunch', purpose: 'Jollof rice' },
  { id: '3', date: '2026-07-07', itemName: 'Rice', quantity: 8, unit: 'bags', issuedTo: 'Kitchen - Lunch', purpose: 'Waakye preparation' },
  { id: '4', date: '2026-07-07', itemName: 'Chicken', quantity: 5, unit: 'cartons', issuedTo: 'Kitchen - Dinner', purpose: 'Chicken stew' },
];

const INITIAL_MENU: MenuDay[] = [
  { id: 'm1', day: 'Monday', breakfast: 'Porridge + bread', lunch: 'Jollof rice + chicken', dinner: 'Banku + tilapia' },
  { id: 'm2', day: 'Tuesday', breakfast: 'Tea + eggs', lunch: 'Fufu + goat soup', dinner: 'Rice + stew' },
  { id: 'm3', day: 'Wednesday', breakfast: 'Hausa koko + koko bread', lunch: 'Kenkey + fried fish', dinner: 'Yam + garden egg stew' },
  { id: 'm4', day: 'Thursday', breakfast: 'Tea + bread', lunch: 'Waakye + egg', dinner: 'Tuo zaafi + ayoyo' },
  { id: 'm5', day: 'Friday', breakfast: 'Porridge + bread', lunch: 'Plain rice + chicken stew', dinner: 'Konkonte + groundnut soup' },
];

const INITIAL_CUSTOM_MENUS: CustomMenu[] = [
  { id: 'c1', personName: 'Kwame Asante', personRole: 'Student', reason: 'Lactose intolerant', day: 'Monday', breakfast: 'Tea (no milk) + bread', lunch: 'Jollof rice (no butter)', dinner: 'Banku + tilapia', active: true },
  { id: 'c2', personName: 'Mr. Osei', personRole: 'Teacher', reason: 'Diabetic diet', day: 'Tuesday', breakfast: 'Plain tea + eggs', lunch: 'Fufu + light soup (no palm oil)', dinner: 'Grilled chicken + salad', active: true },
  { id: 'c3', personName: 'Ama Owusu', personRole: 'Student', reason: 'Vegetarian', day: 'Wednesday', breakfast: 'Hausa koko + bread', lunch: 'Kenkey + garden egg stew (no fish)', dinner: 'Yam + vegetable stew', active: true },
];

const INITIAL_FIN_REQS: FinancialRequisition[] = [
  { id: 'f1', date: '2026-07-06', amount: 5000, purpose: 'Weekly foodstuff purchase', requestedBy: 'Catering Officer', status: 'Approved', notes: 'For week 2 supplies' },
  { id: 'f2', date: '2026-07-01', amount: 2500, purpose: 'Cooking gas refill', requestedBy: 'Catering Officer', status: 'Disbursed', notes: '' },
];

// ── Store ──

interface KitchenState {
  stock: KitchenStockItem[];
  issues: IssueLog[];
  menu: MenuDay[];
  customMenus: CustomMenu[];
  financialReqs: FinancialRequisition[];

  // Stock
  addStockItem: (item: Omit<KitchenStockItem, 'id'>) => void;
  updateStockItem: (id: string, item: Omit<KitchenStockItem, 'id'>) => void;
  deleteStockItem: (id: string) => void;
  restockItem: (id: string, qty: number) => void;
  issueItem: (itemName: string, quantity: number, unit: string, issuedTo: string, purpose: string) => void;
  getLowStock: () => KitchenStockItem[];
  getOutOfStock: () => KitchenStockItem[];

  // Menu
  addMenuDay: (day: Omit<MenuDay, 'id'>) => void;
  updateMenuDay: (id: string, day: Omit<MenuDay, 'id'>) => void;
  deleteMenuDay: (id: string) => void;
  getTodayMenu: () => MenuDay | undefined;

  // Custom menus
  addCustomMenu: (menu: Omit<CustomMenu, 'id'>) => void;
  updateCustomMenu: (id: string, menu: Omit<CustomMenu, 'id'>) => void;
  deleteCustomMenu: (id: string) => void;
  toggleCustomMenu: (id: string) => void;
  getCustomMenusForRole: (role: string) => CustomMenu[];

  // Financial requisitions
  submitFinancialReq: (req: Omit<FinancialRequisition, 'id' | 'date' | 'status'>) => void;
  updateFinancialReqStatus: (id: string, status: FinancialReqStatus) => void;
  deleteFinancialReq: (id: string) => void;
  getPendingFinancialReqs: () => FinancialRequisition[];
}

export const useKitchenStore = create<KitchenState>((set, get) => ({
  stock: INITIAL_STOCK,
  issues: INITIAL_ISSUES,
  menu: INITIAL_MENU,
  customMenus: INITIAL_CUSTOM_MENUS,
  financialReqs: INITIAL_FIN_REQS,

  // ── Stock ──
  addStockItem: (item) => {
    set((state) => ({ stock: [...state.stock, { ...item, id: nextId() }] }));
  },

  updateStockItem: (id, item) => {
    set((state) => ({ stock: state.stock.map((s) => (s.id === id ? { ...item, id } : s)) }));
  },

  deleteStockItem: (id) => {
    set((state) => ({ stock: state.stock.filter((s) => s.id !== id) }));
  },

  restockItem: (id, qty) => {
    set((state) => ({
      stock: state.stock.map((s) => (s.id === id ? { ...s, quantity: s.quantity + qty } : s)),
    }));
  },

  issueItem: (itemName, quantity, unit, issuedTo, purpose) => {
    set((state) => ({
      issues: [{ id: nextId(), date: todayISO(), itemName, quantity, unit, issuedTo, purpose }, ...state.issues],
      stock: state.stock.map((s) =>
        s.name === itemName ? { ...s, quantity: Math.max(0, s.quantity - quantity) } : s
      ),
    }));
  },

  getLowStock: () => {
    return get().stock.filter((s) => s.quantity > 0 && s.quantity <= s.reorderLevel);
  },

  getOutOfStock: () => {
    return get().stock.filter((s) => s.quantity === 0);
  },

  // ── Menu ──
  addMenuDay: (day) => {
    set((state) => ({ menu: [...state.menu, { ...day, id: nextId() }] }));
  },

  updateMenuDay: (id, day) => {
    set((state) => ({ menu: state.menu.map((m) => (m.id === id ? { ...day, id } : m)) }));
  },

  deleteMenuDay: (id) => {
    set((state) => ({ menu: state.menu.filter((m) => m.id !== id) }));
  },

  getTodayMenu: () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return get().menu.find((m) => m.day === today);
  },

  // ── Custom menus ──
  addCustomMenu: (menu) => {
    set((state) => ({ customMenus: [...state.customMenus, { ...menu, id: nextId() }] }));
  },

  updateCustomMenu: (id, menu) => {
    set((state) => ({ customMenus: state.customMenus.map((c) => (c.id === id ? { ...menu, id } : c)) }));
  },

  deleteCustomMenu: (id) => {
    set((state) => ({ customMenus: state.customMenus.filter((c) => c.id !== id) }));
  },

  toggleCustomMenu: (id) => {
    set((state) => ({
      customMenus: state.customMenus.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    }));
  },

  getCustomMenusForRole: (role) => {
    return get().customMenus.filter((c) => c.active && c.personRole === role);
  },

  // ── Financial requisitions ──
  submitFinancialReq: (req) => {
    const newReq: FinancialRequisition = {
      ...req,
      id: nextId(),
      date: todayISO(),
      status: 'Pending',
    };
    set((state) => ({ financialReqs: [newReq, ...state.financialReqs] }));
  },

  updateFinancialReqStatus: (id, status) => {
    set((state) => ({
      financialReqs: state.financialReqs.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  },

  deleteFinancialReq: (id) => {
    set((state) => ({ financialReqs: state.financialReqs.filter((r) => r.id !== id) }));
  },

  getPendingFinancialReqs: () => {
    return get().financialReqs.filter((r) => r.status === 'Pending');
  },
}));
