'use client';

import { use, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, TrendingUp, AlertCircle, Calculator, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ContributionSchedule } from '@/components/plans/contribution-schedule';
import { YearConstraints } from '@/components/plans/year-constraints';
import { FrontloadSelector } from '@/components/plans/frontload-selector';
import { CatchUpYearSelector } from '@/components/plans/catch-up-year-selector';
import { PlanForm } from '@/components/plans/plan-form';
import { ProjectionChart } from '@/components/plans/projection-chart';
import { PrintView } from '@/components/shared/print-view';
import { usePlansStore } from '@/stores/plans-store';
import { useChildrenStore } from '@/stores/children-store';
import { useIncomeStore } from '@/stores/income-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { useMounted } from '@/hooks/use-mounted';
import { useTrackedPlans } from '@/hooks/use-tracked-plans';
import { getProjectionRateValue } from '@/lib/projection-rates';
import {
  generateOptimizedSchedule,
  recalculateFrontloadAmount,
  type OptimizedContribution,
} from '@/features/plans/utils/contribution-optimizer';
import { calculateProjection } from '@/features/plans/utils/projection-calculator';
import { generateContributionSchedule } from '@/features/grants/utils/grant-calculator';
import type { YearConstraint } from '@/types';
import type { PlanFormData } from '@/lib/validators';

interface PlanPageProps {
  params: Promise<{ id: string }>;
}

