import { Zap } from "lucide-react";
import type { SpotPartnerInfo } from "@/types";

interface PartnerBadgeProps {
  partner: SpotPartnerInfo;
  size?: "sm" | "md";
}

export default function PartnerBadge({ partner, size = "md" }: PartnerBadgeProps) {
  const sizeClasses = size === "sm"
    ? "gap-0.5 px-2 py-0.5 text-[10px]"
    : "gap-1 px-2.5 py-0.5 text-xs";

  const iconSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";

  return (
    <span
      className={`inline-flex items-center ${sizeClasses} rounded-full font-semibold text-white shadow-sm`}
      style={{ backgroundColor: partner.brandColor }}
    >
      <Zap className={iconSize} />
      파트너
    </span>
  );
}
