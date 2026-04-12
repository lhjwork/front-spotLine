"use client";

import { cn } from "@/lib/utils";
import type { PlaceDailyHour } from "@/types";

interface SpotBusinessStatusProps {
  dailyHours: PlaceDailyHour[];
  businessHours: string | null;
}

const DAY_MAP = ["일", "월", "화", "수", "목", "금", "토"];

function parseTimeRange(timeSE: string, now: Date) {
  const match = timeSE.match(/(\d{1,2}):(\d{2})~(\d{1,2}):(\d{2})/);
  if (!match) return { status: "unknown" as const };

  const [, oh, om, ch, cm] = match.map(Number);
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;

  if (currentMin < openMin)
    return { status: "closed" as const, text: `${oh}:${String(om).padStart(2, "0")}에 오픈` };
  if (currentMin >= closeMin)
    return { status: "closed" as const, text: "영업 종료" };
  if (closeMin - currentMin <= 60)
    return { status: "closing" as const, text: `${ch}:${String(cm).padStart(2, "0")}에 마감` };
  return { status: "open" as const, text: `${ch}:${String(cm).padStart(2, "0")}에 마감` };
}

function getBusinessStatus(dailyHours: PlaceDailyHour[], businessHours: string | null) {
  const now = new Date();
  const todayName = DAY_MAP[now.getDay()];
  const todayHour = dailyHours.find((h) => h.day.includes(todayName));

  if (!todayHour?.timeSE) {
    if (!businessHours) return { status: "unknown" as const };
    return parseTimeRange(businessHours, now);
  }

  return parseTimeRange(todayHour.timeSE, now);
}

const STATUS_STYLES = {
  open: "bg-green-100 text-green-700",
  closing: "bg-orange-100 text-orange-700",
  closed: "bg-red-100 text-red-700",
} as const;

const STATUS_LABELS = {
  open: "영업 중",
  closing: "곧 마감",
  closed: "영업 종료",
} as const;

export default function SpotBusinessStatus({ dailyHours, businessHours }: SpotBusinessStatusProps) {
  const result = getBusinessStatus(dailyHours, businessHours);

  if (result.status === "unknown") return null;

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[result.status],
      )}
    >
      {STATUS_LABELS[result.status]}
      {"text" in result && result.text && (
        <span className="ml-1 font-normal">&middot; {result.text}</span>
      )}
    </span>
  );
}
