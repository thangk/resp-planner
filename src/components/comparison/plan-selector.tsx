'use client';

import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Plan } from '@/types';

interface PlanSelectorProps {
  plans: Plan[];
  selectedPlanId: string | null;
  onPlanSelect: (planId: string) => void;
  label: string;
  excludePlanId?: string | null;
}

export function PlanSelector({
  plans,
  selectedPlanId,
  onPlanSelect,
  label,
  excludePlanId,
}: PlanSelectorProps) {
  const availablePlans = plans.filter((p) => p.id !== excludePlanId);

  return (
    <Card className={selectedPlanId ? 'border-primary' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          {label}
        </CardTitle>
        <CardDescription>
          {selectedPlanId ? 'Selected for comparison' : 'Choose a plan'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedPlanId || ''} onValueChange={onPlanSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a plan..." />
          </SelectTrigger>
          <SelectContent>
            {availablePlans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                <div className="flex flex-col items-start">
                  <span>{plan.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {plan.childIds.length} {plan.childIds.length === 1 ? 'child' : 'children'}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
