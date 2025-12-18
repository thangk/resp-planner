'use client';

import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type GrantType = 'cesg' | 'acesg' | 'clb';

interface GrantTooltipProps {
  type: GrantType;
  className?: string;
  iconSize?: number;
}

const GRANT_INFO: Record<
  GrantType,
  {
    name: string;
    fullName: string;
    description: string;
    details: string[];
  }
> = {
  cesg: {
    name: 'CESG',
    fullName: 'Canada Education Savings Grant',
    description:
      'A government grant that matches 20% of your annual RESP contributions, up to $500 per year.',
    details: [
      'Basic rate: 20% on first $2,500/year = max $500/year',
      'Lifetime maximum: $7,200 per child',
      'Catch-up: Can claim 1 missed year per year (max $1,000 CESG/year with $5,000 contribution)',
      'Eligible until end of calendar year child turns 17',
    ],
  },
  acesg: {
    name: 'ACESG',
    fullName: 'Additional Canada Education Savings Grant',
    description: 'An additional grant for lower-income families on top of the basic CESG.',
    details: [
      'Family income ≤ $55,867: Extra 20% on first $500 = up to $100',
      'Family income $55,867 - $111,733: Extra 10% on first $500 = up to $50',
      'Above $111,733: Not eligible',
      'Thresholds are adjusted annually for inflation',
    ],
  },
  clb: {
    name: 'CLB',
    fullName: 'Canada Learning Bond',
    description:
      'A government bond for children from lower-income families, no contributions required.',
    details: [
      '$500 in the first year',
      '$100 each subsequent year until age 15',
      'Lifetime maximum: $2,000 per child',
      'Family income threshold: ≤ $55,867 (for 1-3 children)',
      'Must have RESP open to receive',
      'Can be claimed until age 21',
    ],
  },
};

export function GrantTooltip({ type, className, iconSize = 14 }: GrantTooltipProps) {
  const info = GRANT_INFO[type];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors',
              className
            )}
          >
            <Info size={iconSize} />
            <span className="sr-only">Learn more about {info.name}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[350px] p-4">
          <div className="space-y-2">
            <div>
              <p className="font-semibold">{info.name}</p>
              <p className="text-muted-foreground text-xs">{info.fullName}</p>
            </div>
            <p className="text-sm">{info.description}</p>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs">
              {info.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface GrantLabelProps {
  type: GrantType;
  className?: string;
  showTooltip?: boolean;
}

export function GrantLabel({ type, className, showTooltip = true }: GrantLabelProps) {
  const info = GRANT_INFO[type];

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span>{info.name}</span>
      {showTooltip && <GrantTooltip type={type} />}
    </span>
  );
}

interface GrantBreakdownTooltipProps {
  contribution: number;
  cesg: number;
  acesg: number;
  clb: number;
  totalGrants: number;
  cumulativeCESG?: number;
  cumulativeContribution?: number;
}

export function GrantBreakdownTooltip({
  contribution,
  cesg,
  acesg,
  clb,
  totalGrants,
  cumulativeCESG,
  cumulativeContribution,
}: GrantBreakdownTooltipProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="hover:bg-muted/50 -mx-1 rounded px-1 text-left transition-colors"
          >
            {formatCurrency(totalGrants)}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="p-3">
          <div className="min-w-[180px] space-y-2">
            <p className="text-sm font-semibold">Grant Breakdown</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contribution:</span>
                <span>{formatCurrency(contribution)}</span>
              </div>
              <div className="space-y-1 border-t pt-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CESG (20%):</span>
                  <span>{formatCurrency(cesg)}</span>
                </div>
                {acesg > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ACESG:</span>
                    <span>{formatCurrency(acesg)}</span>
                  </div>
                )}
                {clb > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CLB:</span>
                    <span>{formatCurrency(clb)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between border-t pt-1 font-semibold">
                <span>Total Grants:</span>
                <span className="text-green-600">{formatCurrency(totalGrants)}</span>
              </div>
            </div>
            {(cumulativeCESG !== undefined || cumulativeContribution !== undefined) && (
              <div className="text-muted-foreground border-t pt-2 text-xs">
                {cumulativeContribution !== undefined && (
                  <div className="flex justify-between">
                    <span>Cumulative contributions:</span>
                    <span>{formatCurrency(cumulativeContribution)}</span>
                  </div>
                )}
                {cumulativeCESG !== undefined && (
                  <div className="flex justify-between">
                    <span>Cumulative CESG:</span>
                    <span>{formatCurrency(cumulativeCESG)} / $7,200</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
