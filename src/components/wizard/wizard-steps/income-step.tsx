'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { incomeYearSchema, type IncomeYearFormData } from '@/lib/validators';
import { useIncomeStore } from '@/stores/income-store';
import { formatCurrency } from '@/lib/utils';
import { RESP_RULES } from '@/lib/constants';
import type { IncomeYear } from '@/types';

interface IncomeStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function IncomeStep({ onNext, onBack }: IncomeStepProps) {
  const { incomeYears, setIncomeForYear, removeIncomeForYear } = useIncomeStore();
  const [showForm, setShowForm] = useState(incomeYears.length === 0);
  const [editingYear, setEditingYear] = useState<IncomeYear | null>(null);

  const currentYear = new Date().getFullYear();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncomeYearFormData>({
    resolver: zodResolver(incomeYearSchema),
    defaultValues: {
      year: currentYear,
      familyIncome: 0,
    },
  });

  const handleFormSubmit = (data: IncomeYearFormData) => {
    setIncomeForYear(data.year, data.familyIncome);
    reset({ year: currentYear, familyIncome: 0 });
    setShowForm(false);
    setEditingYear(null);
  };

  const handleEdit = (incomeYear: IncomeYear) => {
    setEditingYear(incomeYear);
    reset({
      year: incomeYear.year,
      familyIncome: incomeYear.familyIncome,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    reset({ year: currentYear, familyIncome: 0 });
    setShowForm(false);
    setEditingYear(null);
  };

  const getIncomeCategory = (
    income: number
  ): { label: string; variant: 'default' | 'secondary' | 'outline' } => {
    if (income <= RESP_RULES.ACESG_TIER1_INCOME_MAX) {
      return { label: 'Max ACESG + CLB', variant: 'default' };
    }
    if (income <= RESP_RULES.ACESG_TIER2_INCOME_MAX) {
      return { label: 'Partial ACESG', variant: 'secondary' };
    }
    return { label: 'Basic CESG', variant: 'outline' };
  };

  const sortedYears = [...incomeYears].sort((a, b) => b.year - a.year);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Expected Family Income</h2>
        <p className="text-muted-foreground">
          Enter your expected family income to calculate grant eligibility.
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Why income matters</p>
              <p className="text-muted-foreground">
                Family income determines eligibility for the Additional CESG (up to $100/year extra)
                and Canada Learning Bond ($500 first year + $100/year). Lower income families
                receive more grants.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="default">
                  ≤${RESP_RULES.ACESG_TIER1_INCOME_MAX.toLocaleString()}: Max grants
                </Badge>
                <Badge variant="secondary">
                  ≤${RESP_RULES.ACESG_TIER2_INCOME_MAX.toLocaleString()}: Partial ACESG
                </Badge>
                <Badge variant="outline">Above: Basic CESG only</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Income Years */}
      {sortedYears.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Income by Year</h3>
          {sortedYears.map((incomeYear) => {
            const category = getIncomeCategory(incomeYear.familyIncome);
            return (
              <Card key={incomeYear.year}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <DollarSign className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{incomeYear.year}</p>
                      <p className="text-muted-foreground text-sm">
                        {formatCurrency(incomeYear.familyIncome)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant={category.variant}>{category.label}</Badge>
                        </TooltipTrigger>
                        <TooltipContent>Grant eligibility based on income level</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(incomeYear)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIncomeForYear(incomeYear.year)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingYear ? 'Edit Income Year' : 'Add Income Year'}</CardTitle>
            <CardDescription>
              Enter your expected family income for a specific year.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wizard-income-year">Year</Label>
                  <Input
                    id="wizard-income-year"
                    type="number"
                    min={currentYear}
                    max={currentYear + 20}
                    disabled={!!editingYear}
                    {...register('year', { valueAsNumber: true })}
                  />
                  {errors.year && <p className="text-destructive text-sm">{errors.year.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wizard-income-amount">Family Income ($)</Label>
                  <Input
                    id="wizard-income-amount"
                    type="number"
                    step="1000"
                    min="0"
                    placeholder="e.g., 80000"
                    {...register('familyIncome', { valueAsNumber: true })}
                  />
                  {errors.familyIncome && (
                    <p className="text-destructive text-sm">{errors.familyIncome.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingYear ? 'Save Changes' : 'Add Income Year'}</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add More Button */}
      {!showForm && (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Income Year
        </Button>
      )}

      {/* Skip note */}
      {incomeYears.length === 0 && !showForm && (
        <p className="text-muted-foreground text-center text-sm">
          You can skip this step. Without income data, we&apos;ll only calculate basic CESG grants.
        </p>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
