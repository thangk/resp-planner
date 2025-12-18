'use client';

import { MoreHorizontal, Pencil, Trash2, TrendingUp, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ETF } from '@/types';

interface ETFCardProps {
  etf: ETF;
  onEdit: (etf: ETF) => void;
  onDelete: (etf: ETF) => void;
}

export function ETFCard({ etf, onEdit, onDelete }: ETFCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="font-mono text-lg">{etf.symbol}</CardTitle>
          <p className="text-muted-foreground line-clamp-1 text-sm">{etf.name}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(etf)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(etf)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Percent className="text-muted-foreground h-4 w-4" />
            <span>Allocation</span>
          </div>
          <Badge variant="secondary">{etf.allocation}%</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="text-muted-foreground h-4 w-4" />
            <span>Historical Return</span>
          </div>
          <Badge variant={etf.historicalReturn >= 0 ? 'default' : 'destructive'}>
            {etf.historicalReturn >= 0 ? '+' : ''}
            {etf.historicalReturn}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
