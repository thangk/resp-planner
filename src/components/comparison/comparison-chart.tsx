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
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface ChartDataPoint {
  year: number;
  plan1Value: number;
  plan2Value: number;
}

interface ComparisonChartProps {
  plan1Name: string;
  plan2Name: string;
  data: ChartDataPoint[];
}

// Custom tooltip - moved outside to avoid recreation on each render
function ComparisonTooltip({
  active,
  payload,
  label,
  plan1Name,
  plan2Name,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: number;
  plan1Name: string;
  plan2Name: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background rounded-lg border p-3 shadow-md">
      <p className="mb-2 font-medium">Year {label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
          <span style={{ color: entry.color }}>
            {entry.dataKey === 'plan1Value' ? plan1Name : plan2Name}
          </span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-2 border-t pt-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Difference</span>
            <span className="font-medium">
              {formatCurrency(Math.abs(payload[0].value - payload[1].value))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ComparisonChart({ plan1Name, plan2Name, data }: ComparisonChartProps) {
  const currentYear = new Date().getFullYear();

  const finalValues = useMemo(() => {
    if (data.length === 0) return { plan1: 0, plan2: 0, diff: 0 };
    const lastPoint = data[data.length - 1];
    return {
      plan1: lastPoint.plan1Value,
      plan2: lastPoint.plan2Value,
      diff: lastPoint.plan1Value - lastPoint.plan2Value,
    };
  }, [data]);

  const winner = finalValues.diff > 0 ? plan1Name : finalValues.diff < 0 ? plan2Name : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Trajectory Comparison</CardTitle>
        <CardDescription>
          {winner ? (
            <>
              <span className="font-medium text-green-600">{winner}</span> leads by{' '}
              {formatCurrency(Math.abs(finalValues.diff))} at projected end
            </>
          ) : (
            'Both plans have equal projected value'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="year"
                className="text-xs"
                tickFormatter={(value) => value.toString()}
              />
              <YAxis className="text-xs" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                content={<ComparisonTooltip plan1Name={plan1Name} plan2Name={plan2Name} />}
              />
              <Legend formatter={(value) => (value === 'plan1Value' ? plan1Name : plan2Name)} />
              <ReferenceLine
                x={currentYear}
                stroke="hsl(var(--primary))"
                strokeDasharray="3 3"
                label={{ value: 'Now', position: 'top', className: 'text-xs fill-primary' }}
              />
              <Line
                type="monotone"
                dataKey="plan1Value"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="plan2Value"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
