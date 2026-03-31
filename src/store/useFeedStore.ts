import { create } from "zustand";
import type { SpotDetailResponse, RoutePreview, SpotCategory } from "@/types";

interface FeedState {
  area: string | null;
  category: SpotCategory | null;
  setArea: (area: string | null) => void;
  setCategory: (category: SpotCategory | null) => void;

  spots: SpotDetailResponse[];
  spotsPage: number;
  hasMoreSpots: boolean;
  appendSpots: (newSpots: SpotDetailResponse[], hasMore: boolean) => void;
  nextSpotsPage: () => void;

  routes: RoutePreview[];
  setRoutes: (routes: RoutePreview[]) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  resetData: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  area: null,
  category: null,
  spots: [],
  spotsPage: 0,
  hasMoreSpots: true,
  routes: [],
  isLoading: false,
  error: null,

  setArea: (area) => set((state) => {
    if (state.area === area) return state;
    return { area, spots: [], spotsPage: 0, hasMoreSpots: true, routes: [], error: null };
  }),

  setCategory: (category) => set((state) => {
    if (state.category === category) return state;
    return { category, spots: [], spotsPage: 0, hasMoreSpots: true, error: null };
  }),

  appendSpots: (newSpots, hasMore) => set((state) => ({
    spots: [...state.spots, ...newSpots],
    hasMoreSpots: hasMore,
  })),

  nextSpotsPage: () => set((state) => ({ spotsPage: state.spotsPage + 1 })),

  setRoutes: (routes) => set({ routes }),

  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  resetData: () => set({
    spots: [],
    spotsPage: 0,
    hasMoreSpots: true,
    routes: [],
    error: null,
  }),
}));
