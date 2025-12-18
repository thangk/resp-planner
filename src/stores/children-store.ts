import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Child } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

// Calculate catch-up years available based on DOB and RESP opened date
function calculateCatchUpYears(dateOfBirth: string, respOpenedDate: string | null): number {
  if (!respOpenedDate) return 0;

  const dob = new Date(dateOfBirth);
  const respOpened = new Date(respOpenedDate);
  const currentYear = new Date().getFullYear();

  const dobYear = dob.getFullYear();
  const respOpenedYear = respOpened.getFullYear();

  // Years where contribution room was available but no RESP was open
  // You CAN contribute in the birth year if RESP is opened that year
  // Example: DOB 2022, RESP opened 2025 → missed 2022, 2023, 2024 = 3 years
  const missedYears = respOpenedYear - dobYear;

  // Maximum catch-up is the number of missed years, up to age 17
  const age = currentYear - dobYear;
  if (age > 17) return 0;

  return Math.max(0, missedYears);
}

interface ChildrenState {
  children: Child[];

  // CRUD operations
  addChild: (
    child: Omit<Child, 'id' | 'createdAt' | 'updatedAt' | 'catchUpYearsAvailable'>
  ) => string;
  updateChild: (id: string, updates: Partial<Child>) => void;
  removeChild: (id: string) => void;
  getChild: (id: string) => Child | undefined;

  // Bulk operations for import
  setChildren: (children: Child[]) => void;
  clearChildren: () => void;
}

export const useChildrenStore = create<ChildrenState>()(
  persist(
    (set, get) => ({
      children: [],

      addChild: (childData) => {
        const id = uuid();
        const now = new Date().toISOString();
        const newChild: Child = {
          ...childData,
          id,
          catchUpYearsAvailable: calculateCatchUpYears(
            childData.dateOfBirth,
            childData.respOpenedDate
          ),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ children: [...state.children, newChild] }));
        return id;
      },

      updateChild: (id, updates) => {
        set((state) => ({
          children: state.children.map((child) => {
            if (child.id !== id) return child;

            const updatedChild = { ...child, ...updates, updatedAt: new Date().toISOString() };

            // Recalculate catch-up years if DOB or RESP opened date changed
            if (updates.dateOfBirth || updates.respOpenedDate) {
              updatedChild.catchUpYearsAvailable = calculateCatchUpYears(
                updatedChild.dateOfBirth,
                updatedChild.respOpenedDate
              );
            }

            return updatedChild;
          }),
        }));
      },

      removeChild: (id) => {
        set((state) => ({
          children: state.children.filter((child) => child.id !== id),
        }));
      },

      getChild: (id) => get().children.find((child) => child.id === id),

      setChildren: (children) => set({ children }),

      clearChildren: () => set({ children: [] }),
    }),
    {
      name: STORAGE_KEYS.children,
    }
  )
);
