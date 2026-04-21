"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { MapPin, Star, Eye, Zap } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import SocialActionButtons from "@/components/shared/SocialActionButtons";
import SpotPreviewCard from "@/components/shared/SpotPreviewCard";
import SpotCardSkeleton from "./SpotCardSkeleton";
import FeedEmptyFallback from "./FeedEmptyFallback";
import type { SpotDetailResponse, FeedLayout } from "@/types";

const categoryLabels: Record<string, string> = {
  CAFE: "카페", RESTAURANT: "맛집", BAR: "바", NATURE: "자연",
  CULTURE: "문화", EXHIBITION: "전시", WALK: "산책", ACTIVITY: "액티비티",
  SHOPPING: "쇼핑", OTHER: "기타",
};

interface FeedSpotGridProps {
  spots: SpotDetailResponse[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
  layout: FeedLayout;
  onResetArea?: () => void;
  keyword?: string;
  onResetFilters?: () => void;
}

function SpotListCard({ spot }: { spot: SpotDetailResponse }) {
  const imageUrl = spot.mediaItems?.[0]?.url || spot.placeInfo?.photos?.[0] || spot.media?.[0];
  const categoryLabel = categoryLabels[spot.category] || spot.category;

  return (
    <Link
      href={`/spot/${spot.slug}`}
      className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-shadow hover:shadow-md"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {imageUrl ? (
          <OptimizedImage src={imageUrl} alt={spot.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MapPin className="h-6 w-6 text-gray-300" />
          </div>
        )}
        {spot.partner?.isPartner && (
          <span
            className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white"
            style={{ backgroundColor: spot.partner.brandColor }}
          >
            <Zap className="h-2 w-2" />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="mb-0.5 flex items-center gap-1.5 text-xs text-gray-500">
            <span>{categoryLabel}</span>
            <span>·</span>
            <span>{spot.area}</span>
          </div>
          <h3 className="truncate text-sm font-bold text-gray-900">{spot.title}</h3>
          {spot.crewNote && (
            <p className="mt-0.5 truncate text-xs text-gray-500">{spot.crewNote}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
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

export default function FeedSpotGrid({ spots, hasMore, onLoadMore, isLoading, layout, onResetArea, keyword, onResetFilters }: FeedSpotGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore]
  );

  if (spots.length === 0 && !isLoading) {
    return <FeedEmptyFallback onResetArea={onResetArea} keyword={keyword} onResetFilters={onResetFilters} />;
  }

  return (
    <section className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-gray-900">인기 Spot</h2>
      <div className={layout === "grid"
        ? "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
        : "flex flex-col gap-3"
      }>
        {spots.map((spot, i) => (
          <div
            key={spot.id}
            ref={i === spots.length - 1 ? lastCardRef : undefined}
            className="transition-all duration-200"
          >
            {layout === "grid" ? (
              <SpotPreviewCard spot={spot} />
            ) : (
              <SpotListCard spot={spot} />
            )}
          </div>
        ))}
      </div>
      {isLoading && (
        <>
          <div className={layout === "grid"
            ? "mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
            : "mt-3 flex flex-col gap-3"
          }>
            {Array.from({ length: 3 }).map((_, i) => (
              <SpotCardSkeleton key={`loading-${i}`} index={i} />
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">더 불러오는 중...</p>
        </>
      )}
    </section>
  );
}
