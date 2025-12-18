'use client';

import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlanCard } from './plan-card';
import { PlanForm } from './plan-form';
import { usePlansStore } from '@/stores/plans-store';
import { useChildrenStore } from '@/stores/children-store';
import type { Plan } from '@/types';
import type { PlanFormData } from '@/lib/validators';

export function PlanList() {
  const { plans, addPlan, updatePlan, removePlan, togglePlanDisabled } = usePlansStore();
  const { children } = useChildrenStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);

  const handleAddPlan = (data: PlanFormData) => {
    addPlan({
      name: data.name,
      description: data.description,
      childIds: data.childIds,
      projectionRate: data.projectionRate,
      customRate: data.customRate,
      inflationAdjusted: data.inflationAdjusted,
      optimizeForGrowth: data.optimizeForGrowth,
    });
    toast.success('Plan created successfully');
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  const handleUpdatePlan = (data: PlanFormData) => {
    if (!editingPlan) return;
    updatePlan(editingPlan.id, {
      name: data.name,
      description: data.description,
      childIds: data.childIds,
      projectionRate: data.projectionRate,
      customRate: data.customRate,
      inflationAdjusted: data.inflationAdjusted,
      optimizeForGrowth: data.optimizeForGrowth,
    });
    setEditingPlan(null);
    toast.success('Plan updated successfully');
  };

  const handleDeletePlan = (plan: Plan) => {
    setDeletingPlan(plan);
  };

  const confirmDelete = () => {
    if (!deletingPlan) return;
    removePlan(deletingPlan.id);
    setDeletingPlan(null);
    toast.success('Plan deleted');
  };

  const handleDuplicatePlan = (plan: Plan) => {
    addPlan({
      name: `${plan.name} (Copy)`,
      description: plan.description,
      childIds: plan.childIds,
      projectionRate: plan.projectionRate,
      customRate: plan.customRate,
      inflationAdjusted: plan.inflationAdjusted,
      optimizeForGrowth: plan.optimizeForGrowth,
    });
    toast.success('Plan duplicated');
  };

  const handleToggleDisabled = (plan: Plan) => {
    togglePlanDisabled(plan.id);
    toast.success(plan.disabled ? 'Plan enabled' : 'Plan disabled');
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans</h1>
          <p className="text-muted-foreground">View and manage your contribution plans.</p>
        </div>
        <Button onClick={() => setFormOpen(true)} disabled={children.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          New Plan
        </Button>
      </div>

      {children.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <FileText className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">No children added yet</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Add children first before creating contribution plans.
          </p>
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <FileText className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">No plans yet</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Create your first contribution plan to get started.
          </p>
          <Button className="mt-4" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEditPlan}
              onDelete={handleDeletePlan}
              onDuplicate={handleDuplicatePlan}
              onToggleDisabled={handleToggleDisabled}
            />
          ))}
        </div>
      )}

      {/* Plan Form Dialog */}
      <PlanForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onSubmit={editingPlan ? handleUpdatePlan : handleAddPlan}
        plan={editingPlan}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingPlan?.name}&quot;? This will remove all
              contribution schedules and projections for this plan. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
