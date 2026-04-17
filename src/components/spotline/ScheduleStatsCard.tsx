"use client";

import { Trophy, CalendarCheck, MapPin } from "lucide-react";
import type { MySpotLine } from "@/types";

export interface ScheduleStatsCardProps {
  spotLines: MySpotLine[];
}

export default function ScheduleStatsCard({ spotLines }: ScheduleStatsCardProps) {
  const completed = spotLines.filter((s) => s.status === "completed");
  const totalCompleted = completed.length;

  const now = new Date();
  const thisMonthCompleted = completed.filter((s) => {
    if (!s.completedAt) return false;
    const d = new Date(s.completedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const averageSpots =
    totalCompleted > 0
      ? Math.round(completed.reduce((sum, s) => sum + s.spotsCount, 0) / totalCompleted * 10) / 10
      : 0;

  const stats = [
    { icon: Trophy, label: "총 완주", value: totalCompleted, color: "text-purple-600 bg-purple-50" },
    { icon: CalendarCheck, label: "이번 달", value: thisMonthCompleted, color: "text-green-600 bg-green-50" },
    { icon: MapPin, label: "평균 Spot", value: averageSpots, color: "text-blue-600 bg-blue-50" },
  ];

  return (
    <div className="flex gap-3">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div
          key={label}
          className="flex flex-1 items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
