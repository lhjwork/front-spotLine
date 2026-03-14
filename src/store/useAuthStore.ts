import { create } from "zustand";
import type { UserProfile, InstagramUser } from "@/types";

const AUTH_STORAGE_KEY = "spotline_auth";

interface StoredAuthData {
  user: UserProfile;
  instagramUser: InstagramUser;
  expiresAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  instagramUser: InstagramUser | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: UserProfile, instagramUser: InstagramUser, expiresAt: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  initFromStorage: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  instagramUser: null,
  isLoading: false,
  error: null,

  setUser: (user, instagramUser, expiresAt) => {
    const data: StoredAuthData = { user, instagramUser, expiresAt };
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage 용량 초과 등 무시
    }
    set({ isAuthenticated: true, user, instagramUser, error: null });
  },

  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  logout: () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // 무시
    }
    set({
      isAuthenticated: false,
      user: null,
      instagramUser: null,
      error: null,
    });
  },

  initFromStorage: () => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;

      const data: StoredAuthData = JSON.parse(raw);

      // 만료 체크
      if (new Date(data.expiresAt) < new Date()) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }

      set({
        isAuthenticated: true,
        user: data.user,
        instagramUser: data.instagramUser,
      });
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },
}));
