"use client";

import { create } from "zustand";
import {
  fetchMySpots as apiFetchMySpots,
  deleteSpot as apiDeleteSpot,
} from "@/lib/api";
import type { SpotDetailResponse, SpotStatus } from "@/types";

const LOCAL_STORAGE_KEY = "spotline_my_spots";

interface MySpotState {
  spots: SpotDetailResponse[];
  isLoading: boolean;

  setSpots: (spots: SpotDetailResponse[]) => void;
  addSpot: (spot: SpotDetailResponse) => void;
  removeSpot: (slug: string) => Promise<void>;
  fetchSpots: (status?: SpotStatus) => Promise<void>;
  clearAll: () => void;
}

const readLocal = (): SpotDetailResponse[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data.spots || [];
  } catch {
    return [];
  }
};

const syncLocal = (spots: SpotDetailResponse[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({ spots, updatedAt: new Date().toISOString() })
  );
};

export const useMySpotStore = create<MySpotState>((set, get) => ({
  spots: [],
  isLoading: false,

  setSpots: (spots) => {
    set({ spots });
    syncLocal(spots);
  },

  addSpot: (spot) => {
    set((state) => {
      const updated = [spot, ...state.spots];
      syncLocal(updated);
      return { spots: updated };
    });
  },

  removeSpot: async (slug) => {
    // Optimistic update
    set((state) => ({
      spots: state.spots.filter((s) => s.slug !== slug),
    }));
    syncLocal(get().spots);

    try {
      await apiDeleteSpot(slug);
    } catch {
      console.warn(`Spot 삭제 API 실패 (${slug}) — 로컬 상태 유지`);
    }
  },

  fetchSpots: async (status) => {
    set({ isLoading: true });
    try {
      const data = await apiFetchMySpots(status);
      if (data.items.length > 0) {
        set({ spots: data.items });
        syncLocal(data.items);
      } else {
        const local = readLocal();
        if (local.length > 0) {
          const filtered = status
            ? local.filter((s) => s.status === status)
            : local;
          set({ spots: filtered });
        } else {
          set({ spots: [] });
        }
      }
    } catch {
      const local = readLocal();
      const filtered = status
        ? local.filter((s) => s.status === status)
        : local;
      set({ spots: filtered });
    } finally {
      set({ isLoading: false });
    }
  },

  clearAll: () => {
    set({ spots: [], isLoading: false });
  },
}));
