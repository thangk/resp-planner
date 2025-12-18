'use client';

import { differenceInYears, format } from 'date-fns';
import { MoreHorizontal, Pencil, Trash2, Calendar, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Child } from '@/types';

interface ChildCardProps {
  child: Child;
  onEdit: (child: Child) => void;
  onDelete: (child: Child) => void;
}

export function ChildCard({ child, onEdit, onDelete }: ChildCardProps) {
  const dob = new Date(child.dateOfBirth);
  const age = differenceInYears(new Date(), dob);
  // CESG eligibility ends at the end of the calendar year child turns 17
  const turnsSeventeenYear = dob.getFullYear() + 17;
  const yearsUntilSeventeen = turnsSeventeenYear - new Date().getFullYear();
  const isEligibleForGrants = age <= 17;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{child.name}</CardTitle>
          <p className="text-muted-foreground text-sm">{age} years old</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(child)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(child)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="text-muted-foreground h-4 w-4" />
          <span>Born {format(dob, 'MMM d, yyyy')}</span>
        </div>

        {child.respOpenedDate && (
          <div className="flex items-center gap-2 text-sm">
            <Gift className="text-muted-foreground h-4 w-4" />
            <span>RESP opened {format(new Date(child.respOpenedDate), 'MMM d, yyyy')}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {isEligibleForGrants ? (
            <Badge variant="secondary">
              {yearsUntilSeventeen > 0
                ? `${yearsUntilSeventeen} years of CESG eligibility`
                : 'Last year of CESG eligibility'}
            </Badge>
          ) : (
            <Badge variant="outline">No longer grant eligible</Badge>
          )}

          {child.catchUpYearsEnabled && child.catchUpYearsAvailable > 0 && (
            <Badge variant="default">{child.catchUpYearsAvailable} catch-up years</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
