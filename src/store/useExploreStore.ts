import { create } from "zustand";
import type { SpotDetailResponse, SpotCategory } from "@/types";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/constants/explore";

interface ExploreState {
  center: { lat: number; lng: number };
  zoom: number;
  selectedArea: string | null;
  selectedCategory: SpotCategory | null;
  spots: SpotDetailResponse[];
  isLoading: boolean;
  selectedSpot: SpotDetailResponse | null;
  isPanelExpanded: boolean;

  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  setSelectedArea: (area: string | null) => void;
  setSelectedCategory: (category: SpotCategory | null) => void;
  setSpots: (spots: SpotDetailResponse[]) => void;
  setIsLoading: (loading: boolean) => void;
  setSelectedSpot: (spot: SpotDetailResponse | null) => void;
  setIsPanelExpanded: (expanded: boolean) => void;
  clearAll: () => void;
}

export const useExploreStore = create<ExploreState>((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  selectedArea: null,
  selectedCategory: null,
  spots: [],
  isLoading: false,
  selectedSpot: null,
  isPanelExpanded: false,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedArea: (area) => set({ selectedArea: area }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSpots: (spots) => set({ spots }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setSelectedSpot: (spot) => set({ selectedSpot: spot }),
  setIsPanelExpanded: (expanded) => set({ isPanelExpanded: expanded }),
  clearAll: () =>
    set({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      selectedArea: null,
      selectedCategory: null,
      spots: [],
      isLoading: false,
      selectedSpot: null,
      isPanelExpanded: false,
    }),
}));
