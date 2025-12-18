'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { usePlansStore } from '@/stores/plans-store';
import { useChildrenStore } from '@/stores/children-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { useMounted } from '@/hooks/use-mounted';
import { planSchema, type PlanFormData } from '@/lib/validators';
import { getDynamicProjectionRates } from '@/lib/projection-rates';
import type { ProjectionRate } from '@/types';

export default function NewPlanPage() {
  const router = useRouter();
  const mounted = useMounted();
  const { addPlan } = usePlansStore();
  const { children } = useChildrenStore();
  const { getBlendedReturn } = usePortfolioStore();

  const blendedReturn = getBlendedReturn();
  const projectionRates = useMemo(() => getDynamicProjectionRates(blendedReturn), [blendedReturn]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      childIds: [],
      projectionRate: 'conservative',
      inflationAdjusted: true,
      optimizeForGrowth: true,
    },
  });

  const selectedChildIds = watch('childIds');
  const projectionRate = watch('projectionRate');

  const handleChildToggle = (childId: string, checked: boolean) => {
    const current = selectedChildIds || [];
    if (checked) {
      setValue('childIds', [...current, childId], { shouldValidate: true });
    } else {
      setValue(
        'childIds',
        current.filter((id) => id !== childId),
        { shouldValidate: true }
      );
    }
  };

  const onSubmit = (data: PlanFormData) => {
    const planId = addPlan({
      name: data.name,
      description: data.description,
      childIds: data.childIds,
      projectionRate: data.projectionRate,
      customRate: data.customRate,
      inflationAdjusted: data.inflationAdjusted,
      optimizeForGrowth: data.optimizeForGrowth,
    });
    toast.success('Plan created successfully');
    router.push(`/plans/${planId}`);
  };

  if (!mounted) {
    return null;
  }

  // No children - show message
  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/plans">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Plan</h1>
            <p className="text-muted-foreground">Create a new contribution plan.</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="text-muted-foreground h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No children added yet</h3>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              You need to add children before creating a contribution plan.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/children">Add Children</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/plans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Plan</h1>
          <p className="text-muted-foreground">Create a new contribution plan.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Plan Details
            </CardTitle>
            <CardDescription>Give your plan a name and description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                placeholder="e.g., Aggressive Growth Strategy"
                {...register('name')}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe this plan's strategy..."
                {...register('description')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Children Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Children</CardTitle>
            <CardDescription>Choose which children this plan applies to.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {children.map((child) => (
                <div key={child.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`child-${child.id}`}
                    checked={selectedChildIds?.includes(child.id) || false}
                    onCheckedChange={(checked) => handleChildToggle(child.id, checked as boolean)}
                  />
                  <Label htmlFor={`child-${child.id}`} className="cursor-pointer">
                    {child.name}
                    <span className="text-muted-foreground ml-2 text-sm">
                      (Born {new Date(child.dateOfBirth).getFullYear()})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
            {errors.childIds && (
              <p className="text-destructive mt-2 text-sm">{errors.childIds.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Projection Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Projection Settings</CardTitle>
            <CardDescription>Configure how returns are projected.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Return Rate</Label>
              <Select
                value={projectionRate}
                onValueChange={(value) =>
                  setValue('projectionRate', value as ProjectionRate, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
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

            {projectionRate === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="customRate">Custom Rate (%)</Label>
                <Input
                  id="customRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  placeholder="e.g., 6.5"
                  {...register('customRate', { valueAsNumber: true })}
                />
                {errors.customRate && (
                  <p className="text-destructive text-sm">{errors.customRate.message}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Inflation Adjusted</Label>
                <p className="text-muted-foreground text-xs">
                  Show projections in today&apos;s dollars
                </p>
              </div>
              <Switch
                checked={watch('inflationAdjusted')}
                onCheckedChange={(checked) => setValue('inflationAdjusted', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Optimize for Growth</Label>
                <p className="text-muted-foreground text-xs">
                  Front-load contributions for maximum compounding
                </p>
              </div>
              <Switch
                checked={watch('optimizeForGrowth')}
                onCheckedChange={(checked) => setValue('optimizeForGrowth', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/plans">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Create Plan
          </Button>
        </div>
      </form>
    </div>
  );
}
