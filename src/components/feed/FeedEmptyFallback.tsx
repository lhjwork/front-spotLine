"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import { fetchFeedSpots } from "@/lib/api";
import type { SpotDetailResponse } from "@/types";

interface FeedEmptyFallbackProps {
  onResetArea?: () => void;
  keyword?: string;
  onResetFilters?: () => void;
}

export default function FeedEmptyFallback({ onResetArea, keyword, onResetFilters }: FeedEmptyFallbackProps) {
  const [fallbackSpots, setFallbackSpots] = useState<SpotDetailResponse[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await fetchFeedSpots(undefined, undefined, 0, 4, "POPULAR");
        if (!cancelled) setFallbackSpots(result.content);
      } catch {
        // fallback is non-critical
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="px-4 py-12 text-center">
      <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
      <p className="mb-1 text-base font-semibold text-gray-700">
        {keyword ? `'${keyword}' 검색 결과가 없습니다` : "이 지역에 등록된 Spot이 없습니다"}
      </p>
      <p className="mb-6 text-sm text-gray-400">
        다른 키워드나 지역으로 검색해 보세요
      </p>

      {fallbackSpots.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-gray-600">이런 Spot은 어떠세요?</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {fallbackSpots.map((spot) => (
              <Link
                key={spot.id}
                href={`/spot/${spot.slug}`}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative h-24 w-full bg-gray-100">
                  {spot.mediaItems?.[0]?.url || spot.placeInfo?.photos?.[0] || spot.media?.[0] ? (
                    <OptimizedImage
                      src={(spot.mediaItems?.[0]?.url || spot.placeInfo?.photos?.[0] || spot.media?.[0])!}
                      alt={spot.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <MapPin className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h4 className="truncate text-xs font-bold text-gray-900">{spot.title}</h4>
                  <span className="text-[10px] text-gray-400">{spot.area}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3">
        {onResetArea && (
          <button
            type="button"
            onClick={onResetArea}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            전체 보기
          </button>
        )}
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            필터 초기화
          </button>
        )}
      </div>
    </div>
  );
}
