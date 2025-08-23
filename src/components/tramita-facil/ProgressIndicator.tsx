

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type ProgressIndicatorProps = {
  steps: string[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
};

export default function ProgressIndicator({ steps, currentStep, onStepClick }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = onStepClick && isCompleted;

        return (
          <React.Fragment key={step}>
            <div 
              className={cn("flex flex-col items-center text-center", isClickable ? "cursor-pointer" : "cursor-default")}
              onClick={() => isClickable && onStepClick(index)}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isActive ? "bg-primary border-primary text-primary-foreground" : "",
                  isCompleted ? "bg-green-600 border-green-600 text-white" : "",
                  !isActive && !isCompleted ? "bg-secondary border-border" : "",
                  isClickable && "hover:border-primary hover:bg-primary/20"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
              </div>
              <p className={cn(
                "text-xs mt-1 capitalize transition-colors",
                isActive ? "font-bold text-primary-foreground" : "text-muted-foreground",
                isClickable && "group-hover:text-primary-foreground"
              )}>
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-1 mx-2 transition-colors duration-300",
                isCompleted ? "bg-green-600" : "bg-border"
              )}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
