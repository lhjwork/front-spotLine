"use client";

import { useState } from "react";
import { Clock, Phone, Globe, Star, ChevronDown } from "lucide-react";
import { cn, formatPhoneNumber } from "@/lib/utils";
import type { DiscoverPlaceInfo, PlaceDailyHour } from "@/types";

interface SpotPlaceInfoProps {
  placeInfo: DiscoverPlaceInfo;
}

const DAY_MAP = ["일", "월", "화", "수", "목", "금", "토"];

function DailyHoursAccordion({ dailyHours }: { dailyHours: PlaceDailyHour[] }) {
  const [open, setOpen] = useState(false);
  const todayName = DAY_MAP[new Date().getDay()];
  const todayHour = dailyHours.find((h) => h.day.includes(todayName));

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1 text-sm text-gray-600"
      >
        <span className={cn(todayHour && "font-semibold text-gray-900")}>
          {todayHour ? `${todayHour.day} ${todayHour.timeSE}` : "영업시간 보기"}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-gray-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <ul className="mt-1.5 space-y-0.5">
          {dailyHours.map((h) => {
            const isToday = h.day.includes(todayName);
            return (
              <li
                key={h.day}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  isToday ? "font-semibold text-gray-900" : "text-gray-500",
                )}
              >
                {isToday && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                <span className="w-8">{h.day}</span>
                <span>{h.timeSE}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function SpotPlaceInfo({ placeInfo }: SpotPlaceInfoProps) {
  return (
    <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">매장 정보</h2>

      <div className="space-y-2.5">
        {(placeInfo.dailyHours || placeInfo.businessHours) && (
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="flex-1">
              {placeInfo.dailyHours ? (
                <DailyHoursAccordion dailyHours={placeInfo.dailyHours} />
              ) : (
                <span className="text-sm text-gray-600">{placeInfo.businessHours}</span>
              )}
            </div>
          </div>
        )}

        {placeInfo.phone && (
          <div className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 shrink-0 text-gray-400" />
            <a
              href={`tel:${placeInfo.phone}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {formatPhoneNumber(placeInfo.phone)}
            </a>
          </div>
        )}

        {placeInfo.url && (
          <div className="flex items-center gap-2.5">
            <Globe className="h-4 w-4 shrink-0 text-gray-400" />
            <a
              href={placeInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm text-blue-600 hover:underline"
            >
              {placeInfo.provider === "naver" ? "네이버 플레이스" : "카카오맵"} 보기
            </a>
          </div>
        )}

        {placeInfo.rating && (
          <div className="flex items-center gap-2.5">
            <Star className="h-4 w-4 shrink-0 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-gray-600">
              {placeInfo.rating.toFixed(1)}
              {placeInfo.reviewCount && (
                <span className="text-gray-400"> · 리뷰 {placeInfo.reviewCount.toLocaleString()}개</span>
              )}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
