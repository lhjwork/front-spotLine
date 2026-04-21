"use client";

import { Suspense } from "react";
import { useReferral } from "@/hooks/useReferral";
import { ReferralBanner } from "@/components/common/ReferralBanner";

function ReferralBannerInner() {
  const referral = useReferral();

  if (!referral) return null;

  return <ReferralBanner referrerId={referral.referrerId} />;
}

export default function ReferralBannerWrapper() {
  return (
    <Suspense fallback={null}>
      <ReferralBannerInner />
    </Suspense>
  );
}
