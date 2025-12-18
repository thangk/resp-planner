'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ComparisonView } from '@/components/comparison/comparison-view';
import { usePlansStore } from '@/stores/plans-store';
import { useMounted } from '@/hooks/use-mounted';

export default function ComparePlansPage() {
  const mounted = useMounted();
  const { plans } = usePlansStore();
  const [plan1Id, setPlan1Id] = useState<string | null>(null);
  const [plan2Id, setPlan2Id] = useState<string | null>(null);

  if (!mounted) {
    return <CompareSkeleton />;
  }

  if (plans.length < 2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/plans">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compare Plans</h1>
            <p className="text-muted-foreground">Compare different contribution strategies.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Not Enough Plans
            </CardTitle>
            <CardDescription>You need at least 2 plans to compare.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Create another plan to start comparing strategies.
            </p>
            <Button asChild>
              <Link href="/plans/new">Create New Plan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/plans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compare Plans</h1>
          <p className="text-muted-foreground">
            Compare different contribution strategies side by side.
          </p>
        </div>
      </div>

      <ComparisonView
        plans={plans}
        plan1Id={plan1Id}
        plan2Id={plan2Id}
        onPlan1Change={setPlan1Id}
        onPlan2Change={setPlan2Id}
      />
    </div>
  );
}

function CompareSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
