import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

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

const INITIAL_STOCK: KitchenStockItem[] = [];

const INITIAL_ISSUES: IssueLog[] = [];

const INITIAL_MENU: MenuDay[] = [];

const INITIAL_CUSTOM_MENUS: CustomMenu[] = [];

const INITIAL_FIN_REQS: FinancialRequisition[] = [];

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

  // API
  loadStock: () => Promise<void>;
  loadMenus: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const useKitchenStore = create<KitchenState>((set, get) => ({
  stock: INITIAL_STOCK,
  issues: INITIAL_ISSUES,
  menu: INITIAL_MENU,
  customMenus: INITIAL_CUSTOM_MENUS,
  financialReqs: INITIAL_FIN_REQS,

  // ── Stock ──
  addStockItem: async (item) => {
    try {
      const created = await apiClient.post<any>('/kitchen/stock', item);
      set((state) => ({ stock: [...state.stock, { ...item, id: created.id || nextId() }] }));
    } catch {
      set((state) => ({ stock: [...state.stock, { ...item, id: nextId() }] }));
    }
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
  addMenuDay: async (day) => {
    try {
      const created = await apiClient.post<any>('/kitchen/menus', day);
      set((state) => ({ menu: [...state.menu, { ...day, id: created.id || nextId() }] }));
    } catch {
      set((state) => ({ menu: [...state.menu, { ...day, id: nextId() }] }));
    }
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

  loadStock: async () => {
    try {
      const data = await apiClient.get<any[]>('/kitchen/stock');
      set({ stock: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadMenus: async () => {
    try {
      const data = await apiClient.get<any[]>('/kitchen/menus');
      set({ menu: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadMenus(),
      get().loadStock(),
    ]);
  },

}));
