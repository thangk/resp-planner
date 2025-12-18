import { RESP_RULES } from '@/lib/constants';

interface CESGInput {
  contribution: number;
  childAge: number;
  cumulativeCESG: number;
  catchUpYearsAvailable: number;
  catchUpYearsEnabled: boolean;
}

interface CESGResult {
  cesg: number;
  contributionUsedForCESG: number;
  catchUpUsed: number;
  remainingLifetimeCESG: number;
}

/**
 * Calculate CESG (Canada Education Savings Grant) for a given contribution
 *
 * Rules:
 * - Basic: 20% on first $2,500/year = max $500/year
 * - Lifetime cap: $7,200 per child
 * - Catch-up: Can claim 1 missed year per year (max $1,000 CESG/year with $5,000 contribution)
 * - Eligible until end of calendar year child turns 17
 */
export function calculateCESG(input: CESGInput): CESGResult {
  const { contribution, childAge, cumulativeCESG, catchUpYearsAvailable, catchUpYearsEnabled } =
    input;

  // Check eligibility - must be 17 or younger
  if (childAge > RESP_RULES.CESG_ELIGIBLE_UNTIL_AGE) {
    return {
      cesg: 0,
      contributionUsedForCESG: 0,
      catchUpUsed: 0,
      remainingLifetimeCESG: Math.max(0, RESP_RULES.CESG_LIFETIME_MAX - cumulativeCESG),
    };
  }

  // Check lifetime limit
  const remainingLifetimeCESG = Math.max(0, RESP_RULES.CESG_LIFETIME_MAX - cumulativeCESG);
  if (remainingLifetimeCESG <= 0) {
    return {
      cesg: 0,
      contributionUsedForCESG: 0,
      catchUpUsed: 0,
      remainingLifetimeCESG: 0,
    };
  }

  let totalCESG = 0;
  let contributionUsedForCESG = 0;
  let catchUpUsed = 0;

  // Calculate base CESG (20% on first $2,500)
  const baseContribution = Math.min(contribution, RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX);
  const baseCESG = baseContribution * RESP_RULES.CESG_RATE;
  totalCESG += baseCESG;
  contributionUsedForCESG += baseContribution;

  // Calculate catch-up CESG if enabled and available
  if (catchUpYearsEnabled && catchUpYearsAvailable > 0) {
    const remainingContribution = contribution - baseContribution;
    if (remainingContribution > 0) {
      // Can use up to $2,500 more for catch-up (total $5,000 for $1,000 CESG)
      const catchUpContribution = Math.min(
        remainingContribution,
        RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX
      );
      const catchUpCESG = catchUpContribution * RESP_RULES.CESG_RATE;
      totalCESG += catchUpCESG;
      contributionUsedForCESG += catchUpContribution;
      catchUpUsed = 1; // Used one catch-up year
    }
  }

  // Apply lifetime limit
  totalCESG = Math.min(totalCESG, remainingLifetimeCESG);

  // Cap at maximum annual CESG (including catch-up)
  const maxAnnualCESG =
    catchUpYearsEnabled && catchUpYearsAvailable > 0
      ? RESP_RULES.CESG_CATCHUP_MAX_PER_YEAR
      : RESP_RULES.CESG_ANNUAL_MAX;
  totalCESG = Math.min(totalCESG, maxAnnualCESG);

  return {
    cesg: Math.round(totalCESG * 100) / 100,
    contributionUsedForCESG,
    catchUpUsed,
    remainingLifetimeCESG: Math.max(0, remainingLifetimeCESG - totalCESG),
  };
}

/**
 * Calculate the optimal contribution to maximize CESG for a year
 */
export function getOptimalCESGContribution(
  childAge: number,
  cumulativeCESG: number,
  catchUpYearsAvailable: number,
  catchUpYearsEnabled: boolean
): number {
  if (childAge > RESP_RULES.CESG_ELIGIBLE_UNTIL_AGE) {
    return 0;
  }

  const remainingLifetimeCESG = RESP_RULES.CESG_LIFETIME_MAX - cumulativeCESG;
  if (remainingLifetimeCESG <= 0) {
    return 0;
  }

  // Base optimal is $2,500 for $500 CESG
  let optimal: number = RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX;

  // If catch-up is available, optimal is $5,000 for $1,000 CESG
  if (catchUpYearsEnabled && catchUpYearsAvailable > 0) {
    optimal = RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX * 2;
  }

  // Limit based on remaining lifetime CESG
  const maxContributionForRemainingCESG = remainingLifetimeCESG / RESP_RULES.CESG_RATE;
  optimal = Math.min(optimal, maxContributionForRemainingCESG);

  return Math.ceil(optimal);
}
