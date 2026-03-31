"use client";

import { useState } from "react";
import { MapPin, Star, ExternalLink, Navigation2, ChevronDown, ChevronUp, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import MediaCarousel from "@/components/common/MediaCarousel";
import ExternalMapButtons from "@/components/map/ExternalMapButtons";
import type { DiscoverSpot, DiscoverPlaceInfo } from "@/types";

interface SpotBlockProps {
  spot: DiscoverSpot;
  placeInfo: DiscoverPlaceInfo | null;
  variant: "current" | "next";
  distanceLabel: string;
  className?: string;
}

const categoryLabels: Record<string, string> = {
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

export default function SpotBlock({
  spot,
  placeInfo,
  variant,
  distanceLabel,
  className,
}: SpotBlockProps) {
  const [showMap, setShowMap] = useState(false);
  const isCurrent = variant === "current";
  const label = isCurrent ? "지금 여기" : "다음은 여기";
  const imageUrl =
    placeInfo?.photos?.[0] || spot.media?.[0] || null;
  const categoryLabel =
    categoryLabels[spot.category?.toUpperCase()] || spot.category;
  const rating = placeInfo?.rating;

  const handleDetailClick = () => {
    window.location.href = `/spot/${spot.slug}`;
  };

  return (
    <div
      className={cn(
        "animate-[fadeInUp_0.4s_ease-out] rounded-2xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md",
        isCurrent ? "border-blue-100" : "border-green-100",
        className
      )}
    >
      {/* Label badge */}
      <div className="px-4 pt-4 pb-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
            isCurrent
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          )}
        >
          {label}
        </span>
      </div>

      {/* Media */}
      {spot.mediaItems && spot.mediaItems.length > 0 ? (
        <div className="px-4">
          <div className="relative h-48 w-full overflow-hidden rounded-xl">
            <MediaCarousel items={spot.mediaItems} alt={spot.title} />
          </div>
        </div>
      ) : imageUrl ? (
        <div className="px-4">
          <div className="relative h-48 w-full overflow-hidden rounded-xl">
            <OptimizedImage
              src={imageUrl}
              alt={spot.title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      ) : (
        <div className="mx-4 flex h-48 items-center justify-center rounded-xl bg-gray-100">
          <MapPin className="h-8 w-8 text-gray-300" />
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs text-gray-500">{categoryLabel}</span>
          {rating && (
            <span className="flex items-center gap-0.5 text-xs text-yellow-600">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <h3 className="mb-1 text-lg font-bold text-gray-900">{spot.title}</h3>

        {spot.crewNote && (
          <p className="mb-2 text-sm text-gray-600 leading-relaxed">
            {spot.crewNote}
          </p>
        )}

        <div className="mb-3 flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="h-3 w-3" />
          <span>{distanceLabel}</span>
          {placeInfo?.businessHours && (
            <>
              <span className="mx-1">·</span>
              <span>{placeInfo.businessHours}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDetailClick}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-colors",
              isCurrent
                ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
            )}
          >
            자세히 보기
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center justify-center gap-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <Navigation2 className="h-4 w-4" />
            {showMap ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* External Map Buttons (expandable) */}
        {showMap && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <ExternalMapButtons
              storeName={spot.title}
              address={spot.address}
              lat={spot.latitude}
              lng={spot.longitude}
            />
          </div>
        )}
      </div>
    </div>
  );
}
