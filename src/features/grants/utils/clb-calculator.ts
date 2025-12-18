import { RESP_RULES } from '@/lib/constants';

interface CLBInput {
  familyIncome: number | undefined;
  childAge: number;
  cumulativeCLB: number;
  hasRESPOpen: boolean;
  isFirstCLBYear: boolean;
}

interface CLBResult {
  clb: number;
  isEligible: boolean;
  remainingLifetimeCLB: number;
}

/**
 * Check if family is eligible for CLB based on income
 * Note: $0 income is treated as eligible (maximum benefit) - use undefined for unknown income
 */
export function isCLBEligible(familyIncome: number | undefined): boolean {
  // Only ineligible if income is explicitly undefined (unknown)
  if (familyIncome === undefined) return false;
  // $0 or low income is eligible
  return familyIncome <= RESP_RULES.CLB_INCOME_THRESHOLD_1_3_CHILDREN;
}

/**
 * Calculate CLB (Canada Learning Bond) for a given year
 *
 * Rules:
 * - $500 first year + $100/year until age 15
 * - Max $2,000 per child lifetime
 * - Family income threshold ≤ $55,867 (2025) for 1-3 children
 * - Must have RESP open to receive
 * - Can be claimed retroactively until age 21
 */
export function calculateCLB(input: CLBInput): CLBResult {
  const { familyIncome, childAge, cumulativeCLB, hasRESPOpen, isFirstCLBYear } = input;

  // Check if RESP is open
  if (!hasRESPOpen) {
    return {
      clb: 0,
      isEligible: false,
      remainingLifetimeCLB: RESP_RULES.CLB_LIFETIME_MAX - cumulativeCLB,
    };
  }

  // Check age eligibility (eligible until age 15 for new CLB)
  if (childAge > RESP_RULES.CLB_ELIGIBLE_UNTIL_AGE) {
    return {
      clb: 0,
      isEligible: false,
      remainingLifetimeCLB: Math.max(0, RESP_RULES.CLB_LIFETIME_MAX - cumulativeCLB),
    };
  }

  // Check income eligibility
  if (!isCLBEligible(familyIncome)) {
    return {
      clb: 0,
      isEligible: false,
      remainingLifetimeCLB: Math.max(0, RESP_RULES.CLB_LIFETIME_MAX - cumulativeCLB),
    };
  }

  // Check lifetime limit
  const remainingLifetimeCLB = Math.max(0, RESP_RULES.CLB_LIFETIME_MAX - cumulativeCLB);
  if (remainingLifetimeCLB <= 0) {
    return {
      clb: 0,
      isEligible: true,
      remainingLifetimeCLB: 0,
    };
  }

  // Calculate CLB amount
  let clb: number = isFirstCLBYear ? RESP_RULES.CLB_FIRST_YEAR : RESP_RULES.CLB_SUBSEQUENT_YEARS;

  // Add retroactive CLB for years between birth and current schedule year
  // When RESP opens late, the first CLB payment includes:
  // - $500 enrollment bonus (covers birth year/age 0)
  // - $100 for each year from age 1 to (currentAge - 1) - retroactive
  // - $100 for current age (if age >= 1, since age 0 is covered by enrollment)
  // Note: User may receive retroactive ($700) initially, with current year's $100 later
  if (isFirstCLBYear && childAge >= 1) {
    // Add $100 for each year from age 1 to childAge (retroactive + current year)
    const retroactiveAmount = childAge * RESP_RULES.CLB_SUBSEQUENT_YEARS;
    clb += retroactiveAmount;
  }

  // Apply lifetime limit
  clb = Math.min(clb, remainingLifetimeCLB);

  return {
    clb,
    isEligible: true,
    remainingLifetimeCLB: Math.max(0, remainingLifetimeCLB - clb),
  };
}

/**
 * Calculate total potential CLB for a child from current age to 15
 * Includes retroactive CLB for years before schedule starts
 */
export function calculatePotentialCLB(
  currentAge: number,
  cumulativeCLB: number,
  hasRESPOpen: boolean
): number {
  if (!hasRESPOpen || currentAge > RESP_RULES.CLB_ELIGIBLE_UNTIL_AGE) {
    return 0;
  }

  const remainingLifetimeCLB = Math.max(0, RESP_RULES.CLB_LIFETIME_MAX - cumulativeCLB);
  const yearsRemaining = RESP_RULES.CLB_ELIGIBLE_UNTIL_AGE - currentAge + 1;

  // First year is $500, subsequent years are $100 each
  const isFirstYear = cumulativeCLB === 0;
  let potential = 0;

  if (isFirstYear && yearsRemaining > 0) {
    // $500 enrollment bonus (covers birth year/age 0)
    potential += RESP_RULES.CLB_FIRST_YEAR;

    // $100/year for ages 1 to 15 (age 0 is covered by enrollment bonus)
    if (currentAge === 0) {
      // No retroactive needed, and age 0 doesn't get $100
      // Future ages 1-15 = 15 years × $100
      potential += 15 * RESP_RULES.CLB_SUBSEQUENT_YEARS;
    } else {
      // Retroactive for ages 1 to (currentAge - 1)
      if (currentAge > 1) {
        potential += (currentAge - 1) * RESP_RULES.CLB_SUBSEQUENT_YEARS;
      }
      // Current + future: ages currentAge to 15
      potential += yearsRemaining * RESP_RULES.CLB_SUBSEQUENT_YEARS;
    }
  } else {
    potential = yearsRemaining * RESP_RULES.CLB_SUBSEQUENT_YEARS;
  }

  return Math.min(potential, remainingLifetimeCLB);
}
