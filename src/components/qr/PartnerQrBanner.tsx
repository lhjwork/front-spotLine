"use client";

import { Gift, MapPin, ChevronRight } from "lucide-react";
import { recordPartnerEvent, generateSessionId } from "@/lib/api";
import type { SpotPartnerInfo } from "@/types";

interface PartnerQrBannerProps {
  storeName: string;
  partner: SpotPartnerInfo;
  onBenefitClick: () => void;
}

export default function PartnerQrBanner({ storeName, partner, onBenefitClick }: PartnerQrBannerProps) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: partner.brandColor + "40",
        backgroundColor: partner.brandColor + "0A",
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Gift className="h-5 w-5" style={{ color: partner.brandColor }} />
        <span className="text-sm font-bold text-gray-900">
          {storeName} 방문 혜택
        </span>
      </div>

      <p className="mb-3 text-sm text-gray-700">{partner.benefitText}</p>

      <button
        onClick={onBenefitClick}
        className="mb-3 flex w-full items-center justify-center gap-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: partner.brandColor }}
      >
        혜택 받기
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <MapPin className="h-3 w-3" />
        <span>QR 스캔으로 방문 확인 완료</span>
      </div>
    </div>
  );
}

// 서버 컴포넌트(page.tsx)에서 사용하기 위한 클라이언트 래퍼
interface PartnerQrBannerWrapperProps {
  storeName: string;
  partner: SpotPartnerInfo;
  spotId: string;
  qrId: string;
}

export function PartnerQrBannerWrapper({ storeName, partner, qrId }: PartnerQrBannerWrapperProps) {
  const handleBenefitClick = () => {
    const sessionId = generateSessionId();
    recordPartnerEvent(qrId, "benefit_click", sessionId);

    const el = document.getElementById("partner-benefit");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <PartnerQrBanner
      storeName={storeName}
      partner={partner}
      onBenefitClick={handleBenefitClick}
    />
  );
}
