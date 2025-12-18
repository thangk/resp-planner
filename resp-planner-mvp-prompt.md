# RESP Planner - Full Stack App Development Prompt

## Project Overview

Build a comprehensive RESP (Registered Education Savings Plan) Planner web application for Canadian families. The app helps parents plan and optimize their children's education savings by tracking contributions, government grants, and projected investment growth.

**App Name:** RESP Planner

**Architecture:** Client-side application with browser storage. Each user's data is stored in their own browser (localStorage), making it a static, isolated app that works on Vercel, Railway, or any static host. No server-side database required.

---

## Tech Stack

### Core Framework

- **Next.js 16** (latest) with App Router
- **React 19** (stable)
- **TypeScript** (strict mode enabled)
- **pnpm** as package manager

### Next.js 16 Specific Notes

- **Turbopack** is now the default bundler
- **`proxy.ts`** replaces `middleware.ts` (rename and export `proxy` function)
- **React Compiler** support is stable (auto-memoization)
- Minimum **Node.js 20.9.0** required

### UI & Styling

- **shadcn/ui** (latest version) - all UI components
- **Tailwind CSS 4** - styling
- **Lucide React** - icons (shadcn default)
- **Recharts** - charts and visualizations
- **sonner** - toast notifications

### State Management & Data

- **Zustand** - global state management with `persist` middleware
- **localStorage** - primary data persistence (via Zustand persist)
- No server-side database - all data stored in user's browser

### Forms & Validation

- **React Hook Form** - form handling
- **Zod** - schema validation

### Utilities

- **date-fns** - date manipulation
- **uuid** - unique ID generation

### Development Tools

- **ESLint 9** (flat config) - linting
- **Prettier** with Tailwind plugin - formatting
- **Husky** - git hooks
- **lint-staged** - pre-commit linting
- **Vitest** - unit testing
- **Playwright** - e2e testing

### Deployment

- **Vercel** (recommended) - zero config, free tier works
- **Railway** - Docker deployment option
- **Docker** + **docker-compose** - containerization (optional)

---

## Project Structure

