'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, PieChart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { etfSchema, type ETFFormData } from '@/lib/validators';
import { usePortfolioStore } from '@/stores/portfolio-store';
import type { ETF } from '@/types';

const DEFAULT_PORTFOLIO = [
  { symbol: 'VFV.TO', name: 'Vanguard S&P 500 Index ETF', allocation: 50, historicalReturn: 10.5 },
  { symbol: 'VEQT.TO', name: 'Vanguard All-Equity ETF', allocation: 30, historicalReturn: 9.2 },
  {
    symbol: 'TEC.TO',
    name: 'TD Global Technology Leaders',
    allocation: 20,
    historicalReturn: 12.1,
  },
];

interface PortfolioStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PortfolioStep({ onNext, onBack }: PortfolioStepProps) {
  const { etfs, addETF, updateETF, removeETF, isAllocationValid, getTotalAllocation, clearETFs } =
    usePortfolioStore();
  const [showForm, setShowForm] = useState(false);
  const [editingETF, setEditingETF] = useState<ETF | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ETFFormData>({
    resolver: zodResolver(etfSchema),
    defaultValues: {
      symbol: '',
      name: '',
      allocation: 0,
      historicalReturn: 0,
    },
  });

  const handleFormSubmit = (data: ETFFormData) => {
    if (editingETF) {
      updateETF(editingETF.id, data);
    } else {
      addETF(data);
    }
    reset();
    setShowForm(false);
    setEditingETF(null);
  };

  const handleEdit = (etf: ETF) => {
    setEditingETF(etf);
    reset({
      symbol: etf.symbol,
      name: etf.name,
      allocation: etf.allocation,
      historicalReturn: etf.historicalReturn,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setEditingETF(null);
  };

  const handleUseDefaults = () => {
    clearETFs();
    DEFAULT_PORTFOLIO.forEach((etf) => addETF(etf));
  };

  const totalAllocation = getTotalAllocation();
  const isValid = isAllocationValid();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Set Up Your Portfolio</h2>
        <p className="text-muted-foreground">
          Configure the ETFs in your RESP portfolio for projection calculations.
        </p>
      </div>

      {/* Quick Setup */}
      {etfs.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Sparkles className="text-muted-foreground mb-4 h-10 w-10" />
            <h3 className="mb-2 font-semibold">Quick Setup</h3>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Use our recommended diversified portfolio or add your own ETFs.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleUseDefaults}>
                <Sparkles className="mr-2 h-4 w-4" />
                Use Recommended Portfolio
              </Button>
              <Button variant="outline" onClick={() => setShowForm(true)}>
                Add Custom ETF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing ETFs */}
      {etfs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Your ETFs</h3>
            <Badge variant={isValid ? 'default' : 'destructive'}>Total: {totalAllocation}%</Badge>
          </div>
          {etfs.map((etf) => (
            <Card key={etf.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                    <PieChart className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{etf.symbol}</p>
                    <p className="text-muted-foreground text-sm">{etf.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{etf.allocation}%</p>
                    <p className="text-muted-foreground text-xs">{etf.historicalReturn}% return</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(etf)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeETF(etf.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!isValid && (
            <p className="text-destructive text-sm">
              Allocation must equal 100%. Currently at {totalAllocation}%.
            </p>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingETF ? 'Edit ETF' : 'Add ETF'}</CardTitle>
            <CardDescription>Enter the ETF details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wizard-etf-symbol">Symbol</Label>
                  <Input
                    id="wizard-etf-symbol"
                    placeholder="e.g., VFV.TO"
                    {...register('symbol')}
                  />
                  {errors.symbol && (
                    <p className="text-destructive text-sm">{errors.symbol.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wizard-etf-name">Name</Label>
                  <Input
                    id="wizard-etf-name"
                    placeholder="e.g., Vanguard S&P 500"
                    {...register('name')}
                  />
                  {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wizard-etf-allocation">Allocation (%)</Label>
                  <Input
                    id="wizard-etf-allocation"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    {...register('allocation', { valueAsNumber: true })}
                  />
                  {errors.allocation && (
                    <p className="text-destructive text-sm">{errors.allocation.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wizard-etf-return">Historical Return (%)</Label>
                  <Input
                    id="wizard-etf-return"
                    type="number"
                    step="0.1"
                    {...register('historicalReturn', { valueAsNumber: true })}
                  />
                  {errors.historicalReturn && (
                    <p className="text-destructive text-sm">{errors.historicalReturn.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingETF ? 'Save Changes' : 'Add ETF'}</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add More Button */}
      {etfs.length > 0 && !showForm && (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Another ETF
        </Button>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={etfs.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  );
}
