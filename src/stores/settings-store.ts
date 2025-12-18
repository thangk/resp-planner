import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface SettingsState extends AppSettings {
  // Actions
  setTheme: (theme: AppSettings['theme']) => void;
  setHasCompletedWizard: (completed: boolean) => void;
  setLastOpenedPlanId: (planId: string | null) => void;

  // Bulk operations
  setSettings: (settings: AppSettings) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  hasCompletedWizard: false,
  lastOpenedPlanId: null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setTheme: (theme) => set({ theme }),

      setHasCompletedWizard: (completed) => set({ hasCompletedWizard: completed }),

      setLastOpenedPlanId: (planId) => set({ lastOpenedPlanId: planId }),

      setSettings: (settings) => set(settings),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: STORAGE_KEYS.settings,
    }
  )
);
