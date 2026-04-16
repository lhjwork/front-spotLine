"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import DiscoverPage from "@/components/discover/DiscoverPage";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import { isFirstVisit } from "@/lib/onboarding";

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isFirstVisit()) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <Layout showFooter>
      <DiscoverPage />
      {showOnboarding && (
        <OnboardingOverlay onComplete={() => setShowOnboarding(false)} />
      )}
    </Layout>
  );
}
