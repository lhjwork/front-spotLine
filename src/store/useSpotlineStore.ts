import { create } from 'zustand';
import { Store, RecommendationResponse, CategoryType } from '@/types';

interface SpotlineState {
  // 현재 매장 정보
  currentStore: Store | null;
  setCurrentStore: (store: Store | null) => void;
  
  // 추천 정보
  recommendations: RecommendationResponse | null;
  setRecommendations: (recommendations: RecommendationResponse | null) => void;
  
  // 필터 상태
  selectedCategory: CategoryType | null;
  setSelectedCategory: (category: CategoryType | null) => void;
  
  // 로딩 상태
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // 에러 상태
  error: string | null;
  setError: (error: string | null) => void;
  
  // 세션 정보
  sessionId: string | null;
  setSessionId: (sessionId: string) => void;
  
  // 지도 상태
  isMapVisible: boolean;
  setIsMapVisible: (visible: boolean) => void;
  selectedStoreForMap: Store | null;
  setSelectedStoreForMap: (store: Store | null) => void;
  
  // 액션들
  clearAll: () => void;
  clearError: () => void;
}

export const useSpotlineStore = create<SpotlineState>((set) => ({
  // 초기 상태
  currentStore: null,
  recommendations: null,
  selectedCategory: null,
  isLoading: false,
  error: null,
  sessionId: null,
  isMapVisible: false,
  selectedStoreForMap: null,
  
  // 세터 함수들
  setCurrentStore: (store) => set({ currentStore: store }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSessionId: (sessionId) => set({ sessionId }),
  setIsMapVisible: (visible) => set({ isMapVisible: visible }),
  setSelectedStoreForMap: (store) => set({ selectedStoreForMap: store }),
  
  // 액션 함수들
  clearAll: () => set({
    currentStore: null,
    recommendations: null,
    selectedCategory: null,
    isLoading: false,
    error: null,
    isMapVisible: false,
    selectedStoreForMap: null,
  }),
  
  clearError: () => set({ error: null }),
}));