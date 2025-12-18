// Child type - represents a beneficiary in the RESP
export interface Child {
  id: string;
  name: string;
  dateOfBirth: string; // ISO date string
  respOpenedDate: string | null; // ISO date string
  catchUpYearsEnabled: boolean;
  catchUpYearsAvailable: number;
  createdAt: string;
  updatedAt: string;
}

// ETF type - represents an investment in the portfolio
export interface ETF {
  id: string;
  symbol: string;
  name: string;
  allocation: number; // 0-100
  historicalReturn: number; // percentage
  createdAt: string;
  updatedAt: string;
}

// Plan type - represents a contribution strategy
export interface Plan {
  id: string;
  name: string;
  description: string | null;
  childIds: string[]; // Children included in this plan
  projectionRate: 'conservative' | 'moderate' | 'optimistic' | 'custom';
  customRate: number | null; // If projectionRate is 'custom'
  inflationAdjusted: boolean;
  optimizeForGrowth: boolean;
  disabled: boolean; // If true, plan is excluded from dashboard stats
  createdAt: string;
  updatedAt: string;
}

// PlanChild type - links a child to a plan with specific settings
export interface PlanChild {
  planId: string;
  childId: string;
  frontloadYear: number | null; // null if no frontload
  catchUpYears: number[]; // Years designated for catch-up ($5000 contribution)
}

// Contribution type - represents a single contribution entry
export interface Contribution {
  id: string;
  planId: string;
  childId: string;
  year: number;
  amount: number;
  isLocked: boolean; // User-set constraint
  note: string | null;
}

// CLBOverride type - represents a user-edited CLB value
export interface CLBOverride {
  id: string;
  planId: string;
  childId: string;
  year: number;
  amount: number;
  isLocked: boolean; // User-set constraint
}

// IncomeYear type - represents family income for a specific year
export interface IncomeYear {
  year: number;
  familyIncome: number;
}

// AppSettings type - application-wide settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  hasCompletedWizard: boolean;
  lastOpenedPlanId: string | null;
}

// UIState type - UI preferences
export interface UIState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean; // for mobile
}

// ExportData type - for JSON export/import
export interface ExportData {
  version: string;
  exportedAt: string;
  children: Child[];
  etfs: ETF[];
  plans: Plan[];
  planChildren: PlanChild[];
  contributions: Contribution[];
  clbOverrides: CLBOverride[];
  incomeYears: IncomeYear[];
  settings: AppSettings;
}

// Projection rate type
export type ProjectionRate = 'conservative' | 'moderate' | 'optimistic' | 'custom';

// Grant eligibility tier
export type ACESGTier = 'tier1' | 'tier2' | 'none';

// Year constraint type for contribution planning
export interface YearConstraint {
  startYear: number;
  endYear: number;
  maxContribution: number;
}

// Calculated grant amounts for a year
export interface GrantCalculation {
  year: number;
  childId: string;
  contribution: number;
  cesg: number;
  acesg: number;
  clb: number;
  totalGrants: number;
  cumulativeContribution: number;
  cumulativeGrants: number;
}

// Projection result for a single year
export interface ProjectionYear {
  year: number;
  age: number;
  contribution: number;
  grants: number;
  growth: number;
  balance: number;
  inflationAdjustedBalance?: number;
}

// Child projection summary
export interface ChildProjection {
  childId: string;
  childName: string;
  projectionYears: ProjectionYear[];
  totalContributions: number;
  totalGrants: number;
  totalGrowth: number;
  finalBalance: number;
}
