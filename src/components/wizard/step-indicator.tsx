'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index < currentStep;

          return (
            <li
              key={step.id}
              className={cn('relative', index !== steps.length - 1 && 'flex-1 pr-8 sm:pr-20')}
            >
              {index !== steps.length - 1 && (
                <div
                  className={cn('absolute inset-0 flex items-center', 'top-4 sm:top-5')}
                  aria-hidden="true"
                >
                  <div className={cn('h-0.5 w-full', isCompleted ? 'bg-primary' : 'bg-muted')} />
                </div>
              )}

              <button
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  'group relative flex flex-col items-center',
                  isClickable && 'cursor-pointer'
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium sm:h-10 sm:w-10',
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'border-primary bg-background text-primary border-2'
                        : 'border-muted bg-background text-muted-foreground border-2'
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : index + 1}
                </span>
                <span className="mt-2 hidden sm:block">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isCurrent
                        ? 'text-primary'
                        : isCompleted
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Mobile: Show current step title */}
      <div className="mt-4 text-center sm:hidden">
        <p className="text-primary text-sm font-medium">
          Step {currentStep + 1}: {steps[currentStep]?.title}
        </p>
        <p className="text-muted-foreground text-xs">{steps[currentStep]?.description}</p>
      </div>
    </nav>
  );
}
