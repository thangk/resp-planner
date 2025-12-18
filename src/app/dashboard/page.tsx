'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  PieChart,
  FileText,
  ArrowRight,
  Sparkles,
  TrendingUp,
  DollarSign,
  Gift,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useChildrenStore } from '@/stores/children-store';
import { usePlansStore } from '@/stores/plans-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { useIncomeStore } from '@/stores/income-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useMounted } from '@/hooks/use-mounted';
import { formatCurrency } from '@/lib/utils';
import { calculateProjection } from '@/features/plans/utils/projection-calculator';
import { generateContributionSchedule } from '@/features/grants/utils/grant-calculator';
import { RESP_RULES } from '@/lib/constants';

export default function DashboardPage() {
  const mounted = useMounted();
  const { children, getChild } = useChildrenStore();
  const { plans, getContributionsForChild } = usePlansStore();
  const { etfs, isAllocationValid, getBlendedReturn } = usePortfolioStore();
  const { incomeYears } = useIncomeStore();
  const { hasCompletedWizard } = useSettingsStore();

  const blendedReturn = getBlendedReturn();

  // Filter out disabled plans for calculations
  const activePlans = useMemo(() => plans.filter((plan) => !plan.disabled), [plans]);

  // Calculate aggregated projections across all active plans
  const aggregatedStats = useMemo(() => {
    if (activePlans.length === 0) {
      return {
        totalProjectedValue: 0,
        totalContributions: 0,
        totalGrants: 0,
        totalGrowth: 0,
        grantUtilization: 0,
      };
    }

    let totalProjectedValue = 0;
    let totalContributions = 0;
    let totalGrants = 0;

    activePlans.forEach((plan) => {
      plan.childIds.forEach((childId) => {
        const child = getChild(childId);
        if (!child) return;

        const contributions = getContributionsForChild(plan.id, childId);
        const contributionsMap = new Map(contributions.map((c) => [c.year, c.amount]));
        const schedule = generateContributionSchedule(child, incomeYears, contributionsMap);

        const projection = calculateProjection({
          schedule,
          projectionRate: plan.projectionRate,
          customRate: plan.customRate ?? undefined,
          inflationAdjusted: plan.inflationAdjusted,
          childName: child.name,
          blendedReturn,
        });

        if (projection) {
          totalProjectedValue += projection.finalBalance;
          totalContributions += projection.totalContributions;
          totalGrants += projection.totalGrants;
        }
      });
    });

    const totalGrowth = totalProjectedValue - totalContributions - totalGrants;
    const maxPossibleGrants = children.length * RESP_RULES.CESG_LIFETIME_MAX;
    const grantUtilization = maxPossibleGrants > 0 ? (totalGrants / maxPossibleGrants) * 100 : 0;

    return {
      totalProjectedValue,
      totalContributions,
      totalGrants,
      totalGrowth,
      grantUtilization: Math.min(grantUtilization, 100),
    };
  }, [activePlans, children, getChild, getContributionsForChild, incomeYears, blendedReturn]);

  if (!mounted) {
    return <DashboardSkeleton />;
  }

  // Show welcome state for new users
  if (!hasCompletedWizard && children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to RESP Planner</h1>
          <p className="text-muted-foreground">
            Plan and optimize your children&apos;s education savings.
          </p>
        </div>

        {/* Quick Start Wizard CTA */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Sparkles className="text-primary mb-4 h-12 w-12" />
            <h2 className="mb-2 text-xl font-semibold">Quick Start Wizard</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get set up in minutes. We&apos;ll guide you through adding children, configuring your
              portfolio, and creating your first RESP contribution plan.
            </p>
            <Button size="lg" asChild>
              <Link href="/wizard">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Wizard
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Manual Setup Option */}
        <Card>
          <CardHeader>
            <CardTitle>Or Set Up Manually</CardTitle>
            <CardDescription>Configure each section individually if you prefer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/children">
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                  <CardHeader className="pb-2">
                    <Users className="text-primary h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold">Add Children</h3>
                    <p className="text-muted-foreground text-sm">
                      Start by adding your children&apos;s information
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/portfolio">
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                  <CardHeader className="pb-2">
                    <PieChart className="text-primary h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold">Set Up Portfolio</h3>
                    <p className="text-muted-foreground text-sm">
                      Configure your investment allocation
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/plans/new">
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                  <CardHeader className="pb-2">
                    <FileText className="text-primary h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold">Create a Plan</h3>
                    <p className="text-muted-foreground text-sm">
                      Build your contribution strategy
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your RESP planning progress.</p>
        </div>
        <Button asChild>
          <Link href="/plans/new">
            <Plus className="mr-2 h-4 w-4" />
            New Plan
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projected Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activePlans.length > 0 ? formatCurrency(aggregatedStats.totalProjectedValue) : '--'}
            </div>
            <p className="text-muted-foreground text-xs">
              {activePlans.length > 0
                ? `${formatCurrency(aggregatedStats.totalGrowth)} in growth`
                : 'Create a plan to see projections'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activePlans.length > 0 ? formatCurrency(aggregatedStats.totalContributions) : '--'}
            </div>
            <p className="text-muted-foreground text-xs">
              {activePlans.length > 0
                ? `Across ${activePlans.length} active ${activePlans.length === 1 ? 'plan' : 'plans'}`
                : 'Your contributions to date'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grants</CardTitle>
            <Gift className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {activePlans.length > 0 ? formatCurrency(aggregatedStats.totalGrants) : '--'}
            </div>
            {activePlans.length > 0 && children.length > 0 && (
              <div className="mt-2">
                <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                  <span>Grant utilization</span>
                  <span>{Math.round(aggregatedStats.grantUtilization)}%</span>
                </div>
                <Progress value={aggregatedStats.grantUtilization} className="h-1.5" />
              </div>
            )}
            {(activePlans.length === 0 || children.length === 0) && (
              <p className="text-muted-foreground text-xs">CESG, ACESG, CLB grants</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">{children.length}</span>
                <span className="text-muted-foreground text-xs">
                  {children.length === 1 ? 'child' : 'children'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">{activePlans.length}</span>
                <span className="text-muted-foreground text-xs">
                  active {activePlans.length === 1 ? 'plan' : 'plans'}
                  {plans.length > activePlans.length && (
                    <span className="text-muted-foreground/60">
                      {' '}
                      ({plans.length - activePlans.length} disabled)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PieChart className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">{etfs.length}</span>
                <span className="text-muted-foreground text-xs">
                  {etfs.length === 1 ? 'ETF' : 'ETFs'}
                  {etfs.length > 0 && !isAllocationValid() && (
                    <span className="ml-1 text-amber-500">(needs adjustment)</span>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/children">
                Manage Children
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/portfolio">
                View Portfolio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/plans">
                View All Plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Plans</CardTitle>
          </CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No plans yet. Create your first plan to start tracking contributions.
              </p>
            ) : (
              <div className="space-y-2">
                {plans.slice(0, 3).map((plan) => (
                  <Link
                    key={plan.id}
                    href={`/plans/${plan.id}`}
                    className={`hover:bg-muted block rounded-md p-2 transition-colors ${plan.disabled ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{plan.name}</span>
                      {plan.disabled && (
                        <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {plan.childIds.length} {plan.childIds.length === 1 ? 'child' : 'children'}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
