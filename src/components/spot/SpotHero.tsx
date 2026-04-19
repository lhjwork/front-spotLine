import { ArrowLeft, MapPin, Star, Eye, Share2 } from "lucide-react";
import Link from "next/link";
import HeroCarousel from "@/components/spot/HeroCarousel";
import PartnerBadge from "@/components/spot/PartnerBadge";
import SpotBusinessStatus from "@/components/spot/SpotBusinessStatus";
import type { SpotDetailResponse } from "@/types";

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

interface SpotHeroProps {
  spot: SpotDetailResponse;
  heroPhotos: string[];
}

export default function SpotHero({ spot, heroPhotos }: SpotHeroProps) {
  const categoryLabel = categoryLabels[spot.category] || spot.category;
  const rating = spot.placeInfo?.rating;

  return (
    <section className="relative">
      {/* Hero Carousel */}
      <div className="relative">
        <HeroCarousel photos={heroPhotos} title={spot.title} />
        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Back button */}
        <Link
          href="/"
          className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white"
        >
          <ArrowLeft className="h-5 w-5 text-gray-800" />
        </Link>
      </div>

      {/* Info overlay */}
      <div className="relative -mt-16 px-4">
        <div className="animate-[fadeInUp_0.4s_ease-out] rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {categoryLabel}
            </span>
            {spot.partner?.isPartner && (
              <PartnerBadge partner={spot.partner} />
            )}
            {spot.placeInfo?.dailyHours && (
              <SpotBusinessStatus
                dailyHours={spot.placeInfo.dailyHours}
                businessHours={spot.placeInfo.businessHours}
              />
            )}
            <span className="text-xs text-gray-400">{spot.area}</span>
          </div>

          <h1 className="mb-1 text-xl font-bold text-gray-900">{spot.title}</h1>

          {spot.description && (
            <p className="mb-2 text-sm text-gray-600 leading-relaxed">
              {spot.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {spot.address}
            </span>
            {rating && (
              <span className="flex items-center gap-0.5 text-yellow-600">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {rating.toFixed(1)}
                {spot.placeInfo?.reviewCount && (
                  <span className="text-gray-400">({spot.placeInfo.reviewCount})</span>
                )}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Eye className="h-3 w-3" />
              {spot.viewsCount.toLocaleString()}
            </span>
            {spot.sharesCount > 0 && (
              <span className="flex items-center gap-0.5">
                <Share2 className="h-3 w-3" />
                {spot.sharesCount.toLocaleString()}
              </span>
            )}
          </div>

          {/* Tags */}
          {spot.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {spot.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
