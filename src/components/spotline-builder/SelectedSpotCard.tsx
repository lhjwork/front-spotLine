"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance, formatWalkingTime } from "@/lib/utils";
import { useSpotLineBuilderStore } from "@/store/useSpotLineBuilderStore";
import SpotPhotoUpload from "./SpotPhotoUpload";
import type { SpotLineBuilderSpot, SpotMediaItem } from "@/types";

interface SelectedSpotCardProps {
  builderSpot: SpotLineBuilderSpot;
  index: number;
  isLast: boolean;
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

export default function SelectedSpotCard({
  builderSpot,
  index,
  isLast,
}: SelectedSpotCardProps) {
  const removeSpot = useSpotLineBuilderStore((s) => s.removeSpot);
  const updateSpotMeta = useSpotLineBuilderStore((s) => s.updateSpotMeta);
  const [mediaItems, setMediaItems] = useState<SpotMediaItem[]>(
    builderSpot.spot.mediaItems || []
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: builderSpot.spot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { spot } = builderSpot;

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "rounded-xl border bg-white p-3 transition-shadow",
          isDragging
            ? "border-purple-300 shadow-lg ring-2 ring-purple-200 z-10"
            : "border-gray-100"
        )}
      >
        <div className="flex items-start gap-2">
          {/* DnD Handle */}
          <button
            type="button"
            className="mt-1 shrink-0 cursor-grab touch-none text-gray-300 hover:text-gray-500 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Spot Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                {index + 1}
              </span>
              <p className="truncate text-sm font-medium text-gray-900">
                {spot.title}
              </p>
            </div>
            <p className="ml-7 mt-0.5 text-xs text-gray-500">
              {spot.area} · {categoryLabels[spot.category] || spot.category}
            </p>

            {/* Meta inputs */}
            <div className="ml-7 mt-2 flex flex-wrap gap-2">
              <label className="flex items-center gap-1 text-xs text-gray-500">
                <span>체류</span>
                <input
                  type="number"
                  min={0}
                  max={480}
                  value={builderSpot.stayDuration ?? ""}
                  onChange={(e) =>
                    updateSpotMeta(spot.id, {
                      stayDuration: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  placeholder="60"
                  className="w-14 rounded border border-gray-200 px-1.5 py-0.5 text-xs outline-none focus:border-purple-400"
                />
                <span>분</span>
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-500">
                <span>방문</span>
                <input
                  type="time"
                  value={builderSpot.suggestedTime ?? ""}
                  onChange={(e) =>
                    updateSpotMeta(spot.id, {
                      suggestedTime: e.target.value || null,
                    })
                  }
                  className="rounded border border-gray-200 px-1.5 py-0.5 text-xs outline-none focus:border-purple-400"
                />
              </label>
            </div>

            {/* Photo Upload */}
            <SpotPhotoUpload
              spotId={spot.id}
              mediaItems={mediaItems}
              onMediaUpdate={setMediaItems}
            />
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeSpot(spot.id)}
            className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Distance indicator */}
      {!isLast && builderSpot.distanceToNext != null && (
        <div className="my-1 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <span className="h-px w-4 bg-gray-200" />
          <span>
            {formatWalkingTime(builderSpot.walkingTimeToNext ?? undefined)} ·{" "}
            {formatDistance(builderSpot.distanceToNext)}
          </span>
          <span className="h-px w-4 bg-gray-200" />
        </div>
      )}
    </div>
  );
}
