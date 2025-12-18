'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { childSchema, type ChildFormData } from '@/lib/validators';
import type { Child } from '@/types';

interface ChildFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ChildFormData) => void;
  child?: Child | null;
}

export function ChildForm({ open, onOpenChange, onSubmit, child }: ChildFormProps) {
  const isEditing = !!child;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      name: '',
      dateOfBirth: '',
      respOpenedDate: null,
      catchUpYearsEnabled: false,
    },
  });

  // Reset form when dialog opens or child changes
  useEffect(() => {
    if (open) {
      reset({
        name: child?.name || '',
        dateOfBirth: child?.dateOfBirth ? format(new Date(child.dateOfBirth), 'yyyy-MM-dd') : '',
        respOpenedDate: child?.respOpenedDate
          ? format(new Date(child.respOpenedDate), 'yyyy-MM-dd')
          : null,
        catchUpYearsEnabled: child?.catchUpYearsEnabled || false,
      });
    }
  }, [open, child, reset]);

  const catchUpYearsEnabled = watch('catchUpYearsEnabled');

  const handleFormSubmit = (data: ChildFormData) => {
    onSubmit({
      ...data,
      dateOfBirth: new Date(data.dateOfBirth).toISOString(),
      respOpenedDate: data.respOpenedDate ? new Date(data.respOpenedDate).toISOString() : null,
    });
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
          // Prevent Radix from auto-focusing, let the form handle it naturally
          e.preventDefault();
          // Focus the first input after a small delay
          setTimeout(() => {
            const firstInput = document.getElementById('child-name');
            firstInput?.focus();
          }, 0);
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Child' : 'Add Child'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your child's information."
              : 'Add a new child as an RESP beneficiary.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="child-name">Name</Label>
            <Input
              id="child-name"
              tabIndex={1}
              placeholder="Enter child's name"
              {...register('name')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'child-name-error' : undefined}
            />
            {errors.name && (
              <p id="child-name-error" className="text-destructive text-sm" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="child-dateOfBirth">Date of Birth</Label>
            <Input
              id="child-dateOfBirth"
              tabIndex={2}
              type="date"
              {...register('dateOfBirth')}
              aria-invalid={!!errors.dateOfBirth}
              aria-describedby={errors.dateOfBirth ? 'child-dob-error' : undefined}
            />
            {errors.dateOfBirth && (
              <p id="child-dob-error" className="text-destructive text-sm" role="alert">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="child-respOpenedDate">RESP Opened Date (Optional)</Label>
            <Input
              id="child-respOpenedDate"
              tabIndex={3}
              type="date"
              {...register('respOpenedDate')}
              aria-invalid={!!errors.respOpenedDate}
              aria-describedby="child-resp-help"
            />
            {errors.respOpenedDate && (
              <p className="text-destructive text-sm" role="alert">
                {errors.respOpenedDate.message}
              </p>
            )}
            <p id="child-resp-help" className="text-muted-foreground text-xs">
              Leave blank if RESP hasn&apos;t been opened yet.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="child-catchUpYearsEnabled">Enable Catch-Up Years</Label>
              <p className="text-muted-foreground text-xs">
                Claim missed CESG contribution room from previous years.
              </p>
            </div>
            <Switch
              id="child-catchUpYearsEnabled"
              tabIndex={4}
              checked={catchUpYearsEnabled}
              onCheckedChange={(checked) => setValue('catchUpYearsEnabled', checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} tabIndex={5}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} tabIndex={6}>
              {isEditing ? 'Save Changes' : 'Add Child'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
