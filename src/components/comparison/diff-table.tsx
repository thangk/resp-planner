'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface ComparisonMetric {
  label: string;
  plan1Value: number;
  plan2Value: number;
  format?: 'currency' | 'percent' | 'number';
  higherIsBetter?: boolean;
}

interface DiffTableProps {
  plan1Name: string;
  plan2Name: string;
  metrics: ComparisonMetric[];
}

export function DiffTable({ plan1Name, plan2Name, metrics }: DiffTableProps) {
  const formatValue = (value: number, format?: string): string => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const getDiff = (plan1: number, plan2: number): number => {
    return plan1 - plan2;
  };

  const getDiffBadge = (diff: number, higherIsBetter = true, format?: string) => {
    if (Math.abs(diff) < 0.01) {
      return (
        <Badge variant="outline" className="gap-1">
          <Minus className="h-3 w-3" />
          Same
        </Badge>
      );
    }

    const isPositive = diff > 0;
    const isBetter = higherIsBetter ? isPositive : !isPositive;

    return (
      <Badge variant={isBetter ? 'default' : 'secondary'} className="gap-1">
        {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        {formatValue(Math.abs(diff), format)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Metric</TableHead>
              <TableHead className="text-right">{plan1Name}</TableHead>
              <TableHead className="text-right">{plan2Name}</TableHead>
              <TableHead className="text-right">Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => {
              const diff = getDiff(metric.plan1Value, metric.plan2Value);
              return (
                <TableRow key={metric.label}>
                  <TableCell className="font-medium">{metric.label}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right',
                      diff > 0 && metric.higherIsBetter !== false && 'font-medium text-green-600',
                      diff < 0 && metric.higherIsBetter !== false && 'text-muted-foreground'
                    )}
                  >
                    {formatValue(metric.plan1Value, metric.format)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right',
                      diff < 0 && metric.higherIsBetter !== false && 'font-medium text-green-600',
                      diff > 0 && metric.higherIsBetter !== false && 'text-muted-foreground'
                    )}
                  >
                    {formatValue(metric.plan2Value, metric.format)}
                  </TableCell>
                  <TableCell className="text-right">
                    {getDiffBadge(diff, metric.higherIsBetter, metric.format)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
