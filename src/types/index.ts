// 매장 관련 타입
export interface Location {
  address: string;
  coordinates: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  district?: string;
  area?: string;
}

export interface Contact {
  phone?: string;
  website?: string;
  instagram?: string;
}

export interface BusinessHours {
  [key: string]: {
    open?: string;
    close?: string;
  };
}

export interface QRCode {
  id: string;
  isActive: boolean;
}

export type StoreCategory = "cafe" | "restaurant" | "exhibition" | "hotel" | "retail" | "culture" | "other";

export interface Store {
  _id: string;
  name: string;
  category: StoreCategory;
  location: Location;
  contact?: Contact;
  businessHours?: BusinessHours;
  description?: string;
  tags?: string[];
  images?: string[];
  qrCode: QRCode;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  distance?: number; // 근처 매장 검색시 추가되는 필드
}

// 추천 관련 타입
export type RecommendationCategory = "next_meal" | "dessert" | "activity" | "shopping" | "culture" | "rest";

export interface Recommendation {
  _id: string;
  fromStore: Store;
  toStore: Store;
  category: RecommendationCategory;
  priority: number;
  distance?: number;
  walkingTime?: number;
  description?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface RecommendationResponse {
  success: boolean;
  message: string;
  data: Recommendation[];
}

// 분석 관련 타입
export interface AnalyticsEvent {
  qrCode: string;
  store?: string;
  eventType: "qr_scan" | "page_view" | "recommendation_click" | "map_click" | "store_visit";
  targetStore?: string;
  sessionId: string;
  metadata?: {
    category?: string;
    position?: number;
    duration?: number;
  };
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status?: number;
}

// 필터 타입
export interface FilterOptions {
  category?: RecommendationCategory | StoreCategory;
  limit?: number;
  area?: string;
  radius?: number;
}

// 지오코딩 관련 타입
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResponse {
  coordinates: Coordinates;
  source: string;
  address: string;
}

export interface CoordinateValidation {
  valid: boolean;
  coordinates: Coordinates;
  message: string;
}

// 통계 관련 타입
export interface CategoryStats {
  category: string;
  count: number;
}

export interface StatsResponse {
  categories: CategoryStats[];
}

// 근처 매장 검색 관련 타입
export interface NearbyStoreParams {
  lat: number;
  lng: number;
  radius?: number;
  category?: StoreCategory;
}

// 헬스 체크 타입
export interface HealthCheckResponse {
  status: string;
  message: string;
}
