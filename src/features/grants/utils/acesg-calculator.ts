import { RESP_RULES } from '@/lib/constants';
import type { ACESGTier } from '@/types';

interface ACESGInput {
  contribution: number;
  familyIncome: number | undefined;
  childAge: number;
  cumulativeCESG: number; // Combined CESG + ACESG cumulative (shares $7,200 lifetime cap)
}

interface ACESGResult {
  acesg: number;
  tier: ACESGTier;
  contributionUsedForACESG: number;
}

/**
 * Determine ACESG tier based on family income
 * Note: $0 income is treated as tier1 (maximum benefit) - use undefined for unknown income
 */
export function getACESGTier(familyIncome: number | undefined): ACESGTier {
  // Only skip if income is explicitly undefined (unknown)
  if (familyIncome === undefined) return 'none';

  // $0 or low income gets tier1
  if (familyIncome <= RESP_RULES.ACESG_TIER1_INCOME_MAX) {
    return 'tier1';
  }
  if (familyIncome <= RESP_RULES.ACESG_TIER2_INCOME_MAX) {
    return 'tier2';
  }
  return 'none';
}

/**
 * Calculate ACESG (Additional Canada Education Savings Grant) for a given contribution
 *
 * Rules:
 * - Tier 1 (Income ≤ $55,867): Extra 20% on first $500 = $100
 * - Tier 2 (Income $55,867 - $111,733): Extra 10% on first $500 = $50
 * - Above $111,733: Not eligible
 * - Same age eligibility as CESG (until end of year child turns 17)
 * - IMPORTANT: ACESG counts toward the shared $7,200 CESG lifetime cap
 */
export function calculateACESG(input: ACESGInput): ACESGResult {
  const { contribution, familyIncome, childAge, cumulativeCESG } = input;

  // Check age eligibility (same as CESG)
  if (childAge > RESP_RULES.CESG_ELIGIBLE_UNTIL_AGE) {
    return {
      acesg: 0,
      tier: 'none',
      contributionUsedForACESG: 0,
    };
  }

  // Check shared lifetime limit (CESG + ACESG share the $7,200 cap)
  const remainingLifetimeCESG = Math.max(0, RESP_RULES.CESG_LIFETIME_MAX - cumulativeCESG);
  if (remainingLifetimeCESG <= 0) {
    return {
      acesg: 0,
      tier: 'none',
      contributionUsedForACESG: 0,
    };
  }

  const tier = getACESGTier(familyIncome);

  if (tier === 'none') {
    return {
      acesg: 0,
      tier: 'none',
      contributionUsedForACESG: 0,
    };
  }

  // ACESG is calculated on the first $500 of contribution
  const contributionForACESG = Math.min(contribution, RESP_RULES.ACESG_TIER1_CONTRIBUTION_MAX);

  let acesg = 0;
  if (tier === 'tier1') {
    acesg = contributionForACESG * RESP_RULES.ACESG_TIER1_RATE;
    acesg = Math.min(acesg, RESP_RULES.ACESG_TIER1_MAX);
  } else if (tier === 'tier2') {
    acesg = contributionForACESG * RESP_RULES.ACESG_TIER2_RATE;
    acesg = Math.min(acesg, RESP_RULES.ACESG_TIER2_MAX);
  }

  // Apply shared lifetime limit (ACESG counts toward CESG cap)
  acesg = Math.min(acesg, remainingLifetimeCESG);

  return {
    acesg: Math.round(acesg * 100) / 100,
    tier,
    contributionUsedForACESG: contributionForACESG,
  };
}

/**
 * Get the maximum possible ACESG for a given tier
 */
export function getMaxACESG(tier: ACESGTier): number {
  switch (tier) {
    case 'tier1':
      return RESP_RULES.ACESG_TIER1_MAX;
    case 'tier2':
      return RESP_RULES.ACESG_TIER2_MAX;
    default:
      return 0;
  }
}

/**
 * Get the minimum contribution needed to maximize ACESG
 */
export function getOptimalACESGContribution(tier: ACESGTier): number {
  if (tier === 'none') return 0;
  return RESP_RULES.ACESG_TIER1_CONTRIBUTION_MAX; // $500 for both tiers
}
