import { RESP_RULES } from '@/lib/constants';
import { getDynamicProjectionRates } from '@/lib/projection-rates';
import type { ProjectionRate, ProjectionYear, ChildProjection } from '@/types';
import type { GrantCalculationResult } from '@/features/grants/utils/grant-calculator';

export interface ProjectionInput {
  schedule: GrantCalculationResult[];
  projectionRate: ProjectionRate;
  customRate?: number;
  inflationAdjusted: boolean;
  childName: string;
  blendedReturn?: number; // Portfolio blended return for dynamic rates
}

/**
 * Get the annual return rate based on projection type
 * If blendedReturn is provided, uses dynamic rates based on portfolio
 */
export function getProjectionRate(
  projectionRate: ProjectionRate,
  customRate?: number,
  blendedReturn?: number
): number {
  if (projectionRate === 'custom' && customRate !== undefined) {
    return customRate / 100;
  }

  // Use dynamic rates if blended return is available
  if (blendedReturn !== undefined && blendedReturn > 0) {
    const dynamicRates = getDynamicProjectionRates(blendedReturn);
    return dynamicRates[projectionRate as keyof typeof dynamicRates] / 100;
  }

  // Fallback to static rates from constants (as decimals)
  return RESP_RULES.PROJECTION_RATES[projectionRate as keyof typeof RESP_RULES.PROJECTION_RATES];
}

/**
 * Calculate projected growth for a contribution schedule
 */
export function calculateProjection(input: ProjectionInput): ChildProjection {
  const { schedule, projectionRate, customRate, inflationAdjusted, childName, blendedReturn } =
    input;

  if (schedule.length === 0) {
    return {
      childId: '',
      childName,
      projectionYears: [],
      totalContributions: 0,
      totalGrants: 0,
      totalGrowth: 0,
      finalBalance: 0,
    };
  }

  const annualRate = getProjectionRate(projectionRate, customRate, blendedReturn);
  const inflationRate = RESP_RULES.DEFAULT_INFLATION_RATE;

  const projectionYears: ProjectionYear[] = [];
  let balance = 0;
  let totalContributions = 0;
  let totalGrants = 0;
  let totalGrowth = 0;

  schedule.forEach((yearData, index) => {
    // Add contributions and grants at the start of the year
    const yearContribution = yearData.contribution;
    const yearGrants = yearData.totalGrants;

    totalContributions += yearContribution;
    totalGrants += yearGrants;

    // Add to balance
    balance += yearContribution + yearGrants;

    // Calculate growth for the year (compound at end of year)
    const yearGrowth = balance * annualRate;
    totalGrowth += yearGrowth;
    balance += yearGrowth;

    // Calculate inflation-adjusted balance if needed
    let inflationAdjustedBalance: number | undefined;
    if (inflationAdjusted) {
      const yearsFromNow = index + 1;
      const inflationFactor = Math.pow(1 + inflationRate, yearsFromNow);
      inflationAdjustedBalance = balance / inflationFactor;
    }

    projectionYears.push({
      year: yearData.year,
      age: yearData.childAge,
      contribution: yearContribution,
      grants: yearGrants,
      growth: Math.round(yearGrowth * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      inflationAdjustedBalance: inflationAdjustedBalance
        ? Math.round(inflationAdjustedBalance * 100) / 100
        : undefined,
    });
  });

  return {
    childId: schedule[0]?.childId || '',
    childName,
    projectionYears,
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalGrants: Math.round(totalGrants * 100) / 100,
    totalGrowth: Math.round(totalGrowth * 100) / 100,
    finalBalance: Math.round(balance * 100) / 100,
  };
}

/**
 * Calculate the breakdown percentages for the final balance
 */
export function calculateBreakdown(projection: ChildProjection): {
  contributionPercent: number;
  grantPercent: number;
  growthPercent: number;
} {
  const { totalContributions, totalGrants, totalGrowth, finalBalance } = projection;

  if (finalBalance === 0) {
    return { contributionPercent: 0, grantPercent: 0, growthPercent: 0 };
  }

  return {
    contributionPercent: Math.round((totalContributions / finalBalance) * 100),
    grantPercent: Math.round((totalGrants / finalBalance) * 100),
    growthPercent: Math.round((totalGrowth / finalBalance) * 100),
  };
}

/**
 * Compare two projections and return the difference
 */
export function compareProjections(
  projection1: ChildProjection,
  projection2: ChildProjection
): {
  balanceDiff: number;
  percentDiff: number;
  winner: 1 | 2 | 'tie';
} {
  const balanceDiff = projection1.finalBalance - projection2.finalBalance;
  const percentDiff =
    projection2.finalBalance > 0
      ? ((projection1.finalBalance - projection2.finalBalance) / projection2.finalBalance) * 100
      : 0;

  let winner: 1 | 2 | 'tie' = 'tie';
  if (balanceDiff > 0) winner = 1;
  else if (balanceDiff < 0) winner = 2;

  return {
    balanceDiff: Math.round(balanceDiff * 100) / 100,
    percentDiff: Math.round(percentDiff * 100) / 100,
    winner,
  };
}
