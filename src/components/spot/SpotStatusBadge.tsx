"use client";

import { cn } from "@/lib/utils";
import type { SpotStatus } from "@/types";

interface SpotStatusBadgeProps {
  status: SpotStatus | string | null;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "검토 중",
    className: "bg-amber-100 text-amber-700",
  },
  APPROVED: {
    label: "승인됨",
    className: "bg-emerald-100 text-emerald-700",
  },
  REJECTED: {
    label: "반려됨",
    className: "bg-red-100 text-red-700",
  },
};

export default function SpotStatusBadge({ status, className }: SpotStatusBadgeProps) {
  if (!status) return null;

  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
