import Link from "next/link";
import { Route, Clock, MapPin } from "lucide-react";
import { formatWalkingTime } from "@/lib/utils";
import type { RoutePreview } from "@/types";

const themeLabels: Record<string, string> = {
  date: "데이트", travel: "여행", walk: "산책",
  hangout: "놀거리", "food-tour": "맛집 투어",
  "cafe-tour": "카페 투어", culture: "문화",
};

interface SpotRoutesProps {
  routes: RoutePreview[];
}

export default function SpotRoutes({ routes }: SpotRoutesProps) {
  return (
    <section className="mt-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">
        이 Spot이 포함된 Route
      </h2>
      <div className="space-y-2">
        {routes.map((route) => (
          <Link
            key={route.id}
            href={`/route/${route.slug}`}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <Route className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium text-gray-900">
                {route.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{themeLabels[route.theme] || route.theme}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {route.spotCount}곳
                </span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {formatWalkingTime(route.totalDuration)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
