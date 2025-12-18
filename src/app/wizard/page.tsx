'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickStartWizard } from '@/components/wizard/quick-start-wizard';

export default function WizardPage() {
  return (
    <div className="min-h-screen">
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <X className="mr-2 h-4 w-4" />
            Skip Wizard
          </Link>
        </Button>
      </div>

      {/* Wizard */}
      <div className="px-4 pb-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to RESP Planner</h1>
          <p className="text-muted-foreground mt-2">
            Let&apos;s set up your RESP plan in a few simple steps.
          </p>
        </div>
        <QuickStartWizard />
      </div>
    </div>
  );
}
