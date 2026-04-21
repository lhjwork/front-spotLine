"use client";

import Link from "next/link";
import { Route, Clock, MapPin } from "lucide-react";
import { formatWalkingTime } from "@/lib/utils";
import SocialActionButtons from "@/components/shared/SocialActionButtons";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { SpotLinePreview } from "@/types";

const themeLabels: Record<string, string> = {
  DATE: "데이트", TRAVEL: "여행", WALK: "산책",
  HANGOUT: "놀거리", FOOD_TOUR: "맛집 투어",
  CAFE_TOUR: "카페 투어", CULTURE: "문화",
};

const themeColors: Record<string, string> = {
  DATE: "bg-pink-100 text-pink-700",
  TRAVEL: "bg-blue-100 text-blue-700",
  WALK: "bg-green-100 text-green-700",
  HANGOUT: "bg-yellow-100 text-yellow-700",
  FOOD_TOUR: "bg-red-100 text-red-700",
  CAFE_TOUR: "bg-amber-100 text-amber-700",
  CULTURE: "bg-purple-100 text-purple-700",
};

interface SpotLinePreviewCardProps {
  spotLine: SpotLinePreview;
}

export default function SpotLinePreviewCard({ spotLine }: SpotLinePreviewCardProps) {
  const themeLabel = themeLabels[spotLine.theme] || spotLine.theme;
  const themeColor = themeColors[spotLine.theme] || "bg-gray-100 text-gray-700";

  return (
    <Link
      href={`/spotline/${spotLine.slug}`}
      className="block overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
    >
      {spotLine.coverImageUrl && (
        <div className="aspect-[2/1] w-full overflow-hidden">
          <OptimizedImage
            src={spotLine.coverImageUrl}
            alt={spotLine.title}
            width={400}
            height={200}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {!spotLine.coverImageUrl && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <Route className="h-5 w-5 text-purple-600" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${themeColor}`}>
                {themeLabel}
              </span>
              <span className="text-xs text-gray-400">{spotLine.area}</span>
            </div>
            <h3 className="truncate text-sm font-bold text-gray-900">
              {spotLine.title}
            </h3>
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {spotLine.spotCount}곳
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {formatWalkingTime(spotLine.totalDuration)}
                </span>
              </div>
              <SocialActionButtons
                type="spotline"
                id={spotLine.id}
                initialLikesCount={spotLine.likesCount}
                initialSavesCount={0}
                initialSharesCount={spotLine.sharesCount ?? 0}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
