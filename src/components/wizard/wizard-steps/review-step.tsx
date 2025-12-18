'use client';

import { format } from 'date-fns';
import { Users, PieChart, DollarSign, TrendingUp, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useChildrenStore } from '@/stores/children-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { useIncomeStore } from '@/stores/income-store';
import { formatCurrency } from '@/lib/utils';
import type { ContributionStrategy } from './strategy-step';

interface ReviewStepProps {
  strategy: ContributionStrategy;
  onBack: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

const STRATEGY_LABELS: Record<ContributionStrategy, string> = {
  optimize: 'Optimize for Growth',
  steady: 'Steady Contributions',
  frontload: 'Aggressive Frontload',
};

export function ReviewStep({ strategy, onBack, onComplete, isSubmitting }: ReviewStepProps) {
  const { children } = useChildrenStore();
  const { etfs, getBlendedReturn, getTotalAllocation } = usePortfolioStore();
  const { incomeYears } = useIncomeStore();

  const blendedReturn = getBlendedReturn();
  const totalAllocation = getTotalAllocation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Review Your Setup</h2>
        <p className="text-muted-foreground">Confirm your settings and create your first plan.</p>
      </div>

      {/* Children Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="text-primary h-5 w-5" />
            Children ({children.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {children.map((child) => (
              <div key={child.id} className="flex items-center justify-between py-1">
                <span className="font-medium">{child.name}</span>
                <span className="text-muted-foreground text-sm">
                  Born {format(new Date(child.dateOfBirth), 'MMM d, yyyy')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChart className="text-primary h-5 w-5" />
            Portfolio ({etfs.length} ETFs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {etfs.map((etf) => (
              <div key={etf.id} className="flex items-center justify-between py-1">
                <span className="font-medium">{etf.symbol}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {etf.historicalReturn}% return
                  </span>
                  <Badge variant="secondary">{etf.allocation}%</Badge>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Blended Return</span>
            <span className="font-medium">{blendedReturn.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Total Allocation</span>
            <Badge variant={totalAllocation === 100 ? 'default' : 'destructive'}>
              {totalAllocation}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Income Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="text-primary h-5 w-5" />
            Family Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incomeYears.length > 0 ? (
            <div className="space-y-2">
              {[...incomeYears]
                .sort((a, b) => a.year - b.year)
                .slice(0, 3)
                .map((income) => (
                  <div key={income.year} className="flex items-center justify-between py-1">
                    <span className="font-medium">{income.year}</span>
                    <span className="text-sm">{formatCurrency(income.familyIncome)}</span>
                  </div>
                ))}
              {incomeYears.length > 3 && (
                <p className="text-muted-foreground text-xs">
                  +{incomeYears.length - 3} more years
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No income data entered. Only basic CESG will be calculated.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Strategy Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="text-primary h-5 w-5" />
            Contribution Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="default" className="text-sm">
            {STRATEGY_LABELS[strategy]}
          </Badge>
        </CardContent>
      </Card>

      {/* What happens next */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="text-primary h-5 w-5" />
            What happens next
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="text-primary h-4 w-4" />
              We&apos;ll create a contribution plan for all your children
            </li>
            <li className="flex items-center gap-2">
              <Check className="text-primary h-4 w-4" />
              Government grants (CESG, ACESG, CLB) will be calculated
            </li>
            <li className="flex items-center gap-2">
              <Check className="text-primary h-4 w-4" />
              You&apos;ll see projected growth based on your portfolio
            </li>
            <li className="flex items-center gap-2">
              <Check className="text-primary h-4 w-4" />
              You can adjust contributions at any time
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onComplete} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Plan'}
        </Button>
      </div>
    </div>
  );
}
