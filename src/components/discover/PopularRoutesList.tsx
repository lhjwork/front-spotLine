"use client";

import { Route, Clock, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoutePreview } from "@/types";

interface PopularRoutesListProps {
  routes: RoutePreview[];
  className?: string;
}

const themeLabels: Record<string, string> = {
  DATE: "데이트",
  TRAVEL: "여행",
  WALK: "산책",
  HANGOUT: "놀기",
  FOOD_TOUR: "맛집투어",
  CAFE_TOUR: "카페투어",
  CULTURE: "문화",
};

export default function PopularRoutesList({
  routes,
  className,
}: PopularRoutesListProps) {
  if (routes.length === 0) return null;

  return (
    <div className={cn("px-4", className)}>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        이 지역 인기 Route
      </h3>
      <div className="space-y-2">
        {routes.map((route) => (
          <button
            key={route.id}
            onClick={() => (window.location.href = `/route/${route.slug}`)}
            className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
              <Route className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {route.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{themeLabels[route.theme] || route.theme}</span>
                <span>·</span>
                <span>{route.spotCount}곳</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {route.totalDuration}분
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 text-xs text-gray-400">
              <Heart className="h-3 w-3" />
              {route.likesCount}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
