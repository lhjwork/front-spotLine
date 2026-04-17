import { create } from "zustand";
import type { SpotDetailResponse, SpotLinePreview, SpotCategory, FeedSort } from "@/types";

interface FeedState {
  area: string | null;
  category: SpotCategory | null;
  sort: FeedSort;
  keyword: string;
  setArea: (area: string | null) => void;
  setCategory: (category: SpotCategory | null) => void;
  setSort: (sort: FeedSort) => void;
  setKeyword: (keyword: string) => void;
  resetFilters: () => void;

  feedTab: "all" | "following";
  setFeedTab: (tab: "all" | "following") => void;

  spots: SpotDetailResponse[];
  spotsPage: number;
  hasMoreSpots: boolean;
  appendSpots: (newSpots: SpotDetailResponse[], hasMore: boolean) => void;
  nextSpotsPage: () => void;

  spotLines: SpotLinePreview[];
  setSpotLines: (spotLines: SpotLinePreview[]) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  resetData: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  area: null,
  category: null,
  sort: "POPULAR",
  keyword: "",
  feedTab: "all",
  spots: [],
  spotsPage: 0,
  hasMoreSpots: true,
  spotLines: [],
  isLoading: false,
  error: null,

  setArea: (area) => set((state) => {
    if (state.area === area) return state;
    return { area, spots: [], spotsPage: 0, hasMoreSpots: true, spotLines: [], error: null };
  }),

  setCategory: (category) => set((state) => {
    if (state.category === category) return state;
    return { category, spots: [], spotsPage: 0, hasMoreSpots: true, error: null };
  }),

  setSort: (sort) => set((state) => {
    if (state.sort === sort) return state;
    return { sort, spots: [], spotsPage: 0, hasMoreSpots: true, error: null };
  }),

  setKeyword: (keyword) => set((state) => {
    if (state.keyword === keyword) return state;
    return { keyword, spots: [], spotsPage: 0, hasMoreSpots: true, error: null };
  }),

  setFeedTab: (feedTab) => set({
    feedTab,
    spots: [],
    spotsPage: 0,
    hasMoreSpots: true,
    spotLines: [],
    error: null,
  }),

  resetFilters: () => set({
    area: null,
    category: null,
    sort: "POPULAR",
    keyword: "",
    spots: [],
    spotsPage: 0,
    hasMoreSpots: true,
    spotLines: [],
    error: null,
  }),

  appendSpots: (newSpots, hasMore) => set((state) => {
    const existingIds = new Set(state.spots.map((s) => s.id));
    const unique = newSpots.filter((s) => !existingIds.has(s.id));
    return {
      spots: [...state.spots, ...unique],
      hasMoreSpots: hasMore,
    };
  }),

  nextSpotsPage: () => set((state) => ({ spotsPage: state.spotsPage + 1 })),

  setSpotLines: (spotLines) => set({ spotLines }),

  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  resetData: () => set({
    spots: [],
    spotsPage: 0,
    hasMoreSpots: true,
    spotLines: [],
    error: null,
  }),
}));