```
resp-planner/
├── .husky/
│   └── pre-commit
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Redirects to dashboard or wizard
│   │   ├── globals.css
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Summary dashboard
│   │   ├── plans/
│   │   │   ├── page.tsx                # Plans list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx            # Single plan view
│   │   │   ├── compare/
│   │   │   │   └── page.tsx            # Plan comparison
│   │   │   └── new/
│   │   │       └── page.tsx            # New plan wizard
│   │   ├── children/
│   │   │   └── page.tsx                # Children management
│   │   ├── portfolio/
│   │   │   └── page.tsx                # Portfolio management
│   │   └── settings/
│   │       └── page.tsx                # App settings + data management
│   ├── components/
│   │   ├── ui/                         # shadcn components
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── footer.tsx
│   │   ├── dashboard/
│   │   │   ├── summary-cards.tsx
│   │   │   ├── quick-actions.tsx
│   │   │   └── recent-plans.tsx
│   │   ├── children/
│   │   │   ├── child-form.tsx
│   │   │   ├── child-card.tsx
│   │   │   ├── child-list.tsx
│   │   │   └── catch-up-toggle.tsx
│   │   ├── portfolio/
│   │   │   ├── etf-form.tsx
│   │   │   ├── etf-card.tsx
│   │   │   ├── allocation-chart.tsx
│   │   │   └── portfolio-summary.tsx
│   │   ├── plans/
│   │   │   ├── plan-form.tsx
│   │   │   ├── plan-card.tsx
│   │   │   ├── schedule-table.tsx
│   │   │   ├── contribution-editor.tsx
│   │   │   ├── frontload-selector.tsx
│   │   │   ├── year-constraints.tsx
│   │   │   ├── projection-settings.tsx
│   │   │   └── notes-editor.tsx
│   │   ├── charts/
│   │   │   ├── growth-chart.tsx
│   │   │   ├── breakdown-chart.tsx
│   │   │   ├── timeline-chart.tsx
│   │   │   └── comparison-chart.tsx
│   │   ├── grants/
│   │   │   ├── grant-calculator.tsx
│   │   │   ├── eligibility-indicator.tsx
│   │   │   └── grant-breakdown.tsx
│   │   ├── comparison/
│   │   │   ├── comparison-view.tsx
│   │   │   ├── plan-selector.tsx
│   │   │   └── diff-table.tsx
│   │   ├── wizard/
│   │   │   ├── quick-start-wizard.tsx
│   │   │   ├── step-indicator.tsx
│   │   │   └── wizard-steps/
│   │   ├── settings/
│   │   │   ├── data-management.tsx     # Export/Import/Clear data
│   │   │   └── storage-indicator.tsx   # Show storage usage
│   │   ├── shared/
│   │   │   ├── loading-skeleton.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   ├── tooltip-wrapper.tsx
│   │   │   ├── confirmation-dialog.tsx
│   │   │   ├── keyboard-shortcut.tsx
│   │   │   └── print-view.tsx
│   │   └── providers/
│   │       ├── theme-provider.tsx
│   │       └── toast-provider.tsx
│   ├── features/
│   │   ├── children/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── types.ts
│   │   ├── portfolio/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── types.ts
│   │   ├── plans/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── types.ts
│   │   └── grants/
│   │       ├── hooks/
│   │       ├── utils/
│   │       │   ├── cesg-calculator.ts
│   │       │   ├── acesg-calculator.ts
│   │       │   ├── clb-calculator.ts
│   │       │   └── eligibility-rules.ts
│   │       └── types.ts
│   ├── lib/
│   │   ├── utils.ts                    # General utilities
│   │   ├── constants.ts                # RESP limits, grant caps, etc.
│   │   └── validators.ts               # Zod schemas
│   ├── stores/                         # PRIMARY DATA LAYER (Zustand + persist)
│   │   ├── children-store.ts           # Children data + CRUD
│   │   ├── portfolio-store.ts          # ETFs data + CRUD
│   │   ├── plans-store.ts              # Plans + Contributions data + CRUD
│   │   ├── income-store.ts             # Income years data
│   │   ├── settings-store.ts           # App settings (theme, wizard state)
│   │   ├── ui-store.ts                 # UI preferences (sidebar state, etc.)
│   │   └── undo-store.ts               # Undo/redo history
│   ├── hooks/
│   │   ├── use-keyboard-shortcuts.ts
│   │   ├── use-undo-redo.ts
│   │   ├── use-inflation.ts
│   │   ├── use-export-import.ts        # JSON export/import logic
│   │   └── use-media-query.ts
│   └── types/
│       └── index.ts                    # All type definitions
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.example
├── .gitignore
├── .prettierrc
├── .prettierignore
├── eslint.config.mjs
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Data Types (TypeScript)

```typescript
// src/types/index.ts

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

export interface ETF {
  id: string;
  symbol: string;
  name: string;
  allocation: number; // 0-100
  historicalReturn: number; // percentage
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  childIds: string[]; // Children included in this plan
  projectionRate: 'conservative' | 'moderate' | 'optimistic' | 'custom';
  customRate: number | null; // If projectionRate is 'custom'
  inflationAdjusted: boolean;
  optimizeForGrowth: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanChild {
  planId: string;
  childId: string;
  frontloadYear: number | null; // null if no frontload
}

export interface Contribution {
  id: string;
  planId: string;
  childId: string;
  year: number;
  amount: number;
  isLocked: boolean; // User-set constraint
  note: string | null;
}

export interface IncomeYear {
  year: number;
  familyIncome: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  hasCompletedWizard: boolean;
  lastOpenedPlanId: string | null;
}

// For JSON export/import
export interface ExportData {
  version: string;
  exportedAt: string;
  children: Child[];
  etfs: ETF[];
  plans: Plan[];
  planChildren: PlanChild[];
  contributions: Contribution[];
  incomeYears: IncomeYear[];
  settings: AppSettings;
}
```

---

## Zustand Stores (Primary Data Layer)

All data is stored in the user's browser via Zustand's `persist` middleware.

### Example: Children Store

```typescript
// src/stores/children-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Child } from '@/types';

interface ChildrenState {
  children: Child[];

  // CRUD operations
  addChild: (
    child: Omit<Child, 'id' | 'createdAt' | 'updatedAt' | 'catchUpYearsAvailable'>
  ) => string;
  updateChild: (id: string, updates: Partial<Child>) => void;
  removeChild: (id: string) => void;
  getChild: (id: string) => Child | undefined;

