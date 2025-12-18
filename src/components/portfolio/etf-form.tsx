'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { etfSchema, type ETFFormData } from '@/lib/validators';
import type { ETF } from '@/types';

interface ETFFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ETFFormData) => void;
  etf?: ETF | null;
}

export function ETFForm({ open, onOpenChange, onSubmit, etf }: ETFFormProps) {
  const isEditing = !!etf;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ETFFormData>({
    resolver: zodResolver(etfSchema),
    defaultValues: {
      symbol: '',
      name: '',
      allocation: 0,
      historicalReturn: 0,
    },
  });

  // Reset form when dialog opens or ETF changes
  useEffect(() => {
    if (open) {
      reset({
        symbol: etf?.symbol || '',
        name: etf?.name || '',
        allocation: etf?.allocation || 0,
        historicalReturn: etf?.historicalReturn || 0,
      });
    }
  }, [open, etf, reset]);

  const handleFormSubmit = (data: ETFFormData) => {
    onSubmit(data);
    reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[425px]"
        showCloseButton={false}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          setTimeout(() => {
            const firstInput = document.getElementById('etf-symbol');
            firstInput?.focus();
          }, 0);
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit ETF' : 'Add ETF'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the ETF information.' : 'Add a new ETF to your portfolio.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="etf-symbol">Symbol</Label>
            <Input
              id="etf-symbol"
              tabIndex={1}
              placeholder="e.g., VFV.TO"
              {...register('symbol')}
              aria-invalid={!!errors.symbol}
            />
            {errors.symbol && <p className="text-destructive text-sm">{errors.symbol.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="etf-name">Name</Label>
            <Input
              id="etf-name"
              tabIndex={2}
              placeholder="e.g., Vanguard S&P 500 Index ETF"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="etf-allocation">Allocation (%)</Label>
            <Input
              id="etf-allocation"
              tabIndex={3}
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g., 50"
              {...register('allocation', { valueAsNumber: true })}
              aria-invalid={!!errors.allocation}
            />
            {errors.allocation && (
              <p className="text-destructive text-sm">{errors.allocation.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="etf-historicalReturn">Historical Return (%)</Label>
            <Input
              id="etf-historicalReturn"
              tabIndex={4}
              type="number"
              step="0.1"
              placeholder="e.g., 10.5"
              {...register('historicalReturn', { valueAsNumber: true })}
              aria-invalid={!!errors.historicalReturn}
            />
            {errors.historicalReturn && (
              <p className="text-destructive text-sm">{errors.historicalReturn.message}</p>
            )}
            <p className="text-muted-foreground text-xs">
              Average annual return over the past 10 years.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} tabIndex={5}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} tabIndex={6}>
              {isEditing ? 'Save Changes' : 'Add ETF'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
