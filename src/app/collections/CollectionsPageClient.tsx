"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { fetchCollections } from "@/lib/api";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import Layout from "@/components/layout/Layout";
import type { CollectionPreview } from "@/types";

const AREAS = ["전체", "서울", "성수", "홍대", "이태원", "강남", "여의도"];
const THEMES = ["전체", "DATE", "FOOD_TOUR", "CAFE_TOUR", "WALK", "CULTURE", "TRAVEL", "HANGOUT"];
const THEME_LABELS: Record<string, string> = {
  전체: "전체",
  DATE: "데이트",
  FOOD_TOUR: "맛집투어",
  CAFE_TOUR: "카페투어",
  WALK: "산책",
  CULTURE: "문화",
  TRAVEL: "여행",
  HANGOUT: "모임",
};

interface CollectionsPageClientProps {
  initialCollections: CollectionPreview[];
  initialHasMore: boolean;
}

export default function CollectionsPageClient({ initialCollections, initialHasMore }: CollectionsPageClientProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState("전체");
  const [selectedTheme, setSelectedTheme] = useState("전체");

  const loadCollections = useCallback(async (area: string, theme: string, pageNum: number, append = false) => {
    setIsLoading(true);
    try {
      const result = await fetchCollections({
        area: area === "전체" ? undefined : area,
        theme: theme === "전체" ? undefined : theme,
        page: pageNum,
        size: 12,
      });
      setCollections(append ? (prev) => [...prev, ...result.content] : result.content);
      setHasMore(!result.last);
      setPage(pageNum);
    } catch {
      // Non-critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
    loadCollections(area, selectedTheme, 0);
  };

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    loadCollections(selectedArea, theme, 0);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadCollections(selectedArea, selectedTheme, page + 1, true);
    }
  };

  return (
    <Layout showFooter>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-gray-900">큐레이션 컬렉션</h1>
          <p className="mt-1 text-sm text-gray-500">크루가 엄선한 테마별 큐레이션</p>
        </div>

        {/* Area filter */}
        <div className="flex gap-2 overflow-x-auto bg-white px-4 py-2 scrollbar-hide">
          {AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => handleAreaChange(area)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                selectedArea === area
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Theme filter */}
        <div className="flex gap-2 overflow-x-auto border-b border-gray-100 bg-white px-4 py-2 scrollbar-hide">
          {THEMES.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => handleThemeChange(theme)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                selectedTheme === theme
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {THEME_LABELS[theme] || theme}
            </button>
          ))}
        </div>

        {/* Collection grid */}
        <div className="mx-auto max-w-5xl px-4 py-4">
          {collections.length === 0 && !isLoading ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-500">해당 조건의 컬렉션이 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collection/${collection.slug}`}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-purple-100">
                    {collection.coverImageUrl && (
                      <OptimizedImage
                        src={collection.coverImageUrl}
                        alt={collection.title}
                        fill
                        className="object-cover"
                      />
                    )}
                    {collection.area && (
                      <span className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                        {collection.area}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-sm font-semibold text-gray-900">{collection.title}</h3>
                    {collection.description && (
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{collection.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      <span>{collection.itemCount}개 장소/코스</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {isLoading ? "불러오는 중..." : "더보기"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
