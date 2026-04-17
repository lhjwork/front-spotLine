"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";

import { useExploreStore } from "@/store/useExploreStore";
import OptimizedImage from "@/components/common/OptimizedImage";
import { CATEGORY_COLORS } from "@/constants/explore";
import { cn } from "@/lib/utils";

import type { SpotDetailResponse, SpotCategory } from "@/types";

const CATEGORY_LABELS: Record<SpotCategory, string> = {
  CAFE: "카페",
  RESTAURANT: "맛집",
  BAR: "바",
  NATURE: "자연",
  CULTURE: "문화",
  EXHIBITION: "전시",
  WALK: "산책",
  ACTIVITY: "액티비티",
  SHOPPING: "쇼핑",
  OTHER: "기타",
};

function SpotCard({ spot, onSelect }: { spot: SpotDetailResponse; onSelect: (spot: SpotDetailResponse) => void }) {
  const thumbnailUrl = spot.media?.[0] || spot.mediaItems?.[0]?.url;

  return (
    <div
      className="shrink-0 w-48 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect(spot)}
    >
      <div className="w-full h-24 bg-gray-100">
        {thumbnailUrl ? (
          <OptimizedImage
            src={thumbnailUrl}
            alt={spot.title}
            width={192}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
            📍
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h4 className="font-semibold text-sm text-gray-900 truncate">{spot.title}</h4>
        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[spot.category] }}
          />
          {CATEGORY_LABELS[spot.category]} · {spot.area}
        </p>
      </div>
    </div>
  );
}

export default function ExploreBottomPanel() {
  const spots = useExploreStore((s) => s.spots);
  const isLoading = useExploreStore((s) => s.isLoading);
  const isPanelExpanded = useExploreStore((s) => s.isPanelExpanded);
  const setIsPanelExpanded = useExploreStore((s) => s.setIsPanelExpanded);
  const setSelectedSpot = useExploreStore((s) => s.setSelectedSpot);
  const setCenter = useExploreStore((s) => s.setCenter);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSpotSelect = useCallback(
    (spot: SpotDetailResponse) => {
      setSelectedSpot(spot);
      setCenter({ lat: spot.latitude, lng: spot.longitude });
    },
    [setSelectedSpot, setCenter]
  );

  const togglePanel = useCallback(() => {
    setIsPanelExpanded(!isPanelExpanded);
  }, [isPanelExpanded, setIsPanelExpanded]);

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-lg transition-all duration-300",
        isPanelExpanded ? "h-[60vh]" : "h-[120px]"
      )}
    >
      {/* Drag handle */}
      <button
        onClick={togglePanel}
        className="w-full flex justify-center pt-2 pb-1 cursor-pointer"
        aria-label={isPanelExpanded ? "패널 축소" : "패널 확장"}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </button>

      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : spots.length === 0 ? (
        <div className="flex items-center justify-center h-20 text-sm text-gray-400">
          이 지역에 등록된 Spot이 없습니다
        </div>
      ) : isPanelExpanded ? (
        <div className="overflow-y-auto h-[calc(100%-28px)] px-4 pb-4">
          <p className="text-xs text-gray-500 mb-2">{spots.length}개 Spot</p>
          <div className="grid grid-cols-2 gap-3">
            {spots.map((spot) => (
              <Link key={spot.id} href={`/spot/${spot.slug}`} className="block">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-full h-24 bg-gray-100">
                    {(spot.media?.[0] || spot.mediaItems?.[0]?.url) ? (
                      <OptimizedImage
                        src={spot.media?.[0] || spot.mediaItems?.[0]?.url || ""}
                        alt={spot.title}
                        width={192}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📍</div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">{spot.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[spot.category] }} />
                      {CATEGORY_LABELS[spot.category]} · {spot.area}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide px-4 pb-3">
          <div className="flex gap-3">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} onSelect={handleSpotSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
