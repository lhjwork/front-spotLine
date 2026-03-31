import { Gift } from "lucide-react";
import type { SpotPartnerInfo } from "@/types";

interface PartnerBenefitProps {
  partner: SpotPartnerInfo;
}

function formatPartnerSince(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function PartnerBenefit({ partner }: PartnerBenefitProps) {
  return (
    <section
      className="mt-4 rounded-xl border p-4"
      style={{
        borderColor: partner.brandColor + "30",
        backgroundColor: partner.brandColor + "08",
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Gift className="h-4 w-4" style={{ color: partner.brandColor }} />
        <span className="text-sm font-bold text-gray-900">QR 스캔 고객 혜택</span>
      </div>
      <p className="text-sm text-gray-700">{partner.benefitText}</p>
      <p className="mt-2 text-xs text-gray-400">
        SpotLine 파트너 · since {formatPartnerSince(partner.partnerSince)}
      </p>
    </section>
  );
}
