// RESP Rules and Limits (Canadian government rules)
export const RESP_RULES = {
  // Contribution limits
  LIFETIME_CONTRIBUTION_LIMIT: 50000,
  NO_ANNUAL_CONTRIBUTION_LIMIT: true, // No annual limit, only lifetime

  // CESG (Canada Education Savings Grant)
  CESG_RATE: 0.2,
  CESG_ANNUAL_CONTRIBUTION_MAX: 2500,
  CESG_ANNUAL_MAX: 500,
  CESG_LIFETIME_MAX: 7200,
  CESG_CATCHUP_MAX_PER_YEAR: 1000, // With $5000 contribution
  CESG_ELIGIBLE_UNTIL_AGE: 17, // End of calendar year they turn 17

  // ACESG (Additional CESG) - 2025 thresholds
  ACESG_TIER1_INCOME_MAX: 55867,
  ACESG_TIER1_RATE: 0.2,
  ACESG_TIER1_CONTRIBUTION_MAX: 500,
  ACESG_TIER1_MAX: 100,
  ACESG_TIER2_INCOME_MAX: 111733,
  ACESG_TIER2_RATE: 0.1,
  ACESG_TIER2_CONTRIBUTION_MAX: 500,
  ACESG_TIER2_MAX: 50,

  // CLB (Canada Learning Bond)
  CLB_FIRST_YEAR: 500,
  CLB_SUBSEQUENT_YEARS: 100,
  CLB_LIFETIME_MAX: 2000,
  CLB_INCOME_THRESHOLD_1_3_CHILDREN: 55867, // 2025
  CLB_ELIGIBLE_UNTIL_AGE: 15,
  CLB_CLAIMABLE_UNTIL_AGE: 21,

  // Projections
  PROJECTION_RATES: {
    conservative: 0.08,
    moderate: 0.1,
    optimistic: 0.12,
  } as const,
  DEFAULT_INFLATION_RATE: 0.02,

  // RESP lifecycle
  RESP_MUST_CLOSE_YEARS_AFTER_OPEN: 35,
  BENEFICIARY_MAX_AGE_AT_OPEN: 31,
} as const;

// App configuration
export const APP_CONFIG = {
  name: 'RESP Planner',
  version: '1.0.0',
  storagePrefix: 'resp-planner',
} as const;

// Storage keys for Zustand persist
export const STORAGE_KEYS = {
  children: `${APP_CONFIG.storagePrefix}-children`,
  portfolio: `${APP_CONFIG.storagePrefix}-portfolio`,
  plans: `${APP_CONFIG.storagePrefix}-plans`,
  income: `${APP_CONFIG.storagePrefix}-income`,
  settings: `${APP_CONFIG.storagePrefix}-settings`,
  ui: `${APP_CONFIG.storagePrefix}-ui`,
  undo: `${APP_CONFIG.storagePrefix}-undo`,
} as const;

// Navigation items for sidebar
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Wizard',
    href: '/wizard',
    icon: 'Sparkles',
  },
  {
    label: 'Plans',
    href: '/plans',
    icon: 'FileText',
  },
  {
    label: 'Children',
    href: '/children',
    icon: 'Users',
  },
  {
    label: 'Portfolio',
    href: '/portfolio',
    icon: 'PieChart',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
  },
] as const;

// Projection rates as percentages for display
export const PROJECTION_RATES = {
  conservative: 4,
  moderate: 6,
  optimistic: 8,
} as const;

// Default ETFs for portfolio
export const DEFAULT_ETFS = [
  {
    symbol: 'VFV.TO',
    name: 'Vanguard S&P 500 Index ETF',
    allocation: 50,
    historicalReturn: 10.5,
  },
  {
    symbol: 'VEQT.TO',
    name: 'Vanguard All-Equity ETF Portfolio',
    allocation: 30,
    historicalReturn: 9.8,
  },
  {
    symbol: 'TEC.TO',
    name: 'TD Global Technology Leaders Index ETF',
    allocation: 20,
    historicalReturn: 12.2,
  },
] as const;
