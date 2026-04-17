"use client";

import { ArrowLeft, Clock, MapPin, Heart, Users, Copy, Route } from "lucide-react";
import Link from "next/link";
import { formatDistance, formatWalkingTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import HeroCarousel from "@/components/spot/HeroCarousel";
import type { SpotLineDetailResponse } from "@/types";

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

const themeGradients: Record<string, string> = {
  DATE: "from-pink-100 to-rose-200",
  TRAVEL: "from-blue-100 to-sky-200",
  WALK: "from-green-100 to-emerald-200",
  HANGOUT: "from-yellow-100 to-amber-200",
  FOOD_TOUR: "from-red-100 to-orange-200",
  CAFE_TOUR: "from-amber-100 to-yellow-200",
  CULTURE: "from-purple-100 to-violet-200",
};

interface SpotLineHeaderProps {
  spotLine: SpotLineDetailResponse;
}

export default function SpotLineHeader({ spotLine }: SpotLineHeaderProps) {
  const themeLabel = themeLabels[spotLine.theme] || spotLine.theme;
  const themeColor = themeColors[spotLine.theme] || "bg-gray-100 text-gray-700";
  const gradient = themeGradients[spotLine.theme] || "from-gray-100 to-gray-200";

  const heroPhotos = spotLine.spots
    .map(s => s.spotMedia?.[0])
    .filter((url): url is string => Boolean(url));

  return (
    <section className="bg-white pb-4">
      {/* Hero section */}
      {heroPhotos.length > 0 ? (
        <div className="relative">
          <HeroCarousel photos={heroPhotos} title={spotLine.title} />
          <div className="absolute left-4 top-4 z-10">
            <Link
              href="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/40"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
          </div>
        </div>
      ) : (
        <div className={cn("relative flex h-56 w-full items-center justify-center bg-gradient-to-br md:h-72", gradient)}>
          <Route className="h-12 w-12 text-blue-300" />
          <div className="absolute left-4 top-4">
            <Link
              href="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/40"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
          </div>
        </div>
      )}

      {/* Header info */}
      <div className="px-4 pt-4">
        {/* Theme badge */}
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${themeColor}`}>
          {themeLabel}
        </span>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">{spotLine.title}</h1>

        {spotLine.description && (
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">
            {spotLine.description}
          </p>
        )}

        {/* Stats */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {spotLine.area} · {spotLine.spots.length}곳
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatWalkingTime(spotLine.totalDuration)}
          </span>
          <span className="flex items-center gap-1">
            {formatDistance(spotLine.totalDistance)}
          </span>
        </div>

        {/* Social stats */}
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {spotLine.likesCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Copy className="h-3 w-3" />
            {spotLine.replicationsCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {spotLine.completionsCount.toLocaleString()} 완주
          </span>
        </div>

        {/* Creator profile section */}
        {spotLine.creatorName && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            {spotLine.creatorId ? (
              <Link
                href={`/profile/${spotLine.creatorId}`}
                className="flex items-center gap-3 rounded-lg -mx-1 px-1 py-1 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  {spotLine.creatorName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{spotLine.creatorName}</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      spotLine.creatorType === "CREW"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    )}>
                      {spotLine.creatorType === "CREW" ? "크루" : "유저"}
                    </span>
                  </div>
                </div>
                <ArrowLeft className="h-4 w-4 rotate-180 text-gray-300" />
              </Link>
            ) : (
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  {spotLine.creatorName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{spotLine.creatorName}</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      spotLine.creatorType === "CREW"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    )}>
                      {spotLine.creatorType === "CREW" ? "크루" : "유저"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
