"use client";

import { create } from "zustand";
import {
  fetchMySpotLines as apiFetchMySpotLines,
  updateMySpotLineStatus as apiUpdateStatus,
  deleteMySpotLine as apiDeleteSpotLine,
} from "@/lib/api";
import type { MySpotLine } from "@/types";

const LOCAL_STORAGE_KEY = "spotline_my_spotlines";

interface MySpotLinesState {
  spotLines: MySpotLine[];
  isLoading: boolean;

  setSpotLines: (spotLines: MySpotLine[]) => void;
  addSpotLine: (spotLine: MySpotLine) => void;
  markComplete: (mySpotLineId: string) => Promise<void>;
  removeSpotLine: (mySpotLineId: string) => Promise<void>;
  fetchSpotLines: (status?: "scheduled" | "completed") => Promise<void>;
  clearAll: () => void;
}

const readLocal = (): MySpotLine[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data.spotLines || [];
  } catch {
    return [];
  }
};

const syncLocal = (spotLines: MySpotLine[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({ spotLines, updatedAt: new Date().toISOString() })
  );
};

export const useMySpotLinesStore = create<MySpotLinesState>((set, get) => ({
  spotLines: [],
  isLoading: false,

  setSpotLines: (spotLines) => {
    set({ spotLines });
    syncLocal(spotLines);
  },

  addSpotLine: (spotLine) => {
    set((state) => {
      const updated = [spotLine, ...state.spotLines];
      syncLocal(updated);
      return { spotLines: updated };
    });
  },

  markComplete: async (mySpotLineId) => {
    // Optimistic update
    set((state) => ({
      spotLines: state.spotLines.map((r) =>
        r.id === mySpotLineId
          ? { ...r, status: "completed" as const, completedAt: new Date().toISOString() }
          : r
      ),
    }));
    syncLocal(get().spotLines);

    try {
      await apiUpdateStatus(mySpotLineId, "completed");
    } catch {
      console.warn(`완주 마킹 API 실패 (${mySpotLineId}) — 로컬 상태 유지`);
    }
  },

  removeSpotLine: async (mySpotLineId) => {
    // Optimistic update
    set((state) => ({
      spotLines: state.spotLines.filter((r) => r.id !== mySpotLineId),
    }));
    syncLocal(get().spotLines);

    try {
      await apiDeleteSpotLine(mySpotLineId);
    } catch {
      console.warn(`삭제 API 실패 (${mySpotLineId}) — 로컬 상태 유지`);
    }
  },

  fetchSpotLines: async (status) => {
    set({ isLoading: true });
    try {
      const data = await apiFetchMySpotLines(status);
      if (data.items.length > 0) {
        set({ spotLines: data.items });
        syncLocal(data.items);
      } else {
        // API 빈 응답 시 localStorage fallback
        const local = readLocal();
        if (local.length > 0) {
          const filtered = status
            ? local.filter((r) => r.status === status)
            : local;
          set({ spotLines: filtered });
        } else {
          set({ spotLines: [] });
        }
      }
    } catch {
      // API 실패 -> localStorage fallback
      const local = readLocal();
      const filtered = status
        ? local.filter((r) => r.status === status)
        : local;
      set({ spotLines: filtered });
    } finally {
      set({ isLoading: false });
    }
  },

  clearAll: () => {
    set({ spotLines: [], isLoading: false });
  },
}));
