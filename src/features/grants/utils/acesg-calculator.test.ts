import { describe, it, expect } from 'vitest';
import { calculateACESG, getACESGTier } from './acesg-calculator';

describe('getACESGTier', () => {
  it('should return tier1 for income below first threshold', () => {
    const tier = getACESGTier(40000);
    expect(tier).toBe('tier1');
  });

  it('should return tier2 for income between thresholds', () => {
    const tier = getACESGTier(60000);
    expect(tier).toBe('tier2');
  });

  it('should return none for income above both thresholds', () => {
    const tier = getACESGTier(120000);
    expect(tier).toBe('none');
  });

  it('should return none when income is undefined', () => {
    const tier = getACESGTier(undefined);
    expect(tier).toBe('none');
  });
});

describe('calculateACESG', () => {
  describe('basic ACESG calculation', () => {
    it('should return 20% of first $500 for tier 1', () => {
      const result = calculateACESG({
        contribution: 1000,
        familyIncome: 40000,
        childAge: 5,
      });

      expect(result.acesg).toBe(100); // 20% of $500
      expect(result.tier).toBe('tier1');
    });

    it('should return 10% of first $500 for tier 2', () => {
      const result = calculateACESG({
        contribution: 1000,
        familyIncome: 60000,
        childAge: 5,
      });

      expect(result.acesg).toBe(50); // 10% of $500
      expect(result.tier).toBe('tier2');
    });

    it('should return 0 for high income', () => {
      const result = calculateACESG({
        contribution: 1000,
        familyIncome: 120000,
        childAge: 5,
      });

      expect(result.acesg).toBe(0);
      expect(result.tier).toBe('none');
    });
  });

  describe('contribution limits', () => {
    it('should only apply to first $500 of contribution', () => {
      const result = calculateACESG({
        contribution: 5000,
        familyIncome: 40000,
        childAge: 5,
      });

      expect(result.acesg).toBe(100); // 20% of $500, not $5000
    });

    it('should return proportional amount for small contributions', () => {
      const result = calculateACESG({
        contribution: 250,
        familyIncome: 40000,
        childAge: 5,
      });

      expect(result.acesg).toBe(50); // 20% of $250
    });
  });

  describe('age limits', () => {
    it('should return 0 for child over 17', () => {
      const result = calculateACESG({
        contribution: 1000,
        familyIncome: 40000,
        childAge: 18,
      });

      expect(result.acesg).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should return 0 when income is undefined', () => {
      const result = calculateACESG({
        contribution: 1000,
        familyIncome: undefined,
        childAge: 5,
      });

      expect(result.acesg).toBe(0);
    });

    it('should return 0 for zero contribution', () => {
      const result = calculateACESG({
        contribution: 0,
        familyIncome: 40000,
        childAge: 5,
      });

      expect(result.acesg).toBe(0);
    });
  });
});
