"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFeedStore } from "@/store/useFeedStore";
import { fetchFeedSpots, fetchFeedSpotLines, fetchBlogs } from "@/lib/api";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpotCategory, FeedSort, BlogListItem } from "@/types";
import FeedAreaTabs from "./FeedAreaTabs";
import FeedCategoryChips from "./FeedCategoryChips";
import FeedSearchBar from "./FeedSearchBar";
import FeedSortDropdown from "./FeedSortDropdown";
import FeedFilterReset from "./FeedFilterReset";
import FeedSpotLineSection from "./FeedSpotLineSection";
import FeedRecommendationSection from "./FeedRecommendationSection";
import FeedBlogSection from "./FeedBlogSection";
import FeedSpotGrid from "./FeedSpotGrid";
import FeedSkeleton from "./FeedSkeleton";
import FollowingFeed from "./FollowingFeed";
import ExploreNavBar from "@/components/shared/ExploreNavBar";

export default function FeedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [partnerOnly, setPartnerOnly] = useState(false);
  const initializedRef = useRef(false);
  const {
    area, category, sort, keyword,
    feedTab, setFeedTab,
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
    if (urlSort === "NEWEST") setSort("NEWEST" as FeedSort);
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
    if (sort !== "POPULAR") params.set("sort", sort);
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

  // Load blogs when area changes
  useEffect(() => {
    if (!initializedRef.current) return;
    let cancelled = false;
    const loadBlogs = async () => {
      try {
        const result = await fetchBlogs(0, 4, area || undefined);
        if (!cancelled) setBlogs(result.content);
      } catch {
        // Blogs are non-critical, don't block
      }
    };
    loadBlogs();
    return () => { cancelled = true; };
  }, [area]);

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
          sort !== "POPULAR" ? sort : undefined,
          keyword || undefined,
          partnerOnly || undefined
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
  }, [area, category, sort, keyword, spotsPage, partnerOnly]);

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

      {/* Feed tab: 전체 / 팔로잉 */}
      <div className="flex gap-2 border-b border-gray-100 px-4 py-2">
        {(["all", "following"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFeedTab(tab)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              feedTab === tab
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            {tab === "all" ? "전체" : "팔로잉"}
          </button>
        ))}
      </div>

      {feedTab === "following" ? (
        <FollowingFeed />
      ) : (
        <>
          <FeedAreaTabs selected={area} onSelect={setArea} />
          <FeedCategoryChips selected={category} onSelect={setCategory} />

          {/* Partner filter */}
          <div className="px-4 py-1">
            <button
              type="button"
              onClick={() => setPartnerOnly((prev) => !prev)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                partnerOnly
                  ? "bg-amber-100 text-amber-700"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              파트너 혜택
            </button>
          </div>

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
          <FeedRecommendationSection />
          <FeedSpotLineSection spotLines={spotLines} />
          <FeedBlogSection blogs={blogs} />
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
        </>
      )}
    </div>
  );
}
