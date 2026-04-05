"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFeedStore } from "@/store/useFeedStore";
import { fetchFeedSpots, fetchFeedSpotLines } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SpotCategory, FeedSort } from "@/types";
import FeedAreaTabs from "./FeedAreaTabs";
import FeedCategoryChips from "./FeedCategoryChips";
import FeedSearchBar from "./FeedSearchBar";
import FeedSortDropdown from "./FeedSortDropdown";
import FeedFilterReset from "./FeedFilterReset";
import FeedSpotLineSection from "./FeedSpotLineSection";
import FeedSpotGrid from "./FeedSpotGrid";
import FeedSkeleton from "./FeedSkeleton";
import ExploreNavBar from "@/components/shared/ExploreNavBar";

export default function FeedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const initializedRef = useRef(false);
  const {
    area, category, sort, keyword,
    spots, spotsPage, hasMoreSpots, spotLines,
    isLoading, error,
    setArea, setCategory, setSort, setKeyword, resetFilters,
    appendSpots, nextSpotsPage, setSpotLines,
    setIsLoading, setError,
  } = useFeedStore();

  // Init filters from URL (once)
  useEffect(() => {
    const urlArea = searchParams.get("area");
    const urlCategory = searchParams.get("category");
    const urlSort = searchParams.get("sort");
    const urlKeyword = searchParams.get("keyword");
    if (urlArea) setArea(urlArea);
    if (urlCategory) setCategory(urlCategory as SpotCategory);
    if (urlSort === "newest") setSort("newest" as FeedSort);
    if (urlKeyword) setKeyword(urlKeyword);
    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync filters to URL
  useEffect(() => {
    if (!initializedRef.current) return;
    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (category) params.set("category", category);
    if (sort !== "popular") params.set("sort", sort);
    if (keyword) params.set("keyword", keyword);
    const query = params.toString();
    router.replace(`/feed${query ? `?${query}` : ""}`, { scroll: false });
  }, [area, category, sort, keyword, router]);

  // Scroll to content on filter change
  useEffect(() => {
    if (!initializedRef.current) return;
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [area, category]);

  // Load spotLines when area changes
  useEffect(() => {
    if (!initializedRef.current) return;
    let cancelled = false;
    const loadSpotLines = async () => {
      try {
        const result = await fetchFeedSpotLines(area || undefined, undefined, 0, 5);
        if (!cancelled) setSpotLines(result.content);
      } catch {
        // SpotLines are non-critical, don't block
      }
    };
    loadSpotLines();
    return () => { cancelled = true; };
  }, [area, setSpotLines]);

  // Load spots when filters/page change
  useEffect(() => {
    if (!initializedRef.current) return;
    let cancelled = false;

    const loadSpots = async () => {
      if (spotsPage === 0 && spots.length > 0) {
        setIsFiltering(true);
      }
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchFeedSpots(
          area || undefined,
          category || undefined,
          spotsPage,
          20,
          sort !== "popular" ? sort : undefined,
          keyword || undefined
        );
        if (!cancelled) {
          appendSpots(result.content, !result.last);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Spot을 불러올 수 없습니다");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsFiltering(false);
        }
      }
    };
    loadSpots();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, category, sort, keyword, spotsPage]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMoreSpots) {
      nextSpotsPage();
    }
  }, [isLoading, hasMoreSpots, nextSpotsPage]);

  // Initial loading
  if (isLoading && spots.length === 0 && spotLines.length === 0) {
    return <FeedSkeleton />;
  }

  // Error with no data
  if (error && spots.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="mb-4 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => { setError(null); nextSpotsPage(); }}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <ExploreNavBar activeTab="feed" />
      <FeedAreaTabs selected={area} onSelect={setArea} />
      <FeedCategoryChips selected={category} onSelect={setCategory} />

      {/* Search + Sort row */}
      <div className="flex items-center gap-2 px-4 py-2">
        <FeedSearchBar value={keyword} onChange={setKeyword} />
        <FeedSortDropdown selected={sort} onSelect={setSort} />
      </div>

      <FeedFilterReset
        area={area}
        category={category}
        sort={sort}
        keyword={keyword}
        onReset={resetFilters}
      />

      <div ref={contentRef} />
      <FeedSpotLineSection spotLines={spotLines} />
      <div className={cn("transition-opacity duration-200", isFiltering && "opacity-50")}>
        <FeedSpotGrid
          spots={spots}
          hasMore={hasMoreSpots}
          onLoadMore={handleLoadMore}
          isLoading={isLoading}
          onResetArea={() => setArea(null)}
          keyword={keyword}
          onResetFilters={resetFilters}
        />
      </div>
    </div>
  );
}
