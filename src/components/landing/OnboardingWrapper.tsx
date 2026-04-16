"use client";

import { useState } from "react";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import { isFirstVisit } from "@/lib/onboarding";

function useIsFirstVisit() {
  const [show] = useState(() => {
    if (typeof window === "undefined") return false;
    return isFirstVisit();
  });
  return show;
}

export default function OnboardingWrapper() {
  const isFirst = useIsFirstVisit();
  const [dismissed, setDismissed] = useState(false);

  if (!isFirst || dismissed) return null;

  return <OnboardingOverlay onComplete={() => setDismissed(true)} />;
}
