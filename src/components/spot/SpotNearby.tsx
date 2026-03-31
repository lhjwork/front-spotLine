"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { SpotDetailResponse } from "@/types";

const categoryLabels: Record<string, string> = {
  CAFE: "카페", cafe: "카페",
  RESTAURANT: "맛집", restaurant: "맛집",
  BAR: "바", bar: "바",
  NATURE: "자연", nature: "자연",
  CULTURE: "문화", culture: "문화",
  EXHIBITION: "전시", exhibition: "전시",
  WALK: "산책", walk: "산책",
  ACTIVITY: "액티비티", activity: "액티비티",
  SHOPPING: "쇼핑", shopping: "쇼핑",
  OTHER: "기타", other: "기타",
};

interface SpotNearbyProps {
  spots: SpotDetailResponse[];
}

export default function SpotNearby({ spots }: SpotNearbyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftGradient(el.scrollLeft > 0);
    setShowRightGradient(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  return (
    <section className="mt-6 mb-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">근처 Spot</h2>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        >
          {spots.map((spot) => {
            const imageUrl = spot.placeInfo?.photos?.[0] || spot.media?.[0];
            const categoryLabel = categoryLabels[spot.category] || spot.category;

            return (
              <Link
                key={spot.id}
                href={`/spot/${spot.slug}`}
                className="w-36 shrink-0"
              >
                <div className="relative h-24 w-full overflow-hidden rounded-xl bg-gray-100">
                  {imageUrl ? (
                    <OptimizedImage
                      src={imageUrl}
                      alt={spot.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <MapPin className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="mt-1.5">
                  <p className="truncate text-xs text-gray-500">{categoryLabel}</p>
                  <p className="truncate text-sm font-medium text-gray-900">
                    {spot.title}
                  </p>
                  {spot.placeInfo?.rating && (
                    <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {spot.placeInfo.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        {showLeftGradient && (
          <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-gray-50" />
        )}
        {showRightGradient && (
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-gray-50" />
        )}
      </div>
    </section>
  );
}
