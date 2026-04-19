import Link from "next/link";
import { Route, Clock, MapPin } from "lucide-react";
import { cn, formatWalkingTime } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { SpotLinePreview } from "@/types";

const themeLabels: Record<string, string> = {
  DATE: "데이트", TRAVEL: "여행", WALK: "산책",
  HANGOUT: "놀거리", FOOD_TOUR: "맛집 투어",
  CAFE_TOUR: "카페 투어", CULTURE: "문화",
};

interface SpotSpotLinesProps {
  spotLines: SpotLinePreview[];
  id?: string;
  heading?: string;
  highlight?: boolean;
}

export default function SpotSpotLines({ spotLines, id, heading, highlight }: SpotSpotLinesProps) {
  return (
    <section className={cn("mt-4", highlight && "rounded-xl bg-purple-50 p-3")} id={id}>
      <h2 className={cn("mb-3 text-sm font-semibold", highlight ? "text-purple-700" : "text-gray-900")}>
        {heading || "이 Spot이 포함된 SpotLine"}
      </h2>
      <div className="space-y-2">
        {spotLines.map((spotLine) => (
          <Link
            key={spotLine.id}
            href={`/spotline/${spotLine.slug}`}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50"
          >
            {spotLine.coverImageUrl ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                <OptimizedImage
                  src={spotLine.coverImageUrl}
                  alt={spotLine.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <Route className="h-5 w-5 text-purple-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium text-gray-900">
                {spotLine.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{themeLabels[spotLine.theme] || spotLine.theme}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {spotLine.spotCount}곳
                </span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {formatWalkingTime(spotLine.totalDuration)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
