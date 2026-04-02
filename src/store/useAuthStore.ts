import { create } from "zustand";
import type { UserProfile } from "@/types";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const PROFILE_CACHE_KEY = "spotline_user_profile";

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  setUser: (user: UserProfile) => void;
  logout: () => Promise<void>;
  initFromSupabase: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  session: null,
  isLoading: true,

  setSession: (session) => {
    if (session) {
      const cachedProfile = loadCachedProfile();
      set({
        isAuthenticated: true,
        session,
        user: cachedProfile || sessionToUserProfile(session),
      });
    } else {
      clearCachedProfile();
      set({ isAuthenticated: false, session: null, user: null });
    }
  },

  setUser: (user) => {
    saveCachedProfile(user);
    set({ user });
  },

  logout: async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    clearCachedProfile();
    set({ isAuthenticated: false, session: null, user: null });
  },

  initFromSupabase: async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    get().setSession(session);
    set({ isLoading: false });
  },
}));

function sessionToUserProfile(session: Session): UserProfile {
  const user = session.user;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    nickname: meta.full_name || meta.name || user.email?.split("@")[0] || "user",
    avatar: meta.avatar_url || meta.picture || "",
    email: user.email,
    joinedAt: user.created_at,
    stats: { visited: 0, liked: 0, recommended: 0, spotlines: 0, followers: 0, following: 0 },
  };
}

function loadCachedProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCachedProfile(user: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(user));
  } catch {}
}

function clearCachedProfile(): void {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    localStorage.removeItem("spotline_auth"); // 레거시 정리
  } catch {}
}
