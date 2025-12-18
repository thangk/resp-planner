'use client';

import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
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
import { ChildForm } from '@/components/children/child-form';
import { ChildCard } from '@/components/children/child-card';
import { useChildrenStore } from '@/stores/children-store';
import { useMounted } from '@/hooks/use-mounted';
import { Skeleton } from '@/components/ui/skeleton';
import type { Child } from '@/types';
import type { ChildFormData } from '@/lib/validators';

export default function ChildrenPage() {
  const mounted = useMounted();
  const { children, addChild, updateChild, removeChild } = useChildrenStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);

  const handleAddChild = (data: ChildFormData) => {
    addChild(data);
    toast.success('Child added successfully');
  };

  const handleEditChild = (data: ChildFormData) => {
    if (editingChild) {
      updateChild(editingChild.id, data);
      toast.success('Child updated successfully');
      setEditingChild(null);
    }
  };

  const handleDeleteClick = (child: Child) => {
    setChildToDelete(child);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (childToDelete) {
      removeChild(childToDelete.id);
      toast.success('Child removed successfully');
      setChildToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleEditClick = (child: Child) => {
    setEditingChild(child);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingChild(null);
    }
  };

  if (!mounted) {
    return <ChildrenPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Children</h1>
          <p className="text-muted-foreground">Manage your RESP beneficiaries.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Child
        </Button>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              No Children Added
            </CardTitle>
            <CardDescription>Add your first child to start planning their RESP.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Child
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Form Dialog */}
      <ChildForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={editingChild ? handleEditChild : handleAddChild}
        child={editingChild}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Child</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {childToDelete?.name}? This will also remove them from
              any plans they are included in. This action cannot be undone.
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
    </div>
  );
}

function ChildrenPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-2 h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
