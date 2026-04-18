"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Clock, MapPin } from "lucide-react";
import { fetchFeedSpots, fetchFeedSpotLines, fetchBlogs } from "@/lib/api";
import SpotPreviewCard from "@/components/shared/SpotPreviewCard";
import SpotLinePreviewCard from "@/components/shared/SpotLinePreviewCard";
import BlogCard from "@/components/blog/BlogCard";
import SearchFilters from "@/components/search/SearchFilters";
import SearchAutocomplete from "@/components/search/SearchAutocomplete";
import type { SpotDetailResponse, SpotLinePreview, BlogListItem } from "@/types";

type SearchTab = "spot" | "spotline" | "blog";
type SortOption = "POPULAR" | "NEWEST";

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

  // 필터 상태
  const [area, setArea] = useState<string | null>(searchParams.get("area"));
  const [category, setCategory] = useState<string | null>(searchParams.get("category"));
  const [theme, setTheme] = useState<string | null>(searchParams.get("theme"));
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "POPULAR"
  );
  const [totalCount, setTotalCount] = useState(0);

  const [spots, setSpots] = useState<SpotDetailResponse[]>([]);
  const [spotsPage, setSpotsPage] = useState(0);
  const [hasMoreSpots, setHasMoreSpots] = useState(true);

  const [spotLines, setSpotLines] = useState<SpotLinePreview[]>([]);
  const [spotLinesPage, setSpotLinesPage] = useState(0);
  const [hasMoreSpotLines, setHasMoreSpotLines] = useState(true);

  const [blogResults, setBlogResults] = useState<BlogListItem[]>([]);
  const [blogPage, setBlogPage] = useState(0);
  const [hasMoreBlogs, setHasMoreBlogs] = useState(true);

  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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
    if (area) params.set("area", area);
    if (tab === "spot" && category) params.set("category", category);
    if (tab === "spotline" && theme) params.set("theme", theme);
    if (sort !== "POPULAR") params.set("sort", sort);
    const qs = params.toString();
    router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [debouncedQuery, tab, area, category, theme, sort, router]);

  // 검색/필터 활성 여부
  const hasActiveFilter = !!(debouncedQuery || area || category || theme);

  // 검색 실행
  useEffect(() => {
    if (!hasActiveFilter) {
      setSpots([]);
      setSpotLines([]);
      setBlogResults([]);
      setTotalCount(0);
      return;
    }

    if (debouncedQuery) {
      addRecentSearch(debouncedQuery);
      setRecentSearches(getRecentSearches());
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        if (tab === "spot") {
          const result = await fetchFeedSpots(
            area ?? undefined,
            category ?? undefined,
            0,
            PAGE_SIZE,
            sort,
            debouncedQuery || undefined
          );
          if (!cancelled) {
            setSpots(result.content);
            setSpotsPage(0);
            setHasMoreSpots(!result.last);
            setTotalCount(result.totalElements);
          }
        } else if (tab === "spotline") {
          const result = await fetchFeedSpotLines(
            area ?? undefined,
            theme ?? undefined,
            0,
            PAGE_SIZE,
            debouncedQuery || undefined,
            sort
          );
          if (!cancelled) {
            setSpotLines(result.content);
            setSpotLinesPage(0);
            setHasMoreSpotLines(!result.last);
            setTotalCount(result.totalElements);
          }
        } else {
          const result = await fetchBlogs(
            0,
            PAGE_SIZE,
            area ?? undefined,
            sort
          );
          if (!cancelled) {
            setBlogResults(result.content);
            setBlogPage(0);
            setHasMoreBlogs(!result.last);
            setTotalCount(result.totalElements);
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
  }, [debouncedQuery, tab, area, category, theme, sort, hasActiveFilter]);

  // 더 보기
  const handleLoadMore = useCallback(async () => {
    if (loading || !hasActiveFilter) return;
    setLoading(true);
    try {
      if (tab === "spot") {
        const nextPage = spotsPage + 1;
        const result = await fetchFeedSpots(
          area ?? undefined,
          category ?? undefined,
          nextPage,
          PAGE_SIZE,
          sort,
          debouncedQuery || undefined
        );
        setSpots((prev) => [...prev, ...result.content]);
        setSpotsPage(nextPage);
        setHasMoreSpots(!result.last);
      } else if (tab === "spotline") {
        const nextPage = spotLinesPage + 1;
        const result = await fetchFeedSpotLines(
          area ?? undefined,
          theme ?? undefined,
          nextPage,
          PAGE_SIZE,
          debouncedQuery || undefined,
          sort
        );
        setSpotLines((prev) => [...prev, ...result.content]);
        setSpotLinesPage(nextPage);
        setHasMoreSpotLines(!result.last);
      } else {
        const nextPage = blogPage + 1;
        const result = await fetchBlogs(
          nextPage,
          PAGE_SIZE,
          area ?? undefined,
          sort
        );
        setBlogResults((prev) => [...prev, ...result.content]);
        setBlogPage(nextPage);
        setHasMoreBlogs(!result.last);
      }
    } catch {
      // 조용히 처리
    } finally {
      setLoading(false);
    }
  }, [loading, hasActiveFilter, debouncedQuery, tab, area, category, theme, sort, spotsPage, spotLinesPage, blogPage]);

  // 초기화: 최근 검색어
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // 탭 변경
  const handleTabChange = useCallback((newTab: SearchTab) => {
    setTab(newTab);
    setCategory(null);
    setTheme(null);
    if (newTab === "spot") {
      setSpots([]);
      setSpotsPage(0);
      setHasMoreSpots(true);
    } else if (newTab === "spotline") {
      setSpotLines([]);
      setSpotLinesPage(0);
      setHasMoreSpotLines(true);
    } else {
      setBlogResults([]);
      setBlogPage(0);
      setHasMoreBlogs(true);
    }
  }, []);

  // 필터 변경 핸들러
  const handleAreaChange = useCallback((newArea: string | null) => {
    setArea(newArea);
    setSpotsPage(0);
    setSpotLinesPage(0);
    setBlogPage(0);
  }, []);

  const handleCategoryChange = useCallback((newCategory: string | null) => {
    setCategory(newCategory);
    setSpotsPage(0);
  }, []);

  const handleThemeChange = useCallback((newTheme: string | null) => {
    setTheme(newTheme);
    setSpotLinesPage(0);
  }, []);

  // 필터 초기화
  const handleResetFilters = useCallback(() => {
    setArea(null);
    setCategory(null);
    setTheme(null);
    setSort("POPULAR");
  }, []);

  return (
    <div className="mx-auto max-w-2xl pb-20">
      {/* 검색 입력 */}
      <div className="sticky top-16 z-40 bg-white px-4 py-3 border-b border-gray-100">
        <SearchAutocomplete
          defaultValue={query}
          onSearch={(keyword) => setQuery(keyword)}
          placeholder="Spot, SpotLine, Blog 검색"
        />
      </div>

      {/* 필터 칩 */}
      <SearchFilters
        tab={tab}
        area={area}
        category={category}
        theme={theme}
        onAreaChange={handleAreaChange}
        onCategoryChange={handleCategoryChange}
        onThemeChange={handleThemeChange}
      />

      {/* 최근 검색어 (검색/필터 없을 때) */}
      {!hasActiveFilter && recentSearches.length > 0 && (
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
      {hasActiveFilter && (
        <>
          {/* 탭 */}
          <div className="flex border-b border-gray-200 px-4">
            {([
              { key: "spot" as const, label: "Spot" },
              { key: "spotline" as const, label: "SpotLine" },
              { key: "blog" as const, label: "Blog" },
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

          {/* 결과 카운트 + 정렬 */}
          {!loading && (
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-500">
                {totalCount}개의 {tab === "spot" ? "Spot" : tab === "spotline" ? "SpotLine" : "Blog"}
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600 outline-none"
              >
                <option value="POPULAR">인기순</option>
                <option value="NEWEST">최신순</option>
              </select>
            </div>
          )}

          {/* Spot 결과 */}
          {tab === "spot" && (
            <div className="px-4 py-4">
              {spots.length === 0 && !loading ? (
                <div className="py-12 text-center">
                  <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400 mb-4">
                    검색 결과가 없습니다
                  </p>
                  {(area || category) && (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleResetFilters}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        필터 초기화
                      </button>
                      <a
                        href="/explore"
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        탐색하기
                      </a>
                    </div>
                  )}
                </div>
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
                <div className="py-12 text-center">
                  <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400 mb-4">
                    검색 결과가 없습니다
                  </p>
                  {(area || theme) && (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleResetFilters}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        필터 초기화
                      </button>
                      <a
                        href="/explore"
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        탐색하기
                      </a>
                    </div>
                  )}
                </div>
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

          {/* Blog 결과 */}
          {tab === "blog" && (
            <div className="px-4 py-4">
              {blogResults.length === 0 && !loading ? (
                <div className="py-12 text-center">
                  <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400 mb-4">
                    검색 결과가 없습니다
                  </p>
                  {area && (
                    <button
                      onClick={handleResetFilters}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      필터 초기화
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {blogResults.map((blog) => (
                      <BlogCard key={blog.id} blog={blog} />
                    ))}
                  </div>
                  {hasMoreBlogs && !loading && (
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

      {/* 검색/필터 없고 최근 검색어도 없을 때 */}
      {!hasActiveFilter && recentSearches.length === 0 && (
        <div className="px-4 py-16 text-center">
          <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Spot, SpotLine, Blog를 검색해보세요</p>
        </div>
      )}
    </div>
  );
}
