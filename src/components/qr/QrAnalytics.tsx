"use client";

import { useEffect, useRef } from "react";
import { logPageEnter, recordQrScan, generateSessionId } from "@/lib/api";

interface QrAnalyticsProps {
  spotId: string;
  qrId: string;
}

export default function QrAnalytics({ spotId, qrId }: QrAnalyticsProps) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;

    // 기존 레거시 페이지 진입 이벤트 (fire-and-forget)
    logPageEnter(spotId, qrId);

    // v2 스캔 기록 (파트너 QR 분석용, fire-and-forget)
    const sessionId = generateSessionId();
    recordQrScan(qrId, sessionId);
  }, [spotId, qrId]);

  return null;
}
