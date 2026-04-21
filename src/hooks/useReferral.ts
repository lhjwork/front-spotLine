"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ReferralInfo {
  referrerId: string;
}

export function useReferral() {
  const searchParams = useSearchParams();
  const [referral, setReferral] = useState<ReferralInfo | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;

    localStorage.setItem("spotline_referrer", ref);
    setReferral({ referrerId: ref });

    // 레퍼럴 유입 기록 (fire-and-forget)
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v2/shares/referral-landing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrerId: ref, landingUrl: window.location.pathname }),
    }).catch(() => {});
  }, [searchParams]);

  return referral;
}
