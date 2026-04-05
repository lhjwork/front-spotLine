"use client";

import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { SpotDetailResponse } from "@/types";

interface SpotSearchCardProps {
  spot: SpotDetailResponse;
  isAdded: boolean;
  onAdd: (spot: SpotDetailResponse) => void;
}

const categoryLabels: Record<string, string> = {
  cafe: "카페",
  restaurant: "음식점",
  bar: "바",
  nature: "자연",
  culture: "문화",
  exhibition: "전시",
  walk: "산책",
  activity: "액티비티",
  shopping: "쇼핑",
  other: "기타",
};

export default function SpotSearchCard({
  spot,
  isAdded,
  onAdd,
}: SpotSearchCardProps) {
  const imageUrl = spot.mediaItems?.[0]?.url || spot.media?.[0] || null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 transition-colors",
        isAdded
          ? "border-purple-200 bg-purple-50/50"
          : "border-gray-100 bg-white hover:bg-gray-50 cursor-pointer"
      )}
      onClick={() => !isAdded && onAdd(spot)}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {imageUrl ? (
          <OptimizedImage
            src={imageUrl}
            alt={spot.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs">
            No img
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {spot.title}
        </p>
        <p className="truncate text-xs text-gray-500">
          {spot.area} · {categoryLabels[spot.category] || spot.category}
        </p>
      </div>

      <button
        type="button"
        disabled={isAdded}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
          isAdded
            ? "bg-purple-100 text-purple-600"
            : "bg-blue-600 text-white hover:bg-blue-700"
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (!isAdded) onAdd(spot);
        }}
      >
        {isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    </div>
  );
}
