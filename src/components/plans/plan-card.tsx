'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  TrendingUp,
  Users,
  Calendar,
  Copy,
  EyeOff,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChildrenStore } from '@/stores/children-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { getProjectionRateValue } from '@/lib/projection-rates';
import type { Plan } from '@/types';

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onDuplicate: (plan: Plan) => void;
  onToggleDisabled: (plan: Plan) => void;
}

export function PlanCard({ plan, onEdit, onDelete, onDuplicate, onToggleDisabled }: PlanCardProps) {
  const { children } = useChildrenStore();
  const { getBlendedReturn } = usePortfolioStore();

  const planChildren = children.filter((c) => plan.childIds.includes(c.id));
  const blendedReturn = getBlendedReturn();

  const rateValue = getProjectionRateValue(plan.projectionRate, plan.customRate, blendedReturn);

  return (
    <Card
      className={`hover:border-primary/50 transition-colors ${plan.disabled ? 'border-dashed opacity-60' : ''}`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href={`/plans/${plan.id}`}>
              <CardTitle className="cursor-pointer text-lg hover:underline">{plan.name}</CardTitle>
            </Link>
            {plan.disabled && (
              <Badge variant="secondary" className="bg-muted text-xs">
                <EyeOff className="mr-1 h-3 w-3" />
                Disabled
              </Badge>
            )}
          </div>
          {plan.description && (
            <p className="text-muted-foreground line-clamp-1 text-sm">{plan.description}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(plan)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(plan)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleDisabled(plan)}>
              {plan.disabled ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Enable
                </>
              ) : (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Disable
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(plan)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Children in Plan */}
        <div className="flex items-center gap-2">
          <Users className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">
            {planChildren.length > 0
              ? planChildren.map((c) => c.name).join(', ')
              : 'No children assigned'}
          </span>
        </div>

        {/* Projection Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="text-muted-foreground h-4 w-4" />
            <span>Projection Rate</span>
          </div>
          <Badge variant="secondary">
            {plan.projectionRate === 'custom' ? 'Custom' : plan.projectionRate} ({rateValue}%)
          </Badge>
        </div>

        {/* Settings Badges */}
        <div className="flex flex-wrap gap-2">
          {plan.optimizeForGrowth && (
            <Badge variant="outline" className="text-xs">
              Growth Optimized
            </Badge>
          )}
          {plan.inflationAdjusted && (
            <Badge variant="outline" className="text-xs">
              Inflation Adjusted
            </Badge>
          )}
        </div>

        {/* Updated Date */}
        <div className="text-muted-foreground flex items-center gap-2 border-t pt-2 text-xs">
          <Calendar className="h-3 w-3" />
          <span>Updated {format(new Date(plan.updatedAt), 'MMM d, yyyy')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
