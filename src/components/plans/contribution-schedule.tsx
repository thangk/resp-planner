'use client';

import { useState, useMemo } from 'react';
import { Lock, Unlock, Edit2, Calendar, StickyNote, X, Zap, TrendingUp, Info } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { generateContributionSchedule } from '@/features/grants/utils/grant-calculator';
import type { Child, Contribution, IncomeYear, CLBOverride } from '@/types';

const LIFETIME_CONTRIBUTION_LIMIT = 50000;
const CLB_LIFETIME_LIMIT = 2000;

type YearStatus = 'past' | 'current' | 'future';

function getYearStatus(year: number, currentYear: number): YearStatus {
  if (year < currentYear) return 'past';
  if (year === currentYear) return 'current';
  return 'future';
}

interface ContributionScheduleProps {
  child: Child;
  contributions: Contribution[];
  incomeYears: IncomeYear[];
  onContributionChange: (year: number, amount: number, isLocked: boolean) => void;
  onNoteChange?: (year: number, note: string | null) => void;
  readOnly?: boolean;
  frontloadYear?: number | null;
  catchUpYears?: number[];
  /** Projection rate as a decimal (e.g., 0.06 for 6%). Used to calculate return on contributions. */
  projectionRate?: number;
  /** Called when a locked row's contribution is manually changed */
  onLockedRowChanged?: () => void;
  /** CLB overrides for manual editing */
  clbOverrides?: CLBOverride[];
  /** Called when CLB is manually changed */
  onCLBChange?: (year: number, amount: number, isLocked: boolean) => void;
}

