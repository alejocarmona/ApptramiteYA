'use client';

import React from 'react';
import {cn} from '@/lib/utils';
import {Check} from 'lucide-react';

type ProgressIndicatorProps = {
  steps: string[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
};

export default function ProgressIndicator({
  steps,
  currentStep,
  onStepClick,
}: ProgressIndicatorProps) {
  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-between">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = onStepClick && isCompleted;

        return (
          <React.Fragment key={step}>
            <div
              className={cn(
                'flex flex-col items-center text-center',
                isClickable ? 'cursor-pointer' : 'cursor-default'
              )}
              onClick={() => isClickable && onStepClick(index)}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : '',
                  isCompleted
                    ? 'border-accent bg-accent text-accent-foreground'
                    : '',
                  !isActive && !isCompleted ? 'border-border bg-secondary' : '',
                  isClickable && 'hover:border-primary hover:bg-primary/20'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <p
                className={cn(
                  'mt-1- capitalize text-xs transition-colors',
                  isActive
                    ? 'font-bold text-primary-foreground'
                    : 'text-muted-foreground',
                  isClickable && 'group-hover:text-primary-foreground'
                )}
              >
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-1 flex-1 transition-colors duration-300',
                  isCompleted ? 'bg-accent' : 'bg-border'
                )}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
