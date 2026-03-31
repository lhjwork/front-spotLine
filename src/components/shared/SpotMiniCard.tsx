import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { SpotDetailResponse } from "@/types";

const categoryLabels: Record<string, string> = {
  CAFE: "카페", cafe: "카페", RESTAURANT: "맛집", restaurant: "맛집",
  BAR: "바", bar: "바", NATURE: "자연", nature: "자연",
  CULTURE: "문화", culture: "문화", EXHIBITION: "전시", exhibition: "전시",
  WALK: "산책", walk: "산책", ACTIVITY: "액티비티", activity: "액티비티",
  SHOPPING: "쇼핑", shopping: "쇼핑", OTHER: "기타", other: "기타",
};

interface SpotMiniCardProps {
  spot: SpotDetailResponse;
}

export default function SpotMiniCard({ spot }: SpotMiniCardProps) {
  const imageUrl = spot.placeInfo?.photos?.[0] || spot.media?.[0];
  const categoryLabel = categoryLabels[spot.category] || spot.category;

  return (
    <Link
      href={`/spot/${spot.slug}`}
      className="flex gap-3 rounded-xl border border-gray-100 bg-white p-2.5 transition-colors hover:bg-gray-50"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {imageUrl ? (
          <OptimizedImage src={imageUrl} alt={spot.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MapPin className="h-4 w-4 text-gray-300" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{spot.title}</p>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span>{categoryLabel}</span>
          {spot.placeInfo?.rating && (
            <span className="flex items-center gap-0.5 text-yellow-600">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {spot.placeInfo.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
