'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { planSchema, type PlanFormData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useChildrenStore } from '@/stores/children-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { getDynamicProjectionRates } from '@/lib/projection-rates';
import type { Plan, Child } from '@/types';

interface PlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PlanFormData) => void;
  plan?: Plan | null;
}

export function PlanForm({ open, onOpenChange, onSubmit, plan }: PlanFormProps) {
  const { children } = useChildrenStore();
  const { getBlendedReturn } = usePortfolioStore();

  // Get dynamic projection rates based on portfolio
  const blendedReturn = getBlendedReturn();
  const projectionRates = useMemo(() => getDynamicProjectionRates(blendedReturn), [blendedReturn]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: null,
      childIds: [],
      projectionRate: 'moderate',
      customRate: null,
      inflationAdjusted: false,
      optimizeForGrowth: true,
    },
  });

  const watchProjectionRate = watch('projectionRate');
  const watchChildIds = watch('childIds');

  useEffect(() => {
    if (open) {
      if (plan) {
        reset({
          name: plan.name,
          description: plan.description,
          childIds: plan.childIds,
          projectionRate: plan.projectionRate,
          customRate: plan.customRate,
          inflationAdjusted: plan.inflationAdjusted,
          optimizeForGrowth: plan.optimizeForGrowth,
        });
      } else {
        reset({
          name: '',
          description: null,
          childIds: children.length === 1 ? [children[0].id] : [],
          projectionRate: 'moderate',
          customRate: null,
          inflationAdjusted: false,
          optimizeForGrowth: true,
        });
      }
    }
  }, [open, plan, reset, children]);

  const handleFormSubmit = (data: PlanFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  const toggleChild = (childId: string) => {
    const current = watchChildIds || [];
    if (current.includes(childId)) {
      setValue(
        'childIds',
        current.filter((id) => id !== childId)
      );
    } else {
      setValue('childIds', [...current, childId]);
    }
  };

  const getChildAge = (child: Child): number => {
    const dob = new Date(child.dateOfBirth);
    const today = new Date();
    return today.getFullYear() - dob.getFullYear();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        showCloseButton={false}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          setTimeout(() => {
            const firstInput = document.getElementById('plan-name');
            firstInput?.focus();
          }, 0);
        }}
      >
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          <DialogDescription>
            {plan
              ? 'Update your contribution plan settings.'
              : 'Create a new contribution plan for your children.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input
              id="plan-name"
              tabIndex={1}
              placeholder="e.g., Main Strategy"
              {...register('name')}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="plan-description">Description (Optional)</Label>
            <Textarea
              id="plan-description"
              tabIndex={2}
              placeholder="Notes about this plan..."
              rows={2}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description.message}</p>
            )}
          </div>

          {/* Children Selection */}
          <div className="space-y-2">
            <Label>Children</Label>
            {children.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No children added yet. Add children first to create a plan.
              </p>
            ) : (
              <div className="space-y-2 rounded-md border p-3">
                {children.map((child, index) => (
                  <div key={child.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`plan-child-${child.id}`}
                      tabIndex={3 + index}
                      checked={watchChildIds?.includes(child.id)}
                      onCheckedChange={() => toggleChild(child.id)}
                    />
                    <Label
                      htmlFor={`plan-child-${child.id}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {child.name}{' '}
                      <span className="text-muted-foreground">
                        ({getChildAge(child)} years old)
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {errors.childIds && (
              <p className="text-destructive text-sm">{errors.childIds.message}</p>
            )}
          </div>

          {/* Projection Rate */}
          <div className="space-y-2">
            <Label htmlFor="plan-projectionRate">Projection Rate</Label>
            <Select
              value={watchProjectionRate}
              onValueChange={(value) =>
                setValue('projectionRate', value as PlanFormData['projectionRate'])
              }
            >
              <SelectTrigger tabIndex={20} id="plan-projectionRate">
                <SelectValue placeholder="Select projection rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">
                  Conservative ({projectionRates.conservative}%)
                </SelectItem>
                <SelectItem value="moderate">Moderate ({projectionRates.moderate}%)</SelectItem>
                <SelectItem value="optimistic">
                  Optimistic ({projectionRates.optimistic}%)
                </SelectItem>
                <SelectItem value="custom">Custom Rate</SelectItem>
              </SelectContent>
            </Select>
            {blendedReturn > 0 && (
              <p className="text-muted-foreground text-xs">
                Based on your portfolio&apos;s {blendedReturn.toFixed(1)}% blended return
              </p>
            )}
          </div>

          {/* Custom Rate */}
          {watchProjectionRate === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="plan-customRate">Custom Rate (%)</Label>
              <Input
                id="plan-customRate"
                tabIndex={21}
                type="number"
                step="0.1"
                placeholder="e.g., 6.5"
                {...register('customRate', { valueAsNumber: true })}
              />
              {errors.customRate && (
                <p className="text-destructive text-sm">{errors.customRate.message}</p>
              )}
            </div>
          )}

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="plan-inflationAdjusted">Inflation Adjusted</Label>
                <p className="text-muted-foreground text-sm">
                  Show projections in today&apos;s dollars
                </p>
              </div>
              <Switch
                id="plan-inflationAdjusted"
                tabIndex={22}
                checked={watch('inflationAdjusted')}
                onCheckedChange={(checked) => setValue('inflationAdjusted', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="plan-optimizeForGrowth">Optimize for Growth</Label>
                <p className="text-muted-foreground text-sm">
                  Frontload contributions for maximum growth
                </p>
              </div>
              <Switch
                id="plan-optimizeForGrowth"
                tabIndex={23}
                checked={watch('optimizeForGrowth')}
                onCheckedChange={(checked) => setValue('optimizeForGrowth', checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              tabIndex={24}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || children.length === 0} tabIndex={25}>
              {plan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
