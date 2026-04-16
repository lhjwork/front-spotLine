"use client";

import { useState, useCallback } from "react";
import { QrCode, Smartphone, MapPin, Sparkles, Route } from "lucide-react";
import { completeOnboarding } from "@/lib/onboarding";
import OnboardingCard from "./OnboardingCard";
import OnboardingDots from "./OnboardingDots";
import type { OnboardingStep } from "./OnboardingCard";

const SWIPE_THRESHOLD = 50;

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 0,
    title: "다음 장소, Spotline이 추천해요",
    description: "지금 있는 장소에서 다음에 가기 좋은 곳을 추천받으세요",
    icon: (
      <div className="flex items-center gap-1 text-blue-600">
        <QrCode className="h-8 w-8" />
        <MapPin className="h-8 w-8" />
      </div>
    ),
    bgColor: "bg-blue-50",
  },
  {
    id: 1,
    title: "QR 스캔 한 번이면 끝",
    description:
      "매장의 QR 코드를 스캔하면 근처 추천 장소를 바로 확인할 수 있어요",
    icon: (
      <div className="flex items-center gap-1 text-green-600">
        <Smartphone className="h-8 w-8" />
        <QrCode className="h-6 w-6" />
      </div>
    ),
    bgColor: "bg-green-50",
  },
  {
    id: 2,
    title: "나만의 동선을 만들어보세요",
    description:
      "좋았던 장소들을 연결해 SpotLine을 만들고, 다른 사람의 경험도 따라가보세요",
    icon: (
      <div className="flex items-center gap-1 text-purple-600">
        <MapPin className="h-8 w-8" />
        <Route className="h-8 w-8" />
      </div>
    ),
    bgColor: "bg-purple-50",
  },
  {
    id: 3,
    title: "지금 시작하세요",
    description: "피드에서 인기 SpotLine을 둘러보거나, 데모를 체험해보세요",
    icon: <Sparkles className="h-10 w-10 text-amber-500" />,
    bgColor: "bg-amber-50",
  },
];

export interface OnboardingOverlayProps {
  onComplete: () => void;
}

export default function OnboardingOverlay({
  onComplete,
}: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleClose = useCallback(() => {
    completeOnboarding();
    onComplete();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, handleClose]);

  const handleDemo = useCallback(() => {
    completeOnboarding();
    window.location.href = "/qr/demo_cafe_001";
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const delta = touchStart - e.changedTouches[0].clientX;

      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        if (delta > 0 && currentStep < ONBOARDING_STEPS.length - 1) {
          setCurrentStep((prev) => prev + 1);
        } else if (delta < 0 && currentStep > 0) {
          setCurrentStep((prev) => prev - 1);
        }
      }
      setTouchStart(null);
    },
    [touchStart, currentStep]
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={handleClose}
          aria-label="닫기"
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        {!isLastStep && (
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
          >
            건너뛰기
          </button>
        )}
      </div>

      {/* Card Area with Swipe */}
      <div
        className="flex flex-1 items-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex w-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentStep * 100}%)` }}
        >
          {ONBOARDING_STEPS.map((step) => (
            <OnboardingCard
              key={step.id}
              step={step}
              isLastStep={step.id === ONBOARDING_STEPS.length - 1}
              onPrimaryAction={
                step.id === ONBOARDING_STEPS.length - 1
                  ? handleClose
                  : handleNext
              }
              onSecondaryAction={
                step.id === ONBOARDING_STEPS.length - 1
                  ? handleDemo
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="pb-8 pt-4">
        <OnboardingDots
          totalSteps={ONBOARDING_STEPS.length}
          currentStep={currentStep}
          onDotClick={setCurrentStep}
        />
      </div>
    </div>
  );
}
