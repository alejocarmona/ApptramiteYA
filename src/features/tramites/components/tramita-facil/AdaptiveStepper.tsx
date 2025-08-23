'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type StepperMode = 'FULL' | 'ABBR' | 'ICONS';

type StepProps = {
  stepNumber: number;
  label: string;
  abbr: string;
  current: number;
  mode: StepperMode;
};

const stepsConfig = [
  { label: 'Selecciona tu trámite', abbr: 'Trámite' },
  { label: 'Ingresa tu información', abbr: 'Info' },
  { label: 'Paga seguro', abbr: 'Pago' },
  { label: 'Documento listo', abbr: 'Listo' },
];

const Step = ({ stepNumber, label, abbr, current, mode }: StepProps) => {
  const isActive = stepNumber === current;
  const isCompleted = stepNumber < current;

  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ flexBasis: '25%', flexShrink: 0 }}
      aria-current={isActive ? 'step' : undefined}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
          isActive && 'border-primary bg-primary text-primary-foreground',
          isCompleted && 'border-green-600 bg-green-600 text-white',
          !isActive && !isCompleted && 'border-border bg-muted text-muted-foreground'
        )}
        aria-label={label}
      >
        {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
      </div>
      {mode !== 'ICONS' && (
        <p
          className={cn(
            'mt-1 w-full min-w-0 break-words font-medium leading-tight transition-colors',
            mode === 'FULL' ? 'text-xs' : 'text-[0.65rem]',
            isActive ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {mode === 'FULL' ? label : abbr}
        </p>
      )}
    </div>
  );
};

const StepperConnector = ({ isCompleted }: { isCompleted: boolean }) => (
  <div
    className={cn(
      'mt-[-1.25rem] h-px w-full flex-1 transition-colors duration-300',
      isCompleted ? 'bg-green-600' : 'bg-border'
    )}
  />
);

type AdaptiveStepperProps = {
  current: 1 | 2 | 3 | 4;
};

export default function AdaptiveStepper({ current }: AdaptiveStepperProps) {
  const [mode, setMode] = useState<StepperMode>('FULL');
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const { width } = entry.contentRect;
        if (width < 320) {
          setMode('ICONS');
        } else if (width < 360) {
          setMode('ABBR');
        } else {
          setMode('FULL');
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={4}
      className="flex w-full flex-nowrap items-start justify-between px-2 py-3"
    >
      {stepsConfig.map((step, index) => (
        <React.Fragment key={step.abbr}>
          <Step
            stepNumber={index + 1}
            label={step.label}
            abbr={step.abbr}
            current={current}
            mode={mode}
          />
          {index < stepsConfig.length - 1 && (
            <StepperConnector isCompleted={index + 1 < current} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
