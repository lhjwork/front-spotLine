"use client";

import { useState } from "react";
import { Clock, Phone, Globe, Star, ChevronDown, CircleCheck, CircleMinus } from "lucide-react";
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
  const hasBusinessHours = !!(placeInfo.dailyHours || placeInfo.businessHours);
  const hasRating = !!placeInfo.rating;
  const showSummaryCards = hasBusinessHours || hasRating;

  return (
    <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">매장 정보</h2>

      {showSummaryCards && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {hasBusinessHours && (
            <BusinessStatusCard
              dailyHours={placeInfo.dailyHours}
              businessHours={placeInfo.businessHours}
            />
          )}
          {hasRating && (
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="mb-1 flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold text-gray-900">{placeInfo.rating!.toFixed(1)}</span>
              </div>
              {placeInfo.reviewCount && (
                <p className="text-xs text-gray-500">리뷰 {placeInfo.reviewCount.toLocaleString()}개</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2.5">
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

        {placeInfo.dailyHours && (
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="flex-1">
              <DailyHoursAccordion dailyHours={placeInfo.dailyHours} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function BusinessStatusCard({ dailyHours, businessHours }: { dailyHours?: PlaceDailyHour[] | null; businessHours?: string | null }) {
  const now = new Date();
  const todayName = DAY_MAP[now.getDay()];
  const todayHour = dailyHours?.find((h) => h.day.includes(todayName));
  const timeSE = todayHour?.timeSE || businessHours;

  if (!timeSE) return null;

  const match = timeSE.match(/(\d{1,2}):(\d{2})~(\d{1,2}):(\d{2})/);
  if (!match) {
    return (
      <div className="rounded-xl bg-gray-50 p-3">
        <div className="mb-1 flex items-center gap-1">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">{timeSE}</span>
        </div>
      </div>
    );
  }

  const [, oh, om, ch, cm] = match.map(Number);
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;

  const isOpen = currentMin >= openMin && currentMin < closeMin;
  const isClosingSoon = isOpen && closeMin - currentMin <= 60;

  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="mb-1 flex items-center gap-1.5">
        {isOpen ? (
          <CircleCheck className={cn("h-4 w-4", isClosingSoon ? "text-orange-500" : "text-green-500")} />
        ) : (
          <CircleMinus className="h-4 w-4 text-red-400" />
        )}
        <span className={cn("text-sm font-semibold", isOpen ? (isClosingSoon ? "text-orange-600" : "text-green-600") : "text-red-600")}>
          {isOpen ? (isClosingSoon ? "곧 마감" : "영업 중") : "영업 종료"}
        </span>
      </div>
      <p className="text-xs text-gray-500">
        {isOpen ? `${ch}:${String(cm).padStart(2, "0")} 마감` : `${oh}:${String(om).padStart(2, "0")} 오픈`}
      </p>
    </div>
  );
}
