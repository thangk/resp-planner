'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useIncomeStore } from '@/stores/income-store';
import { incomeYearSchema, type IncomeYearFormData } from '@/lib/validators';
import { RESP_RULES } from '@/lib/constants';

export function IncomeManagement() {
  const { incomeYears, setIncomeForYear, removeIncomeForYear, getACESGTier, isCLBEligible } =
    useIncomeStore();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteYear, setDeleteYear] = useState<number | null>(null);

  const currentYear = new Date().getFullYear();
  const sortedYears = [...incomeYears].sort((a, b) => b.year - a.year);

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

  const handleAddIncome = (data: IncomeYearFormData) => {
    setIncomeForYear(data.year, data.familyIncome);
    toast.success(`Income for ${data.year} saved`);
    reset();
    setFormOpen(false);
  };

  const handleDeleteIncome = () => {
    if (deleteYear !== null) {
      removeIncomeForYear(deleteYear);
      toast.success(`Income for ${deleteYear} removed`);
      setDeleteYear(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getEligibilityBadges = (year: number) => {
    const tier = getACESGTier(year);
    const clbEligible = isCLBEligible(year);

    return (
      <div className="flex gap-1">
        {tier === 'tier1' && (
          <Badge variant="default" className="text-xs">
            ACESG +$100
          </Badge>
        )}
        {tier === 'tier2' && (
          <Badge variant="secondary" className="text-xs">
            ACESG +$50
          </Badge>
        )}
        {clbEligible && (
          <Badge variant="outline" className="text-xs">
            CLB Eligible
          </Badge>
        )}
        {tier === 'none' && !clbEligible && (
          <Badge variant="outline" className="text-muted-foreground text-xs">
            Basic CESG only
          </Badge>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Family Income
              </CardTitle>
              <CardDescription>
                Your family income affects ACESG and CLB eligibility.
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Year
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedYears.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No income data added yet. Add your expected family income to see grant eligibility.
            </p>
          ) : (
            <div className="space-y-2">
              {sortedYears.map((iy) => (
                <div
                  key={iy.year}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{iy.year}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(iy.familyIncome)}
                      </span>
                    </div>
                    {getEligibilityBadges(iy.year)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                    onClick={() => setDeleteYear(iy.year)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-muted/50 text-muted-foreground mt-4 rounded-lg p-3 text-xs">
            <p className="font-medium">2025 Income Thresholds:</p>
            <ul className="mt-1 list-inside list-disc space-y-1">
              <li>
                ACESG Tier 1 (extra $100): Income ≤{' '}
                {formatCurrency(RESP_RULES.ACESG_TIER1_INCOME_MAX)}
              </li>
              <li>
                ACESG Tier 2 (extra $50): Income ≤{' '}
                {formatCurrency(RESP_RULES.ACESG_TIER2_INCOME_MAX)}
              </li>
              <li>
                CLB Eligible: Income ≤{' '}
                {formatCurrency(RESP_RULES.CLB_INCOME_THRESHOLD_1_3_CHILDREN)}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Add Income Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Family Income</DialogTitle>
            <DialogDescription>
              Enter your expected family income for a specific year.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleAddIncome)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="2000"
                max="2100"
                {...register('year', { valueAsNumber: true })}
                aria-invalid={!!errors.year}
              />
              {errors.year && <p className="text-destructive text-sm">{errors.year.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyIncome">Family Income ($)</Label>
              <Input
                id="familyIncome"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 85000"
                {...register('familyIncome', { valueAsNumber: true })}
                aria-invalid={!!errors.familyIncome}
              />
              {errors.familyIncome && (
                <p className="text-destructive text-sm">{errors.familyIncome.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Income</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteYear !== null} onOpenChange={() => setDeleteYear(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Income Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the income record for {deleteYear}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteYear(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteIncome}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