  // Bulk operations for import
  setChildren: (children: Child[]) => void;
  clearChildren: () => void;
}

export const useChildrenStore = create<ChildrenState>()(
  persist(
    (set, get) => ({
      children: [],

      addChild: (childData) => {
        const id = uuid();
        const now = new Date().toISOString();
        const newChild: Child = {
          ...childData,
          id,
          catchUpYearsAvailable: calculateCatchUpYears(
            childData.dateOfBirth,
            childData.respOpenedDate
          ),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ children: [...state.children, newChild] }));
        return id;
      },

      updateChild: (id, updates) => {
        set((state) => ({
          children: state.children.map((child) =>
            child.id === id ? { ...child, ...updates, updatedAt: new Date().toISOString() } : child
          ),
        }));
      },

      removeChild: (id) => {
        set((state) => ({
          children: state.children.filter((child) => child.id !== id),
        }));
      },

      getChild: (id) => get().children.find((child) => child.id === id),

      setChildren: (children) => set({ children }),

      clearChildren: () => set({ children: [] }),
    }),
    {
      name: 'resp-planner-children', // localStorage key
    }
  )
);
```

### All Stores to Create

| Store                | localStorage Key         | Purpose                              |
| -------------------- | ------------------------ | ------------------------------------ |
| `children-store.ts`  | `resp-planner-children`  | Children data + CRUD                 |
| `portfolio-store.ts` | `resp-planner-portfolio` | ETFs data + CRUD                     |
| `plans-store.ts`     | `resp-planner-plans`     | Plans + PlanChildren + Contributions |
| `income-store.ts`    | `resp-planner-income`    | Income years data                    |
| `settings-store.ts`  | `resp-planner-settings`  | Theme, wizard state, preferences     |
| `ui-store.ts`        | `resp-planner-ui`        | Sidebar state, UI preferences        |
| `undo-store.ts`      | `resp-planner-undo`      | Undo/redo history                    |

---

## Core Features

### 1. Children Management

- Add, edit, remove children
- Fields: Name, Date of Birth, RESP Opened Date
- Toggle catch-up years on/off per child
- Auto-calculate available catch-up years based on DOB and RESP opened date
- Calculate age and "turns 18" year
- Validation: DOB must be in the past, RESP opened date must be on or after DOB

### 2. Portfolio Management

- Add, edit, remove ETFs
- Fields: Symbol (e.g., VFV.TO), Name, Allocation %, Historical Return %
- Allocation must sum to 100% (validation warning if not)
- Calculate blended historical return
- Visual allocation pie/bar chart
- Default portfolio: 50% VFV.TO, 30% VEQT.TO, 20% TEC.TO

### 3. Contribution Planning

- **Yearly schedule table** per child showing:
  - Year, Age, Contribution, CESG, ACESG, CLB, Total Grants, Cumulative Contribution, Cumulative Grants
- **Year constraints**: Allow user to set max contribution for a range of years
  - Example: "2026-2028: max $2,500 per child per year"
  - These years become "locked" in the optimizer
- **Frontload selector**: Choose which year to frontload for each child
  - Dropdown per child in the plan
  - Calculator shows how much to frontload based on remaining room
- **"Optimize for growth" toggle**:
  - ON: Frontload as early as possible while respecting constraints and grant eligibility
  - OFF: Spread contributions evenly

### 4. Government Grants Engine

Implement accurate Canadian RESP grant rules:

**CESG (Canada Education Savings Grant)**

- Basic: 20% on first $2,500/year = max $500/year
- Lifetime cap: $7,200 per child
- Catch-up: Can claim 1 missed year per year (max $1,000 CESG/year with $5,000 contribution)
- Eligible until end of calendar year child turns 17

**ACESG (Additional CESG)**

- Family income ≤ $55,867 (2025): Extra 20% on first $500 = $100
- Family income $55,867 - $111,733: Extra 10% on first $500 = $50
- Above $111,733: Not eligible
- Use 2025 thresholds for projections (note: thresholds may adjust for inflation)

**CLB (Canada Learning Bond)**

- $500 first year + $100/year until age 15
- Max $2,000 per child
- Family income threshold ≤ $55,867 (2025) for 1-3 children
- Must have RESP open to receive

**Income-based eligibility**

- User inputs expected family income per year
- Auto-toggle ACESG tier and CLB eligibility based on income
- Show eligibility indicators in the schedule

### 5. Projections

**Projection rate presets (dynamic based on portfolio):**

- **Moderate:** Uses the portfolio's blended return (weighted average of all ETF historical returns)
- **Conservative:** 0.9x the moderate rate (rounded to 1 decimal place)
- **Optimistic:** 1.1x the moderate rate (rounded to 1 decimal place)
- **Custom:** User-defined rate

**Fallback defaults (when no portfolio ETFs are set):**

- Conservative: 4%
- Moderate: 6%
- Optimistic: 8%

**Example:** If portfolio has ETFs with blended return of 7.5%, then:

- Conservative = 6.8% (7.5 × 0.9)
- Moderate = 7.5%
- Optimistic = 8.3% (7.5 × 1.1)

**Inflation adjustment toggle:**

- When ON: Show values in today's dollars (assume 2% inflation)
- Display both nominal and real values

**Calculations:**

- Project contribution + grants + compound growth to age 18
- Show breakdown: Your contributions vs Grants vs Investment growth

### 6. Multiple Plans & Comparison

- Create, save, rename, delete plans
- Each plan can have different:
  - Children included
  - Frontload years
  - Year constraints
  - Projection settings
- **Comparison tool:**
  - Select 2 plans to compare side-by-side
  - Show difference in projected values
  - Highlight which strategy wins and by how much
  - Charts comparing growth trajectories

### 7. Visualizations

**Growth chart (line):**

- X-axis: Years
- Y-axis: Portfolio value
- Lines: Each child + combined total
- Hover: Show exact values

**Breakdown chart (stacked bar):**

- Per child at age 18
- Segments: Contributions, Grants, Growth
- Show percentages

**Timeline chart:**

- Horizontal bar chart showing contributions per year
- Color-coded by child
- Highlight frontload years

**Comparison chart:**

- Overlay two plans' growth trajectories
- Show delta at age 18

### 8. Notes

- Add notes per year per child
- Example: "Use tax refund", "Bonus month", "Parental leave - reduced income"
- Notes appear in schedule table and are included in export

### 9. UI/UX Features

**Quick Start Wizard:**

- Step 1: Add your children (name, DOB)
- Step 2: Set up portfolio (or use defaults)
- Step 3: Enter expected income
- Step 4: Choose contribution strategy
- Step 5: Review generated plan
- Can be skipped, accessible from dashboard

**Summary Dashboard:**

- Total children
- Total projected value across all children
- Next contribution due
- Grant eligibility status
- Quick links to recent plans

**Year highlighting:**

- Past years: Grayed out, non-editable
- Current year: Highlighted border
- Future years: Normal, editable

**Keyboard shortcuts:**

- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Ctrl/Cmd + S`: Save (shows "All changes saved" toast)
- `Ctrl/Cmd + N`: New plan
- `Ctrl/Cmd + P`: Print view
- `Escape`: Close modals
- Display shortcut hints in UI

