import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIState } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface UIStoreState extends UIState {
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarOpen: () => void;

  // Reset
  resetUI: () => void;
}

const defaultUIState: UIState = {
  sidebarCollapsed: false,
  sidebarOpen: false,
};

export const useUIStore = create<UIStoreState>()(
  persist(
    (set) => ({
      ...defaultUIState,

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebarOpen: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      resetUI: () => set(defaultUIState),
    }),
    {
      name: STORAGE_KEYS.ui,
    }
  )
);
