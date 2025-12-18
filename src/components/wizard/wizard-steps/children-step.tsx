'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { childSchema, type ChildFormData } from '@/lib/validators';
import { useChildrenStore } from '@/stores/children-store';
import type { Child } from '@/types';

interface ChildrenStepProps {
  onNext: () => void;
}

export function ChildrenStep({ onNext }: ChildrenStepProps) {
  const { children, addChild, updateChild, removeChild } = useChildrenStore();
  const [showForm, setShowForm] = useState(children.length === 0);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      name: '',
      dateOfBirth: '',
      respOpenedDate: null,
      catchUpYearsEnabled: false,
    },
  });

  const catchUpYearsEnabled = watch('catchUpYearsEnabled');

  const handleFormSubmit = (data: ChildFormData) => {
    const childData = {
      name: data.name,
      dateOfBirth: new Date(data.dateOfBirth).toISOString(),
      respOpenedDate: data.respOpenedDate ? new Date(data.respOpenedDate).toISOString() : null,
      catchUpYearsEnabled: data.catchUpYearsEnabled,
    };

    if (editingChild) {
      updateChild(editingChild.id, childData);
    } else {
      addChild(childData);
    }

    reset();
    setShowForm(false);
    setEditingChild(null);
  };

  const handleEdit = (child: Child) => {
    setEditingChild(child);
    reset({
      name: child.name,
      dateOfBirth: format(new Date(child.dateOfBirth), 'yyyy-MM-dd'),
      respOpenedDate: child.respOpenedDate
        ? format(new Date(child.respOpenedDate), 'yyyy-MM-dd')
        : null,
      catchUpYearsEnabled: child.catchUpYearsEnabled,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setEditingChild(null);
  };

  const handleDelete = (childId: string) => {
    removeChild(childId);
    if (children.length === 1) {
      setShowForm(true);
    }
  };

  const canProceed = children.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Add Your Children</h2>
        <p className="text-muted-foreground">Add the children who will be RESP beneficiaries.</p>
      </div>

      {/* Existing Children */}
      {children.length > 0 && (
        <div className="space-y-3">
          {children.map((child) => (
            <Card key={child.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                    <Users className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{child.name}</p>
                    <p className="text-muted-foreground text-sm">
                      Born {format(new Date(child.dateOfBirth), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(child)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(child.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingChild ? 'Edit Child' : 'Add Child'}</CardTitle>
            <CardDescription>Enter your child&apos;s information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wizard-child-name">Name</Label>
                <Input
                  id="wizard-child-name"
                  placeholder="Enter child's name"
                  {...register('name')}
                />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="wizard-child-dob">Date of Birth</Label>
                <Input id="wizard-child-dob" type="date" {...register('dateOfBirth')} />
                {errors.dateOfBirth && (
                  <p className="text-destructive text-sm">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="wizard-child-resp">RESP Opened Date (Optional)</Label>
                <Input id="wizard-child-resp" type="date" {...register('respOpenedDate')} />
                <p className="text-muted-foreground text-xs">
                  Leave blank if RESP hasn&apos;t been opened yet.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="wizard-catchup">Enable Catch-Up Years</Label>
                  <p className="text-muted-foreground text-xs">
                    Claim missed CESG room from previous years.
                  </p>
                </div>
                <Switch
                  id="wizard-catchup"
                  checked={catchUpYearsEnabled}
                  onCheckedChange={(checked) => setValue('catchUpYearsEnabled', checked)}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingChild ? 'Save Changes' : 'Add Child'}</Button>
                {(children.length > 0 || editingChild) && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Another Child
        </Button>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!canProceed}>
          Continue
        </Button>
      </div>
    </div>
  );
}
