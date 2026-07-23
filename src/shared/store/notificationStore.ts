import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
  link?: string;
  sender?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (n) =>
    set((st) => ({
      notifications: [
        { ...n, id: genId(), read: false, timestamp: new Date().toISOString() },
        ...st.notifications,
      ],
    })),

  markAsRead: (id) =>
    set((st) => ({
      notifications: st.notifications.map((x) => (x.id === id ? { ...x, read: true } : x)),
    })),

  markAllAsRead: () =>
    set((st) => ({
      notifications: st.notifications.map((x) => ({ ...x, read: true })),
    })),

  deleteNotification: (id) =>
    set((st) => ({
      notifications: st.notifications.filter((x) => x.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),

  unreadCount: () => get().notifications.filter((x) => !x.read).length,
}));
