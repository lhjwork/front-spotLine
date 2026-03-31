"use client";

import { useEffect, useState } from "react";
import { logPageEnter } from "@/lib/api";

interface QrAnalyticsProps {
  spotId: string;
  qrId: string;
}

export default function QrAnalytics({ spotId, qrId }: QrAnalyticsProps) {
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // 페이지 진입 이벤트 (fire-and-forget)
    logPageEnter(spotId, qrId);

    // 이탈 시 체류 시간 기록
    const handleBeforeUnload = () => {
      const stayDuration = Date.now() - startTime;
      console.log(`QR Spot 체류 시간: ${stayDuration}ms (spotId: ${spotId}, qrId: ${qrId})`);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [spotId, qrId, startTime]);

  return null;
}
