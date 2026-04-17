"use client";

import { cn } from "@/lib/utils";

interface VariationDiffBadgeProps {
  originalSpotCount: number;
  variationSpotCount: number;
}

export default function VariationDiffBadge({
  originalSpotCount,
  variationSpotCount,
}: VariationDiffBadgeProps) {
  const diff = variationSpotCount - originalSpotCount;

  if (diff > 0) {
    return (
      <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium", "bg-green-50 text-green-600")}>
        +{diff}곳
      </span>
    );
  }

  if (diff < 0) {
    return (
      <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium", "bg-red-50 text-red-600")}>
        {diff}곳
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium", "bg-gray-50 text-gray-500")}>
      동일
    </span>
  );
}
