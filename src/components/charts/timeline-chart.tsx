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
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChildProjection } from '@/types';

interface TimelineChartProps {
  projections: ChildProjection[];
  frontloadYears?: Map<string, number | null>; // childId -> frontloadYear
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

interface TimelineDataPoint {
  year: number;
  isCurrentYear: boolean;
  [key: string]: number | boolean | string;
}

// Custom tooltip - moved outside to avoid recreation on each render
function TimelineTooltip({
  active,
  payload,
  label,
  frontloadYearsList,
  currentYear,
  projections,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: number;
  frontloadYearsList: number[];
  currentYear: number;
  projections: ChildProjection[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const isFrontloadYear = label !== undefined && frontloadYearsList.includes(label);
  const isCurrentYr = label === currentYear;
  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div className="bg-background rounded-lg border p-3 shadow-lg" style={{ minWidth: '180px' }}>
      <div className="mb-2 flex items-center gap-2">
        <p className="font-semibold">{label}</p>
        {isCurrentYr && (
          <span className="bg-primary/20 text-primary rounded px-1.5 py-0.5 text-xs">Current</span>
        )}
        {isFrontloadYear && (
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-600">
            Frontload
          </span>
        )}
      </div>
      <div className="space-y-1 text-sm">
        {payload.map((entry, idx) => {
          const childIndex = parseInt(entry.dataKey.split('_')[1]);
          const childName = projections[childIndex]?.childName || `Child ${childIndex + 1}`;
          return (
            <div key={idx} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-muted-foreground">{childName}:</span>
              </span>
              <span>{formatCurrency(entry.value || 0)}</span>
            </div>
          );
        })}
        {payload.length > 1 && (
          <div className="flex justify-between border-t pt-1 font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function TimelineChart({ projections, frontloadYears }: TimelineChartProps) {
  const currentYear = new Date().getFullYear();

  const chartData = useMemo(() => {
    if (projections.length === 0) return [];

    // Find all unique years across all projections
    const allYears = new Set<number>();
    projections.forEach((p) => {
      p.projectionYears.forEach((y) => allYears.add(y.year));
    });
    const sortedYears = Array.from(allYears).sort((a, b) => a - b);

    // Build chart data with each child's contribution
    return sortedYears.map((year) => {
      const dataPoint: TimelineDataPoint = {
        year,
        isCurrentYear: year === currentYear,
      };

      projections.forEach((projection, index) => {
        const yearData = projection.projectionYears.find((y) => y.year === year);
        dataPoint[`child_${index}`] = yearData?.contribution ?? 0;
      });

      return dataPoint;
    });
  }, [projections, currentYear]);

  // Find frontload years for highlighting
  const frontloadYearsList = useMemo(() => {
    if (!frontloadYears) return [];
    return Array.from(frontloadYears.values()).filter((y): y is number => y !== null);
  }, [frontloadYears]);

  if (projections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contribution Timeline</CardTitle>
          <CardDescription>No contribution data available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribution Timeline</CardTitle>
        <CardDescription>
          Year-by-year contributions per child. Frontload years are highlighted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" tickFormatter={(year) => String(year)} className="text-xs" />
              <YAxis
                tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                className="text-xs"
              />
              <Tooltip
                content={
                  <TimelineTooltip
                    frontloadYearsList={frontloadYearsList}
                    currentYear={currentYear}
                    projections={projections}
                  />
                }
              />
              <Legend
                formatter={(value: string) => {
                  const index = parseInt(value.split('_')[1]);
                  return projections[index]?.childName || `Child ${index + 1}`;
                }}
              />

              {/* Reference line for current year */}
              <ReferenceLine
                x={currentYear}
                stroke="hsl(var(--primary))"
                strokeDasharray="3 3"
                label={{
                  value: 'Now',
                  position: 'top',
                  className: 'fill-primary text-xs',
                }}
              />

              {/* Reference lines for frontload years */}
              {frontloadYearsList.map((year) => (
                <ReferenceLine
                  key={`frontload-${year}`}
                  x={year}
                  stroke="hsl(38, 92%, 50%)"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              ))}

              {/* Bars for each child */}
              {projections.map((projection, index) => (
                <Bar
                  key={projection.childId || index}
                  dataKey={`child_${index}`}
                  name={`child_${index}`}
                  fill={COLORS[index % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend for highlights */}
        <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-0.5 w-4" style={{ borderStyle: 'dashed' }} />
            <span>Current Year</span>
          </div>
          {frontloadYearsList.length > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="h-0.5 w-4"
                style={{ backgroundColor: 'hsl(38, 92%, 50%)', borderStyle: 'dashed' }}
              />
              <span>Frontload Year</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
