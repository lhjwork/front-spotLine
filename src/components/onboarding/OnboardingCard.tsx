"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
  bgColor: string;
}

export interface OnboardingCardProps {
  step: OnboardingStep;
  isLastStep: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}

export default function OnboardingCard({
  step,
  isLastStep,
  onPrimaryAction,
  onSecondaryAction,
}: OnboardingCardProps) {
  return (
    <div className="flex w-full shrink-0 flex-col items-center px-6">
      <div
        className={cn(
          "flex h-24 w-24 items-center justify-center rounded-2xl",
          step.bgColor
        )}
      >
        {step.icon}
      </div>

      <h2 className="mt-8 text-center text-2xl font-bold text-gray-900">
        {step.title}
      </h2>

      <p className="mx-auto mt-4 max-w-xs text-center text-base text-gray-600">
        {step.description}
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        {isLastStep ? (
          <>
            <button
              type="button"
              onClick={onPrimaryAction}
              className="w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700"
            >
              피드 둘러보기
            </button>
            {onSecondaryAction && (
              <button
                type="button"
                onClick={onSecondaryAction}
                className="w-full rounded-xl border border-gray-300 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                데모 체험하기
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700"
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
}
