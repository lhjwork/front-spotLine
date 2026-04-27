"use client";

import { cn } from "@/lib/utils";
import type { TimeOfDay, WeatherCondition } from "@/types";

const TIME_LABELS: Record<TimeOfDay, string> = {
  DAWN: "새벽",
  MORNING: "오전",
  AFTERNOON: "오후",
  SUNSET: "일몰",
  NIGHT: "밤",
  ANY: "상관없음",
};

const WEATHER_LABELS: Record<WeatherCondition, string> = {
  SUNNY: "맑음",
  CLOUDY: "흐림",
  RAINY: "비",
  SNOWY: "눈",
  ANY: "상관없음",
};

const TIME_ICONS: Record<TimeOfDay, string> = {
  DAWN: "🌅",
  MORNING: "☀️",
  AFTERNOON: "🌤",
  SUNSET: "🌇",
  NIGHT: "🌙",
  ANY: "⏰",
};

const WEATHER_ICONS: Record<WeatherCondition, string> = {
  SUNNY: "☀️",
  CLOUDY: "☁️",
  RAINY: "🌧",
  SNOWY: "❄️",
  ANY: "🌈",
};

interface WeatherBadgeProps {
  timeOfDay?: TimeOfDay | null;
  weather?: WeatherCondition | null;
  isIndoor?: boolean | null;
  className?: string;
}

export default function WeatherBadge({ timeOfDay, weather, isIndoor, className }: WeatherBadgeProps) {
  const badges: { icon: string; label: string }[] = [];

  if (timeOfDay && timeOfDay !== "ANY") {
    badges.push({ icon: TIME_ICONS[timeOfDay], label: TIME_LABELS[timeOfDay] });
  }
  if (weather && weather !== "ANY") {
    badges.push({ icon: WEATHER_ICONS[weather], label: WEATHER_LABELS[weather] });
  }
  if (isIndoor != null) {
    badges.push({ icon: isIndoor ? "🏠" : "🌳", label: isIndoor ? "실내" : "야외" });
  }

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((b) => (
        <span
          key={b.label}
          className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-700"
        >
          <span>{b.icon}</span>
          {b.label}
        </span>
      ))}
    </div>
  );
}
