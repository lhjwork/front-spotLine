"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Clock } from "lucide-react";
import { fetchFeedSpots, fetchFeedSpotLines } from "@/lib/api";
import SpotPreviewCard from "@/components/shared/SpotPreviewCard";
import SpotLinePreviewCard from "@/components/shared/SpotLinePreviewCard";
import type { SpotDetailResponse, SpotLinePreview } from "@/types";

type SearchTab = "spot" | "spotline";

const STORAGE_KEY = "spotline_recent_searches";
const MAX_RECENT = 10;
const PAGE_SIZE = 20;

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const searches = getRecentSearches().filter((s) => s !== trimmed);
  searches.unshift(trimmed);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches.slice(0, MAX_RECENT)));
}

function removeRecentSearch(query: string) {
  const searches = getRecentSearches().filter((s) => s !== query);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [tab, setTab] = useState<SearchTab>(
    (searchParams.get("tab") as SearchTab) || "spot"
  );

  const [spots, setSpots] = useState<SpotDetailResponse[]>([]);
  const [spotsPage, setSpotsPage] = useState(0);
  const [hasMoreSpots, setHasMoreSpots] = useState(true);

  const [spotLines, setSpotLines] = useState<SpotLinePreview[]>([]);
  const [spotLinesPage, setSpotLinesPage] = useState(0);
  const [hasMoreSpotLines, setHasMoreSpotLines] = useState(true);

  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 디바운스
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // URL 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (tab !== "spot") params.set("tab", tab);
    const qs = params.toString();
    router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [debouncedQuery, tab, router]);

  // 검색 실행
  useEffect(() => {
    if (!debouncedQuery) {
      setSpots([]);
      setSpotLines([]);
      return;
    }

    addRecentSearch(debouncedQuery);
    setRecentSearches(getRecentSearches());

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        if (tab === "spot") {
          const result = await fetchFeedSpots(undefined, undefined, 0, PAGE_SIZE, "POPULAR", debouncedQuery);
          if (!cancelled) {
            setSpots(result.content);
            setSpotsPage(0);
            setHasMoreSpots(!result.last);
          }
        } else {
          const result = await fetchFeedSpotLines(undefined, undefined, 0, PAGE_SIZE, debouncedQuery, "POPULAR");
          if (!cancelled) {
            setSpotLines(result.content);
            setSpotLinesPage(0);
            setHasMoreSpotLines(!result.last);
          }
        }
      } catch {
        // 조용히 처리
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [debouncedQuery, tab]);

  // 더 보기
  const handleLoadMore = useCallback(async () => {
    if (loading || !debouncedQuery) return;
    setLoading(true);
    try {
      if (tab === "spot") {
        const nextPage = spotsPage + 1;
        const result = await fetchFeedSpots(undefined, undefined, nextPage, PAGE_SIZE, "POPULAR", debouncedQuery);
        setSpots((prev) => [...prev, ...result.content]);
        setSpotsPage(nextPage);
        setHasMoreSpots(!result.last);
      } else {
        const nextPage = spotLinesPage + 1;
        const result = await fetchFeedSpotLines(undefined, undefined, nextPage, PAGE_SIZE, debouncedQuery, "POPULAR");
        setSpotLines((prev) => [...prev, ...result.content]);
        setSpotLinesPage(nextPage);
        setHasMoreSpotLines(!result.last);
      }
    } catch {
      // 조용히 처리
    } finally {
      setLoading(false);
    }
  }, [loading, debouncedQuery, tab, spotsPage, spotLinesPage]);

  // 초기화: 최근 검색어 + autoFocus
  useEffect(() => {
    setRecentSearches(getRecentSearches());
    inputRef.current?.focus();
  }, []);

  // 탭 변경
  const handleTabChange = useCallback((newTab: SearchTab) => {
    setTab(newTab);
    if (newTab === "spot") {
      setSpots([]);
      setSpotsPage(0);
      setHasMoreSpots(true);
    } else {
      setSpotLines([]);
      setSpotLinesPage(0);
      setHasMoreSpotLines(true);
    }
  }, []);

  return (
    <div className="mx-auto max-w-2xl pb-20">
      {/* 검색 입력 */}
      <div className="sticky top-16 z-40 bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spot, SpotLine 검색..."
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 최근 검색어 (검색어 없을 때) */}
      {!debouncedQuery && recentSearches.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">최근 검색</h2>
            <button
              onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              전체 삭제
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <div key={term} className="flex items-center gap-1 rounded-full bg-gray-100 pl-3 pr-1.5 py-1.5">
                <button
                  onClick={() => setQuery(term)}
                  className="flex items-center gap-1.5 text-sm text-gray-700"
                >
                  <Clock className="h-3 w-3 text-gray-400" />
                  {term}
                </button>
                <button
                  onClick={() => {
                    removeRecentSearch(term);
                    setRecentSearches(getRecentSearches());
                  }}
                  className="p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 탭 + 결과 */}
      {debouncedQuery && (
        <>
          {/* 탭 */}
          <div className="flex border-b border-gray-200 px-4">
            {([
              { key: "spot" as const, label: "Spot" },
              { key: "spotline" as const, label: "SpotLine" },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Spot 결과 */}
          {tab === "spot" && (
            <div className="px-4 py-4">
              {spots.length === 0 && !loading ? (
                <p className="py-12 text-center text-sm text-gray-400">
                  검색 결과가 없습니다
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {spots.map((spot) => (
                      <SpotPreviewCard key={spot.id} spot={spot} />
                    ))}
                  </div>
                  {hasMoreSpots && !loading && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        className="rounded-lg border border-gray-200 px-6 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        더 보기
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* SpotLine 결과 */}
          {tab === "spotline" && (
            <div className="px-4 py-4">
              {spotLines.length === 0 && !loading ? (
                <p className="py-12 text-center text-sm text-gray-400">
                  검색 결과가 없습니다
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {spotLines.map((sl) => (
                      <SpotLinePreviewCard key={sl.id} spotLine={sl} />
                    ))}
                  </div>
                  {hasMoreSpotLines && !loading && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        className="rounded-lg border border-gray-200 px-6 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        더 보기
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 로딩 */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          )}
        </>
      )}

      {/* 검색어 없고 최근 검색어도 없을 때 */}
      {!debouncedQuery && recentSearches.length === 0 && (
        <div className="px-4 py-16 text-center">
          <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Spot이나 SpotLine을 검색해보세요</p>
        </div>
      )}
    </div>
  );
}