**Undo/Redo:**

- Track all plan changes
- Store in Zustand with persist to localStorage
- Show undo/redo buttons in header
- Toast notification on undo/redo

**Auto-save:**

- All changes automatically persist to localStorage via Zustand
- Show "All changes saved" indicator
- Instant persistence (no debounce needed for localStorage)

**Dark mode:**

- Toggle in settings/header
- Persist preference
- Use shadcn's built-in dark mode support

**Tooltips:**

- Info icons next to CESG, ACESG, CLB with explanations
- Hover on any grant amount to see calculation breakdown
- Explain catch-up rules

**Validation warnings:**

- Exceeding $50K lifetime contribution limit
- Missing grant opportunities (e.g., not contributing enough to max CESG)
- Allocation not summing to 100%
- Income not set for a year (affects grant calculation)

**Loading states:**

- Skeleton loaders for initial hydration
- Suspense boundaries for async components

**Mobile responsive:**

- Collapsible sidebar → bottom nav on mobile
- Tables become cards on small screens
- Touch-friendly inputs
- Swipe gestures where appropriate

### 10. Data Management (Settings Page)

**JSON Export:**

- Export all data to a JSON file
- Include: children, ETFs, plans, contributions, income, settings
- Timestamped filename: `resp-planner-backup-2025-01-15.json`
- Download trigger via browser

