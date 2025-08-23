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
      className="overflow-x-auto no-scrollbar"
    >
      <div className="flex items-start justify-between gap-2 sm:gap-4 px-4 py-3 min-w-max snap-x snap-mandatory">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = onStepClick && isCompleted;

          return (
            <React.Fragment key={step}>
              <div
                className={cn(
                  'flex flex-col items-center text-center snap-start min-w-0 group',
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                )}
                onClick={() => isClickable && onStepClick(index)}
                aria-current={isActive ? 'step' : undefined}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold transition-all duration-300',
                    isActive && 'border-primary bg-primary text-primary-foreground',
                    isCompleted && 'border-green-600 bg-green-600 text-white',
                    !isActive && !isCompleted && 'border-border bg-muted text-muted-foreground',
                    isClickable && 'hover:border-primary hover:bg-primary/20'
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
                </div>
                <p
                  className={cn(
                    'mt-1 w-full min-w-0 break-words whitespace-nowrap text-xs sm:text-sm capitalize transition-colors',
                    isActive ? 'font-bold text-primary' : 'text-muted-foreground',
                    isClickable && 'group-hover:text-primary'
                  )}
                >
                  {step}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mt-3.5 h-px w-6 sm:w-8 transition-colors duration-300',
                    isCompleted ? 'bg-green-600' : 'bg-border'
                  )}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
