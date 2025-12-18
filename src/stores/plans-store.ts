import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Plan, PlanChild, Contribution, CLBOverride } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface PlansState {
  plans: Plan[];
  planChildren: PlanChild[];
  contributions: Contribution[];
  clbOverrides: CLBOverride[];

  // Plan CRUD
  addPlan: (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt' | 'disabled'>) => string;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  removePlan: (id: string) => void;
  getPlan: (id: string) => Plan | undefined;
  togglePlanDisabled: (id: string) => void;

  // PlanChild operations
  addPlanChild: (planChild: PlanChild) => void;
  updatePlanChild: (planId: string, childId: string, updates: Partial<PlanChild>) => void;
  removePlanChild: (planId: string, childId: string) => void;
  getPlanChildren: (planId: string) => PlanChild[];

  // Contribution CRUD
  addContribution: (contribution: Omit<Contribution, 'id'>) => string;
  updateContribution: (id: string, updates: Partial<Contribution>) => void;
  removeContribution: (id: string) => void;
  getContribution: (id: string) => Contribution | undefined;
  getContributionsForPlan: (planId: string) => Contribution[];
  getContributionsForChild: (planId: string, childId: string) => Contribution[];

  // CLB Override CRUD
  addCLBOverride: (clbOverride: Omit<CLBOverride, 'id'>) => string;
  updateCLBOverride: (id: string, updates: Partial<CLBOverride>) => void;
  removeCLBOverride: (id: string) => void;
  getCLBOverride: (id: string) => CLBOverride | undefined;
  getCLBOverridesForChild: (planId: string, childId: string) => CLBOverride[];

  // Bulk operations
  setPlans: (plans: Plan[]) => void;
  setPlanChildren: (planChildren: PlanChild[]) => void;
  setContributions: (contributions: Contribution[]) => void;
  setCLBOverrides: (clbOverrides: CLBOverride[]) => void;
  clearPlans: () => void;
}

export const usePlansStore = create<PlansState>()(
  persist(
    (set, get) => ({
      plans: [],
      planChildren: [],
      contributions: [],
      clbOverrides: [],

      // Plan CRUD
      addPlan: (planData) => {
        const id = uuid();
        const now = new Date().toISOString();
        const newPlan: Plan = {
          ...planData,
          id,
          disabled: false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ plans: [...state.plans, newPlan] }));
        return id;
      },

      updatePlan: (id, updates) => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === id ? { ...plan, ...updates, updatedAt: new Date().toISOString() } : plan
          ),
        }));
      },

      togglePlanDisabled: (id) => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === id
              ? { ...plan, disabled: !plan.disabled, updatedAt: new Date().toISOString() }
              : plan
          ),
        }));
      },

      removePlan: (id) => {
        set((state) => ({
          plans: state.plans.filter((plan) => plan.id !== id),
          planChildren: state.planChildren.filter((pc) => pc.planId !== id),
          contributions: state.contributions.filter((c) => c.planId !== id),
          clbOverrides: state.clbOverrides.filter((c) => c.planId !== id),
        }));
      },

      getPlan: (id) => get().plans.find((plan) => plan.id === id),

      // PlanChild operations
      addPlanChild: (planChild) => {
        set((state) => ({
          planChildren: [
            ...state.planChildren,
            { ...planChild, catchUpYears: planChild.catchUpYears ?? [] },
          ],
        }));
      },

      updatePlanChild: (planId, childId, updates) => {
        set((state) => ({
          planChildren: state.planChildren.map((pc) =>
            pc.planId === planId && pc.childId === childId ? { ...pc, ...updates } : pc
          ),
        }));
      },

      removePlanChild: (planId, childId) => {
        set((state) => ({
          planChildren: state.planChildren.filter(
            (pc) => !(pc.planId === planId && pc.childId === childId)
          ),
          contributions: state.contributions.filter(
            (c) => !(c.planId === planId && c.childId === childId)
          ),
          clbOverrides: state.clbOverrides.filter(
            (c) => !(c.planId === planId && c.childId === childId)
          ),
        }));
      },

      getPlanChildren: (planId) => get().planChildren.filter((pc) => pc.planId === planId),

      // Contribution CRUD
      addContribution: (contributionData) => {
        const id = uuid();
        const newContribution: Contribution = {
          ...contributionData,
          id,
        };
        set((state) => ({
          contributions: [...state.contributions, newContribution],
        }));
        return id;
      },

      updateContribution: (id, updates) => {
        set((state) => ({
          contributions: state.contributions.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      removeContribution: (id) => {
        set((state) => ({
          contributions: state.contributions.filter((c) => c.id !== id),
        }));
      },

      getContribution: (id) => get().contributions.find((c) => c.id === id),

      getContributionsForPlan: (planId) => get().contributions.filter((c) => c.planId === planId),

      getContributionsForChild: (planId, childId) =>
        get().contributions.filter((c) => c.planId === planId && c.childId === childId),

      // CLB Override CRUD
      addCLBOverride: (clbOverrideData) => {
        const id = uuid();
        const newCLBOverride: CLBOverride = {
          ...clbOverrideData,
          id,
        };
        set((state) => ({
          clbOverrides: [...state.clbOverrides, newCLBOverride],
        }));
        return id;
      },

      updateCLBOverride: (id, updates) => {
        set((state) => ({
          clbOverrides: state.clbOverrides.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      removeCLBOverride: (id) => {
        set((state) => ({
          clbOverrides: state.clbOverrides.filter((c) => c.id !== id),
        }));
      },

      getCLBOverride: (id) => get().clbOverrides.find((c) => c.id === id),

      getCLBOverridesForChild: (planId, childId) =>
        get().clbOverrides.filter((c) => c.planId === planId && c.childId === childId),

      // Bulk operations
      setPlans: (plans) => set({ plans }),
      setPlanChildren: (planChildren) => set({ planChildren }),
      setContributions: (contributions) => set({ contributions }),
      setCLBOverrides: (clbOverrides) => set({ clbOverrides }),
      clearPlans: () => set({ plans: [], planChildren: [], contributions: [], clbOverrides: [] }),
    }),
    {
      name: STORAGE_KEYS.plans,
    }
  )
);
