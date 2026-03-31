"use client";

import { create } from "zustand";
import {
  fetchMyRoutes as apiFetchMyRoutes,
  updateMyRouteStatus as apiUpdateStatus,
  deleteMyRoute as apiDeleteRoute,
} from "@/lib/api";
import type { MyRoute } from "@/types";

const LOCAL_STORAGE_KEY = "spotline_my_routes";

interface MyRoutesState {
  routes: MyRoute[];
  isLoading: boolean;

  setRoutes: (routes: MyRoute[]) => void;
  addRoute: (route: MyRoute) => void;
  markComplete: (myRouteId: string) => Promise<void>;
  removeRoute: (myRouteId: string) => Promise<void>;
  fetchRoutes: (status?: "scheduled" | "completed") => Promise<void>;
  clearAll: () => void;
}

const readLocal = (): MyRoute[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data.routes || [];
  } catch {
    return [];
  }
};

const syncLocal = (routes: MyRoute[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({ routes, updatedAt: new Date().toISOString() })
  );
};

export const useMyRoutesStore = create<MyRoutesState>((set, get) => ({
  routes: [],
  isLoading: false,

  setRoutes: (routes) => {
    set({ routes });
    syncLocal(routes);
  },

  addRoute: (route) => {
    set((state) => {
      const updated = [route, ...state.routes];
      syncLocal(updated);
      return { routes: updated };
    });
  },

  markComplete: async (myRouteId) => {
    // Optimistic update
    set((state) => ({
      routes: state.routes.map((r) =>
        r.id === myRouteId
          ? { ...r, status: "completed" as const, completedAt: new Date().toISOString() }
          : r
      ),
    }));
    syncLocal(get().routes);

    try {
      await apiUpdateStatus(myRouteId, "completed");
    } catch {
      console.warn(`완주 마킹 API 실패 (${myRouteId}) — 로컬 상태 유지`);
    }
  },

  removeRoute: async (myRouteId) => {
    // Optimistic update
    set((state) => ({
      routes: state.routes.filter((r) => r.id !== myRouteId),
    }));
    syncLocal(get().routes);

    try {
      await apiDeleteRoute(myRouteId);
    } catch {
      console.warn(`삭제 API 실패 (${myRouteId}) — 로컬 상태 유지`);
    }
  },

  fetchRoutes: async (status) => {
    set({ isLoading: true });
    try {
      const data = await apiFetchMyRoutes(status);
      if (data.items.length > 0) {
        set({ routes: data.items });
        syncLocal(data.items);
      } else {
        // API 빈 응답 시 localStorage fallback
        const local = readLocal();
        if (local.length > 0) {
          const filtered = status
            ? local.filter((r) => r.status === status)
            : local;
          set({ routes: filtered });
        } else {
          set({ routes: [] });
        }
      }
    } catch {
      // API 실패 → localStorage fallback
      const local = readLocal();
      const filtered = status
        ? local.filter((r) => r.status === status)
        : local;
      set({ routes: filtered });
    } finally {
      set({ isLoading: false });
    }
  },

  clearAll: () => {
    set({ routes: [], isLoading: false });
  },
}));
