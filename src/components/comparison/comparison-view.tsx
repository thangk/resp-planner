'use client';

import { useMemo } from 'react';
import { PlanSelector } from './plan-selector';
import { DiffTable, type ComparisonMetric } from './diff-table';
import { ComparisonChart } from './comparison-chart';
import { generateContributionSchedule } from '@/features/grants/utils/grant-calculator';
import { getDynamicProjectionRates } from '@/lib/projection-rates';
import { useChildrenStore } from '@/stores/children-store';
import { usePlansStore } from '@/stores/plans-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { useIncomeStore } from '@/stores/income-store';
import type { Plan, Child } from '@/types';

interface ComparisonViewProps {
  plans: Plan[];
  plan1Id: string | null;
  plan2Id: string | null;
  onPlan1Change: (planId: string) => void;
  onPlan2Change: (planId: string) => void;
}

interface PlanProjection {
  totalContributions: number;
  totalGrants: number;
  projectedGrowth: number;
  projectedTotal: number;
  yearlyData: { year: number; value: number }[];
}

function calculatePlanProjection(
  plan: Plan,
  children: Child[],
  contributions: Map<string, Map<number, number>>,
  incomeYears: { year: number; familyIncome: number }[],
  projectionRate: number
): PlanProjection {
  const planChildren = children.filter((c) => plan.childIds.includes(c.id));

  let totalContributions = 0;
  let totalGrants = 0;
  const yearlyTotals = new Map<number, { contributions: number; grants: number }>();

  // Calculate contributions and grants for each child
  for (const child of planChildren) {
    const childContributions = contributions.get(child.id) || new Map();
    const schedule = generateContributionSchedule(child, incomeYears, childContributions);

    for (const row of schedule) {
      totalContributions += row.contribution;
      totalGrants += row.totalGrants;

      const yearData = yearlyTotals.get(row.year) || { contributions: 0, grants: 0 };
      yearData.contributions += row.contribution;
      yearData.grants += row.totalGrants;
      yearlyTotals.set(row.year, yearData);
    }
  }

  // Calculate projected growth with compound interest
  const years = Array.from(yearlyTotals.keys()).sort((a, b) => a - b);
  if (years.length === 0) {
    return {
      totalContributions: 0,
      totalGrants: 0,
      projectedGrowth: 0,
      projectedTotal: 0,
      yearlyData: [],
    };
  }

  const startYear = Math.min(...years);
  const endYear = Math.max(...years);
  const yearlyData: { year: number; value: number }[] = [];

  let runningTotal = 0;
  for (let year = startYear; year <= endYear; year++) {
    // Add growth to existing total
    if (year > startYear) {
      runningTotal *= 1 + projectionRate / 100;
    }

    // Add this year's contributions and grants
    const yearData = yearlyTotals.get(year);
    if (yearData) {
      runningTotal += yearData.contributions + yearData.grants;
    }

    yearlyData.push({ year, value: runningTotal });
  }

  const projectedGrowth = runningTotal - totalContributions - totalGrants;

  return {
    totalContributions,
    totalGrants,
    projectedGrowth,
    projectedTotal: runningTotal,
    yearlyData,
  };
}

