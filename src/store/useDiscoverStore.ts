import { create } from "zustand";
import type { DiscoverResponse } from "@/types";

interface DiscoverState {
  data: DiscoverResponse | null;
  setData: (data: DiscoverResponse | null) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  clearAll: () => void;
  clearError: () => void;
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  setData: (data) => set({ data }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  clearAll: () => set({ data: null, isLoading: false, error: null }),
  clearError: () => set({ error: null }),
}));
