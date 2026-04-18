import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { SpotLineSpotDetail } from "@/types";

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

const themeBadgeColors: Record<string, string> = {
  DATE: "bg-pink-500", TRAVEL: "bg-blue-500", WALK: "bg-green-500",
  HANGOUT: "bg-yellow-500", FOOD_TOUR: "bg-red-500",
  CAFE_TOUR: "bg-amber-500", CULTURE: "bg-purple-500",
};

interface SpotLineTimelineItemProps {
  spot: SpotLineSpotDetail;
  isLast: boolean;
  index: number;
  theme?: string;
}

export default function SpotLineTimelineItem({ spot, isLast, index, theme }: SpotLineTimelineItemProps) {
  const imageUrl = spot.spotMedia?.[0];
  const categoryLabel = categoryLabels[spot.spotCategory] || spot.spotCategory;
  const badgeColor = index === 0
    ? (themeBadgeColors[theme || ""] || "bg-blue-600")
    : "bg-gray-400";

  return (
    <div className="flex gap-3">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
          badgeColor
        )}>
          {spot.order}
        </div>
        {!isLast && (
          <div className="relative flex-1">
            <div className="mx-auto h-full w-0.5 bg-gray-200" />
            {spot.walkingTimeToNext && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-1.5 py-0.5 text-[10px] text-gray-400 shadow-sm border border-gray-100">
                🚶 {spot.walkingTimeToNext}분
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spot card */}
      <Link
        href={`/spot/${spot.spotSlug}`}
        className={cn(
          "mb-4 flex flex-1 flex-col rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-colors hover:bg-gray-50",
          !isLast && "mb-6"
        )}
      >
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {imageUrl ? (
              <OptimizedImage
                src={imageUrl}
                alt={spot.spotTitle}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <MapPin className="h-5 w-5 text-gray-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">{categoryLabel}</span>
              {spot.suggestedTime && (
                <>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                    <Clock className="h-2.5 w-2.5" />
                    {spot.suggestedTime}
                  </span>
                </>
              )}
            </div>
            <h3 className="truncate text-sm font-medium text-gray-900">
              {spot.spotTitle}
            </h3>
            {spot.spotAddress && (
              <p className="mt-0.5 flex items-center gap-0.5 text-[10px] text-gray-400 truncate">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                {spot.spotAddress}
              </p>
            )}
            {spot.crewNote && (
              <p className="mt-1 border-l-2 border-gray-200 pl-2 text-xs italic text-gray-500 line-clamp-2">
                {spot.crewNote}
              </p>
            )}
            {spot.stayDuration && (
              <p className="mt-0.5 text-[10px] text-gray-400">
                체류 약 {spot.stayDuration}분
              </p>
            )}
          </div>
        </div>

        {/* Media preview gallery */}
        {spot.spotMedia.length > 1 && (
          <div className="mt-2 flex gap-1.5">
            {spot.spotMedia.slice(0, 3).map((url, i) => (
              <div key={i} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <OptimizedImage src={url} alt="" fill className="object-cover" />
              </div>
            ))}
            {spot.spotMedia.length > 3 && (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                +{spot.spotMedia.length - 3}
              </div>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}
