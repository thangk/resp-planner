'use client';

import { useState, useMemo } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { ChildProjection } from '@/types';

// Color palette for different children
const COLORS = [
  '#2563eb', // blue
  '#16a34a', // green
  '#dc2626', // red
  '#9333ea', // purple
  '#ea580c', // orange
  '#0891b2', // cyan
];

interface ProjectionChartProps {
  projections: ChildProjection[];
  showInflationAdjusted?: boolean;
}

const projectionFormatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Custom tooltip - moved outside to avoid recreation on each render
function ProjectionTooltip({
  active,
  payload,
  label,
  projectionsCount,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  projectionsCount: number;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background rounded-lg border p-3 shadow-lg">
        <p className="mb-2 font-medium">Year {label}</p>
        {payload.map((entry, idx) => {
          // Skip if this child is hidden or if it's total and there's only one child
          const isTotal = entry.name === 'Total';
          if (isTotal && projectionsCount === 1) return null;

          return (
            <p key={idx} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {projectionFormatCurrency(entry.value)}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
}

export function ProjectionChart({
  projections,
  showInflationAdjusted = false,
}: ProjectionChartProps) {
  // Track which children are visible in the chart
  const [visibleChildren, setVisibleChildren] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    projections.forEach((p) => {
      initial[p.childId] = true;
    });
    return initial;
  });

  // Combine all projection years into a single dataset for the chart
  const chartData = useMemo(() => {
    if (projections.length === 0) return [];

    // Get all unique years
    const allYears = new Set<number>();
    projections.forEach((p) => {
      p.projectionYears.forEach((y) => allYears.add(y.year));
    });

    const years = Array.from(allYears).sort((a, b) => a - b);

    return years.map((year) => {
      const dataPoint: Record<string, number | string> = { year: year.toString() };

      projections.forEach((projection) => {
        const yearData = projection.projectionYears.find((y) => y.year === year);
        if (yearData) {
          const balanceKey = `balance_${projection.childId}`;
          const value =
            showInflationAdjusted && yearData.inflationAdjustedBalance
              ? yearData.inflationAdjustedBalance
              : yearData.balance;
          dataPoint[balanceKey] = value;
        }
      });

      // Calculate total if multiple children
      if (projections.length > 1) {
        let total = 0;
        projections.forEach((projection) => {
          if (visibleChildren[projection.childId]) {
            const yearData = projection.projectionYears.find((y) => y.year === year);
            if (yearData) {
              total +=
                showInflationAdjusted && yearData.inflationAdjustedBalance
                  ? yearData.inflationAdjustedBalance
                  : yearData.balance;
            }
          }
        });
        dataPoint['total'] = total;
      }

      return dataPoint;
    });
  }, [projections, showInflationAdjusted, visibleChildren]);

  const toggleChild = (childId: string) => {
    setVisibleChildren((prev) => ({
      ...prev,
      [childId]: !prev[childId],
    }));
  };

  if (projections.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projected Balance Over Time</CardTitle>
        <CardDescription>
          {showInflationAdjusted
            ? "Projected RESP value in today's dollars"
            : 'Projected RESP value based on expected returns'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Child toggles */}
          {projections.length > 1 && (
            <div className="flex flex-wrap gap-4 border-b pb-4">
              {projections.map((projection, index) => (
                <div key={projection.childId} className="flex items-center space-x-2">
                  <Checkbox
                    id={`toggle-${projection.childId}`}
                    checked={visibleChildren[projection.childId]}
                    onCheckedChange={() => toggleChild(projection.childId)}
                  />
                  <Label
                    htmlFor={`toggle-${projection.childId}`}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {projection.childName}
                    <span className="text-muted-foreground text-sm">
                      ({projectionFormatCurrency(projection.finalBalance)})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip content={<ProjectionTooltip projectionsCount={projections.length} />} />
                <Legend />

                {/* Individual child lines */}
                {projections.map(
                  (projection, index) =>
                    visibleChildren[projection.childId] && (
                      <Line
                        key={projection.childId}
                        type="monotone"
                        dataKey={`balance_${projection.childId}`}
                        name={projection.childName}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    )
                )}

                {/* Total line if multiple children */}
                {projections.length > 1 && (
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="#6b7280"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Contributions</p>
              <p className="text-lg font-semibold">
                {projectionFormatCurrency(
                  projections
                    .filter((p) => visibleChildren[p.childId])
                    .reduce((sum, p) => sum + p.totalContributions, 0)
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Grants</p>
              <p className="text-lg font-semibold text-blue-600">
                {projectionFormatCurrency(
                  projections
                    .filter((p) => visibleChildren[p.childId])
                    .reduce((sum, p) => sum + p.totalGrants, 0)
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Growth</p>
              <p className="text-lg font-semibold text-purple-600">
                {projectionFormatCurrency(
                  projections
                    .filter((p) => visibleChildren[p.childId])
                    .reduce((sum, p) => sum + p.totalGrowth, 0)
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Final Balance</p>
              <p className="text-lg font-semibold text-green-600">
                {projectionFormatCurrency(
                  projections
                    .filter((p) => visibleChildren[p.childId])
                    .reduce((sum, p) => sum + p.finalBalance, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
