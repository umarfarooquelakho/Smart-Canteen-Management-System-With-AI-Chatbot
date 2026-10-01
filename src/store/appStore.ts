/**
 * Global reactive app store — drives "real-time" updates across tabs/components.
 * A simple event bus + version counter approach replaces WebSocket for the demo.
 */
import { create } from 'zustand';

interface AppState {
  ordersVersion: number;
  menuVersion: number;
  queueVersion: number;
  notifVersion: number;
  tick: () => void; // general refresh trigger
  refreshOrders: () => void;
  refreshMenu: () => void;
  refreshQueue: () => void;
  refreshNotifs: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  ordersVersion: 0,
  menuVersion: 0,
  queueVersion: 0,
  notifVersion: 0,
  tick: () =>
    set((s) => ({
      ordersVersion: s.ordersVersion + 1,
      menuVersion: s.menuVersion + 1,
      queueVersion: s.queueVersion + 1,
      notifVersion: s.notifVersion + 1,
    })),
  refreshOrders: () => set((s) => ({ ordersVersion: s.ordersVersion + 1 })),
  refreshMenu: () => set((s) => ({ menuVersion: s.menuVersion + 1 })),
  refreshQueue: () => set((s) => ({ queueVersion: s.queueVersion + 1 })),
  refreshNotifs: () => set((s) => ({ notifVersion: s.notifVersion + 1 })),
}));
