"use client";

import { useEffect, useCallback } from "react";

import { useExploreStore } from "@/store/useExploreStore";
import { useKakaoMapLoader } from "@/lib/kakao-map";
import { fetchFeedSpots } from "@/lib/api";
import { AREA_CENTERS } from "@/constants/explore";
import FeedAreaTabs from "@/components/feed/FeedAreaTabs";
import FeedCategoryChips from "@/components/feed/FeedCategoryChips";

import ExploreMap from "./ExploreMap";
import ExploreLocationButton from "./ExploreLocationButton";
import ExploreBottomPanel from "./ExploreBottomPanel";

import type { SpotCategory } from "@/types";

export default function ExplorePage() {
  const { loading: sdkLoading, error: sdkError } = useKakaoMapLoader();

  const selectedArea = useExploreStore((s) => s.selectedArea);
  const selectedCategory = useExploreStore((s) => s.selectedCategory);
  const setSelectedArea = useExploreStore((s) => s.setSelectedArea);
  const setSelectedCategory = useExploreStore((s) => s.setSelectedCategory);
  const setSpots = useExploreStore((s) => s.setSpots);
  const setIsLoading = useExploreStore((s) => s.setIsLoading);
  const setCenter = useExploreStore((s) => s.setCenter);
  const setSelectedSpot = useExploreStore((s) => s.setSelectedSpot);

  const loadSpots = useCallback(async (area: string | null, category: SpotCategory | null) => {
    setIsLoading(true);
    try {
      const result = await fetchFeedSpots(
        area || undefined,
        category || undefined,
        0,
        100
      );
      setSpots(result.content);
    } catch {
      setSpots([]);
    } finally {
      setIsLoading(false);
    }
  }, [setSpots, setIsLoading]);

  useEffect(() => {
    loadSpots(selectedArea, selectedCategory);
  }, [selectedArea, selectedCategory, loadSpots]);

  const handleAreaChange = useCallback((area: string | null) => {
    setSelectedArea(area);
    setSelectedSpot(null);
    if (area && AREA_CENTERS[area]) {
      setCenter(AREA_CENTERS[area]);
    }
  }, [setSelectedArea, setSelectedSpot, setCenter]);

  const handleCategoryChange = useCallback((category: SpotCategory | null) => {
    setSelectedCategory(category);
    setSelectedSpot(null);
  }, [setSelectedCategory, setSelectedSpot]);

  if (sdkError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center px-4">
        <p className="text-gray-500 text-sm">지도를 불러올 수 없습니다</p>
        <p className="text-gray-400 text-xs mt-1">네트워크 연결을 확인해주세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <FeedAreaTabs selected={selectedArea} onSelect={handleAreaChange} />
      <FeedCategoryChips selected={selectedCategory} onSelect={handleCategoryChange} />

      <div className="relative flex-1">
        {sdkLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <ExploreMap />
            <ExploreLocationButton />
            <ExploreBottomPanel />
          </>
        )}
      </div>
    </div>
  );
}
