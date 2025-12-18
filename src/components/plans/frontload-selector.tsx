'use client';

import { Info, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Child } from '@/types';

interface FrontloadSelectorProps {
  child: Child;
  value: number | null;
  onChange: (year: number | null) => void;
  minYear: number;
  maxYear: number;
  /** Catch-up years that should be disabled in the dropdown */
  catchUpYears?: number[];
}

export function FrontloadSelector({
  child,
  value,
  onChange,
  minYear,
  maxYear,
  catchUpYears = [],
}: FrontloadSelectorProps) {
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const dob = new Date(child.dateOfBirth);
  const birthYear = dob.getFullYear();

  const getAgeForYear = (year: number): number => {
    return year - birthYear;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-amber-500" />
          Frontload Strategy
        </CardTitle>
        <CardDescription>Select a year to maximize contributions for {child.name}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="frontload-year">Frontload Year</Label>
            <Select
              value={value?.toString() || 'none'}
              onValueChange={(val) => onChange(val === 'none' ? null : parseInt(val))}
            >
              <SelectTrigger id="frontload-year">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No frontloading</SelectItem>
                {years.map((year) => {
                  const isCatchUpYear = catchUpYears.includes(year);
                  return (
                    <SelectItem key={year} value={year.toString()} disabled={isCatchUpYear}>
                      {year} (age {getAgeForYear(year)}){isCatchUpYear && ' — Catch-up'}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground mt-6 h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Frontloading means contributing extra in a specific year to maximize investment
                  growth time. Works best when you have catch-up room available.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {value && (
          <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-950/20">
            <div className="flex items-start gap-2">
              <Zap className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Frontload Year: {value}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {child.name} will be {getAgeForYear(value)} years old. Extra contributions in this
                  year will maximize compound growth potential.
                </p>
              </div>
            </div>
          </div>
        )}

        {!value && (
          <p className="text-muted-foreground text-sm">
            Select a year to frontload contributions. This is useful when you want to maximize
            investment growth by contributing more early.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
