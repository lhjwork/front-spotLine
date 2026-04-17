"use client";

import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import type {
  SpotLineBuilderSpot,
  SpotDetailResponse,
  SpotLineDetailResponse,
  SpotLineTheme,
  CreateSpotLineRequest,
  UpdateSpotLineRequest,
} from "@/types";
import { calculateSpotDistances } from "@/lib/geo";

const MAX_SPOTS = 10;

const THEME_TO_BACKEND: Record<string, string> = {
  date: "DATE",
  travel: "TRAVEL",
  walk: "WALK",
  hangout: "HANGOUT",
  "food-tour": "FOOD_TOUR",
  "cafe-tour": "CAFE_TOUR",
  culture: "CULTURE",
};

interface SpotLineBuilderStore {
  // State
  spots: SpotLineBuilderSpot[];
  title: string;
  description: string;
  theme: SpotLineTheme | null;
  area: string;
  parentSpotLineId: string | null;
  parentInfo: { title: string; creatorName: string; slug: string } | null;
  isDirty: boolean;
  isSaving: boolean;

  // Spot 관리
  addSpot: (spot: SpotDetailResponse) => boolean;
  removeSpot: (spotId: string) => void;
  reorderSpots: (activeId: string, overId: string) => void;
  updateSpotMeta: (
    spotId: string,
    meta: Partial<
      Pick<SpotLineBuilderSpot, "suggestedTime" | "stayDuration" | "transitionNote">
    >
  ) => void;

  // 메타 정보
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setTheme: (theme: SpotLineTheme | null) => void;
  setArea: (area: string) => void;
  setIsSaving: (saving: boolean) => void;

  // Fork / Edit
  initFromFork: (spotLine: SpotLineDetailResponse) => void;
  initFromEdit: (spotLine: SpotLineDetailResponse) => void;

  // 유틸
  clearAll: () => void;
  canSave: () => boolean;
  toCreateRequest: () => CreateSpotLineRequest;
  toUpdateRequest: () => UpdateSpotLineRequest;
}

function inferArea(spots: SpotLineBuilderSpot[]): string {
  if (spots.length === 0) return "";
  const counts: Record<string, number> = {};
  for (const s of spots) {
    const a = s.spot.area;
    if (a) counts[a] = (counts[a] || 0) + 1;
  }
  let maxArea = "";
  let maxCount = 0;
  for (const [area, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxArea = area;
      maxCount = count;
    }
  }
  return maxArea;
}

function spotLineSpotDetailToBuilderSpot(
  spotLine: SpotLineDetailResponse
): SpotLineBuilderSpot[] {
  return spotLine.spots.map((s) => ({
    spot: {
      id: s.spotId,
      slug: s.spotSlug,
      title: s.spotTitle,
      category: s.spotCategory as SpotDetailResponse["category"],
      area: s.spotArea,
      address: s.spotAddress,
      latitude: s.spotLatitude,
      longitude: s.spotLongitude,
      crewNote: s.crewNote,
      media: s.spotMedia,
      // fill minimal defaults for fields not available from SpotLineSpotDetail
      description: null,
      source: "CREW",
      sido: null,
      sigungu: null,
      dong: null,
      blogUrl: null,
      instagramUrl: null,
      websiteUrl: null,
      naverPlaceId: null,
      kakaoPlaceId: null,
      tags: [],
      mediaItems: [],
      likesCount: 0,
      savesCount: 0,
      visitedCount: 0,
      viewsCount: 0,
      commentsCount: 0,
      creatorId: null,
      creatorType: "crew",
      creatorName: null,
      createdAt: "",
      placeInfo: null,
      partner: null,
      status: "APPROVED",
      rejectionReason: null,
      reviewedAt: null,
      reviewedBy: null,
    } as SpotDetailResponse,
    order: s.order,
    suggestedTime: s.suggestedTime,
    stayDuration: s.stayDuration,
    transitionNote: s.transitionNote,
    walkingTimeToNext: s.walkingTimeToNext,
    distanceToNext: s.distanceToNext,
  }));
}

