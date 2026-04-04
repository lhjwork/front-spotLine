"use client";

import Link from "next/link";
import { Check, Trash2, ExternalLink, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MySpotLine } from "@/types";

interface MySpotLineCardProps {
  mySpotLine: MySpotLine;
  onMarkComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const getDday = (scheduledDate: string | null): string => {
  if (!scheduledDate) return "미정";
  const diff = Math.ceil(
    (new Date(scheduledDate).getTime() - new Date().setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "D-Day";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
};

const getDdayColor = (scheduledDate: string | null): string => {
  if (!scheduledDate) return "text-gray-400";
  const diff = Math.ceil(
    (new Date(scheduledDate).getTime() - new Date().setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );
  if (diff <= 0) return "text-red-600";
  if (diff <= 3) return "text-orange-500";
  return "text-green-600";
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const day = days[date.getDay()];
  return `${y}.${m}.${d} (${day})`;
};

export default function MySpotLineCard({
  mySpotLine,
  onMarkComplete,
  onDelete,
}: MySpotLineCardProps) {
  const isCompleted = mySpotLine.status === "completed";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* Title row */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{mySpotLine.title}</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            {mySpotLine.area} · {mySpotLine.spotsCount}곳
          </p>
        </div>
        {!isCompleted && (
          <span
            className={cn(
              "ml-2 text-sm font-bold",
              getDdayColor(mySpotLine.scheduledDate)
            )}
          >
            {getDday(mySpotLine.scheduledDate)}
          </span>
        )}
      </div>

      {/* Date */}
      <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
        <Calendar className="h-3.5 w-3.5" />
        {isCompleted && mySpotLine.completedAt
          ? `완주: ${formatDate(mySpotLine.completedAt.split("T")[0])}`
          : mySpotLine.scheduledDate
            ? formatDate(mySpotLine.scheduledDate)
            : "날짜 미정"}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        {!isCompleted && (
          <button
            onClick={() => onMarkComplete(mySpotLine.id)}
            className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
          >
            <Check className="h-3.5 w-3.5" />
            완주
          </button>
        )}

        <button
          onClick={() => onDelete(mySpotLine.id)}
          className="flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
          삭제
        </button>

        <Link
          href={`/spotline/${mySpotLine.spotLineSlug}`}
          className="ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-50"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          원본 보기
        </Link>
      </div>
    </div>
  );
}
