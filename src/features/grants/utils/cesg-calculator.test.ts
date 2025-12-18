import { describe, it, expect } from 'vitest';
import { calculateCESG, getOptimalCESGContribution } from './cesg-calculator';

describe('calculateCESG', () => {
  describe('basic CESG calculation', () => {
    it('should return 20% of contribution up to $500', () => {
      const result = calculateCESG({
        contribution: 2500,
        childAge: 5,
        cumulativeCESG: 0,
        catchUpYearsAvailable: 0,
        catchUpYearsEnabled: false,
      });

      expect(result.cesg).toBe(500);
      expect(result.contributionUsedForCESG).toBe(2500);
    });

    it('should cap at $500 for contributions over $2500', () => {
      const result = calculateCESG({
        contribution: 5000,
        childAge: 5,
        cumulativeCESG: 0,
        catchUpYearsAvailable: 0,
        catchUpYearsEnabled: false,
      });

      expect(result.cesg).toBe(500);
    });

    it('should return 0 for child over 17', () => {
      const result = calculateCESG({
        contribution: 2500,
        childAge: 18,
        cumulativeCESG: 0,
        catchUpYearsAvailable: 0,
        catchUpYearsEnabled: false,
      });

      expect(result.cesg).toBe(0);
    });

    it('should return 0 for zero contribution', () => {
      const result = calculateCESG({
        contribution: 0,
        childAge: 5,
        cumulativeCESG: 0,
        catchUpYearsAvailable: 0,
        catchUpYearsEnabled: false,
      });

      expect(result.cesg).toBe(0);
    });
  });

  describe('lifetime limit', () => {
    it('should cap at lifetime limit of $7,200', () => {
      const result = calculateCESG({
        contribution: 2500,
        childAge: 15,
        cumulativeCESG: 7000,
        catchUpYearsAvailable: 0,
        catchUpYearsEnabled: false,
      });

      expect(result.cesg).toBe(200); // Only $200 remaining to hit $7,200
    });

    it('should return 0 when lifetime limit reached', () => {
      const result = calculateCESG({
        contribution: 2500,
        childAge: 15,
        cumulativeCESG: 7200,
        catchUpYearsAvailable: 0,
        catchUpYearsEnabled: false,
      });

      expect(result.cesg).toBe(0);
    });
  });

  describe('catch-up years', () => {
    it('should allow up to $1000 CESG with catch-up enabled', () => {
      const result = calculateCESG({
        contribution: 5000,
        childAge: 10,
        cumulativeCESG: 0,
        catchUpYearsAvailable: 5,
        catchUpYearsEnabled: true,
      });

      expect(result.cesg).toBe(1000);
    });

    it('should not use catch-up when disabled', () => {
      const result = calculateCESG({
        contribution: 5000,
        childAge: 10,
        cumulativeCESG: 0,
        catchUpYearsAvailable: 5,
        catchUpYearsEnabled: false,
      });

      expect(result.cesg).toBe(500);
    });
  });
});

describe('getOptimalCESGContribution', () => {
  it('should return $2500 for basic case', () => {
    const optimal = getOptimalCESGContribution(5, 0, 0, false);
    expect(optimal).toBe(2500);
  });

  it('should return $5000 with catch-up enabled and available', () => {
    const optimal = getOptimalCESGContribution(10, 0, 5, true);
    expect(optimal).toBe(5000);
  });

  it('should return 0 for child over 17', () => {
    const optimal = getOptimalCESGContribution(18, 0, 0, false);
    expect(optimal).toBe(0);
  });

  it('should return lower amount when near lifetime limit', () => {
    const optimal = getOptimalCESGContribution(15, 7000, 0, false);
    expect(optimal).toBe(1000); // Only need $1000 to earn remaining $200 CESG
  });
});