export function ComparisonView({
  plans,
  plan1Id,
  plan2Id,
  onPlan1Change,
  onPlan2Change,
}: ComparisonViewProps) {
  const { children } = useChildrenStore();
  const { getContributionsForPlan } = usePlansStore();
  const { getBlendedReturn } = usePortfolioStore();
  const { incomeYears } = useIncomeStore();

  const plan1 = plans.find((p) => p.id === plan1Id);
  const plan2 = plans.find((p) => p.id === plan2Id);

  const blendedReturn = getBlendedReturn();
  const projectionRates = getDynamicProjectionRates(blendedReturn);

  // Calculate projections for both plans
  const { comparisonData, metrics } = useMemo(() => {
    if (!plan1 || !plan2) {
      return {
        plan1Projection: null,
        plan2Projection: null,
        comparisonData: [],
        metrics: [],
      };
    }

    // Get contributions for each plan as a map of childId -> (year -> amount)
    const getContributionsMap = (planId: string): Map<string, Map<number, number>> => {
      const contributions = getContributionsForPlan(planId);
      const map = new Map<string, Map<number, number>>();
      for (const c of contributions) {
        if (!map.has(c.childId)) {
          map.set(c.childId, new Map());
        }
        map.get(c.childId)!.set(c.year, c.amount);
      }
      return map;
    };

    // Get projection rate for each plan
    const getRate = (plan: Plan): number => {
      if (plan.projectionRate === 'custom' && plan.customRate) {
        return plan.customRate;
      }
      return (
        projectionRates[plan.projectionRate as keyof typeof projectionRates] ||
        projectionRates.moderate
      );
    };

    const p1Projection = calculatePlanProjection(
      plan1,
      children,
      getContributionsMap(plan1.id),
      incomeYears,
      getRate(plan1)
    );

    const p2Projection = calculatePlanProjection(
      plan2,
      children,
      getContributionsMap(plan2.id),
      incomeYears,
      getRate(plan2)
    );

    // Create chart data by merging yearly data
    const allYears = new Set([
      ...p1Projection.yearlyData.map((d) => d.year),
      ...p2Projection.yearlyData.map((d) => d.year),
    ]);
    const sortedYears = Array.from(allYears).sort((a, b) => a - b);

    const chartData = sortedYears.map((year) => ({
      year,
      plan1Value: p1Projection.yearlyData.find((d) => d.year === year)?.value || 0,
      plan2Value: p2Projection.yearlyData.find((d) => d.year === year)?.value || 0,
    }));

    const comparisonMetrics: ComparisonMetric[] = [
      {
        label: 'Total Contributions',
        plan1Value: p1Projection.totalContributions,
        plan2Value: p2Projection.totalContributions,
        format: 'currency',
        higherIsBetter: true,
      },
      {
        label: 'Total Grants',
        plan1Value: p1Projection.totalGrants,
        plan2Value: p2Projection.totalGrants,
        format: 'currency',
        higherIsBetter: true,
      },
      {
        label: 'Projected Growth',
        plan1Value: p1Projection.projectedGrowth,
        plan2Value: p2Projection.projectedGrowth,
        format: 'currency',
        higherIsBetter: true,
      },
      {
        label: 'Projected Total',
        plan1Value: p1Projection.projectedTotal,
        plan2Value: p2Projection.projectedTotal,
        format: 'currency',
        higherIsBetter: true,
      },
    ];

    return {
      plan1Projection: p1Projection,
      plan2Projection: p2Projection,
      comparisonData: chartData,
      metrics: comparisonMetrics,
    };
  }, [plan1, plan2, children, getContributionsForPlan, incomeYears, projectionRates]);

  const bothSelected = plan1 && plan2;

  return (
    <div className="space-y-6">
      {/* Plan Selectors */}
      <div className="grid gap-4 md:grid-cols-2">
        <PlanSelector
          plans={plans}
          selectedPlanId={plan1Id}
          onPlanSelect={onPlan1Change}
          label="Plan A"
          excludePlanId={plan2Id}
        />
        <PlanSelector
          plans={plans}
          selectedPlanId={plan2Id}
          onPlanSelect={onPlan2Change}
          label="Plan B"
          excludePlanId={plan1Id}
        />
      </div>

      {/* Comparison Results */}
      {bothSelected ? (
        <div className="space-y-6">
          <DiffTable plan1Name={plan1.name} plan2Name={plan2.name} metrics={metrics} />
          {comparisonData.length > 0 && (
            <ComparisonChart plan1Name={plan1.name} plan2Name={plan2.name} data={comparisonData} />
          )}
        </div>
      ) : (
        <div className="bg-muted/50 flex items-center justify-center rounded-lg border p-12">
          <p className="text-muted-foreground text-center">
            Select two plans above to compare their projected outcomes.
          </p>
        </div>
      )}
    </div>
  );
}
