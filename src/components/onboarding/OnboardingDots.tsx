"use client";

import { cn } from "@/lib/utils";

export interface OnboardingDotsProps {
  totalSteps: number;
  currentStep: number;
  onDotClick: (step: number) => void;
}

export default function OnboardingDots({
  totalSteps,
  currentStep,
  onDotClick,
}: OnboardingDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i + 1}단계로 이동`}
          onClick={() => onDotClick(i)}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i === currentStep
              ? "w-6 bg-blue-600"
              : "w-2 bg-gray-300 hover:bg-gray-400"
          )}
        />
      ))}
    </div>
  );
}
