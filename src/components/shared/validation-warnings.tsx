'use client';

import { AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { RESP_RULES } from '@/lib/constants';

export type WarningLevel = 'info' | 'warning' | 'error';

export interface ValidationWarning {
  id: string;
  level: WarningLevel;
  title: string;
  message: string;
  suggestion?: string;
}

interface ValidationWarningsProps {
  warnings: ValidationWarning[];
  className?: string;
  dismissible?: boolean;
  onDismiss?: (id: string) => void;
}

const LEVEL_CONFIG: Record<
  WarningLevel,
  {
    icon: typeof AlertTriangle;
    variant: 'default' | 'destructive';
    className: string;
  }
> = {
  info: {
    icon: Info,
    variant: 'default',
    className:
      'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
  },
  warning: {
    icon: AlertTriangle,
    variant: 'default',
    className:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
  },
  error: {
    icon: XCircle,
    variant: 'destructive',
    className: '',
  },
};

export function ValidationWarnings({
  warnings,
  className,
  dismissible = false,
  onDismiss,
}: ValidationWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {warnings.map((warning) => {
        const config = LEVEL_CONFIG[warning.level];
        const Icon = config.icon;

        return (
          <Alert
            key={warning.id}
            variant={config.variant}
            className={cn(config.className, 'relative')}
          >
            <Icon className="h-4 w-4" />
            <AlertTitle className="font-semibold">{warning.title}</AlertTitle>
            <AlertDescription className="mt-1">
              <p>{warning.message}</p>
              {warning.suggestion && (
                <p className="mt-1 text-sm opacity-90">
                  <strong>Suggestion:</strong> {warning.suggestion}
                </p>
              )}
            </AlertDescription>
            {dismissible && onDismiss && (
              <button
                onClick={() => onDismiss(warning.id)}
                className="absolute top-3 right-3 opacity-70 hover:opacity-100"
              >
                <AlertCircle className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </button>
            )}
          </Alert>
        );
      })}
    </div>
  );
}

// Utility functions to generate common warnings

export function checkLifetimeContributionLimit(
  totalContributions: number
): ValidationWarning | null {
  const limit = RESP_RULES.LIFETIME_CONTRIBUTION_LIMIT;
  const percentage = (totalContributions / limit) * 100;

  if (totalContributions > limit) {
    return {
      id: 'lifetime-limit-exceeded',
      level: 'error',
      title: 'Lifetime Contribution Limit Exceeded',
      message: `Total contributions of $${totalContributions.toLocaleString()} exceed the lifetime limit of $${limit.toLocaleString()}.`,
      suggestion: `Reduce your contributions by $${(totalContributions - limit).toLocaleString()} to stay within the limit.`,
    };
  }

  if (percentage >= 90) {
    return {
      id: 'lifetime-limit-approaching',
      level: 'warning',
      title: 'Approaching Lifetime Contribution Limit',
      message: `You've used ${percentage.toFixed(0)}% of the $${limit.toLocaleString()} lifetime contribution limit.`,
      suggestion: `You have $${(limit - totalContributions).toLocaleString()} remaining for contributions.`,
    };
  }

  return null;
}

export function checkMissedGrantOpportunities(
  yearlyContribution: number,
  cumulativeCESG: number,
  childAge: number
): ValidationWarning | null {
  const optimalContribution = RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX;
  const cesgLifetimeMax = RESP_RULES.CESG_LIFETIME_MAX;
  const eligibleUntilAge = RESP_RULES.CESG_ELIGIBLE_UNTIL_AGE;

  // Check if they're under-contributing and missing CESG
  if (
    yearlyContribution < optimalContribution &&
    cumulativeCESG < cesgLifetimeMax &&
    childAge <= eligibleUntilAge
  ) {
    const missedCESG = (optimalContribution - yearlyContribution) * RESP_RULES.CESG_RATE;
    return {
      id: `missed-cesg-${childAge}`,
      level: 'info',
      title: 'Potential Grant Opportunity',
      message: `Contributing $${yearlyContribution.toLocaleString()} this year. Contributing $${optimalContribution.toLocaleString()} would earn an additional $${missedCESG.toLocaleString()} in CESG.`,
      suggestion: `Consider increasing your contribution to maximize the 20% CESG match.`,
    };
  }

  return null;
}

export function checkCESGLifetimeProgress(
  cumulativeCESG: number,
  childAge: number
): ValidationWarning | null {
  const cesgLifetimeMax = RESP_RULES.CESG_LIFETIME_MAX;
  const eligibleUntilAge = RESP_RULES.CESG_ELIGIBLE_UNTIL_AGE;
  const yearsRemaining = eligibleUntilAge - childAge;

  if (cumulativeCESG >= cesgLifetimeMax) {
    return {
      id: 'cesg-maxed',
      level: 'info',
      title: 'CESG Lifetime Maximum Reached',
      message: `Congratulations! You've received the full $${cesgLifetimeMax.toLocaleString()} lifetime CESG.`,
    };
  }

  if (yearsRemaining > 0) {
    const remainingCESG = cesgLifetimeMax - cumulativeCESG;
    const annualCESGNeeded = remainingCESG / yearsRemaining;
    const annualContributionNeeded = annualCESGNeeded / RESP_RULES.CESG_RATE;

    if (annualContributionNeeded > RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX) {
      return {
        id: 'cesg-catch-up-needed',
        level: 'warning',
        title: 'CESG Catch-up Needed',
        message: `To maximize CESG before eligibility ends, you need to contribute more than $${RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX.toLocaleString()}/year.`,
        suggestion: `Consider using catch-up room to contribute $${Math.min(RESP_RULES.CESG_ANNUAL_CONTRIBUTION_MAX * 2, RESP_RULES.LIFETIME_CONTRIBUTION_LIMIT).toLocaleString()}/year for the next few years.`,
      };
    }
  }

  return null;
}

export function checkPortfolioAllocation(totalAllocation: number): ValidationWarning | null {
  if (totalAllocation === 0) {
    return {
      id: 'portfolio-empty',
      level: 'info',
      title: 'No Portfolio Set',
      message: "You haven't added any ETFs to your portfolio yet.",
      suggestion: 'Add ETFs to see accurate projection rates based on your investment returns.',
    };
  }

  if (totalAllocation !== 100) {
    return {
      id: 'portfolio-allocation',
      level: 'warning',
      title: 'Portfolio Allocation Issue',
      message: `Your portfolio allocation totals ${totalAllocation}%, not 100%.`,
      suggestion:
        totalAllocation < 100
          ? `Add ${100 - totalAllocation}% more allocation to your ETFs.`
          : `Reduce allocation by ${totalAllocation - 100}% across your ETFs.`,
    };
  }

  return null;
}

export function checkIncomeSet(
  year: number,
  incomeYears: { year: number; familyIncome: number }[]
): ValidationWarning | null {
  const incomeYear = incomeYears.find((iy) => iy.year === year);

  if (!incomeYear || incomeYear.familyIncome === 0) {
    return {
      id: `income-not-set-${year}`,
      level: 'info',
      title: `Income Not Set for ${year}`,
      message: 'Family income affects ACESG and CLB eligibility calculations.',
      suggestion: 'Set your expected family income in Settings to get accurate grant estimates.',
    };
  }

  return null;
}
