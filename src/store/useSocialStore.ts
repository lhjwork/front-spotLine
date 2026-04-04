"use client";

import { create } from "zustand";
import {
  toggleLike as apiToggleLike,
  toggleSave as apiToggleSave,
  followUser as apiFollow,
  unfollowUser as apiUnfollow,
} from "@/lib/api";
import type { SocialStatus } from "@/types";

interface SocialItem {
  liked: boolean;
  saved: boolean;
  likesCount: number;
  savesCount: number;
}

interface FollowItem {
  isFollowing: boolean;
  followersCount: number;
}

interface SocialState {
  items: Record<string, SocialItem>;
  followStatus: Record<string, FollowItem>;

  initSocialStatus: (
    type: "spot" | "spotline",
    id: string,
    status: SocialStatus,
    likesCount: number,
    savesCount: number
  ) => void;
  toggleLike: (type: "spot" | "spotline", id: string) => Promise<void>;
  toggleSave: (type: "spot" | "spotline", id: string) => Promise<void>;
  getItem: (type: "spot" | "spotline", id: string) => SocialItem | undefined;

  initFollowStatus: (userId: string, isFollowing: boolean, followersCount: number) => void;
  toggleFollow: (userId: string) => Promise<void>;
  getFollowStatus: (userId: string) => FollowItem | undefined;
}

const makeKey = (type: "spot" | "spotline", id: string) => `${type}:${id}`;

export const useSocialStore = create<SocialState>((set, get) => ({
  items: {},
  followStatus: {},

  initSocialStatus: (type, id, status, likesCount, savesCount) => {
    const key = makeKey(type, id);
    set((state) => ({
      items: {
        ...state.items,
        [key]: {
          liked: status.isLiked,
          saved: status.isSaved,
          likesCount,
          savesCount,
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
      console.warn(`좋아요 API 실패 (${type}:${id}) — 로컬 상태 유지`);
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
      console.warn(`저장 API 실패 (${type}:${id}) — 로컬 상태 유지`);
    }
  },

  getItem: (type, id) => {
    return get().items[makeKey(type, id)];
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
      console.warn(`팔로우 API 실패 (${userId}) — 로컬 상태 유지`);
    }
  },

  getFollowStatus: (userId) => {
    return get().followStatus[userId];
  },
}));
