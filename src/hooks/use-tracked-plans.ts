'use client';

import { usePlansStore } from '@/stores/plans-store';
import { useHistoryStore } from '@/stores/history-store';
import type { Plan, Contribution } from '@/types';

/**
 * Hook that wraps plan operations with undo/redo history tracking
 */
export function useTrackedPlans() {
  const plansStore = usePlansStore();
  const { pushHistory } = useHistoryStore();

  const updateContributionWithHistory = (
    id: string,
    updates: Partial<Contribution>,
    description?: string
  ) => {
    const currentContribution = plansStore.getContribution(id);
    if (!currentContribution) return;

    const previousState = { ...currentContribution };

    plansStore.updateContribution(id, updates);

    pushHistory({
      description: description || 'Update contribution',
      undo: () => plansStore.updateContribution(id, previousState),
      redo: () => plansStore.updateContribution(id, { ...previousState, ...updates }),
    });
  };

  const updatePlanWithHistory = (id: string, updates: Partial<Plan>, description?: string) => {
    const currentPlan = plansStore.getPlan(id);
    if (!currentPlan) return;

    const previousState = { ...currentPlan };

    plansStore.updatePlan(id, updates);

    pushHistory({
      description: description || 'Update plan',
      undo: () => plansStore.updatePlan(id, previousState),
      redo: () => plansStore.updatePlan(id, { ...previousState, ...updates }),
    });
  };

  const addContributionWithHistory = (
    contribution: Omit<Contribution, 'id'>,
    description?: string
  ) => {
    const id = plansStore.addContribution(contribution);

    pushHistory({
      description: description || 'Add contribution',
      undo: () => plansStore.removeContribution(id),
      redo: () => {
        plansStore.addContribution({ ...contribution, id } as Contribution);
      },
    });

    return id;
  };

  const removeContributionWithHistory = (id: string, description?: string) => {
    const contribution = plansStore.getContribution(id);
    if (!contribution) return;

    const savedContribution = { ...contribution };

    plansStore.removeContribution(id);

    pushHistory({
      description: description || 'Remove contribution',
      undo: () => {
        // Re-add the contribution with the same ID
        const { id: savedId, ...rest } = savedContribution;
        plansStore.addContribution(rest);
        // Update the ID to match the original
        const contributions = plansStore.contributions;
        const newContrib = contributions[contributions.length - 1];
        if (newContrib) {
          plansStore.setContributions([
            ...contributions.slice(0, -1),
            { ...newContrib, id: savedId },
          ]);
        }
      },
      redo: () => plansStore.removeContribution(id),
    });
  };

  const removePlanWithHistory = (id: string, description?: string) => {
    const plan = plansStore.getPlan(id);
    if (!plan) return;

    const savedPlan = { ...plan };
    const savedPlanChildren = plansStore.getPlanChildren(id);
    const savedContributions = plansStore.getContributionsForPlan(id);

    plansStore.removePlan(id);

    pushHistory({
      description: description || `Delete plan "${plan.name}"`,
      undo: () => {
        // Re-add plan
        const { id: planId, createdAt, updatedAt, ...planData } = savedPlan;
        const newId = plansStore.addPlan(planData);
        // Update with original ID
        const plans = plansStore.plans;
        const newPlan = plans.find((p) => p.id === newId);
        if (newPlan) {
          plansStore.setPlans([
            ...plans.filter((p) => p.id !== newId),
            { ...newPlan, id: planId, createdAt, updatedAt },
          ]);
        }
        // Re-add plan children
        savedPlanChildren.forEach((pc) => plansStore.addPlanChild(pc));
        // Re-add contributions
        plansStore.setContributions([...plansStore.contributions, ...savedContributions]);
      },
      redo: () => plansStore.removePlan(id),
    });
  };

  return {
    ...plansStore,
    updateContributionWithHistory,
    updatePlanWithHistory,
    addContributionWithHistory,
    removeContributionWithHistory,
    removePlanWithHistory,
  };
}
