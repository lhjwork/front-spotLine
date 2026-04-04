import { ArrowLeft, Clock, MapPin, Heart, Users, Copy } from "lucide-react";
import Link from "next/link";
import { formatDistance, formatWalkingTime } from "@/lib/utils";
import type { SpotLineDetailResponse } from "@/types";

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

interface SpotLineHeaderProps {
  spotLine: SpotLineDetailResponse;
}

export default function SpotLineHeader({ spotLine }: SpotLineHeaderProps) {
  const themeLabel = themeLabels[spotLine.theme] || spotLine.theme;
  const themeColor = themeColors[spotLine.theme] || "bg-gray-100 text-gray-700";

  return (
    <section className="bg-white pb-4">
      {/* Back button */}
      <div className="px-4 pt-4">
        <Link
          href="/"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
      </div>

      <div className="px-4 pt-3">
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

        {spotLine.creatorName && (
          <p className="mt-2 text-xs text-gray-400">
            by {spotLine.creatorName}
          </p>
        )}
      </div>
    </section>
  );
}
