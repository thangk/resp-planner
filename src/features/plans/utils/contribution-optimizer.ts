import { RESP_RULES } from '@/lib/constants';
import type { Child, IncomeYear, YearConstraint } from '@/types';

export interface OptimizationInput {
  child: Child;
  incomeYears: IncomeYear[];
  constraints: YearConstraint[];
  frontloadYear: number | null;
  optimizeForGrowth: boolean;
  startYear?: number;
  catchUpYears?: number[]; // Specific years designated for catch-up ($5000)
}

export interface OptimizedContribution {
  year: number;
  amount: number;
  isLocked: boolean;
  reason: string;
}

/**
 * Generate an optimized contribution schedule for a child
 */
export function generateOptimizedSchedule(input: OptimizationInput): OptimizedContribution[] {
  const {
    child,
    incomeYears,
    constraints,
    frontloadYear,
    optimizeForGrowth,
    startYear,
    catchUpYears = [],
  } = input;

  const dob = new Date(child.dateOfBirth);
  const birthYear = dob.getFullYear();
  const currentYear = startYear || new Date().getFullYear();
  const endYear = birthYear + 17; // Last year for grants

  const schedule: OptimizedContribution[] = [];
  let cumulativeCESG = 0;
  let cumulativeContribution = 0;

  // Create a Set for fast lookup of catch-up years
  const catchUpYearsSet = new Set(catchUpYears);

  for (let year = currentYear; year <= endYear; year++) {
    const incomeYear = incomeYears.find((iy) => iy.year === year);
    // Default to $0 income if not specified (gives maximum ACESG/CLB)
    const familyIncome = incomeYear?.familyIncome ?? 0;

    // Check if this year has a constraint
    const constraint = constraints.find((c) => year >= c.startYear && year <= c.endYear);

    // Check if this is a designated catch-up year
    const isCatchUpYear = catchUpYearsSet.has(year);

    let amount = 0;
    let isLocked = false;
    let reason = '';

    if (constraint) {
      // Year is constrained
      amount = constraint.maxContribution;
      isLocked = true;
      reason = 'Constrained';
    } else if (frontloadYear && year === frontloadYear) {
      // Frontload year - contribute maximum
      amount = calculateFrontloadAmount(
        child,
        year,
        cumulativeContribution,
        cumulativeCESG,
        familyIncome,
        isCatchUpYear,
        catchUpYears
      );
      reason = isCatchUpYear ? 'Frontload + Catch-up' : 'Frontload';
    } else if (isCatchUpYear) {
      // This is a designated catch-up year - contribute $5000 for $1000 CESG
      // But only if CESG can still be earned
      if (cumulativeCESG < RESP_RULES.CESG_LIFETIME_MAX) {
        amount = RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX * 2; // $5000
        reason = 'Catch-up';
      } else {
        amount = 0;
        reason = 'CESG maxed';
      }
    } else if (optimizeForGrowth) {
      // Only contribute if CESG can still be earned
      // Once CESG is maxed, remaining room goes to frontload year
      if (cumulativeCESG < RESP_RULES.CESG_LIFETIME_MAX) {
        amount = RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX; // $2500
        reason = 'Optimized';
      } else {
        amount = 0;
        reason = 'CESG maxed';
      }
    } else {
      // Spread evenly - but only if CESG can still be earned
      if (cumulativeCESG < RESP_RULES.CESG_LIFETIME_MAX) {
        const yearsRemaining = endYear - year + 1;
        const remainingLifetimeRoom =
          RESP_RULES.LIFETIME_CONTRIBUTION_LIMIT - cumulativeContribution;
        amount = Math.min(
          Math.ceil(remainingLifetimeRoom / yearsRemaining),
          RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX // $2500 for non-catch-up years
        );
        reason = 'Even spread';
      } else {
        amount = 0;
        reason = 'CESG maxed';
      }
    }

    // Ensure we don't exceed lifetime limit
    const remainingLifetimeRoom = RESP_RULES.LIFETIME_CONTRIBUTION_LIMIT - cumulativeContribution;
    amount = Math.min(amount, remainingLifetimeRoom);

    // Update cumulative values (estimate CESG + ACESG earned)
    // CESG and ACESG share the $7,200 lifetime cap
    // Must cap at annual CESG max ($500 regular, $1000 catch-up)
    const isThisYearCatchUp = catchUpYearsSet.has(year);
    const annualCESGMax = isThisYearCatchUp ? 1000 : 500;
    const remainingCESGRoom = RESP_RULES.CESG_LIFETIME_MAX - cumulativeCESG;
    const estimatedCESG = Math.min(amount * RESP_RULES.CESG_RATE, annualCESGMax, remainingCESGRoom);
    // Estimate ACESG (max $100/year for tier 1, shares the $7,200 cap)
    const annualACESGMax = 100;
    const estimatedACESG =
      amount > 0 ? Math.min(annualACESGMax, remainingCESGRoom - estimatedCESG) : 0;
    cumulativeCESG += estimatedCESG + estimatedACESG;
    cumulativeContribution += amount;

    schedule.push({
      year,
      amount: Math.round(amount * 100) / 100,
      isLocked,
      reason,
    });
  }

  return schedule;
}

/**
 * Calculate the amount to contribute in a frontload year
 *
 * Strategy: Frontload the maximum possible while only reserving enough
 * for remaining years to max out CESG+ACESG ($7,200 lifetime shared cap).
 *
 * Formula: Frontload = Remaining Room - Future CESG Contributions
 * Where Future CESG Contributions = contributions needed to earn remaining CESG+ACESG
 */
