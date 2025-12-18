'use client';

import { TrendingUp, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ContributionStrategy = 'optimize' | 'steady' | 'frontload';

interface StrategyStepProps {
  strategy: ContributionStrategy;
  onStrategyChange: (strategy: ContributionStrategy) => void;
  onNext: () => void;
  onBack: () => void;
}

const STRATEGIES = [
  {
    id: 'optimize' as const,
    title: 'Optimize for Growth',
    description:
      'Contribute early to maximize compound growth while claiming all available grants.',
    icon: TrendingUp,
    features: [
      'Maximizes CESG by contributing $2,500/year per child',
      'Uses catch-up contributions when available',
      'Front-loads when possible for more growth time',
    ],
    recommended: true,
  },
  {
    id: 'steady' as const,
    title: 'Steady Contributions',
    description: 'Spread contributions evenly over the years for predictable budgeting.',
    icon: Clock,
    features: [
      'Equal annual contributions',
      'Easier to budget for',
      'Still captures government grants',
    ],
    recommended: false,
  },
  {
    id: 'frontload' as const,
    title: 'Aggressive Frontload',
    description: 'Contribute as much as possible early for maximum compound growth.',
    icon: Zap,
    features: [
      'Maximizes time in market',
      'Best for those with available capital',
      'May exceed CESG-eligible amounts',
    ],
    recommended: false,
  },
];

export function StrategyStep({ strategy, onStrategyChange, onNext, onBack }: StrategyStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Choose Your Strategy</h2>
        <p className="text-muted-foreground">
          Select how you want to approach your RESP contributions.
        </p>
      </div>

      <div className="grid gap-4">
        {STRATEGIES.map((item) => {
          const Icon = item.icon;
          const isSelected = strategy === item.id;

          return (
            <Card
              key={item.id}
              className={cn(
                'hover:border-primary/50 cursor-pointer transition-all',
                isSelected && 'border-primary ring-primary ring-2 ring-offset-2'
              )}
              onClick={() => onStrategyChange(item.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {item.title}
                        {item.recommended && (
                          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                            Recommended
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">{item.description}</CardDescription>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="text-primary h-6 w-6 shrink-0" />}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {item.features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                      <div className="bg-muted-foreground h-1.5 w-1.5 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
