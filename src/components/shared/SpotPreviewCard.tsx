import Link from "next/link";
import { MapPin, Star, Eye, Zap } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import SocialActionButtons from "@/components/shared/SocialActionButtons";
import type { SpotDetailResponse } from "@/types";

const categoryLabels: Record<string, string> = {
  CAFE: "카페", cafe: "카페", RESTAURANT: "맛집", restaurant: "맛집",
  BAR: "바", bar: "바", NATURE: "자연", nature: "자연",
  CULTURE: "문화", culture: "문화", EXHIBITION: "전시", exhibition: "전시",
  WALK: "산책", walk: "산책", ACTIVITY: "액티비티", activity: "액티비티",
  SHOPPING: "쇼핑", shopping: "쇼핑", OTHER: "기타", other: "기타",
};

interface SpotPreviewCardProps {
  spot: SpotDetailResponse;
}

export default function SpotPreviewCard({ spot }: SpotPreviewCardProps) {
  const imageUrl = spot.mediaItems?.[0]?.url || spot.placeInfo?.photos?.[0] || spot.media?.[0];
  const categoryLabel = categoryLabels[spot.category] || spot.category;

  return (
    <Link
      href={`/spot/${spot.slug}`}
      className="block overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative h-36 w-full bg-gray-100">
        {imageUrl ? (
          <OptimizedImage src={imageUrl} alt={spot.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MapPin className="h-8 w-8 text-gray-300" />
          </div>
        )}
        {spot.partner?.isPartner && (
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: spot.partner.brandColor }}
          >
            <Zap className="h-2.5 w-2.5" />
            파트너
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="mb-0.5 flex items-center gap-1.5 text-xs text-gray-500">
          <span>{categoryLabel}</span>
          <span>·</span>
          <span>{spot.area}</span>
        </div>
        <h3 className="truncate text-sm font-bold text-gray-900">{spot.title}</h3>
        {spot.crewNote && (
          <p className="mt-0.5 truncate text-xs text-gray-500">{spot.crewNote}</p>
        )}
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {spot.placeInfo?.rating && (
              <span className="flex items-center gap-0.5 text-yellow-600">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {spot.placeInfo.rating.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Eye className="h-3 w-3" />
              {spot.viewsCount.toLocaleString()}
            </span>
          </div>
          <SocialActionButtons
            type="spot"
            id={spot.id}
            initialLikesCount={spot.likesCount}
            initialSavesCount={spot.savesCount}
            initialSharesCount={spot.sharesCount}
            size="sm"
          />
        </div>
      </div>
    </Link>
  );
}