export const useSpotLineBuilderStore = create<SpotLineBuilderStore>(
  (set, get) => ({
    spots: [],
    title: "",
    description: "",
    theme: null,
    area: "",
    parentSpotLineId: null,
    parentInfo: null,
    isDirty: false,
    isSaving: false,

    addSpot: (spot) => {
      const { spots } = get();
      if (spots.length >= MAX_SPOTS) return false;
      if (spots.some((s) => s.spot.id === spot.id)) return false;

      const newSpot: SpotLineBuilderSpot = {
        spot,
        order: spots.length + 1,
        suggestedTime: null,
        stayDuration: null,
        transitionNote: null,
        walkingTimeToNext: null,
        distanceToNext: null,
      };
      const updated = calculateSpotDistances([...spots, newSpot]);
      set({
        spots: updated,
        area: inferArea(updated),
        isDirty: true,
      });
      return true;
    },

    removeSpot: (spotId) => {
      const updated = get()
        .spots.filter((s) => s.spot.id !== spotId)
        .map((s, i) => ({ ...s, order: i + 1 }));
      const recalculated = calculateSpotDistances(updated);
      set({
        spots: recalculated,
        area: inferArea(recalculated),
        isDirty: true,
      });
    },

    reorderSpots: (activeId, overId) => {
      const { spots } = get();
      const oldIndex = spots.findIndex((s) => s.spot.id === activeId);
      const newIndex = spots.findIndex((s) => s.spot.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const moved = arrayMove(spots, oldIndex, newIndex).map((s, i) => ({
        ...s,
        order: i + 1,
      }));
      set({ spots: calculateSpotDistances(moved), isDirty: true });
    },

    updateSpotMeta: (spotId, meta) => {
      set((state) => ({
        spots: state.spots.map((s) =>
          s.spot.id === spotId ? { ...s, ...meta } : s
        ),
        isDirty: true,
      }));
    },

    setTitle: (title) => set({ title, isDirty: true }),
    setDescription: (description) => set({ description, isDirty: true }),
    setTheme: (theme) => set({ theme, isDirty: true }),
    setArea: (area) => set({ area, isDirty: true }),
    setIsSaving: (isSaving) => set({ isSaving }),

    initFromFork: (spotLine) => {
      const spots = spotLineSpotDetailToBuilderSpot(spotLine);
      set({
        spots: calculateSpotDistances(spots),
        title: "",
        description: "",
        theme: spotLine.theme,
        area: spotLine.area,
        parentSpotLineId: spotLine.id,
        parentInfo: {
          title: spotLine.title,
          creatorName: spotLine.creatorName || "익명",
          slug: spotLine.slug,
        },
        isDirty: false,
        isSaving: false,
      });
    },

    initFromEdit: (spotLine) => {
      const spots = spotLineSpotDetailToBuilderSpot(spotLine);
      set({
        spots: calculateSpotDistances(spots),
        title: spotLine.title,
        description: spotLine.description || "",
        theme: spotLine.theme,
        area: spotLine.area,
        parentSpotLineId: null,
        parentInfo: null,
        isDirty: false,
        isSaving: false,
      });
    },

    clearAll: () => {
      set({
        spots: [],
        title: "",
        description: "",
        theme: null,
        area: "",
        parentSpotLineId: null,
        parentInfo: null,
        isDirty: false,
        isSaving: false,
      });
    },

    canSave: () => {
      const { title, theme, spots } = get();
      return title.trim().length >= 2 && theme !== null && spots.length >= 2;
    },

    toCreateRequest: () => {
      const { title, description, theme, area, parentSpotLineId, spots } =
        get();
      return {
        title,
        description: description || undefined,
        theme: THEME_TO_BACKEND[theme || ""] || "DATE",
        area,
        parentSpotLineId: parentSpotLineId || undefined,
        spots: spots.map((s, i) => ({
          spotId: s.spot.id,
          order: i + 1,
          suggestedTime: s.suggestedTime || undefined,
          stayDuration: s.stayDuration || undefined,
          walkingTimeToNext: s.walkingTimeToNext || undefined,
          distanceToNext: s.distanceToNext || undefined,
          transitionNote: s.transitionNote || undefined,
        })),
      };
    },

    toUpdateRequest: () => {
      const { title, description, theme, area, spots } = get();
      return {
        title,
        description: description || undefined,
        theme: THEME_TO_BACKEND[theme || ""] || undefined,
        area,
        spots: spots.map((s, i) => ({
          spotId: s.spot.id,
          order: i + 1,
          suggestedTime: s.suggestedTime || undefined,
          stayDuration: s.stayDuration || undefined,
          walkingTimeToNext: s.walkingTimeToNext || undefined,
          distanceToNext: s.distanceToNext || undefined,
          transitionNote: s.transitionNote || undefined,
        })),
      };
    },
  })
);