**JSON Import:**

- Import data from a previously exported JSON file
- Validate JSON structure before import
- Option to merge or replace existing data
- Show preview of what will be imported

**Clear All Data:**

- Button to clear all localStorage data
- Requires confirmation dialog
- "Are you sure? This cannot be undone."

**Storage Indicator:**

- Show current localStorage usage
- Warn if approaching browser limits (~5-10MB)

### 11. Print/PDF View

- Clean, printer-friendly layout
- Excludes navigation, actions
- Includes: Summary, schedule tables, charts
- "Print" button opens print dialog

### 12. Accessibility (a11y)

- Full keyboard navigation
- ARIA labels on interactive elements
- Focus management in modals/dialogs
- Skip links
- Reduced motion support
- Screen reader announcements for toasts/updates
- Color contrast compliance (WCAG AA)

---

## Constants & Rules

```typescript
// src/lib/constants.ts

export const RESP_RULES = {
  // Contribution limits
  LIFETIME_CONTRIBUTION_LIMIT: 50000,
  NO_ANNUAL_CONTRIBUTION_LIMIT: true, // No annual limit, only lifetime

  // CESG
  CESG_RATE: 0.2,
  CESG_ANNUAL_CONTRIBUTION_MAX: 2500,
  CESG_ANNUAL_MAX: 500,
  CESG_LIFETIME_MAX: 7200,
  CESG_CATCHUP_MAX_PER_YEAR: 1000, // With $5000 contribution
  CESG_ELIGIBLE_UNTIL_AGE: 17, // End of calendar year they turn 17

  // ACESG (2025 thresholds - use for projections)
  ACESG_TIER1_INCOME_MAX: 55867,
  ACESG_TIER1_RATE: 0.2,
  ACESG_TIER1_CONTRIBUTION_MAX: 500,
  ACESG_TIER1_MAX: 100,
  ACESG_TIER2_INCOME_MAX: 111733,
  ACESG_TIER2_RATE: 0.1,
  ACESG_TIER2_CONTRIBUTION_MAX: 500,
  ACESG_TIER2_MAX: 50,

  // CLB
  CLB_FIRST_YEAR: 500,
  CLB_SUBSEQUENT_YEARS: 100,
  CLB_LIFETIME_MAX: 2000,
  CLB_INCOME_THRESHOLD_1_3_CHILDREN: 55867, // 2025
  CLB_ELIGIBLE_UNTIL_AGE: 15,
  CLB_CLAIMABLE_UNTIL_AGE: 21,

  // Projections (fallback defaults when no portfolio is set)
  // Actual rates are dynamically calculated from portfolio blended return:
  // - moderate = portfolio blended return
  // - conservative = moderate × 0.9
  // - optimistic = moderate × 1.1
  PROJECTION_RATES: {
    conservative: 0.04,
    moderate: 0.06,
    optimistic: 0.08,
  },
  DEFAULT_INFLATION_RATE: 0.02,

  // RESP lifecycle
  RESP_MUST_CLOSE_YEARS_AFTER_OPEN: 35,
  BENEFICIARY_MAX_AGE_AT_OPEN: 31,
} as const;

// App metadata
export const APP_CONFIG = {
  name: 'RESP Planner',
  version: '1.0.0',
  storagePrefix: 'resp-planner',
} as const;
```

---

## Environment Variables

```bash
# .env.example

# App (optional - can be hardcoded in constants.ts)
NEXT_PUBLIC_APP_NAME="RESP Planner"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# Optional: Analytics (future)
# NEXT_PUBLIC_ANALYTICS_ID=""
```

Note: No database URL needed - all data stored in browser localStorage.

---

## Docker Configuration

```dockerfile
# Dockerfile

FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    restart: unless-stopped
```

Note: No volumes needed - data is stored in user's browser, not on server.

---

