import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IncomeYear } from '@/types';
import { STORAGE_KEYS, RESP_RULES } from '@/lib/constants';

interface IncomeState {
  incomeYears: IncomeYear[];

  // CRUD operations
  setIncomeForYear: (year: number, familyIncome: number) => void;
  getIncomeForYear: (year: number) => number | undefined;
  removeIncomeForYear: (year: number) => void;

  // ACESG eligibility
  getACESGTier: (year: number) => 'tier1' | 'tier2' | 'none';
  isCLBEligible: (year: number) => boolean;

  // Bulk operations
  setIncomeYears: (incomeYears: IncomeYear[]) => void;
  clearIncomeYears: () => void;
}

export const useIncomeStore = create<IncomeState>()(
  persist(
    (set, get) => ({
      incomeYears: [],

      setIncomeForYear: (year, familyIncome) => {
        set((state) => {
          const existingIndex = state.incomeYears.findIndex((iy) => iy.year === year);
          if (existingIndex >= 0) {
            const updated = [...state.incomeYears];
            updated[existingIndex] = { year, familyIncome };
            return { incomeYears: updated };
          }
          return { incomeYears: [...state.incomeYears, { year, familyIncome }] };
        });
      },

      getIncomeForYear: (year) => {
        const incomeYear = get().incomeYears.find((iy) => iy.year === year);
        return incomeYear?.familyIncome;
      },

      removeIncomeForYear: (year) => {
        set((state) => ({
          incomeYears: state.incomeYears.filter((iy) => iy.year !== year),
        }));
      },

      getACESGTier: (year) => {
        const income = get().getIncomeForYear(year);
        if (!income) return 'none';

        if (income <= RESP_RULES.ACESG_TIER1_INCOME_MAX) {
          return 'tier1';
        }
        if (income <= RESP_RULES.ACESG_TIER2_INCOME_MAX) {
          return 'tier2';
        }
        return 'none';
      },

      isCLBEligible: (year) => {
        const income = get().getIncomeForYear(year);
        if (!income) return false;

        return income <= RESP_RULES.CLB_INCOME_THRESHOLD_1_3_CHILDREN;
      },

      setIncomeYears: (incomeYears) => set({ incomeYears }),

      clearIncomeYears: () => set({ incomeYears: [] }),
    }),
    {
      name: STORAGE_KEYS.income,
    }
  )
);
