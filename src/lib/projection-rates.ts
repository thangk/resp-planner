import { PROJECTION_RATES } from './constants';

/**
 * Calculate dynamic projection rates based on portfolio blended return
 * - Moderate: blended return (or default if no portfolio)
 * - Conservative: 0.9x moderate (rounded)
 * - Optimistic: 1.1x moderate (rounded)
 */
export function getDynamicProjectionRates(blendedReturn: number): {
  conservative: number;
  moderate: number;
  optimistic: number;
} {
  // If no portfolio or zero return, use defaults
  if (blendedReturn <= 0) {
    return { ...PROJECTION_RATES };
  }

  const moderate = Math.round(blendedReturn * 10) / 10; // Round to 1 decimal
  const conservative = Math.round(moderate * 0.9 * 10) / 10;
  const optimistic = Math.round(moderate * 1.1 * 10) / 10;

  return {
    conservative,
    moderate,
    optimistic,
  };
}

/**
 * Get the actual rate value for a projection rate setting
 */
export function getProjectionRateValue(
  projectionRate: 'conservative' | 'moderate' | 'optimistic' | 'custom',
  customRate: number | null,
  blendedReturn: number
): number {
  if (projectionRate === 'custom' && customRate !== null) {
    return customRate;
  }

  const rates = getDynamicProjectionRates(blendedReturn);
  return rates[projectionRate as keyof typeof rates] || rates.moderate;
}
