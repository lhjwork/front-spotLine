import Link from "next/link";
import { Route, Clock, MapPin, Heart } from "lucide-react";
import { formatWalkingTime } from "@/lib/utils";
import type { SpotLinePreview } from "@/types";

const themeLabels: Record<string, string> = {
  date: "데이트", travel: "여행", walk: "산책",
  hangout: "놀거리", "food-tour": "맛집 투어",
  "cafe-tour": "카페 투어", culture: "문화",
};

const themeColors: Record<string, string> = {
  date: "bg-pink-100 text-pink-700",
  travel: "bg-blue-100 text-blue-700",
  walk: "bg-green-100 text-green-700",
  hangout: "bg-yellow-100 text-yellow-700",
  "food-tour": "bg-red-100 text-red-700",
  "cafe-tour": "bg-amber-100 text-amber-700",
  culture: "bg-purple-100 text-purple-700",
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
      className="block rounded-xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
          <Route className="h-5 w-5 text-purple-600" />
        </div>
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
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {spotLine.spotCount}곳
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {formatWalkingTime(spotLine.totalDuration)}
            </span>
            <span className="flex items-center gap-0.5">
              <Heart className="h-3 w-3" />
              {spotLine.likesCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
