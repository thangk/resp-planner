'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChildProjection } from '@/types';

interface GrowthChartProps {
  projections: ChildProjection[];
  showInflationAdjusted?: boolean;
}

// Color palette for multiple children
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

interface ChartDataPoint {
  year: number;
  [key: string]: number;
}

export function GrowthChart({ projections, showInflationAdjusted = false }: GrowthChartProps) {
  const chartData = useMemo(() => {
    if (projections.length === 0) return [];

    // Find all unique years across all projections
    const allYears = new Set<number>();
    projections.forEach((p) => {
      p.projectionYears.forEach((y) => allYears.add(y.year));
    });
    const sortedYears = Array.from(allYears).sort((a, b) => a - b);

    // Build chart data with each child's balance
    return sortedYears.map((year) => {
      const dataPoint: ChartDataPoint = { year };
      let total = 0;

      projections.forEach((projection, index) => {
        const yearData = projection.projectionYears.find((y) => y.year === year);
        const balance = showInflationAdjusted
          ? (yearData?.inflationAdjustedBalance ?? yearData?.balance ?? 0)
          : (yearData?.balance ?? 0);

        dataPoint[`child_${index}`] = balance;
        total += balance;
      });

      // Add combined total if multiple children
      if (projections.length > 1) {
        dataPoint.total = total;
      }

      return dataPoint;
    });
  }, [projections, showInflationAdjusted]);

  if (projections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Growth Projection</CardTitle>
          <CardDescription>No projection data available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Projection</CardTitle>
        <CardDescription>
          Projected RESP balance over time
          {showInflationAdjusted && " (inflation-adjusted to today's dollars)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" tickFormatter={(year) => String(year)} className="text-xs" />
              <YAxis
                tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                className="text-xs"
              />
              <Tooltip
                formatter={(value, name) => {
                  const numValue = (value as number) ?? 0;
                  const strName = (name as string) ?? '';
                  if (strName === 'total') return [formatCurrency(numValue), 'Combined Total'];
                  const index = parseInt(strName.split('_')[1] || '0');
                  const childName = projections[index]?.childName || `Child ${index + 1}`;
                  return [formatCurrency(numValue), childName];
                }}
                labelFormatter={(label) => `Year: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend
                formatter={(value: string) => {
                  if (value === 'total') return 'Combined Total';
                  const index = parseInt(value.split('_')[1]);
                  return projections[index]?.childName || `Child ${index + 1}`;
                }}
              />

              {/* Lines for each child */}
              {projections.map((projection, index) => (
                <Line
                  key={projection.childId || index}
                  type="monotone"
                  dataKey={`child_${index}`}
                  name={`child_${index}`}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}

              {/* Combined total line if multiple children */}
              {projections.length > 1 && (
                <Line
                  type="monotone"
                  dataKey="total"
                  name="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
