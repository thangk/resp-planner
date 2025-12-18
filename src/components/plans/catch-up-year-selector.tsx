'use client';

import { Info, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface CatchUpYearSelectorProps {
  child: Child;
  selectedYears: number[];
  onChange: (years: number[]) => void;
  minYear: number;
  maxYear: number;
  frontloadYear?: number | null;
}

export function CatchUpYearSelector({
  child,
  selectedYears,
  onChange,
  minYear,
  maxYear,
  frontloadYear,
}: CatchUpYearSelectorProps) {
  const maxCatchUpYears = child.catchUpYearsAvailable;

  // Generate years array (only years where child is <= 17)
  const dob = new Date(child.dateOfBirth);
  const birthYear = dob.getFullYear();

  const eligibleYears = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).filter(
    (year) => year - birthYear <= 17
  );

  const getAgeForYear = (year: number): number => {
    return year - birthYear;
  };

  // Handle changing a specific slot
  const handleSlotChange = (slotIndex: number, newYear: string) => {
    const newYears = [...selectedYears];

    if (newYear === 'none') {
      // Remove this slot
      newYears.splice(slotIndex, 1);
    } else {
      const yearNum = parseInt(newYear);
      // If this year is already selected in another slot, swap them
      const existingIndex = newYears.indexOf(yearNum);
      if (existingIndex !== -1 && existingIndex !== slotIndex) {
        // Swap: put the old value from this slot into the other slot
        const oldValue = newYears[slotIndex];
        if (oldValue) {
          newYears[existingIndex] = oldValue;
        } else {
          newYears.splice(existingIndex, 1);
        }
      }
      newYears[slotIndex] = yearNum;
    }

    // Filter out undefined/null and sort
    onChange(newYears.filter(Boolean).sort((a, b) => a - b));
  };

  // Don't show if catch-up is not enabled or no years available
  if (!child.catchUpYearsEnabled || child.catchUpYearsAvailable <= 0) {
    return null;
  }

  // Create slots array (always show all available slots)
  const slots = Array.from({ length: maxCatchUpYears }, (_, i) => {
    // Sort selected years and assign to slots in order
    const sortedSelected = [...selectedYears].sort((a, b) => a - b);
    return sortedSelected[i] || null;
  });

  const selectedCount = selectedYears.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-amber-500" />
          Catch-Up Years
          <Badge
            variant={selectedCount === maxCatchUpYears ? 'default' : 'secondary'}
            className="ml-auto"
          >
            {selectedCount}/{maxCatchUpYears} assigned
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          Assign years to use catch-up room ($5,000 for $1,000 CESG).
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground h-4 w-4 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  {child.name} has {maxCatchUpYears} catch-up year{maxCatchUpYears > 1 ? 's' : ''}{' '}
                  available. Each catch-up year allows contributing $5,000 (instead of $2,500) to
                  earn $1,000 in CESG (instead of $500).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Slot Dropdowns */}
        <div className="flex flex-wrap gap-4">
          {slots.map((selectedYear, index) => (
            <div key={index} className="space-y-1.5">
              <Label htmlFor={`catchup-${index}`} className="text-muted-foreground text-xs">
                Catch-up {index + 1}
              </Label>
              <Select
                value={selectedYear?.toString() || 'none'}
                onValueChange={(val) => handleSlotChange(index, val)}
              >
                <SelectTrigger id={`catchup-${index}`} className="w-[140px]">
                  <SelectValue placeholder="Select year">
                    {selectedYear ? (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-500" />
                        {selectedYear}
                      </span>
                    ) : (
                      'Select year'
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not assigned</SelectItem>
                  {eligibleYears.map((year) => {
                    const isUsedElsewhere = selectedYears.includes(year) && selectedYear !== year;
                    const isFrontloadYear = frontloadYear === year;
                    const isDisabled = isFrontloadYear || isUsedElsewhere;
                    return (
                      <SelectItem key={year} value={year.toString()} disabled={isDisabled}>
                        {year} (age {getAgeForYear(year)}){isUsedElsewhere && ' — Already assigned'}
                        {isFrontloadYear && ' — Frontload'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Summary */}
        {selectedCount > 0 && (
          <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-950/20">
            <div className="flex items-start gap-2">
              <Zap className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {selectedCount} catch-up year{selectedCount > 1 ? 's' : ''} assigned:{' '}
                  {selectedYears.sort((a, b) => a - b).join(', ')}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Total extra CESG: ${selectedCount * 500} (from ${selectedCount * 2500} extra
                  contributions)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedCount === 0 && (
          <p className="text-muted-foreground text-sm">
            Use the dropdowns above to assign catch-up years. Each catch-up year earns an extra $500
            CESG.
          </p>
        )}

        {/* Frontload year note */}
        {frontloadYear && (
          <p className="text-muted-foreground border-t pt-3 text-xs">
            Note: The frontload year ({frontloadYear}) earns regular $500 CESG. Frontloading is
            about maximizing investment growth, not CESG.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
