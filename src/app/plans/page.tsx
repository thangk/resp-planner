'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { PlanList } from '@/components/plans/plan-list';
import { useMounted } from '@/hooks/use-mounted';

export default function PlansPage() {
  const mounted = useMounted();

  if (!mounted) {
    return <PlansSkeleton />;
  }

  return <PlanList />;
}

function PlansSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-24" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
