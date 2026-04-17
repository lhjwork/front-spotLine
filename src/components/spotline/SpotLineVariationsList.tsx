"use client";

import { useEffect, useState, useCallback } from "react";
import { MapPin, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchSpotLineVariations } from "@/lib/api";
import type { SpotLinePreview, SpotLineSpotDetail } from "@/types";
import VariationDiffBadge from "@/components/spotline/VariationDiffBadge";
import VariationCompareModal from "@/components/spotline/VariationCompareModal";

interface SpotLineVariationsListProps {
  spotLineId: string;
  originalSpotCount: number;
  originalSpots: SpotLineSpotDetail[];
  spotLineSlug: string;
}

export default function SpotLineVariationsList({
  spotLineId,
  originalSpotCount,
  originalSpots,
}: SpotLineVariationsListProps) {
  const [variations, setVariations] = useState<SpotLinePreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [compareTarget, setCompareTarget] = useState<SpotLinePreview | null>(null);

  const loadVariations = useCallback(async (p: number, s: "latest" | "popular", append: boolean) => {
    if (p === 0) setIsLoading(true);
    setError(false);
    try {
      const data = await fetchSpotLineVariations(spotLineId, p, s);
      setVariations((prev) => append ? [...prev, ...data.items] : data.items);
      setHasMore(data.hasMore);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [spotLineId]);

  useEffect(() => {
    loadVariations(0, sort, false);
  }, [sort, loadVariations]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadVariations(nextPage, sort, true);
  };

  const toggleSort = () => {
    const next = sort === "latest" ? "popular" : "latest";
    setSort(next);
    setPage(0);
  };

  if (isLoading) {
    return (
      <div className="mt-3 space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-purple-50" />
        ))}
      </div>
    );
  }

  if (error || variations.length === 0) {
    return (
      <p className="mt-3 text-xs text-gray-400">
        {error ? "변형 목록을 불러올 수 없습니다" : "변형 SpotLine이 없습니다"}
      </p>
    );
  }

  return (
    <div className="mt-3">
      {/* Sort toggle */}
      <div className="mb-2 flex justify-end">
        <button
          onClick={toggleSort}
          className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
        >
          <ArrowUpDown className="h-3 w-3" />
          {sort === "latest" ? "최신순" : "좋아요순"}
        </button>
      </div>

      {/* Variation cards */}
      <div className="space-y-2">
        {variations.map((v) => (
          <button
            key={v.id}
            onClick={() => setCompareTarget(v)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border border-purple-100 bg-white p-3 text-left transition-colors hover:bg-purple-50"
            )}
          >
            <MapPin className="h-4 w-4 shrink-0 text-purple-500" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-gray-900">
                  {v.title}
                </p>
                <VariationDiffBadge
                  originalSpotCount={originalSpotCount}
                  variationSpotCount={v.spotCount}
                />
              </div>
              <p className="text-xs text-gray-500">
                {v.area} · {v.spotCount}곳 · {Math.round(v.totalDuration / 60)}시간
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={handleLoadMore}
          className="mt-2 w-full rounded-xl border border-purple-100 py-2 text-xs text-purple-600 hover:bg-purple-50"
        >
          더보기
        </button>
      )}

      {/* Compare modal */}
      {compareTarget && (
        <VariationCompareModal
          originalSpots={originalSpots}
          variationSlug={compareTarget.slug}
          variationTitle={compareTarget.title}
          onClose={() => setCompareTarget(null)}
        />
      )}
    </div>
  );
}
