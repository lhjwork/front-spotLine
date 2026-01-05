// 매장 관련 타입
export interface Location {
  address: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  district: string;
  area: string;
}

export interface Contact {
  phone?: string;
  website?: string;
  instagram?: string;
}

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
  };
}

export interface QRCode {
  id: string;
  isActive: boolean;
}

export interface Store {
  _id: string;
  name: string;
  category: string;
  location: Location;
  contact: Contact;
  businessHours: BusinessHours;
  description: string;
  tags: string[];
  images: string[];
  qrCode: QRCode;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 추천 관련 타입
export interface Recommendation {
  id: string;
  store: Store;
  category: string;
  priority: number;
  distance: number;
  walkingTime: number;
  description: string;
  tags: string[];
}

export interface RecommendationResponse {
  currentStore: {
    id: string;
    name: string;
    category: string;
    location: Location;
  };
  recommendations: Recommendation[];
}

// 분석 관련 타입
export interface AnalyticsEvent {
  qrCode: string;
  eventType: 'qr_scan' | 'page_view' | 'recommendation_click' | 'map_click' | 'store_visit';
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
  data?: T;
  error?: string;
  details?: string;
}

// 카테고리 타입
export type CategoryType = 'next_meal' | 'dessert' | 'activity' | 'shopping' | 'culture' | 'rest';

// 필터 타입
export interface FilterOptions {
  category?: CategoryType;
  limit?: number;
}