export function ContributionSchedule({
  child,
  contributions,
  incomeYears,
  onContributionChange,
  onNoteChange,
  readOnly = false,
  frontloadYear,
  catchUpYears = [],
  projectionRate = 0.06,
  onLockedRowChanged,
  clbOverrides = [],
  onCLBChange,
}: ContributionScheduleProps) {
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editingNoteYear, setEditingNoteYear] = useState<number | null>(null);
  const [noteValue, setNoteValue] = useState<string>('');
  // CLB editing state
  const [editingCLBYear, setEditingCLBYear] = useState<number | null>(null);
  const [editCLBValue, setEditCLBValue] = useState<string>('');
  const currentYear = new Date().getFullYear();

  // Convert contributions array to Map for the schedule generator
  const contributionsMap = useMemo(() => {
    const map = new Map<number, number>();
    contributions.forEach((c) => {
      map.set(c.year, c.amount);
    });
    return map;
  }, [contributions]);

  // Generate the full schedule with grant calculations
  const schedule = useMemo(() => {
    return generateContributionSchedule(child, incomeYears, contributionsMap);
  }, [child, incomeYears, contributionsMap]);

  // Use the selected catch-up years from props
  const catchUpYearsSet = useMemo(() => new Set(catchUpYears), [catchUpYears]);

  const isCatchUpYear = (year: number): boolean => catchUpYearsSet.has(year);
  const isFrontloadYear = (year: number): boolean => frontloadYear === year;

  const startEdit = (year: number, amount: number) => {
    setEditingYear(year);
    setEditValue(amount.toString());
  };

  const saveEdit = (year: number) => {
    let amount = parseFloat(editValue) || 0;
    amount = Math.max(0, Math.min(amount, LIFETIME_CONTRIBUTION_LIMIT)); // Cap at $50K single contribution

    const contribution = contributions.find((c) => c.year === year);
    const isYearLocked = contribution?.isLocked || false;
    const originalAmount = contribution?.amount || 0;

    // Calculate sum of all LOCKED contributions (excluding the year being edited)
    const lockedContributionsTotal = contributions
      .filter((c) => c.isLocked && c.year !== year)
      .reduce((sum, c) => sum + c.amount, 0);

    if (isYearLocked) {
      // Locked row: cannot exceed remaining room after other locked contributions
      const remainingRoom = LIFETIME_CONTRIBUTION_LIMIT - lockedContributionsTotal;

      if (amount > remainingRoom) {
        toast.error(`Cannot set contribution to $${amount.toLocaleString()}`, {
          description: `Only $${remainingRoom.toLocaleString()} remaining after other locked contributions ($${lockedContributionsTotal.toLocaleString()} locked).`,
        });
        setEditingYear(null);
        setEditValue('');
        return;
      }

      // Notify that a locked row was changed (for generate button state)
      if (amount !== originalAmount && onLockedRowChanged) {
        onLockedRowChanged();
      }
    }

    // Calculate remaining room after locked contributions and the new amount
    const remainingRoom = LIFETIME_CONTRIBUTION_LIMIT - lockedContributionsTotal - amount;

    if (remainingRoom < 0) {
      // Can't fit this amount even with all non-locked others at $0
      const maxAllowedAmount = LIFETIME_CONTRIBUTION_LIMIT - lockedContributionsTotal;
      toast.error(`Cannot set contribution to $${amount.toLocaleString()}`, {
        description: `Maximum available is $${maxAllowedAmount.toLocaleString()} after locked contributions.`,
      });
      setEditingYear(null);
      setEditValue('');
      return;
    }

    // Always redistribute remaining room to fill up to $50K
    // Use schedule years (all years) not just contributions (only set years)
    const allYears = schedule
      .map((s) => s.year)
      .filter((y) => y !== year) // Exclude edited year
      .filter((y) => {
        // Exclude locked years
        const contrib = contributions.find((c) => c.year === y);
        return !contrib?.isLocked;
      })
      .sort((a, b) => a - b);

    const catchUpYearsSet = new Set(catchUpYears);

    // Frontload calculation based on CESG maximization:
    // 1. Fill years BEFORE frontload with CESG amounts ($2,500 or $5,000)
    // 2. Calculate future CESG contributions needed (only until CESG is maxed, not all years)
    // 3. Frontload gets: remaining - future_cesg_needed (maximizes frontload)
    // 4. Fill years AFTER frontload with remaining room

    const yearsBeforeFrontload = frontloadYear
      ? allYears.filter((y) => y < frontloadYear)
      : allYears;
    const yearsAfterFrontload = frontloadYear ? allYears.filter((y) => y > frontloadYear) : [];

    // Distribute remaining room
    let roomLeft = remainingRoom;

    // Step 1: Fill years before frontload (up to their CESG limits)
    for (const y of yearsBeforeFrontload) {
      const isCatchUp = catchUpYearsSet.has(y);
      const maxAmount = isCatchUp ? 5000 : 2500;
      const fillAmount = Math.min(maxAmount, roomLeft);
      onContributionChange(y, fillAmount, false);
      roomLeft -= fillAmount;
    }

    // Step 2: If there's a frontload year, calculate its amount using CESG+ACESG-aware logic
    // CESG and ACESG share the $7,200 lifetime cap
    const CESG_LIFETIME_CAP = 7200;
    const ACESG_PER_YEAR = 100; // Assume tier 1 ACESG
    let cumulativeGrants = 0; // Tracks CESG + ACESG combined

    // Calculate CESG+ACESG earned from years before frontload
    if (frontloadYear) {
      for (const y of yearsBeforeFrontload) {
        const isCatchUp = catchUpYearsSet.has(y);
        const cesgPerYear = isCatchUp ? 1000 : 500;
        const grantPerYear = cesgPerYear + ACESG_PER_YEAR;
        cumulativeGrants += grantPerYear;
      }
    }

    if (frontloadYear && allYears.includes(frontloadYear)) {
      // Remaining grant room (CESG + ACESG share the cap)
      const remainingGrantRoom = Math.max(0, CESG_LIFETIME_CAP - cumulativeGrants);

      // Frontload year can earn CESG + ACESG
      const frontloadIsCatchUp = catchUpYearsSet.has(frontloadYear);
      const frontloadCESG = frontloadIsCatchUp ? 1000 : 500;
      const frontloadGrant = frontloadCESG + ACESG_PER_YEAR;

      // Add frontload year's grants
      cumulativeGrants += Math.min(frontloadGrant, remainingGrantRoom);

      // Grant room still needed after frontload year
      let grantRoomStillNeeded = Math.max(0, remainingGrantRoom - frontloadGrant);

      // Calculate minimum contributions needed for years AFTER frontload to max CESG+ACESG
      let futureContribNeeded = 0;
      for (const y of yearsAfterFrontload) {
        if (grantRoomStillNeeded <= 0) break;
        const isCatchUp = catchUpYearsSet.has(y);
        const cesgPerYear = isCatchUp ? 1000 : 500;
        const grantPerYear = cesgPerYear + ACESG_PER_YEAR;
        const contribPerYear = isCatchUp ? 5000 : 2500;
        grantRoomStillNeeded -= grantPerYear;
        futureContribNeeded += contribPerYear;
      }

      // Frontload gets: remaining after before - future contributions needed
      // This maximizes frontload while ensuring future years can still earn grants
      const frontloadAmount = Math.max(0, roomLeft - futureContribNeeded);
      onContributionChange(frontloadYear, frontloadAmount, false);
      roomLeft -= frontloadAmount;
    }

    // Step 3: Fill years after frontload only while grants can still be earned
    for (const y of yearsAfterFrontload) {
      // Stop contributing once CESG+ACESG is maxed - remaining goes to frontload
      if (cumulativeGrants >= CESG_LIFETIME_CAP) {
        onContributionChange(y, 0, false);
      } else if (roomLeft <= 0) {
        onContributionChange(y, 0, false);
      } else {
        const isCatchUp = catchUpYearsSet.has(y);
        const maxAmount = isCatchUp ? 5000 : 2500;
        const cesgPerYear = isCatchUp ? 1000 : 500;
        const grantPerYear = cesgPerYear + ACESG_PER_YEAR;
        const fillAmount = Math.min(maxAmount, roomLeft);
        onContributionChange(y, fillAmount, false);
        roomLeft -= fillAmount;
        cumulativeGrants += grantPerYear;
      }
    }

    if (remainingRoom > 0) {
      toast.info(`Redistributed contributions to fit within $50,000 lifetime limit`, {
        description: `Filled ${allYears.length} years. Total: $${(LIFETIME_CONTRIBUTION_LIMIT - roomLeft).toLocaleString()}`,
      });
    }

    onContributionChange(year, amount, isYearLocked);
    setEditingYear(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingYear(null);
    setEditValue('');
  };

  const toggleLock = (year: number) => {
    const contribution = contributions.find((c) => c.year === year);
    const scheduleItem = schedule.find((s) => s.year === year);
    const amount = contribution?.amount ?? scheduleItem?.contribution ?? 0;
    onContributionChange(year, amount, !(contribution?.isLocked || false));
  };

  const isLocked = (year: number): boolean => {
    const contribution = contributions.find((c) => c.year === year);
    return contribution?.isLocked || false;
  };

  const getNote = (year: number): string | null => {
    const contribution = contributions.find((c) => c.year === year);
    return contribution?.note || null;
  };

  const startEditNote = (year: number) => {
    const note = getNote(year);
    setEditingNoteYear(year);
    setNoteValue(note || '');
  };

  const saveNote = (year: number) => {
    if (onNoteChange) {
      onNoteChange(year, noteValue.trim() || null);
    }
    setEditingNoteYear(null);
    setNoteValue('');
  };

  const deleteNote = (year: number) => {
    if (onNoteChange) {
      onNoteChange(year, null);
    }
    setEditingNoteYear(null);
    setNoteValue('');
  };

  // CLB helper functions
  const getCLBOverride = (year: number): CLBOverride | undefined => {
    return clbOverrides.find((c) => c.year === year);
  };

  const isCLBLocked = (year: number): boolean => {
    const override = getCLBOverride(year);
    return override?.isLocked || false;
  };

  const getCLBAmount = (year: number, calculatedCLB: number): number => {
    const override = getCLBOverride(year);
    return override !== undefined ? override.amount : calculatedCLB;
  };

  const startEditCLB = (year: number, amount: number) => {
    setEditingCLBYear(year);
    setEditCLBValue(amount.toString());
  };

  const cancelEditCLB = () => {
    setEditingCLBYear(null);
    setEditCLBValue('');
  };

  // Calculate total locked CLB for max limit checking
  const getLockedCLBTotal = (excludeYear?: number): number => {
    return clbOverrides
      .filter((c) => c.isLocked && c.year !== excludeYear)
      .reduce((sum, c) => sum + c.amount, 0);
  };

  const saveEditCLB = (year: number) => {
    if (!onCLBChange) return;

    let amount = parseFloat(editCLBValue) || 0;
    amount = Math.max(0, amount);

    const override = getCLBOverride(year);
    const isYearLocked = override?.isLocked || false;

    // Calculate locked CLB total (excluding current year)
    const lockedCLBTotal = getLockedCLBTotal(year);

    // Maximum available for this year
    const maxAvailable = CLB_LIFETIME_LIMIT - lockedCLBTotal;

    if (amount > maxAvailable) {
      toast.error(`Cannot set CLB to $${amount.toLocaleString()}`, {
        description: `Maximum available is $${maxAvailable.toLocaleString()} after locked CLB amounts ($${lockedCLBTotal.toLocaleString()} locked).`,
      });
      cancelEditCLB();
      return;
    }

    // Save the CLB override
    onCLBChange(year, amount, isYearLocked);

    // Auto-redistribute remaining CLB to subsequent years
    redistributeCLB(year, amount);

    cancelEditCLB();
  };

  const toggleCLBLock = (year: number, calculatedCLB: number) => {
    if (!onCLBChange) return;

    const override = getCLBOverride(year);
    const currentAmount = override?.amount ?? calculatedCLB;
    const newLocked = !(override?.isLocked || false);

    onCLBChange(year, currentAmount, newLocked);
  };

  // Redistribute remaining CLB to subsequent years after an edit
  const redistributeCLB = (editedYear: number, editedAmount: number) => {
    if (!onCLBChange) return;

    let usedCLB = 0;

    // Sum all locked CLB amounts (excluding the edited year)
    clbOverrides.forEach((override) => {
      if (override.isLocked && override.year !== editedYear) {
        usedCLB += override.amount;
      }
    });

    // Add the edited amount
    usedCLB += editedAmount;

    // Calculate remaining CLB
    let remainingCLB = CLB_LIFETIME_LIMIT - usedCLB;

    // Get years after the edited year that are CLB-eligible (have calculated CLB > 0)
    const futureYears = schedule
      .filter((row) => row.year > editedYear && row.clb > 0)
      .map((row) => row.year)
      .sort((a, b) => a - b);

    // Redistribute to future years (only unlocked ones)
    for (const year of futureYears) {
      const yearOverride = getCLBOverride(year);

      // Skip locked years
      if (yearOverride?.isLocked) {
        continue;
      }

      // Find calculated CLB for this year from schedule
      const scheduleRow = schedule.find((r) => r.year === year);
      const calculatedCLB = scheduleRow?.clb || 0;

      if (remainingCLB <= 0) {
        // No more CLB available, set to 0
        onCLBChange(year, 0, false);
      } else {
        // Give this year up to its calculated amount or remaining, whichever is less
        const amountForYear = Math.min(calculatedCLB, remainingCLB);
        onCLBChange(year, amountForYear, false);
        remainingCLB -= amountForYear;
      }
    }

    // If there's remaining CLB, add it to the year after the last eligible year
    // This shows the user where the "leftover" CLB went
    if (remainingCLB > 0 && futureYears.length > 0) {
      const lastEligibleYear = futureYears[futureYears.length - 1];
      const overflowYear = lastEligibleYear + 1;

      // Check if overflow year is not locked
      const overflowOverride = getCLBOverride(overflowYear);
      if (!overflowOverride?.isLocked) {
        onCLBChange(overflowYear, remainingCLB, false);
      }
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals with year-over-year compounding returns
  // Return = (previous cumulative + this year's contribution + grants) * projectionRate
  const { totals, yearlyReturns, cumulativeBalances } = useMemo(() => {
    const yearReturns: Record<number, number> = {};
    const cumBalances: Record<number, number> = {};

    // Use a wrapper object for mutable state to avoid React Compiler's immutability warning
    const state = { previousBalance: 0 };

    const totalsResult = schedule.reduce(
      (acc, row) => {
        // Get CLB amount (use override if exists, otherwise calculated)
        const clbOverride = clbOverrides.find((c) => c.year === row.year);
        const actualCLB = clbOverride !== undefined ? clbOverride.amount : row.clb;

        // Recalculate total grants with CLB override
        const actualTotalGrants = row.cesg + row.acesg + actualCLB;

        // This year's addition (contribution + grants)
        const yearAddition = row.contribution + actualTotalGrants;

        // Return is earned on opening balance + this year's addition
        // Assuming contributions are made at start of year
        const balanceEarningReturn = state.previousBalance + yearAddition;
        const yearReturn = balanceEarningReturn * projectionRate;

        // Closing balance = opening + addition + return
        const closingBalance = state.previousBalance + yearAddition + yearReturn;

        yearReturns[row.year] = yearReturn;
        cumBalances[row.year] = closingBalance;

        // Next year's opening balance is this year's closing balance
        state.previousBalance = closingBalance;

        return {
          contribution: acc.contribution + row.contribution,
          cesg: acc.cesg + row.cesg,
          acesg: acc.acesg + row.acesg,
          clb: acc.clb + actualCLB,
          totalGrants: acc.totalGrants + actualTotalGrants,
          projectedReturn: acc.projectedReturn + yearReturn,
        };
      },
      { contribution: 0, cesg: 0, acesg: 0, clb: 0, totalGrants: 0, projectedReturn: 0 }
    );

    return { totals: totalsResult, yearlyReturns: yearReturns, cumulativeBalances: cumBalances };
  }, [schedule, projectionRate, clbOverrides]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-background sticky left-0 z-10 w-20">Year</TableHead>
              <TableHead className="w-12">Age</TableHead>
              <TableHead className="w-32">Contribution</TableHead>
              <TableHead className="text-right">CESG</TableHead>
              <TableHead className="hidden text-right sm:table-cell">ACESG</TableHead>
              <TableHead className="hidden text-right sm:table-cell">CLB</TableHead>
              <TableHead className="text-right">Total Grants</TableHead>
              <TableHead className="hidden text-right lg:table-cell">
                <div className="flex items-center justify-end gap-1">
                  Return
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="text-muted-foreground h-3.5 w-3.5" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Year-over-year compounding return at {(projectionRate * 100).toFixed(0)}%
                          annual growth. Each year&apos;s return is calculated on the total balance
                          (prior balance + new contributions + grants).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead className="hidden text-right md:table-cell">Cumulative</TableHead>
              {!readOnly && <TableHead className="w-16" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.map((row) => {
              const locked = isLocked(row.year);
              const isEditing = editingYear === row.year;
              const yearStatus = getYearStatus(row.year, currentYear);
              const isPast = yearStatus === 'past';
              const isCurrent = yearStatus === 'current';

              return (
                <TableRow
                  key={row.year}
                  className={cn(
                    locked && 'bg-muted/50',
                    isPast && 'bg-muted/30 opacity-60',
                    isCurrent && 'ring-primary bg-primary/5 ring-2 ring-inset'
                  )}
                >
                  <TableCell
                    className={cn(
                      'sticky left-0 z-10 font-medium',
                      locked && 'bg-muted/50',
                      isPast && 'bg-muted/30',
                      isCurrent && 'bg-primary/5',
                      !locked && !isPast && !isCurrent && 'bg-background'
                    )}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      {row.year}
                      {isCurrent && (
                        <Badge variant="default" className="px-1 py-0 text-xs sm:px-1.5">
                          Now
                        </Badge>
                      )}
                      {isPast && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Calendar className="text-muted-foreground h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>Past year - read only</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {getNote(row.year) && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                              <StickyNote className="h-3 w-3 text-amber-500" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Note for {row.year}</p>
                              <p className="text-muted-foreground text-sm">{getNote(row.year)}</p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{row.childAge}</TableCell>
                  <TableCell>
                    {isEditing && !isPast ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 w-24"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(row.year);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <Button size="sm" variant="ghost" onClick={() => saveEdit(row.year)}>
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {(() => {
                          const isSpecialYear =
                            isFrontloadYear(row.year) || isCatchUpYear(row.year);
                          const canEdit = !readOnly && !isPast && !isSpecialYear;
                          return (
                            <span
                              className={cn(
                                canEdit && 'text-primary cursor-pointer hover:underline',
                                (isPast || isSpecialYear) && 'text-muted-foreground'
                              )}
                              onClick={() => canEdit && startEdit(row.year, row.contribution)}
                            >
                              {formatCurrency(row.contribution)}
                            </span>
                          );
                        })()}
                        {/* Year indicator icons */}
                        {isFrontloadYear(row.year) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                              </TooltipTrigger>
                              <TooltipContent>Frontload year</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {isCatchUpYear(row.year) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Zap className="h-3.5 w-3.5 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>Catch-up year: $5,000 for $1,000 CESG</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {locked && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Lock className="text-muted-foreground h-3 w-3" />
                              </TooltipTrigger>
                              <TooltipContent>Locked contribution</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.cesg > 0 ? (
                      <Badge variant="secondary">{formatCurrency(row.cesg)}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-right sm:table-cell">
                    {row.acesg > 0 ? (
                      <Badge variant="secondary">{formatCurrency(row.acesg)}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-right sm:table-cell">
                    {(() => {
                      const calculatedCLB = row.clb;
                      const displayCLB = getCLBAmount(row.year, calculatedCLB);
                      const clbLocked = isCLBLocked(row.year);
                      const isEditingCLB = editingCLBYear === row.year;
                      const canEditCLB =
                        !readOnly &&
                        !isPast &&
                        onCLBChange &&
                        (calculatedCLB > 0 || displayCLB > 0);
                      const lockedCLBTotal = getLockedCLBTotal(row.year);
                      const maxCLBForYear = CLB_LIFETIME_LIMIT - lockedCLBTotal;

                      if (isEditingCLB) {
                        return (
                          <div className="flex items-center justify-end gap-1">
                            <Input
                              type="number"
                              value={editCLBValue}
                              onChange={(e) => setEditCLBValue(e.target.value)}
                              className="h-7 w-20 text-right"
                              autoFocus
                              max={maxCLBForYear}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditCLB(row.year);
                                if (e.key === 'Escape') cancelEditCLB();
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={() => saveEditCLB(row.year)}
                            >
                              Save
                            </Button>
                          </div>
                        );
                      }

                      if (displayCLB > 0 || calculatedCLB > 0) {
                        return (
                          <div className="flex items-center justify-end gap-1">
                            <Badge
                              variant={clbLocked ? 'default' : 'secondary'}
                              className={cn(
                                canEditCLB &&
                                  'cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30',
                                clbLocked && 'bg-purple-600 hover:bg-purple-700'
                              )}
                              onClick={() => canEditCLB && startEditCLB(row.year, displayCLB)}
                            >
                              {formatCurrency(displayCLB)}
                            </Badge>
                            {clbLocked && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Lock className="h-3 w-3 text-purple-600" />
                                  </TooltipTrigger>
                                  <TooltipContent>CLB locked</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {canEditCLB && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6"
                                      onClick={() => toggleCLBLock(row.year, calculatedCLB)}
                                    >
                                      {clbLocked ? (
                                        <Lock className="h-3 w-3 text-purple-600" />
                                      ) : (
                                        <Unlock className="text-muted-foreground h-3 w-3" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {clbLocked ? 'Unlock CLB' : 'Lock CLB'}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        );
                      }

                      return <span className="text-muted-foreground">-</span>;
                    })()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(() => {
                      // Use CLB override if exists for total grants calculation
                      const clbOverride = clbOverrides.find((c) => c.year === row.year);
                      const actualCLB = clbOverride !== undefined ? clbOverride.amount : row.clb;
                      const actualTotalGrants = row.cesg + row.acesg + actualCLB;

                      return actualTotalGrants > 0 ? (
                        <span className="text-green-600 dark:text-green-400">
                          {formatCurrency(actualTotalGrants)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="hidden text-right lg:table-cell">
                    {(() => {
                      const returnValue = yearlyReturns[row.year] || 0;
                      return returnValue > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(returnValue)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-right md:table-cell">
                    {formatCurrency(cumulativeBalances[row.year] || 0)}
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      {(() => {
                        const isSpecialYear = isFrontloadYear(row.year) || isCatchUpYear(row.year);
                        if (isPast) {
                          return <span className="text-muted-foreground text-xs">Past</span>;
                        }
                        if (isSpecialYear) {
                          return (
                            <span className="text-muted-foreground text-xs">
                              {isFrontloadYear(row.year) ? 'Frontload' : 'Catch-up'}
                            </span>
                          );
                        }
                        return (
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => toggleLock(row.year)}
                                  >
                                    {locked ? (
                                      <Lock className="h-3 w-3" />
                                    ) : (
                                      <Unlock className="h-3 w-3" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{locked ? 'Unlock' : 'Lock'}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {!isEditing && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => startEdit(row.year, row.contribution)}
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {onNoteChange && (
                              <Popover
                                open={editingNoteYear === row.year}
                                onOpenChange={(open) => {
                                  if (open) {
                                    startEditNote(row.year);
                                  } else {
                                    setEditingNoteYear(null);
                                    setNoteValue('');
                                  }
                                }}
                              >
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <PopoverTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className={cn(
                                            'h-7 w-7',
                                            getNote(row.year) && 'text-amber-500'
                                          )}
                                        >
                                          <StickyNote className="h-3 w-3" />
                                        </Button>
                                      </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {getNote(row.year) ? 'Edit note' : 'Add note'}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <PopoverContent className="w-72" align="end">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium">Note for {row.year}</p>
                                      {getNote(row.year) && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="text-destructive h-6 w-6"
                                          onClick={() => deleteNote(row.year)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                    <Textarea
                                      placeholder="e.g., Use tax refund, Bonus month..."
                                      value={noteValue}
                                      onChange={(e) => setNoteValue(e.target.value)}
                                      rows={3}
                                      className="text-sm"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingNoteYear(null);
                                          setNoteValue('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button size="sm" onClick={() => saveNote(row.year)}>
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {/* Totals Row */}
            <TableRow className="bg-muted/50 font-semibold">
              <TableCell colSpan={2} className="bg-muted/50 sticky left-0 z-10">
                Totals
              </TableCell>
              <TableCell>{formatCurrency(totals.contribution)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.cesg)}</TableCell>
              <TableCell className="hidden text-right sm:table-cell">
                {formatCurrency(totals.acesg)}
              </TableCell>
              <TableCell className="hidden text-right sm:table-cell">
                {formatCurrency(totals.clb)}
              </TableCell>
              <TableCell className="text-right text-green-600 dark:text-green-400">
                {formatCurrency(totals.totalGrants)}
              </TableCell>
              <TableCell className="hidden text-right text-emerald-600 lg:table-cell dark:text-emerald-400">
                {formatCurrency(totals.projectedReturn)}
              </TableCell>
              <TableCell className="hidden text-right md:table-cell">
                {formatCurrency(totals.contribution + totals.totalGrants + totals.projectedReturn)}
              </TableCell>
              {!readOnly && <TableCell />}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-muted-foreground text-sm">Total Contributions</p>
          <p className="text-lg font-bold">{formatCurrency(totals.contribution)}</p>
          <p className="text-muted-foreground text-xs">of $50,000 lifetime</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-muted-foreground text-sm">CESG + ACESG</p>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(totals.cesg + totals.acesg)}
          </p>
          <p className="text-muted-foreground text-xs">of $7,200 lifetime</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-muted-foreground text-sm">CLB</p>
          <p className="text-lg font-bold text-purple-600">{formatCurrency(totals.clb)}</p>
          <p className="text-muted-foreground text-xs">of $2,000 lifetime</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-muted-foreground text-sm">Grand Total</p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(totals.contribution + totals.totalGrants)}
          </p>
        </div>
      </div>
    </div>
  );
}
