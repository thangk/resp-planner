import { calculateCESG, getOptimalCESGContribution } from './cesg-calculator';
import { calculateACESG, getACESGTier } from './acesg-calculator';
import { calculateCLB, isCLBEligible } from './clb-calculator';
import type { Child, IncomeYear } from '@/types';

export interface GrantCalculationInput {
  child: Child;
  year: number;
  contribution: number;
  familyIncome: number | undefined;
  cumulativeCESG: number;
  cumulativeCLB: number;
  isFirstCLBYear: boolean;
}

export interface GrantCalculationResult {
  year: number;
  childId: string;
  childAge: number;
  contribution: number;
  cesg: number;
  acesg: number;
  clb: number;
  totalGrants: number;
  cumulativeContribution: number;
  cumulativeGrants: number;
  /** Combined CESG + ACESG cumulative (they share the $7,200 lifetime cap) */
  cumulativeCESG: number;
  /** CLB has its own separate $2,000 lifetime cap */
  cumulativeCLB: number;
}

/**
 * Calculate all grants for a single year contribution
 */
export function calculateGrantsForYear(input: GrantCalculationInput): GrantCalculationResult {
  const { child, year, contribution, familyIncome, cumulativeCESG, cumulativeCLB, isFirstCLBYear } =
    input;

  const dob = new Date(child.dateOfBirth);
  const childAge = year - dob.getFullYear();
  const hasRESPOpen = !!child.respOpenedDate;

  // Calculate CESG
  const cesgResult = calculateCESG({
    contribution,
    childAge,
    cumulativeCESG,
    catchUpYearsAvailable: child.catchUpYearsAvailable,
    catchUpYearsEnabled: child.catchUpYearsEnabled,
  });

  // Calculate ACESG (pass cumulativeCESG since they share the $7,200 lifetime cap)
  // ACESG needs to know remaining CESG room AFTER basic CESG is calculated
  const acesgResult = calculateACESG({
    contribution,
    familyIncome,
    childAge,
    cumulativeCESG: cumulativeCESG + cesgResult.cesg, // Include this year's CESG
  });

  // Calculate CLB
  const clbResult = calculateCLB({
    familyIncome,
    childAge,
    cumulativeCLB,
    hasRESPOpen,
    isFirstCLBYear,
  });

  const totalGrants = cesgResult.cesg + acesgResult.acesg + clbResult.clb;

  return {
    year,
    childId: child.id,
    childAge,
    contribution,
    cesg: cesgResult.cesg,
    acesg: acesgResult.acesg,
    clb: clbResult.clb,
    totalGrants,
    cumulativeContribution: 0, // Will be calculated in schedule generator
    cumulativeGrants: 0, // Will be calculated in schedule generator
    cumulativeCESG: cumulativeCESG + cesgResult.cesg + acesgResult.acesg, // CESG + ACESG share the $7,200 cap
    cumulativeCLB: cumulativeCLB + clbResult.clb,
  };
}

/**
 * Generate a full contribution schedule for a child
 */
export function generateContributionSchedule(
  child: Child,
  incomeYears: IncomeYear[],
  contributions: Map<number, number>, // year -> amount
  startYear?: number
): GrantCalculationResult[] {
  const dob = new Date(child.dateOfBirth);
  const birthYear = dob.getFullYear();
  const currentYear = startYear || new Date().getFullYear();

  // RESP contributions are eligible until the child turns 31
  // But grants are only until 17
  const endYear = birthYear + 17; // Last year for grants

  const schedule: GrantCalculationResult[] = [];
  let cumulativeContribution = 0;
  let cumulativeGrants = 0;
  let cumulativeCESG = 0;
  let cumulativeCLB = 0;
  let hasReceivedCLB = false;

  for (let year = currentYear; year <= endYear; year++) {
    const contribution = contributions.get(year) || 0;
    const incomeYear = incomeYears.find((iy) => iy.year === year);
    // Default to $0 income if not specified (gives maximum ACESG/CLB)
    const familyIncome = incomeYear?.familyIncome ?? 0;

    const result = calculateGrantsForYear({
      child,
      year,
      contribution,
      familyIncome,
      cumulativeCESG,
      cumulativeCLB,
      isFirstCLBYear: !hasReceivedCLB && isCLBEligible(familyIncome),
    });

    cumulativeContribution += contribution;
    cumulativeGrants += result.totalGrants;
    cumulativeCESG = result.cumulativeCESG;
    cumulativeCLB = result.cumulativeCLB;

    if (result.clb > 0) {
      hasReceivedCLB = true;
    }

    schedule.push({
      ...result,
      cumulativeContribution,
      cumulativeGrants,
    });
  }

  return schedule;
}

/**
 * Get optimal contribution for maximum grants in a year
 */
export function getOptimalContribution(
  child: Child,
  year: number,
  familyIncome: number | undefined,
  cumulativeCESG: number
): number {
  const dob = new Date(child.dateOfBirth);
  const childAge = year - dob.getFullYear();

  // Get optimal for CESG
  const optimalCESG = getOptimalCESGContribution(
    childAge,
    cumulativeCESG,
    child.catchUpYearsAvailable,
    child.catchUpYearsEnabled
  );

  // ACESG just needs $500 to maximize, which is less than CESG optimal
  // So CESG optimal already covers ACESG

  // CLB doesn't require contributions

  return optimalCESG;
}

export { getACESGTier, isCLBEligible };
