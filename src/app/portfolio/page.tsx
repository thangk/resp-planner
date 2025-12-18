'use client';

import { useState } from 'react';
import { Plus, PieChart, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ETFForm } from '@/components/portfolio/etf-form';
import { ETFCard } from '@/components/portfolio/etf-card';
import { PortfolioSummary } from '@/components/portfolio/portfolio-summary';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { useMounted } from '@/hooks/use-mounted';
import { Skeleton } from '@/components/ui/skeleton';
import type { ETF } from '@/types';
import type { ETFFormData } from '@/lib/validators';

export default function PortfolioPage() {
  const mounted = useMounted();
  const { etfs, addETF, updateETF, removeETF, resetToDefaults } = usePortfolioStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingETF, setEditingETF] = useState<ETF | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [etfToDelete, setETFToDelete] = useState<ETF | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleAddETF = (data: ETFFormData) => {
    addETF(data);
    toast.success('ETF added successfully');
  };

  const handleEditETF = (data: ETFFormData) => {
    if (editingETF) {
      updateETF(editingETF.id, data);
      toast.success('ETF updated successfully');
      setEditingETF(null);
    }
  };

  const handleDeleteClick = (etf: ETF) => {
    setETFToDelete(etf);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (etfToDelete) {
      removeETF(etfToDelete.id);
      toast.success('ETF removed successfully');
      setETFToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleEditClick = (etf: ETF) => {
    setEditingETF(etf);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingETF(null);
    }
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    toast.success('Portfolio reset to defaults');
    setResetDialogOpen(false);
  };

  if (!mounted) {
    return <PortfolioPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">Manage your investment allocation.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setResetDialogOpen(true)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Defaults
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add ETF
          </Button>
        </div>
      </div>

      {etfs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              No ETFs Added
            </CardTitle>
            <CardDescription>
              Add ETFs to your portfolio or use the default portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First ETF
            </Button>
            <Button variant="outline" onClick={handleResetToDefaults}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Use Default Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <PortfolioSummary />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {etfs.map((etf) => (
              <ETFCard
                key={etf.id}
                etf={etf}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Form Dialog */}
      <ETFForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={editingETF ? handleEditETF : handleAddETF}
        etf={editingETF}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete ETF</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {etfToDelete?.symbol} from your portfolio? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset to Defaults</DialogTitle>
            <DialogDescription>
              This will replace your current portfolio with the default allocation: VFV.TO (50%),
              VEQT.TO (30%), TEC.TO (20%). Your current ETFs will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetToDefaults}>Reset to Defaults</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PortfolioPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-2 h-5 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
