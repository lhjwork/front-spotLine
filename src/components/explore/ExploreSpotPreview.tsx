"use client";

import Link from "next/link";
import { CustomOverlayMap } from "react-kakao-maps-sdk";

import { useExploreStore } from "@/store/useExploreStore";
import OptimizedImage from "@/components/common/OptimizedImage";
import { CATEGORY_COLORS } from "@/constants/explore";

import type { SpotDetailResponse, SpotCategory } from "@/types";

interface ExploreSpotPreviewProps {
  spot: SpotDetailResponse;
}

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

export default function ExploreSpotPreview({ spot }: ExploreSpotPreviewProps) {
  const setSelectedSpot = useExploreStore((s) => s.setSelectedSpot);
  const thumbnailUrl = spot.media?.[0] || spot.mediaItems?.[0]?.url;

  return (
    <CustomOverlayMap
      position={{ lat: spot.latitude, lng: spot.longitude }}
      yAnchor={1.3}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-3 w-64 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setSelectedSpot(null)}
          className="absolute top-1.5 right-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          aria-label="닫기"
        >
          &times;
        </button>

        <div className="flex gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
            {thumbnailUrl ? (
              <OptimizedImage
                src={thumbnailUrl}
                alt={spot.title}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                📍
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {spot.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              <span
                className="inline-block w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: CATEGORY_COLORS[spot.category] }}
              />
              {CATEGORY_LABELS[spot.category]} · {spot.area}
            </p>
            {spot.crewNote && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                &ldquo;{spot.crewNote}&rdquo;
              </p>
            )}
          </div>
        </div>

        <Link
          href={`/spot/${spot.slug}`}
          className="block mt-2 text-center text-xs font-medium text-blue-600 hover:text-blue-700 py-1.5 bg-blue-50 rounded-lg"
        >
          상세보기 &rarr;
        </Link>
      </div>
    </CustomOverlayMap>
  );
}
