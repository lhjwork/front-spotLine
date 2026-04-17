import type { SpotCategory } from "@/types";

export const DEFAULT_CENTER = { lat: 37.5447, lng: 127.056 }; // 성수
export const DEFAULT_ZOOM = 15;

export const AREA_CENTERS: Record<string, { lat: number; lng: number }> = {
  성수: { lat: 37.5447, lng: 127.056 },
  을지로: { lat: 37.566, lng: 126.991 },
  연남: { lat: 37.566, lng: 126.923 },
  홍대: { lat: 37.5563, lng: 126.9236 },
  이태원: { lat: 37.5345, lng: 126.9946 },
  한남: { lat: 37.534, lng: 127.0 },
  종로: { lat: 37.572, lng: 126.9794 },
};

export const CATEGORY_COLORS: Record<SpotCategory, string> = {
  CAFE: "#f59e0b",
  RESTAURANT: "#ef4444",
  BAR: "#8b5cf6",
  NATURE: "#22c55e",
  CULTURE: "#6366f1",
  EXHIBITION: "#a855f7",
  WALK: "#14b8a6",
  ACTIVITY: "#f97316",
  SHOPPING: "#06b6d4",
  OTHER: "#6b7280",
};
