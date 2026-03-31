"use client";

import { useRef, useCallback } from "react";
import SpotPreviewCard from "@/components/shared/SpotPreviewCard";
import SpotCardSkeleton from "./SpotCardSkeleton";
import EmptyFeed from "./EmptyFeed";
import type { SpotDetailResponse } from "@/types";

interface FeedSpotGridProps {
  spots: SpotDetailResponse[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
  onResetArea?: () => void;
}

export default function FeedSpotGrid({ spots, hasMore, onLoadMore, isLoading, onResetArea }: FeedSpotGridProps) {
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
    return <EmptyFeed type="spot" onResetArea={onResetArea} />;
  }

  return (
    <section className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-gray-900">인기 Spot</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {spots.map((spot, i) => (
          <div key={spot.id} ref={i === spots.length - 1 ? lastCardRef : undefined}>
            <SpotPreviewCard spot={spot} />
          </div>
        ))}
      </div>
      {isLoading && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <SpotCardSkeleton key={`loading-${i}`} index={i} />
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">더 불러오는 중...</p>
        </>
      )}
    </section>
  );
}