function calculateFrontloadAmount(
  child: Child,
  year: number,
  cumulativeContribution: number,
  cumulativeCESG: number,
  _familyIncome: number | undefined,
  isCatchUpYear: boolean,
  catchUpYears: number[] = []
): number {
  const dob = new Date(child.dateOfBirth);
  const birthYear = dob.getFullYear();
  const endYear = birthYear + RESP_RULES.CESG_ELIGIBLE_UNTIL_AGE;
  const catchUpYearsSet = new Set(catchUpYears);

  // Calculate how much room we have for contributions
  const remainingRoom = RESP_RULES.LIFETIME_CONTRIBUTION_LIMIT - cumulativeContribution;

  // Calculate remaining CESG+ACESG room (they share the $7,200 cap)
  const remainingCESGRoom = Math.max(0, RESP_RULES.CESG_LIFETIME_MAX - cumulativeCESG);

  // Frontload year earns CESG + ACESG
  // CESG: up to $1,000 if catch-up, $500 otherwise
  // ACESG: up to $100/year (assuming tier 1 for conservative estimate)
  const frontloadCESG = isCatchUpYear ? 1000 : 500;
  const frontloadACESG = 100;
  const frontloadGrant = frontloadCESG + frontloadACESG;

  // Grant room still needed after frontload year
  let grantRoomStillNeeded = Math.max(0, remainingCESGRoom - frontloadGrant);

  // Calculate minimum contributions needed for years AFTER frontload to max CESG+ACESG
  let futureContribNeeded = 0;
  for (let y = year + 1; y <= endYear; y++) {
    if (grantRoomStillNeeded <= 0) break;
    const isYearCatchUp = catchUpYearsSet.has(y);
    // Each year earns CESG + ACESG (shares the $7,200 cap)
    const cesgPerYear = isYearCatchUp ? 1000 : 500;
    const acesgPerYear = 100;
    const grantPerYear = cesgPerYear + acesgPerYear;
    const contribPerYear = isYearCatchUp ? 5000 : 2500;
    grantRoomStillNeeded -= grantPerYear;
    futureContribNeeded += contribPerYear;
  }

  // Frontload = remaining room minus future contributions needed for CESG
  let frontloadAmount = remainingRoom - futureContribNeeded;

  // Minimum contribution based on whether this is a catch-up year
  const minContribution = isCatchUpYear
    ? RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX * 2 // $5000 for catch-up year
    : RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX; // $2500 for regular year

  // Ensure we contribute at least the minimum for this year type
  if (frontloadAmount < minContribution) {
    frontloadAmount = Math.min(minContribution, remainingRoom);
  }

  // Final cap at remaining room
  frontloadAmount = Math.min(frontloadAmount, remainingRoom);

  return frontloadAmount;
}

/**
 * Apply a constraint to a schedule
 */
export function applyConstraint(
  schedule: OptimizedContribution[],
  constraint: YearConstraint
): OptimizedContribution[] {
  return schedule.map((item) => {
    if (item.year >= constraint.startYear && item.year <= constraint.endYear) {
      return {
        ...item,
        amount: Math.min(item.amount, constraint.maxContribution),
        isLocked: true,
        reason: 'Constrained',
      };
    }
    return item;
  });
}

/**
 * Get the total contribution from a schedule
 */
export function getTotalContribution(schedule: OptimizedContribution[]): number {
  return schedule.reduce((sum, item) => sum + item.amount, 0);
}

export interface FrontloadRecalculationInput {
  child: Child;
  contributions: Map<number, number>; // year -> amount
  frontloadYear: number;
  optimizedSchedule: OptimizedContribution[];
  changedYear: number;
  newAmount: number;
}

/**
 * Recalculate the frontload year amount when a non-frontload year contribution changes
 * Returns the new frontload year amount, or null if no adjustment needed
 */
export function recalculateFrontloadAmount(input: FrontloadRecalculationInput): number | null {
  const { contributions, frontloadYear, optimizedSchedule, changedYear, newAmount } = input;

  // Don't adjust if the changed year is the frontload year itself
  if (changedYear === frontloadYear) {
    return null;
  }

  // Find the original optimized amount for the changed year
  const originalItem = optimizedSchedule.find((s) => s.year === changedYear);
  if (!originalItem) {
    return null;
  }

  // Calculate the difference
  const originalAmount = originalItem.amount;
  const difference = originalAmount - newAmount;

  // If no difference, no adjustment needed
  if (Math.abs(difference) < 1) {
    return null;
  }

  // Get current frontload amount (from contributions or optimized schedule)
  const currentFrontloadAmount =
    contributions.get(frontloadYear) ??
    optimizedSchedule.find((s) => s.year === frontloadYear)?.amount ??
    0;

  // Calculate new frontload amount (add the difference to absorb the change)
  let newFrontloadAmount = currentFrontloadAmount + difference;

  // Ensure we don't go below 0
  newFrontloadAmount = Math.max(0, newFrontloadAmount);

  // Sum all contributions except frontload year
  let totalOtherContributions = 0;
  contributions.forEach((amount, year) => {
    if (year !== frontloadYear && year !== changedYear) {
      totalOtherContributions += amount;
    }
  });
  totalOtherContributions += newAmount; // Add the new changed amount

  // Cap at remaining lifetime room
  const remainingRoom = RESP_RULES.LIFETIME_CONTRIBUTION_LIMIT - totalOtherContributions;
  newFrontloadAmount = Math.min(newFrontloadAmount, remainingRoom);

  return Math.round(newFrontloadAmount * 100) / 100;
}
