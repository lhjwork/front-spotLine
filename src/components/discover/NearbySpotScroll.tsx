"use client";

import { useState, useRef } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { DiscoverSpot } from "@/types";

interface NearbySpotScrollProps {
  spots: DiscoverSpot[];
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

export default function NearbySpotScroll({
  spots,
  className,
}: NearbySpotScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftGradient(el.scrollLeft > 0);
    setShowRightGradient(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  if (spots.length === 0) return null;

  return (
    <div className={cn("", className)}>
      <h3 className="mb-3 px-4 text-sm font-semibold text-gray-700">
        근처 다른 Spot
      </h3>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          data-scrollbar="blue"
          className="flex gap-3 overflow-x-auto px-4 pb-2"
        >
          {spots.map((spot) => {
            const imageUrl = spot.mediaItems?.[0]?.url || spot.media?.[0] || null;
            const category =
              categoryLabels[spot.category?.toUpperCase()] || spot.category;

            return (
              <button
                key={spot.id}
                onClick={() => (window.location.href = `/spot/${spot.slug}`)}
                className="flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {imageUrl ? (
                  <div className="relative h-24 w-full">
                    <OptimizedImage
                      src={imageUrl}
                      alt={spot.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-full items-center justify-center bg-gray-100">
                    <MapPin className="h-5 w-5 text-gray-300" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-[10px] text-gray-400">{category}</p>
                  <p className="truncate text-xs font-medium text-gray-900">
                    {spot.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        {showLeftGradient && (
          <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white" />
        )}
        {showRightGradient && (
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white" />
        )}
      </div>
    </div>
  );
}
