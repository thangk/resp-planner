import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { ETF } from '@/types';
import { STORAGE_KEYS, DEFAULT_ETFS } from '@/lib/constants';

interface PortfolioState {
  etfs: ETF[];

  // CRUD operations
  addETF: (etf: Omit<ETF, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateETF: (id: string, updates: Partial<ETF>) => void;
  removeETF: (id: string) => void;
  getETF: (id: string) => ETF | undefined;

  // Portfolio calculations
  getTotalAllocation: () => number;
  getBlendedReturn: () => number;
  isAllocationValid: () => boolean;

  // Bulk operations
  setETFs: (etfs: ETF[]) => void;
  clearETFs: () => void;
  resetToDefaults: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      etfs: [],

      addETF: (etfData) => {
        const id = uuid();
        const now = new Date().toISOString();
        const newETF: ETF = {
          ...etfData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ etfs: [...state.etfs, newETF] }));
        return id;
      },

      updateETF: (id, updates) => {
        set((state) => ({
          etfs: state.etfs.map((etf) =>
            etf.id === id ? { ...etf, ...updates, updatedAt: new Date().toISOString() } : etf
          ),
        }));
      },

      removeETF: (id) => {
        set((state) => ({
          etfs: state.etfs.filter((etf) => etf.id !== id),
        }));
      },

      getETF: (id) => get().etfs.find((etf) => etf.id === id),

      getTotalAllocation: () => {
        return get().etfs.reduce((sum, etf) => sum + etf.allocation, 0);
      },

      getBlendedReturn: () => {
        const etfs = get().etfs;
        if (etfs.length === 0) return 0;

        const totalAllocation = get().getTotalAllocation();
        if (totalAllocation === 0) return 0;

        return etfs.reduce((sum, etf) => {
          const weight = etf.allocation / totalAllocation;
          return sum + etf.historicalReturn * weight;
        }, 0);
      },

      isAllocationValid: () => {
        return get().getTotalAllocation() === 100;
      },

      setETFs: (etfs) => set({ etfs }),

      clearETFs: () => set({ etfs: [] }),

      resetToDefaults: () => {
        const now = new Date().toISOString();
        const defaultETFs: ETF[] = DEFAULT_ETFS.map((etf) => ({
          ...etf,
          id: uuid(),
          createdAt: now,
          updatedAt: now,
        }));
        set({ etfs: defaultETFs });
      },
    }),
    {
      name: STORAGE_KEYS.portfolio,
    }
  )
);
