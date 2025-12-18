'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { YearConstraint } from '@/types';

interface YearConstraintsProps {
  constraints: YearConstraint[];
  onChange: (constraints: YearConstraint[]) => void;
  minYear: number;
  maxYear: number;
}

export function YearConstraints({ constraints, onChange, minYear, maxYear }: YearConstraintsProps) {
  const [newConstraint, setNewConstraint] = useState<Partial<YearConstraint>>({
    startYear: minYear,
    endYear: minYear,
    maxContribution: 0,
  });

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const addConstraint = () => {
    if (
      newConstraint.startYear &&
      newConstraint.endYear &&
      newConstraint.maxContribution !== undefined
    ) {
      const constraint: YearConstraint = {
        startYear: newConstraint.startYear,
        endYear: newConstraint.endYear,
        maxContribution: newConstraint.maxContribution,
      };
      onChange([...constraints, constraint]);
      setNewConstraint({
        startYear: minYear,
        endYear: minYear,
        maxContribution: 0,
      });
    }
  };

  const removeConstraint = (index: number) => {
    onChange(constraints.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Year Constraints</CardTitle>
        <CardDescription>
          Set maximum contribution limits for specific years when you have budget constraints.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Constraints */}
        {constraints.length > 0 && (
          <div className="space-y-2">
            {constraints.map((constraint, index) => (
              <div
                key={index}
                className="bg-muted/50 flex items-center justify-between rounded-md border p-3"
              >
                <div className="text-sm">
                  <span className="font-medium">
                    {constraint.startYear === constraint.endYear
                      ? constraint.startYear
                      : `${constraint.startYear} - ${constraint.endYear}`}
                  </span>
                  <span className="text-muted-foreground">
                    : max {formatCurrency(constraint.maxContribution)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive h-8 w-8"
                  onClick={() => removeConstraint(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Constraint */}
        <div className="space-y-3 rounded-md border p-3">
          <p className="text-sm font-medium">Add Constraint</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Start Year</Label>
              <Select
                value={newConstraint.startYear?.toString()}
                onValueChange={(value) =>
                  setNewConstraint((prev) => ({
                    ...prev,
                    startYear: parseInt(value),
                    endYear: Math.max(prev.endYear || parseInt(value), parseInt(value)),
                  }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Year</Label>
              <Select
                value={newConstraint.endYear?.toString()}
                onValueChange={(value) =>
                  setNewConstraint((prev) => ({ ...prev, endYear: parseInt(value) }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years
                    .filter((y) => y >= (newConstraint.startYear || minYear))
                    .map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max Amount</Label>
              <Input
                type="number"
                value={newConstraint.maxContribution || ''}
                onChange={(e) =>
                  setNewConstraint((prev) => ({
                    ...prev,
                    maxContribution: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0"
                className="h-9"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={addConstraint}
                size="sm"
                className="w-full"
                disabled={!newConstraint.maxContribution}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
