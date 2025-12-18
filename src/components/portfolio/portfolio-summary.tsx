'use client';

import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePortfolioStore } from '@/stores/portfolio-store';

export function PortfolioSummary() {
  const { etfs, getTotalAllocation, getBlendedReturn, isAllocationValid } = usePortfolioStore();

  const totalAllocation = getTotalAllocation();
  const blendedReturn = getBlendedReturn();
  const isValid = isAllocationValid();

  if (etfs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Allocation Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Total Allocation</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{totalAllocation}%</span>
              {isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </div>
          <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
            <div
              className={`h-full transition-all ${
                isValid ? 'bg-green-500' : totalAllocation > 100 ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(totalAllocation, 100)}%` }}
            />
          </div>
          {!isValid && (
            <p className="text-xs text-amber-600">
              {totalAllocation < 100
                ? `Allocation is ${100 - totalAllocation}% under 100%`
                : `Allocation is ${totalAllocation - 100}% over 100%`}
            </p>
          )}
        </div>

        {/* Blended Return */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">Blended Historical Return</span>
          </div>
          <Badge variant={blendedReturn >= 0 ? 'default' : 'destructive'}>
            {blendedReturn >= 0 ? '+' : ''}
            {blendedReturn.toFixed(1)}%
          </Badge>
        </div>

        {/* Allocation Breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Allocation Breakdown</p>
          <div className="flex h-6 w-full overflow-hidden rounded-full">
            {etfs.map((etf, index) => {
              const colors = [
                'bg-blue-500',
                'bg-green-500',
                'bg-amber-500',
                'bg-purple-500',
                'bg-pink-500',
                'bg-cyan-500',
              ];
              const width = (etf.allocation / Math.max(totalAllocation, 100)) * 100;
              return (
                <div
                  key={etf.id}
                  className={`${colors[index % colors.length]} flex items-center justify-center text-xs text-white`}
                  style={{ width: `${width}%` }}
                  title={`${etf.symbol}: ${etf.allocation}%`}
                >
                  {width > 10 && <span className="truncate px-1">{etf.symbol}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
