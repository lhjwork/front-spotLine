"use client";

import { create } from "zustand";
import {
  toggleLike as apiToggleLike,
  toggleSave as apiToggleSave,
  toggleVisit as apiToggleVisit,
  checkinSpot as apiCheckin,
  followUser as apiFollow,
  unfollowUser as apiUnfollow,
} from "@/lib/api";
import type { SocialStatus, CheckinResponse } from "@/types";

interface SocialItem {
  liked: boolean;
  saved: boolean;
  visited: boolean;
  likesCount: number;
  savesCount: number;
  visitedCount: number;
}

interface FollowItem {
  isFollowing: boolean;
  followersCount: number;
}

interface SocialState {
  items: Record<string, SocialItem>;
  followStatus: Record<string, FollowItem>;

  initSocialStatus: (
    type: "spot" | "spotline" | "blog",
    id: string,
    status: SocialStatus,
    likesCount: number,
    savesCount: number,
    visitedCount?: number
  ) => void;
  toggleLike: (type: "spot" | "spotline" | "blog", id: string) => Promise<void>;
  toggleSave: (type: "spot" | "spotline" | "blog", id: string) => Promise<void>;
  toggleVisit: (id: string) => Promise<void>;
  checkin: (id: string, data: { latitude?: number; longitude?: number; memo?: string }) => Promise<CheckinResponse>;
  getItem: (type: "spot" | "spotline" | "blog", id: string) => SocialItem | undefined;

  batchInitSocialStatus: (
    items: Array<{ type: "spot" | "spotline" | "blog"; id: string; likesCount: number; savesCount: number; visitedCount?: number }>
  ) => void;

  initFollowStatus: (userId: string, isFollowing: boolean, followersCount: number) => void;
  toggleFollow: (userId: string) => Promise<void>;
  getFollowStatus: (userId: string) => FollowItem | undefined;
}

const makeKey = (type: "spot" | "spotline" | "blog", id: string) => `${type}:${id}`;

export const useSocialStore = create<SocialState>((set, get) => ({
  items: {},
  followStatus: {},

  initSocialStatus: (type, id, status, likesCount, savesCount, visitedCount) => {
    const key = makeKey(type, id);
    set((state) => ({
      items: {
        ...state.items,
        [key]: {
          liked: status.isLiked,
          saved: status.isSaved,
          visited: status.isVisited,
          likesCount,
          savesCount,
          visitedCount: visitedCount ?? 0,
        },
      },
    }));
  },

  toggleLike: async (type, id) => {
    const key = makeKey(type, id);
    const prev = get().items[key];
    if (!prev) return;

    // Optimistic update
    const optimistic: SocialItem = {
      ...prev,
      liked: !prev.liked,
      likesCount: prev.likesCount + (prev.liked ? -1 : 1),
    };
    set((state) => ({ items: { ...state.items, [key]: optimistic } }));

    try {
      const response = await apiToggleLike(type, id);
      // Sync with server count
      set((state) => ({
        items: {
          ...state.items,
          [key]: {
            ...state.items[key],
            liked: response.liked ?? optimistic.liked,
            likesCount: response.likesCount,
          },
        },
      }));
    } catch {
      // API 실패 시 optimistic 상태 유지 (graceful fallback)
      if (process.env.NODE_ENV === "development") console.warn(`좋아요 API 실패 (${type}:${id}) — 로컬 상태 유지`);
    }
  },

  toggleSave: async (type, id) => {
    const key = makeKey(type, id);
    const prev = get().items[key];
    if (!prev) return;

    // Optimistic update
    const optimistic: SocialItem = {
      ...prev,
      saved: !prev.saved,
      savesCount: prev.savesCount + (prev.saved ? -1 : 1),
    };
    set((state) => ({ items: { ...state.items, [key]: optimistic } }));

    try {
      const response = await apiToggleSave(type, id);
      set((state) => ({
        items: {
          ...state.items,
          [key]: {
            ...state.items[key],
            saved: response.saved ?? optimistic.saved,
            savesCount: response.savesCount,
          },
        },
      }));
    } catch {
      if (process.env.NODE_ENV === "development") console.warn(`저장 API 실패 (${type}:${id}) — 로컬 상태 유지`);
    }
  },

  toggleVisit: async (id) => {
    const key = makeKey("spot", id);
    const prev = get().items[key];
    if (!prev) return;

    const optimistic: SocialItem = {
      ...prev,
      visited: !prev.visited,
      visitedCount: prev.visitedCount + (prev.visited ? -1 : 1),
    };
    set((state) => ({ items: { ...state.items, [key]: optimistic } }));

    try {
      const response = await apiToggleVisit(id);
      set((state) => ({
        items: {
          ...state.items,
          [key]: {
            ...state.items[key],
            visited: response.visited ?? optimistic.visited,
            visitedCount: response.visitedCount,
          },
        },
      }));
    } catch {
      if (process.env.NODE_ENV === "development") console.warn(`방문 API 실패 (spot:${id}) — 로컬 상태 유지`);
    }
  },

  checkin: async (id, data) => {
    const key = makeKey("spot", id);
    const response = await apiCheckin(id, data);
    // Update store with server response
    set((state) => {
      const prev = state.items[key];
      if (!prev) return state;
      return {
        items: {
          ...state.items,
          [key]: {
            ...prev,
            visited: true,
            visitedCount: response.visitedCount,
          },
        },
      };
    });
    return response;
  },

  getItem: (type, id) => {
    return get().items[makeKey(type, id)];
  },

  batchInitSocialStatus: (items) => {
    set((state) => {
      const newItems = { ...state.items };
      for (const item of items) {
        const key = makeKey(item.type, item.id);
        if (!newItems[key]) {
          newItems[key] = {
            liked: false,
            saved: false,
            visited: false,
            likesCount: item.likesCount,
            savesCount: item.savesCount,
            visitedCount: item.visitedCount ?? 0,
          };
        }
      }
      return { items: newItems };
    });
  },

  initFollowStatus: (userId, isFollowing, followersCount) => {
    set((state) => ({
      followStatus: {
        ...state.followStatus,
        [userId]: { isFollowing, followersCount },
      },
    }));
  },

  toggleFollow: async (userId) => {
    const prev = get().followStatus[userId];
    if (!prev) return;

    // Optimistic update
    const optimistic: FollowItem = {
      isFollowing: !prev.isFollowing,
      followersCount: prev.followersCount + (prev.isFollowing ? -1 : 1),
    };
    set((state) => ({
      followStatus: { ...state.followStatus, [userId]: optimistic },
    }));

    try {
      const response = prev.isFollowing
        ? await apiUnfollow(userId)
        : await apiFollow(userId);
      set((state) => ({
        followStatus: {
          ...state.followStatus,
          [userId]: {
            isFollowing: response.followed,
            followersCount: response.followersCount,
          },
        },
      }));
    } catch {
      if (process.env.NODE_ENV === "development") console.warn(`팔로우 API 실패 (${userId}) — 로컬 상태 유지`);
    }
  },

  getFollowStatus: (userId) => {
    return get().followStatus[userId];
  },
}));
