'use client';

import { useMemo, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePlansStore } from '@/stores/plans-store';
import { useChildrenStore } from '@/stores/children-store';
import { useIncomeStore } from '@/stores/income-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { generateContributionSchedule } from '@/features/grants/utils/grant-calculator';
import { calculateProjection } from '@/features/plans/utils/projection-calculator';
import { getProjectionRateValue } from '@/lib/projection-rates';
import { APP_CONFIG } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import type { Child } from '@/types';

interface PrintViewProps {
  planId: string;
  open: boolean;
  onClose: () => void;
}

export function PrintView({ planId, open, onClose }: PrintViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { getPlan, getContributionsForChild, getCLBOverridesForChild } = usePlansStore();
  const { getChild } = useChildrenStore();
  const { incomeYears } = useIncomeStore();
  const { getBlendedReturn, etfs } = usePortfolioStore();

  const plan = getPlan(planId);
  const blendedReturn = getBlendedReturn();
  const rateValue = plan
    ? getProjectionRateValue(plan.projectionRate, plan.customRate, blendedReturn)
    : 0;
  const projectionRate = rateValue / 100;

  const childrenData = useMemo(() => {
    if (!plan) return [];

    return plan.childIds
      .map((childId) => {
        const child = getChild(childId);
        if (!child) return null;

        const contributions = getContributionsForChild(planId, childId);
        const clbOverrides = getCLBOverridesForChild(planId, childId);
        const contributionsMap = new Map(contributions.map((c) => [c.year, c.amount]));
        const schedule = generateContributionSchedule(child, incomeYears, contributionsMap);

        // Apply CLB overrides to the schedule
        const scheduleWithOverrides = schedule.map((yearData) => {
          const clbOverride = clbOverrides.find((c) => c.year === yearData.year);
          if (clbOverride !== undefined) {
            const clbDiff = clbOverride.amount - yearData.clb;
            return {
              ...yearData,
              clb: clbOverride.amount,
              totalGrants: yearData.totalGrants + clbDiff,
            };
          }
          return yearData;
        });

        // Calculate year-over-year returns and cumulative balances
        let previousBalance = 0;
        const scheduleWithReturns = scheduleWithOverrides.map((row) => {
          const yearAddition = row.contribution + row.totalGrants;
          const balanceEarningReturn = previousBalance + yearAddition;
          const yearReturn = balanceEarningReturn * projectionRate;
          const cumulativeBalance = previousBalance + yearAddition + yearReturn;
          previousBalance = cumulativeBalance;
          return {
            ...row,
            yearReturn: Math.round(yearReturn * 100) / 100,
            cumulativeBalance: Math.round(cumulativeBalance * 100) / 100,
          };
        });

        const projection = calculateProjection({
          schedule: scheduleWithOverrides,
          projectionRate: plan.projectionRate,
          customRate: plan.customRate ?? undefined,
          inflationAdjusted: plan.inflationAdjusted,
          childName: child.name,
          blendedReturn,
        });

        return { child, schedule: scheduleWithReturns, projection };
      })
      .filter(Boolean) as {
      child: Child;
      schedule: (ReturnType<typeof generateContributionSchedule>[number] & {
        yearReturn: number;
        cumulativeBalance: number;
      })[];
      projection: ReturnType<typeof calculateProjection>;
    }[];
  }, [
    plan,
    getChild,
    getContributionsForChild,
    getCLBOverridesForChild,
    planId,
    incomeYears,
    blendedReturn,
    projectionRate,
  ]);

  const handlePrint = useCallback(() => {
    if (!contentRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RESP Plan - ${plan?.name || 'Print View'}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.5;
              color: #000;
              background: #fff;
              padding: 20px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 16px;
            }
            th, td {
              padding: 6px 8px;
              text-align: left;
            }
            th {
              border-bottom: 2px solid #333;
            }
            td {
              border-bottom: 1px solid #ddd;
            }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .font-medium { font-weight: 500; }
            .section {
              margin-bottom: 32px;
              break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              border-bottom: 2px solid #333;
              padding-bottom: 8px;
              margin-bottom: 16px;
            }
            .header {
              border-bottom: 3px solid #000;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .header h1 { font-size: 24px; }
            .header-meta {
              display: flex;
              justify-content: space-between;
              margin-top: 12px;
              font-size: 12px;
              color: #666;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              font-size: 14px;
            }
            .summary-right { text-align: right; }
            .highlight-box {
              background: #f5f5f5;
              padding: 12px;
              border-radius: 4px;
              font-size: 14px;
            }
            .footer {
              margin-top: 48px;
              padding-top: 16px;
              border-top: 1px solid #ddd;
              font-size: 11px;
              color: #888;
              text-align: center;
            }
            .child-section {
              page-break-before: always;
            }
            .child-section:first-of-type {
              page-break-before: auto;
            }
            @media print {
              body { padding: 0; }
              .section { break-inside: avoid; }
              .child-section { page-break-before: always; }
              .child-section:first-of-type { page-break-before: auto; }
            }
          </style>
        </head>
        <body>
          ${contentRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }, [plan?.name]);

  if (!plan) {
    return null;
  }

  const totalProjected = childrenData.reduce(
    (sum, { projection }) => sum + (projection?.finalBalance || 0),
    0
  );
  const totalContributions = childrenData.reduce(
    (sum, { projection }) => sum + (projection?.totalContributions || 0),
    0
  );
  const totalGrants = childrenData.reduce(
    (sum, { projection }) => sum + (projection?.totalGrants || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Print Preview - {plan.name}</DialogTitle>
            <div className="flex gap-2">
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto rounded-lg border bg-white">
          <div ref={contentRef} className="p-8 text-black">
            {/* Header */}
            <div className="mb-6 border-b-2 border-black pb-4">
              <h1 className="text-2xl font-bold">{plan.name}</h1>
              {plan.description && <p className="mt-1 text-gray-600">{plan.description}</p>}
              <div className="mt-4 flex justify-between text-sm">
                <span>Generated: {format(new Date(), 'MMMM d, yyyy')}</span>
                <span>{APP_CONFIG.name}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-8">
              <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-bold">Summary</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Children:</strong> {childrenData.map((d) => d.child.name).join(', ')}
                  </p>
                  <p>
                    <strong>Projection Rate:</strong> {rateValue}% ({plan.projectionRate})
                  </p>
                  <p>
                    <strong>Inflation Adjusted:</strong> {plan.inflationAdjusted ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    <strong>Total Contributions:</strong> {formatCurrency(totalContributions)}
                  </p>
                  <p>
                    <strong>Total Grants:</strong> {formatCurrency(totalGrants)}
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    <strong>Projected Value:</strong> {formatCurrency(totalProjected)}
                  </p>
                </div>
              </div>
            </div>

            {/* Portfolio Summary */}
            {etfs.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-bold">Portfolio</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-1 text-left">Symbol</th>
                      <th className="py-1 text-left">Name</th>
                      <th className="py-1 text-right">Allocation</th>
                      <th className="py-1 text-right">Historical Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etfs.map((etf) => (
                      <tr key={etf.id} className="border-b border-gray-200">
                        <td className="py-1 font-medium">{etf.symbol}</td>
                        <td className="py-1">{etf.name}</td>
                        <td className="py-1 text-right">{etf.allocation}%</td>
                        <td className="py-1 text-right">{etf.historicalReturn}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-medium">
                      <td colSpan={2}>Blended Return</td>
                      <td className="text-right">100%</td>
                      <td className="text-right">{blendedReturn.toFixed(1)}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Schedule Tables */}
            {childrenData.map(({ child, schedule, projection }, index) => (
              <div
                key={child.id}
                className={`mb-8 break-inside-avoid ${index > 0 ? 'child-section' : ''}`}
              >
                <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-bold">
                  {child.name}&apos;s Schedule
                </h2>
                <p className="mb-2 text-sm text-gray-600">
                  Born: {format(new Date(child.dateOfBirth), 'MMMM d, yyyy')} | Age at end:{' '}
                  {schedule[schedule.length - 1]?.childAge} years
                </p>

                <table className="mb-4 w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-400">
                      <th className="py-1 text-left">Year</th>
                      <th className="py-1 text-right">Age</th>
                      <th className="py-1 text-right">Contribution</th>
                      <th className="py-1 text-right">CESG</th>
                      <th className="py-1 text-right">ACESG</th>
                      <th className="py-1 text-right">CLB</th>
                      <th className="py-1 text-right">Total Grants</th>
                      <th className="py-1 text-right">Return</th>
                      <th className="py-1 text-right">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.year} className="border-b border-gray-200">
                        <td className="py-1">{row.year}</td>
                        <td className="py-1 text-right">{row.childAge}</td>
                        <td className="py-1 text-right">{formatCurrency(row.contribution)}</td>
                        <td className="py-1 text-right">{formatCurrency(row.cesg)}</td>
                        <td className="py-1 text-right">{formatCurrency(row.acesg)}</td>
                        <td className="py-1 text-right">{formatCurrency(row.clb)}</td>
                        <td className="py-1 text-right font-medium">
                          {formatCurrency(row.totalGrants)}
                        </td>
                        <td className="py-1 text-right">{formatCurrency(row.yearReturn)}</td>
                        <td className="py-1 text-right">{formatCurrency(row.cumulativeBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-400 font-medium">
                      <td colSpan={2}>Totals</td>
                      <td className="py-1 text-right">
                        {formatCurrency(projection?.totalContributions || 0)}
                      </td>
                      <td className="py-1 text-right" colSpan={3}></td>
                      <td className="py-1 text-right">
                        {formatCurrency(projection?.totalGrants || 0)}
                      </td>
                      <td className="py-1 text-right">
                        {formatCurrency(projection?.totalGrowth || 0)}
                      </td>
                      <td className="py-1 text-right">
                        {formatCurrency(projection?.finalBalance || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {projection && (
                  <div className="rounded bg-gray-100 p-3 text-sm">
                    <p>
                      <strong>Projected Value at 18:</strong>{' '}
                      {formatCurrency(projection.finalBalance)}
                    </p>
                    <p className="text-gray-600">
                      ({formatCurrency(projection.totalContributions)} contributions +{' '}
                      {formatCurrency(projection.totalGrants)} grants +{' '}
                      {formatCurrency(projection.totalGrowth)} growth)
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Footer */}
            <div className="mt-16 border-t pt-4 text-center text-xs text-gray-500">
              <p>
                Generated by {APP_CONFIG.name} on {format(new Date(), 'PPpp')}
              </p>
              <p className="mt-1">This is a projection only. Actual returns may vary.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
