import { z } from 'zod';

// Child schema
export const childSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const dob = new Date(date);
      const today = new Date();
      return dob < today;
    }, 'Date of birth must be in the past'),
  respOpenedDate: z
    .string()
    .nullable()
    .refine((date) => {
      if (!date) return true;
      const respDate = new Date(date);
      const today = new Date();
      return respDate <= today;
    }, 'RESP opened date cannot be in the future'),
  catchUpYearsEnabled: z.boolean(),
});

export type ChildFormData = z.infer<typeof childSchema>;

// ETF schema
export const etfSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .max(20, 'Symbol must be less than 20 characters')
    .toUpperCase(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  allocation: z
    .number()
    .min(0, 'Allocation must be at least 0%')
    .max(100, 'Allocation cannot exceed 100%'),
  historicalReturn: z
    .number()
    .min(-100, 'Return must be at least -100%')
    .max(100, 'Return cannot exceed 100%'),
});

export type ETFFormData = z.infer<typeof etfSchema>;

// Income year schema
export const incomeYearSchema = z.object({
  year: z
    .number()
    .min(2000, 'Year must be 2000 or later')
    .max(2100, 'Year must be 2100 or earlier'),
  familyIncome: z
    .number()
    .min(0, 'Income must be a positive number')
    .max(10000000, 'Income seems too high'),
});

export type IncomeYearFormData = z.infer<typeof incomeYearSchema>;

// Plan schema
export const planSchema = z.object({
  name: z
    .string()
    .min(1, 'Plan name is required')
    .max(100, 'Plan name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').nullable(),
  childIds: z.array(z.string()).min(1, 'At least one child must be selected'),
  projectionRate: z.enum(['conservative', 'moderate', 'optimistic', 'custom']),
  customRate: z
    .number()
    .min(0, 'Custom rate must be positive')
    .max(50, 'Custom rate seems too high')
    .nullable(),
  inflationAdjusted: z.boolean(),
  optimizeForGrowth: z.boolean(),
});

export type PlanFormData = z.infer<typeof planSchema>;

// Contribution schema
export const contributionSchema = z.object({
  year: z.number(),
  amount: z
    .number()
    .min(0, 'Contribution must be positive')
    .max(50000, 'Contribution exceeds lifetime limit'),
  isLocked: z.boolean(),
  note: z.string().max(200, 'Note must be less than 200 characters').nullable(),
});

export type ContributionFormData = z.infer<typeof contributionSchema>;