export default function PlanPage({ params }: PlanPageProps) {
  const { id } = use(params);
  const mounted = useMounted();
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [constraints, setConstraints] = useState<YearConstraint[]>([]);
  const [showPrintView, setShowPrintView] = useState(false);
  // Store the last generated optimized schedule for each child (for frontload recalculation)
  const [optimizedSchedules, setOptimizedSchedules] = useState<
    Record<string, OptimizedContribution[]>
  >({});
  // Track if locked rows have been manually changed (per child) - indicates need to regenerate
  const [needsRegeneration, setNeedsRegeneration] = useState<Record<string, boolean>>({});

  // Stores
  const {
    getPlan,
    getContributionsForChild,
    addContribution,
    getPlanChildren,
    addPlanChild,
    updatePlanChild,
    getCLBOverridesForChild,
    addCLBOverride,
    updateCLBOverride,
  } = usePlansStore();
  const { updateContributionWithHistory, updatePlanWithHistory } = useTrackedPlans();
  const { getChild } = useChildrenStore();
  const { incomeYears } = useIncomeStore();
  const { getBlendedReturn } = usePortfolioStore();

  const plan = getPlan(id);
  const blendedReturn = getBlendedReturn();

  // Get plan children settings
  const planChildrenSettings = getPlanChildren(id);

  // Get children in this plan
  const planChildren = useMemo(() => {
    if (!plan) return [];
    return plan.childIds.map((childId) => getChild(childId)).filter(Boolean);
  }, [plan, getChild]);

  // Sort children by age (oldest first - smallest birth year first)
  const sortedPlanChildren = useMemo(() => {
    return [...planChildren].sort((a, b) => {
      if (!a || !b) return 0;
      const birthYearA = new Date(a.dateOfBirth).getFullYear();
      const birthYearB = new Date(b.dateOfBirth).getFullYear();
      return birthYearA - birthYearB; // Oldest (smaller year) first
    });
  }, [planChildren]);

  // Calculate current year range
  const currentYear = new Date().getFullYear();
  const endYear = useMemo(() => {
    if (planChildren.length === 0) return currentYear + 17;
    const youngestChild = planChildren.reduce((youngest, child) => {
      if (!child) return youngest;
      const birthYear = new Date(child.dateOfBirth).getFullYear();
      return !youngest || birthYear > new Date(youngest.dateOfBirth).getFullYear()
        ? child
        : youngest;
    }, planChildren[0]);
    if (!youngestChild) return currentYear + 17;
    return new Date(youngestChild.dateOfBirth).getFullYear() + 17;
  }, [planChildren, currentYear]);

  // Handle contribution change for a child
  const handleContributionChange = useCallback(
    (
      childId: string,
      year: number,
      amount: number,
      isLocked: boolean,
      skipFrontloadRecalc = false
    ) => {
      const existingContributions = getContributionsForChild(id, childId);
      const existing = existingContributions.find((c) => c.year === year);

      if (existing) {
        // Use history-tracked version for edits
        updateContributionWithHistory(
          existing.id,
          { amount, isLocked },
          `Update ${year} contribution to $${amount.toLocaleString()}`
        );
      } else {
        addContribution({
          planId: id,
          childId,
          year,
          amount,
          isLocked,
          note: null,
        });
      }

      // Check if we need to recalculate the frontload year
      if (!skipFrontloadRecalc) {
        const child = getChild(childId);
        const planChildSettings = planChildrenSettings.find(
          (pc) => pc.planId === id && pc.childId === childId
        );
        const frontloadYear = planChildSettings?.frontloadYear;
        const optimizedSchedule = optimizedSchedules[childId];

        if (child && frontloadYear && optimizedSchedule && year !== frontloadYear) {
          // Build contributions map including the new change
          const contributionsMap = new Map<number, number>();
          existingContributions.forEach((c) => {
            contributionsMap.set(c.year, c.amount);
          });
          contributionsMap.set(year, amount); // Add/update the changed year

          const newFrontloadAmount = recalculateFrontloadAmount({
            child,
            contributions: contributionsMap,
            frontloadYear,
            optimizedSchedule,
            changedYear: year,
            newAmount: amount,
          });

          if (newFrontloadAmount !== null) {
            // Update the frontload year contribution
            const frontloadContribution = existingContributions.find(
              (c) => c.year === frontloadYear
            );
            if (frontloadContribution) {
              updateContributionWithHistory(
                frontloadContribution.id,
                { amount: newFrontloadAmount },
                `Auto-adjusted ${frontloadYear} frontload to $${newFrontloadAmount.toLocaleString()}`
              );
            } else {
              addContribution({
                planId: id,
                childId,
                year: frontloadYear,
                amount: newFrontloadAmount,
                isLocked: false,
                note: null,
              });
            }
          }
        }
      }
    },
    [
      id,
      getContributionsForChild,
      updateContributionWithHistory,
      addContribution,
      getChild,
      planChildrenSettings,
      optimizedSchedules,
    ]
  );

  // Handle CLB override change for a child
  const handleCLBChange = useCallback(
    (childId: string, year: number, amount: number, isLocked: boolean) => {
      const existingOverrides = getCLBOverridesForChild(id, childId);
      const existing = existingOverrides.find((c) => c.year === year);

      if (existing) {
        updateCLBOverride(existing.id, { amount, isLocked });
      } else {
        addCLBOverride({
          planId: id,
          childId,
          year,
          amount,
          isLocked,
        });
      }
    },
    [id, getCLBOverridesForChild, updateCLBOverride, addCLBOverride]
  );

  // Handle frontload year change
  const handleFrontloadChange = useCallback(
    (childId: string, frontloadYear: number | null) => {
      const existing = planChildrenSettings.find(
        (pc) => pc.planId === id && pc.childId === childId
      );

      if (existing) {
        // If the new frontload year is in catch-up years, remove it
        const updatedCatchUpYears = frontloadYear
          ? (existing.catchUpYears || []).filter((y) => y !== frontloadYear)
          : existing.catchUpYears || [];

        updatePlanChild(id, childId, {
          frontloadYear,
          catchUpYears: updatedCatchUpYears,
        });

        // If we removed a catch-up year, adjust the contribution back to $2500
        if (frontloadYear && existing.catchUpYears?.includes(frontloadYear)) {
          const existingContrib = getContributionsForChild(id, childId).find(
            (c) => c.year === frontloadYear
          );
          if (existingContrib && existingContrib.amount === 5000) {
            handleContributionChange(childId, frontloadYear, 2500, existingContrib.isLocked, true);
          }
        }
      } else {
        addPlanChild({
          planId: id,
          childId,
          frontloadYear,
          catchUpYears: [],
        });
      }
    },
    [
      id,
      planChildrenSettings,
      updatePlanChild,
      addPlanChild,
      getContributionsForChild,
      handleContributionChange,
    ]
  );

  // Handle catch-up years change
  const handleCatchUpYearsChange = useCallback(
    (childId: string, catchUpYears: number[]) => {
      const existing = planChildrenSettings.find(
        (pc) => pc.planId === id && pc.childId === childId
      );

      const existingContributions = getContributionsForChild(id, childId);
      const thisYear = new Date().getFullYear();
      const catchUpYearsSet = new Set(catchUpYears);
      const previousCatchUpYears = existing?.catchUpYears || [];
      const previousCatchUpSet = new Set(previousCatchUpYears);

      // Calculate current total contributions
      const currentTotal = existingContributions.reduce((sum, c) => sum + c.amount, 0);

      // Calculate projected change from catch-up year modifications
      // Add $2500 for each NEW catch-up year (upgrading from $2500 to $5000)
      // Subtract $2500 for each REMOVED catch-up year (downgrading from $5000 to $2500)
      let delta = 0;

      catchUpYears.forEach((year) => {
        if (!previousCatchUpSet.has(year)) {
          // New catch-up year - check if contribution exists
          const existingContrib = existingContributions.find((c) => c.year === year);
          const currentAmount = existingContrib?.amount || 2500; // Assume $2500 if new
          delta += 5000 - currentAmount;
        }
      });

      previousCatchUpYears.forEach((year) => {
        if (!catchUpYearsSet.has(year)) {
          // Removed catch-up year
          const existingContrib = existingContributions.find((c) => c.year === year);
          if (existingContrib?.amount === 5000) {
            delta -= 2500; // Will be reduced from $5000 to $2500
          }
        }
      });

      const projectedTotal = currentTotal + delta;
      const LIFETIME_LIMIT = 50000;

      // Check if this would exceed the lifetime limit
      if (projectedTotal > LIFETIME_LIMIT) {
        toast.error(
          `Cannot add catch-up year: would exceed $50,000 lifetime limit (projected: $${projectedTotal.toLocaleString()})`,
          { description: 'Remove some contributions or catch-up years first.' }
        );
        return;
      }

      if (existing) {
        updatePlanChild(id, childId, { catchUpYears });
      } else {
        addPlanChild({
          planId: id,
          childId,
          frontloadYear: null,
          catchUpYears,
        });
      }

      // For each year, set the appropriate contribution amount
      catchUpYears.forEach((year) => {
        const existingContrib = existingContributions.find((c) => c.year === year);
        if (existingContrib) {
          // Update to $5000 if not already
          if (existingContrib.amount < 5000) {
            handleContributionChange(childId, year, 5000, existingContrib.isLocked, true);
          }
        } else {
          // Add new contribution at $5000
          handleContributionChange(childId, year, 5000, false, true);
        }
      });

      // For years that were removed from catch-up, set back to $2500
      existingContributions.forEach((contrib) => {
        if (
          contrib.year >= thisYear &&
          contrib.amount === 5000 &&
          !catchUpYearsSet.has(contrib.year)
        ) {
          handleContributionChange(childId, contrib.year, 2500, contrib.isLocked, true);
        }
      });
    },
    [
      id,
      planChildrenSettings,
      updatePlanChild,
      addPlanChild,
      getContributionsForChild,
      handleContributionChange,
    ]
  );

  // Generate optimized schedule for a child
  const generateScheduleForChild = useCallback(
    (childId: string) => {
      const child = getChild(childId);
      if (!child || !plan) return;

      const planChildSettings = planChildrenSettings.find(
        (pc) => pc.planId === id && pc.childId === childId
      );

      // Get existing contributions to check for locked years
      const existingContributions = getContributionsForChild(id, childId);
      const lockedContributions = existingContributions.filter((c) => c.isLocked);

      // Build constraints from locked contributions (they should not be changed)
      const lockedConstraints: YearConstraint[] = lockedContributions.map((c) => ({
        startYear: c.year,
        endYear: c.year,
        maxContribution: c.amount,
        reason: 'locked',
      }));

      // Merge with user-defined constraints
      const allConstraints = [...constraints, ...lockedConstraints];

      const schedule = generateOptimizedSchedule({
        child,
        incomeYears,
        constraints: allConstraints,
        frontloadYear: planChildSettings?.frontloadYear || null,
        optimizeForGrowth: plan.optimizeForGrowth,
        startYear: currentYear,
        catchUpYears: planChildSettings?.catchUpYears || [],
      });

      // Store the optimized schedule for frontload recalculation
      setOptimizedSchedules((prev) => ({
        ...prev,
        [childId]: schedule,
      }));

      // Save the optimized contributions (skip locked years, skip frontload recalc)
      schedule.forEach((item) => {
        // Skip locked years - they should not be modified
        const isYearLocked = lockedContributions.some((c) => c.year === item.year);
        if (!isYearLocked) {
          handleContributionChange(childId, item.year, item.amount, item.isLocked, true);
        }
      });

      // Reset needsRegeneration for this child since we just generated
      setNeedsRegeneration((prev) => ({ ...prev, [childId]: false }));

      const lockedCount = lockedContributions.length;
      const message =
        lockedCount > 0
          ? `Generated optimized schedule for ${child.name} (${lockedCount} locked year${lockedCount > 1 ? 's' : ''} preserved)`
          : `Generated optimized schedule for ${child.name}`;
      toast.success(message);
    },
    [
      id,
      plan,
      getChild,
      getContributionsForChild,
      planChildrenSettings,
      incomeYears,
      constraints,
      currentYear,
      handleContributionChange,
    ]
  );

  // Handle plan edit
  const handleUpdatePlan = (data: PlanFormData) => {
    updatePlanWithHistory(
      id,
      {
        name: data.name,
        description: data.description,
        childIds: data.childIds,
        projectionRate: data.projectionRate,
        customRate: data.customRate,
        inflationAdjusted: data.inflationAdjusted,
        optimizeForGrowth: data.optimizeForGrowth,
      },
      `Update plan "${data.name}" settings`
    );
    setEditFormOpen(false);
    toast.success('Plan updated successfully');
  };

  // Calculate projection for display
  const projections = useMemo(() => {
    if (!plan) return [];

    return planChildren
      .filter(Boolean)
      .map((child) => {
        if (!child) return null;
        const contributions = getContributionsForChild(id, child.id);
        const clbOverrides = getCLBOverridesForChild(id, child.id);
        const contributionsMap = new Map(contributions.map((c) => [c.year, c.amount]));

        // Generate the schedule with grant calculations
        const schedule = generateContributionSchedule(child, incomeYears, contributionsMap);

        // Apply CLB overrides to the schedule
        const scheduleWithOverrides = schedule.map((yearData) => {
          const clbOverride = clbOverrides.find((c) => c.year === yearData.year);
          if (clbOverride !== undefined) {
            const clbDiff = clbOverride.amount - yearData.clb;
            return {
              ...yearData,
              clb: clbOverride.amount,
              totalGrants: yearData.totalGrants + clbDiff,
            };
          }
          return yearData;
        });

        return calculateProjection({
          schedule: scheduleWithOverrides,
          projectionRate: plan.projectionRate,
          customRate: plan.customRate ?? undefined,
          inflationAdjusted: plan.inflationAdjusted,
          childName: child.name,
          blendedReturn,
        });
      })
      .filter(Boolean);
  }, [
    plan,
    planChildren,
    getContributionsForChild,
    getCLBOverridesForChild,
    id,
    incomeYears,
    blendedReturn,
  ]);

  if (!mounted) {
    return <PlanPageSkeleton />;
  }

  if (!plan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/plans">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Plan Not Found</h1>
            <p className="text-muted-foreground">This plan may have been deleted.</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="text-muted-foreground h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">Plan not found</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              The plan you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/plans">Back to Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rateValue = getProjectionRateValue(plan.projectionRate, plan.customRate, blendedReturn);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/plans">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{plan.name}</h1>
            {plan.description && (
              <p className="text-muted-foreground truncate text-sm sm:text-base">
                {plan.description}
              </p>
            )}
          </div>
        </div>
        <div className="ml-10 flex shrink-0 gap-2 sm:ml-0">
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            onClick={() => setShowPrintView(true)}
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden sm:inline-flex"
            onClick={() => setShowPrintView(true)}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            onClick={() => setEditFormOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden sm:inline-flex"
            onClick={() => setEditFormOpen(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Plan Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Projection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{rateValue}%</span>
              <Badge variant="secondary" className="ml-auto">
                {plan.projectionRate}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Children</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{planChildren.length}</span>
            <p className="text-muted-foreground text-sm">
              {planChildren.map((c) => c?.name).join(', ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Projected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('en-CA', {
                style: 'currency',
                currency: 'CAD',
                minimumFractionDigits: 0,
              }).format(projections.reduce((sum, p) => sum + (p?.finalBalance || 0), 0))}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {plan.optimizeForGrowth && (
                <Badge variant="outline" className="text-xs">
                  Growth
                </Badge>
              )}
              {plan.inflationAdjusted && (
                <Badge variant="outline" className="text-xs">
                  Inflation Adj.
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projection Chart */}
      {projections.length > 0 && projections.some((p) => p && p.projectionYears.length > 0) && (
        <ProjectionChart
          projections={projections.filter((p): p is NonNullable<typeof p> => p !== null)}
          showInflationAdjusted={plan.inflationAdjusted}
        />
      )}

      {/* Year Constraints */}
      <YearConstraints
        constraints={constraints}
        onChange={setConstraints}
        minYear={currentYear}
        maxYear={endYear}
      />

      {/* Child Tabs - sorted by age (oldest first) */}
      {sortedPlanChildren.length > 0 ? (
        <Tabs defaultValue={sortedPlanChildren[0]?.id} className="space-y-4">
          <TabsList>
            {sortedPlanChildren.map((child) =>
              child ? (
                <TabsTrigger key={child.id} value={child.id}>
                  {child.name}
                </TabsTrigger>
              ) : null
            )}
          </TabsList>

          {sortedPlanChildren.map((child) => {
            if (!child) return null;

            const childContributions = getContributionsForChild(id, child.id);
            const childCLBOverrides = getCLBOverridesForChild(id, child.id);
            const planChildSettings = planChildrenSettings.find(
              (pc) => pc.planId === id && pc.childId === child.id
            );
            const birthYear = new Date(child.dateOfBirth).getFullYear();
            const childEndYear = birthYear + 17;

            return (
              <TabsContent key={child.id} value={child.id} className="space-y-4">
                {/* Catch-Up Year Selector */}
                {child.catchUpYearsEnabled && child.catchUpYearsAvailable > 0 && (
                  <CatchUpYearSelector
                    child={child}
                    selectedYears={planChildSettings?.catchUpYears || []}
                    onChange={(years) => handleCatchUpYearsChange(child.id, years)}
                    minYear={currentYear}
                    maxYear={childEndYear}
                    frontloadYear={planChildSettings?.frontloadYear}
                  />
                )}

                {/* Frontload Selector and Quick Actions */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <FrontloadSelector
                    child={child}
                    value={planChildSettings?.frontloadYear || null}
                    onChange={(year) => handleFrontloadChange(child.id, year)}
                    minYear={currentYear}
                    maxYear={childEndYear}
                    catchUpYears={planChildSettings?.catchUpYears || []}
                  />

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quick Actions</CardTitle>
                      <CardDescription>
                        Generate an optimized contribution schedule.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant={needsRegeneration[child.id] ? 'outline' : 'default'}
                        onClick={() => generateScheduleForChild(child.id)}
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Generate Optimal Schedule
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Contribution Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contribution Schedule</CardTitle>
                    <CardDescription>
                      Year-by-year contributions and projected grants for {child.name}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContributionSchedule
                      child={child}
                      contributions={childContributions}
                      incomeYears={incomeYears}
                      frontloadYear={planChildSettings?.frontloadYear}
                      catchUpYears={planChildSettings?.catchUpYears || []}
                      projectionRate={rateValue / 100}
                      onContributionChange={(year, amount, isLocked) =>
                        handleContributionChange(child.id, year, amount, isLocked)
                      }
                      onLockedRowChanged={() =>
                        setNeedsRegeneration((prev) => ({ ...prev, [child.id]: true }))
                      }
                      clbOverrides={childCLBOverrides}
                      onCLBChange={(year, amount, isLocked) =>
                        handleCLBChange(child.id, year, amount, isLocked)
                      }
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="text-muted-foreground h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No children in plan</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Add children to this plan to create contribution schedules.
            </p>
            <Button className="mt-4" onClick={() => setEditFormOpen(true)}>
              Edit Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Form Dialog */}
      <PlanForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        onSubmit={handleUpdatePlan}
        plan={plan}
      />

      {/* Print View Dialog */}
      {showPrintView && (
        <PrintView planId={id} open={showPrintView} onClose={() => setShowPrintView(false)} />
      )}
    </div>
  );
}

function PlanPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}
