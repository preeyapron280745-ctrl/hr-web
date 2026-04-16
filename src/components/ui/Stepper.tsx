"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  className?: string;
}

export default function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav className={cn("w-full", className)}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={index}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isCompleted && "bg-blue-600 text-white",
                    isCurrent &&
                      "border-2 border-blue-600 bg-white text-blue-600",
                    !isCompleted &&
                      !isCurrent &&
                      "border-2 border-gray-300 bg-white text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    isCompleted && "text-blue-600",
                    isCurrent && "text-blue-600",
                    !isCompleted && !isCurrent && "text-gray-400"
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 transition-colors",
                    isCompleted ? "bg-blue-600" : "bg-gray-300"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
