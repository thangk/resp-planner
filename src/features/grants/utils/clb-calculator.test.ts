import { describe, it, expect } from 'vitest';
import { calculateCLB, isCLBEligible } from './clb-calculator';

describe('isCLBEligible', () => {
  it('should return true for income below threshold', () => {
    expect(isCLBEligible(40000)).toBe(true);
  });

  it('should return false for income above threshold', () => {
    expect(isCLBEligible(60000)).toBe(false);
  });

  it('should return false when income is undefined', () => {
    expect(isCLBEligible(undefined)).toBe(false);
  });
});

describe('calculateCLB', () => {
  describe('initial CLB payment', () => {
    it('should return $500 for first year with eligible income', () => {
      const result = calculateCLB({
        familyIncome: 40000,
        childAge: 1,
        cumulativeCLB: 0,
        hasRESPOpen: true,
        isFirstCLBYear: true,
      });

      expect(result.clb).toBe(500);
    });

    it('should return 0 for first year without RESP open', () => {
      const result = calculateCLB({
        familyIncome: 40000,
        childAge: 1,
        cumulativeCLB: 0,
        hasRESPOpen: false,
        isFirstCLBYear: true,
      });

      expect(result.clb).toBe(0);
    });
  });

  describe('subsequent CLB payments', () => {
    it('should return $100 for subsequent eligible years', () => {
      const result = calculateCLB({
        familyIncome: 40000,
        childAge: 5,
        cumulativeCLB: 500,
        hasRESPOpen: true,
        isFirstCLBYear: false,
      });

      expect(result.clb).toBe(100);
    });
  });

  describe('lifetime limit', () => {
    it('should cap at $2,000 lifetime maximum', () => {
      const result = calculateCLB({
        familyIncome: 40000,
        childAge: 15,
        cumulativeCLB: 1950,
        hasRESPOpen: true,
        isFirstCLBYear: false,
      });

      expect(result.clb).toBe(50); // Only $50 remaining to hit $2,000
    });

    it('should return 0 when lifetime limit reached', () => {
      const result = calculateCLB({
        familyIncome: 40000,
        childAge: 15,
        cumulativeCLB: 2000,
        hasRESPOpen: true,
        isFirstCLBYear: false,
      });

      expect(result.clb).toBe(0);
    });
  });

  describe('age limits', () => {
    it('should return 0 for child over 15', () => {
      const result = calculateCLB({
        familyIncome: 40000,
        childAge: 16,
        cumulativeCLB: 0,
        hasRESPOpen: true,
        isFirstCLBYear: true,
      });

      expect(result.clb).toBe(0);
    });
  });

  describe('income eligibility', () => {
    it('should return 0 for high income', () => {
      const result = calculateCLB({
        familyIncome: 100000,
        childAge: 5,
        cumulativeCLB: 0,
        hasRESPOpen: true,
        isFirstCLBYear: true,
      });

      expect(result.clb).toBe(0);
    });

    it('should return 0 when income is undefined', () => {
      const result = calculateCLB({
        familyIncome: undefined,
        childAge: 5,
        cumulativeCLB: 0,
        hasRESPOpen: true,
        isFirstCLBYear: true,
      });

      expect(result.clb).toBe(0);
    });
  });
});
