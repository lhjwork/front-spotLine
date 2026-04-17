"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { searchSpots } from "@/lib/api";
import { useSpotLineBuilderStore } from "@/store/useSpotLineBuilderStore";
import SpotSearchCard from "./SpotSearchCard";
import type { SpotDetailResponse, SpotCategory } from "@/types";

const AREA_OPTIONS = [
  "전체",
  "성수",
  "연남/연희",
  "한남/이태원",
  "홍대/합정",
  "망원/상수",
  "을지로/종로",
  "여의도",
  "강남/신사",
  "잠실/송파",
];

const CATEGORY_OPTIONS: { value: SpotCategory | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "CAFE", label: "카페" },
  { value: "RESTAURANT", label: "음식점" },
  { value: "BAR", label: "바" },
  { value: "CULTURE", label: "문화" },
  { value: "EXHIBITION", label: "전시" },
  { value: "WALK", label: "산책" },
  { value: "ACTIVITY", label: "액티비티" },
  { value: "SHOPPING", label: "쇼핑" },
  { value: "NATURE", label: "자연" },
];

export default function SpotSearchPanel() {
  const spots = useSpotLineBuilderStore((s) => s.spots);
  const addSpot = useSpotLineBuilderStore((s) => s.addSpot);

  const [keyword, setKeyword] = useState("");
  const [area, setArea] = useState("전체");
  const [category, setCategory] = useState<SpotCategory | "all">("all");
  const [results, setResults] = useState<SpotDetailResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);
  const abortRef = useRef<AbortController>(null);

  const addedIds = new Set(spots.map((s) => s.spot.id));

  const fetchResults = useCallback(
    async (p: number, append: boolean) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      try {
        const data = await searchSpots({
          keyword: keyword || undefined,
          area: area === "전체" ? undefined : area,
          category: category === "all" ? undefined : category,
          page: p,
          size: 20,
        });
        setResults((prev) =>
          append ? [...prev, ...data.content] : data.content
        );
        setHasMore(!data.last);
        setPage(p);
      } catch {
        // 검색 실패 무시
      } finally {
        setIsLoading(false);
      }
    },
    [keyword, area, category]
  );

  // keyword 변경 시 debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(0, false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword, area, category, fetchResults]);

  // 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchResults(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, isLoading, page, fetchResults]);

  const handleAdd = (spot: SpotDetailResponse) => {
    addSpot(spot);
  };

  return (
    <div className="flex h-full flex-col">
      {/* 검색 입력 */}
      <div className="space-y-3 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Spot 검색"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-400 focus:bg-white"
          />
        </div>

        {/* 지역 필터 */}
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-purple-400"
        >
          {AREA_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {/* 카테고리 칩 */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={
                category === c.value
                  ? "rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white"
                  : "rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
        {results.map((spot) => (
          <SpotSearchCard
            key={spot.id}
            spot={spot}
            isAdded={addedIds.has(spot.id)}
            onAdd={handleAdd}
          />
        ))}

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        )}

        {!isLoading && results.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            검색 결과가 없어요. 다른 키워드로 검색해보세요
          </div>
        )}

        <div ref={observerRef} className="h-4" />
      </div>
    </div>
  );
}
