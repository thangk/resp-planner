'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { StepIndicator, type WizardStep } from './step-indicator';
import { ChildrenStep } from './wizard-steps/children-step';
import { PortfolioStep } from './wizard-steps/portfolio-step';
import { IncomeStep } from './wizard-steps/income-step';
import { StrategyStep, type ContributionStrategy } from './wizard-steps/strategy-step';
import { ReviewStep } from './wizard-steps/review-step';
import { useChildrenStore } from '@/stores/children-store';
import { usePlansStore } from '@/stores/plans-store';
import { useSettingsStore } from '@/stores/settings-store';

const WIZARD_STEPS: WizardStep[] = [
  { id: 'children', title: 'Children', description: 'Add your children' },
  { id: 'portfolio', title: 'Portfolio', description: 'Set up investments' },
  { id: 'income', title: 'Income', description: 'Enter family income' },
  { id: 'strategy', title: 'Strategy', description: 'Choose approach' },
  { id: 'review', title: 'Review', description: 'Confirm and create' },
];

export function QuickStartWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [strategy, setStrategy] = useState<ContributionStrategy>('optimize');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { children } = useChildrenStore();
  const { addPlan, addPlanChild } = usePlansStore();
  const { setHasCompletedWizard } = useSettingsStore();

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      // Create a default plan based on the wizard settings
      const planId = addPlan({
        name: 'My RESP Plan',
        description: `Created with Quick Start Wizard - ${strategy === 'optimize' ? 'Optimized for growth' : strategy === 'steady' ? 'Steady contributions' : 'Aggressive frontloading'}`,
        childIds: children.map((c) => c.id),
        projectionRate: 'moderate',
        customRate: null,
        inflationAdjusted: false,
        optimizeForGrowth: strategy === 'optimize' || strategy === 'frontload',
      });

      // Add plan-child relationships with frontload year based on strategy
      children.forEach((child) => {
        const frontloadYear = strategy === 'frontload' ? new Date().getFullYear() : null;
        addPlanChild({
          planId,
          childId: child.id,
          frontloadYear,
          catchUpYears: [],
        });
      });

      // Mark wizard as completed
      setHasCompletedWizard(true);

      toast.success('Your RESP plan has been created!');

      // Navigate to the new plan
      router.push(`/plans/${planId}`);
    } catch {
      toast.error('Failed to create plan. Please try again.');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ChildrenStep onNext={handleNext} />;
      case 1:
        return <PortfolioStep onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <IncomeStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return (
          <StrategyStep
            strategy={strategy}
            onStrategyChange={setStrategy}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <ReviewStep
            strategy={strategy}
            onBack={handleBack}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <StepIndicator steps={WIZARD_STEPS} currentStep={currentStep} onStepClick={handleStepClick} />
      <Card>
        <CardContent className="p-6">{renderStep()}</CardContent>
      </Card>
    </div>
  );
}
