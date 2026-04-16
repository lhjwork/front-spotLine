"use client";

import { useState } from "react";
import Layout from "@/components/layout/Layout";
import DiscoverPage from "@/components/discover/DiscoverPage";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import { isFirstVisit } from "@/lib/onboarding";

function useIsFirstVisit() {
  const [show] = useState(() => {
    if (typeof window === "undefined") return false;
    return isFirstVisit();
  });
  return show;
}

export default function DiscoverPageRoute() {
  const isFirst = useIsFirstVisit();
  const [dismissed, setDismissed] = useState(false);

  return (
    <Layout showFooter>
      <DiscoverPage />
      {isFirst && !dismissed && (
        <OnboardingOverlay onComplete={() => setDismissed(true)} />
      )}
    </Layout>
  );
}
