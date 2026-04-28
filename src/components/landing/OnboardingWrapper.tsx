"use client";

import { useState, useEffect } from "react";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import { isFirstVisit } from "@/lib/onboarding";

export default function OnboardingWrapper() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isFirstVisit()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return <OnboardingOverlay onComplete={() => setShow(false)} />;
}
