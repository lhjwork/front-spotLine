"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFeedStore } from "@/store/useFeedStore";
import { fetchFeedSpots, fetchFeedRoutes } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SpotCategory } from "@/types";
import FeedAreaTabs from "./FeedAreaTabs";
import FeedCategoryChips from "./FeedCategoryChips";
import FeedRouteSection from "./FeedRouteSection";
import FeedSpotGrid from "./FeedSpotGrid";
import FeedSkeleton from "./FeedSkeleton";
import ExploreNavBar from "@/components/shared/ExploreNavBar";

export default function FeedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const {
    area, category, spots, spotsPage, hasMoreSpots, routes,
    isLoading, error,
    setArea, setCategory, appendSpots, nextSpotsPage, setRoutes,
    setIsLoading, setError,
  } = useFeedStore();

  // Init filters from URL
  useEffect(() => {
    const urlArea = searchParams.get("area");
    const urlCategory = searchParams.get("category");
    if (urlArea) setArea(urlArea);
    if (urlCategory) setCategory(urlCategory as SpotCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (category) params.set("category", category);
    const query = params.toString();
    router.replace(`/feed${query ? `?${query}` : ""}`, { scroll: false });
  }, [area, category, router]);

  // Scroll to content on filter change
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [area, category]);

  // Load routes when area changes
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const result = await fetchFeedRoutes(area || undefined, undefined, 0, 5);
        setRoutes(result.content);
      } catch {
        // Routes are non-critical, don't block
      }
    };
    loadRoutes();
  }, [area, setRoutes]);

  // Load spots when area/category/page changes
  useEffect(() => {
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
          20
        );
        appendSpots(result.content, !result.last);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Spot을 불러올 수 없습니다");
      } finally {
        setIsLoading(false);
        setIsFiltering(false);
      }
    };
    loadSpots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, category, spotsPage]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMoreSpots) {
      nextSpotsPage();
    }
  }, [isLoading, hasMoreSpots, nextSpotsPage]);

  // Initial loading
  if (isLoading && spots.length === 0 && routes.length === 0) {
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
      <div ref={contentRef} />
      <FeedRouteSection routes={routes} />
      <div className={cn("transition-opacity duration-200", isFiltering && "opacity-50")}>
        <FeedSpotGrid
          spots={spots}
          hasMore={hasMoreSpots}
          onLoadMore={handleLoadMore}
          isLoading={isLoading}
          onResetArea={() => setArea(null)}
        />
      </div>
    </div>
  );
}
