'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChildProjection } from '@/types';

interface BreakdownChartProps {
  projections: ChildProjection[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// Colors for the breakdown segments
const SEGMENT_COLORS = {
  contributions: 'hsl(var(--chart-1))',
  grants: 'hsl(var(--chart-2))',
  growth: 'hsl(var(--chart-3))',
};

interface BreakdownDataPoint {
  name: string;
  contributions: number;
  grants: number;
  growth: number;
  total: number;
  contributionPercent: number;
  grantPercent: number;
  growthPercent: number;
}

// Custom tooltip - moved outside component to avoid recreation on each render
function BreakdownTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    payload: BreakdownDataPoint;
  }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-background rounded-lg border p-3 shadow-lg" style={{ minWidth: '200px' }}>
      <p className="mb-2 font-semibold">{label}</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Contributions:</span>
          <span>
            {formatCurrency(data.contributions)} ({data.contributionPercent}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Grants:</span>
          <span>
            {formatCurrency(data.grants)} ({data.grantPercent}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Growth:</span>
          <span>
            {formatCurrency(data.growth)} ({data.growthPercent}%)
          </span>
        </div>
        <div className="flex justify-between border-t pt-1 font-semibold">
          <span>Total:</span>
          <span>{formatCurrency(data.total)}</span>
        </div>
      </div>
    </div>
  );
}

export function BreakdownChart({ projections }: BreakdownChartProps) {
  const chartData = useMemo(() => {
    return projections.map((projection) => {
      const total = projection.finalBalance;
      return {
        name: projection.childName,
        contributions: projection.totalContributions,
        grants: projection.totalGrants,
        growth: projection.totalGrowth,
        total,
        contributionPercent:
          total > 0 ? Math.round((projection.totalContributions / total) * 100) : 0,
        grantPercent: total > 0 ? Math.round((projection.totalGrants / total) * 100) : 0,
        growthPercent: total > 0 ? Math.round((projection.totalGrowth / total) * 100) : 0,
      } satisfies BreakdownDataPoint;
    });
  }, [projections]);

  if (projections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance Breakdown</CardTitle>
          <CardDescription>No projection data available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Breakdown</CardTitle>
        <CardDescription>
          Final RESP balance breakdown at age 18: your contributions, government grants, and
          investment growth.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                className="text-xs"
              />
              <YAxis type="category" dataKey="name" className="text-xs" width={100} />
              <Tooltip content={<BreakdownTooltip />} />
              <Legend
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    contributions: 'Your Contributions',
                    grants: 'Government Grants',
                    growth: 'Investment Growth',
                  };
                  return labels[value] || value;
                }}
              />
              <Bar
                dataKey="contributions"
                stackId="a"
                fill={SEGMENT_COLORS.contributions}
                name="contributions"
              >
                {chartData.map((_, index) => (
                  <Cell key={`contributions-${index}`} />
                ))}
              </Bar>
              <Bar dataKey="grants" stackId="a" fill={SEGMENT_COLORS.grants} name="grants">
                {chartData.map((_, index) => (
                  <Cell key={`grants-${index}`} />
                ))}
              </Bar>
              <Bar dataKey="growth" stackId="a" fill={SEGMENT_COLORS.growth} name="growth">
                {chartData.map((_, index) => (
                  <Cell key={`growth-${index}`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div
              className="mx-auto mb-1 h-3 w-3 rounded-full"
              style={{ backgroundColor: SEGMENT_COLORS.contributions }}
            />
            <p className="text-muted-foreground text-xs">Your Contributions</p>
            <p className="font-semibold">
              {formatCurrency(chartData.reduce((sum, d) => sum + d.contributions, 0))}
            </p>
          </div>
          <div className="text-center">
            <div
              className="mx-auto mb-1 h-3 w-3 rounded-full"
              style={{ backgroundColor: SEGMENT_COLORS.grants }}
            />
            <p className="text-muted-foreground text-xs">Government Grants</p>
            <p className="font-semibold">
              {formatCurrency(chartData.reduce((sum, d) => sum + d.grants, 0))}
            </p>
          </div>
          <div className="text-center">
            <div
              className="mx-auto mb-1 h-3 w-3 rounded-full"
              style={{ backgroundColor: SEGMENT_COLORS.growth }}
            />
            <p className="text-muted-foreground text-xs">Investment Growth</p>
            <p className="font-semibold">
              {formatCurrency(chartData.reduce((sum, d) => sum + d.growth, 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
