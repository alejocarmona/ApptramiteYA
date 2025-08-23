'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

type FlowStepperProps = {
  steps: string[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
};

export default function FlowStepper({
  steps,
  currentStep,
  onStepClick,
}: FlowStepperProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      className="w-full overflow-x-auto no-scrollbar"
    >
      <div className="flex flex-nowrap items-start justify-between gap-1 px-2 py-3 xxs:gap-2 xxs:px-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = onStepClick && isCompleted;

          return (
            <React.Fragment key={step}>
              <div
                className={cn(
                  'group flex flex-col items-center text-center',
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                )}
                onClick={() => isClickable && onStepClick(index)}
                aria-current={isActive ? 'step' : undefined}
                style={{ flexBasis: '25%', flexShrink: 0 }}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 sm:h-8 sm:w-8 sm:text-sm',
                    isActive && 'border-primary bg-primary text-primary-foreground',
                    isCompleted && 'border-green-600 bg-green-600 text-white',
                    !isActive && !isCompleted && 'border-border bg-muted text-muted-foreground',
                    isClickable && 'hover:border-primary hover:bg-primary/20'
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <span>{index + 1}</span>}
                </div>
                <p
                  className={cn(
                    'mt-1 w-full min-w-0 break-words text-[0.65rem] font-medium leading-tight sm:text-xs capitalize transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                    isClickable && 'group-hover:text-primary'
                  )}
                >
                  {step}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mt-3 h-px w-full flex-1 transition-colors duration-300',
                    isCompleted ? 'bg-green-600' : 'bg-border'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