## VSCode Configuration

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "mikestead.dotenv"
  ]
}
```

---

## Implementation Order

### Phase 1: Foundation

1. Initialize Next.js 16 project with TypeScript, pnpm
2. Set up Tailwind CSS 4 and shadcn/ui
3. Configure ESLint 9, Prettier, Husky, lint-staged
4. Create TypeScript types (`src/types/index.ts`)
5. Set up Zustand stores with persist middleware
6. Create basic layout (header, sidebar, mobile nav)
7. Implement dark mode toggle
8. Add loading skeletons and error boundaries

### Phase 2: Core Data Management

1. Children management (CRUD via Zustand)
2. Portfolio/ETF management (CRUD via Zustand)
3. Income years management
4. Form validation with React Hook Form + Zod
5. Toast notifications

### Phase 3: Plans & Calculations

1. Plan CRUD operations
2. Grant calculation engine (CESG, ACESG, CLB)
3. Contribution schedule generator
4. Year constraints system
5. Frontload year selector
6. "Optimize for growth" algorithm
7. Projection calculations

### Phase 4: Visualizations & UI Polish

1. Schedule table component
2. Growth chart (Recharts)
3. Breakdown chart
4. Timeline chart
5. Tooltips with grant explanations
6. Validation warnings
7. Year highlighting (past/current/future)

### Phase 5: Advanced Features

1. Quick start wizard
2. Summary dashboard
3. Multiple plans management
4. Comparison tool with comparison chart
5. Notes per year
6. Undo/redo system
7. Keyboard shortcuts

### Phase 6: Export & Finishing

1. JSON export/import (critical for data backup)
2. Clear all data functionality
3. Storage usage indicator
4. Print/PDF view
5. Mobile responsive refinements
6. Accessibility audit and fixes
7. README documentation
8. Docker configuration
9. Testing (Vitest unit tests, Playwright e2e)

---

## Design Guidelines

### Color Palette

Avoid overly purple/AI-looking design. Use a professional, financial app aesthetic:

- **Primary:** Slate/Gray tones for professionalism
- **Accent:** Teal or Blue-green for CTAs and highlights
- **Success:** Green for positive projections, grants received
- **Warning:** Amber for validation warnings
- **Error:** Red for errors, exceeding limits
- **Charts:** Use a harmonious palette (avoid neon colors)

### Typography

- Clean, readable sans-serif (system fonts via Tailwind)
- Clear hierarchy: Large titles, medium section headers, readable body text
- Proper spacing and line heights

### Components Style

- Rounded corners (not too sharp, not too round)
- Subtle shadows for depth
- Clean borders
- Adequate padding
- Consistent spacing using Tailwind's spacing scale

### Mobile

- Touch targets minimum 44x44px
- Collapsible sidebar → bottom navigation
- Cards instead of tables on small screens
- Sticky headers for tables

---

## Testing Requirements

### Unit Tests (Vitest)

- Grant calculation functions (CESG, ACESG, CLB)
- Projection calculations
- Catch-up year calculations
- Contribution optimizer
- Validation schemas
- Zustand store actions

### E2E Tests (Playwright)

- Add a child flow
- Create a plan flow
- Edit contributions
- Compare two plans
- Export/import JSON
- Dark mode toggle
- Keyboard shortcuts
- localStorage persistence (refresh and data remains)

---

## README Structure

Include:

1. Project description and screenshots
2. Features list
3. Tech stack
4. Prerequisites (Node 20.9+, pnpm)
5. Quick start (local development)
6. Docker deployment
7. Vercel deployment (recommended)
8. Railway deployment
9. Project structure overview
10. Data storage explanation (browser localStorage)
11. RESP rules reference
12. Contributing guidelines
13. License

---

## Data Persistence Notes

**Important for users to understand:**

- All data is stored in your browser's localStorage
- Data persists until you clear your browser data or use "Clear All Data"
- Data does NOT sync across devices or browsers
- Use JSON export to backup your data
- Use JSON import to restore data or move to another browser/device

**Storage Limits:**

- localStorage typically allows 5-10MB per domain
- This is more than enough for RESP planning data
- Show warning if approaching limits

---

## Final Notes

- Use client components for all interactive features (data stored in browser)
- Server components can be used for static layout elements
- Implement proper error handling throughout
- Keep bundle size minimal
- Ensure all interactions feel snappy (localStorage is synchronous)
- Follow conventional commits for all git commits
- Document complex calculations with comments
- Use TypeScript strictly (no `any` types)
- Test localStorage persistence across page refreshes

---

**Start by setting up the project foundation (Phase 1), then proceed through each phase sequentially. Ask clarifying questions if any RESP rules or feature requirements are unclear.**
