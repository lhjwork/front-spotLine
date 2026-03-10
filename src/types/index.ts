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

// SpotLine VERSION002 타입 정의

// QR 코드 ID 타입 (의미있는 ID)
export type QRCodeId = string;

// Experience 관련 타입
export interface ExperienceResult {
  qrId: QRCodeId;
  storeName: string;
  storeId: string;
  area: string;
  configUsed: {
    id: string;
    name: string;
    type: string;
  };
  redirectUrl: string;
}

export interface ExperienceSession {
  id: string;
  qrId: QRCodeId;
  storeId: string;
  startedAt: string;
  completedAt?: string;
  sessionId: string;
}

export interface ExperienceResponse {
  success: boolean;
  message: string;
  data: {
    experience: ExperienceSession;
    store: SpotlineStore;
    nextSpots: NextSpot[];
  };
}

// Demo 시스템 타입 (VERSION002 - 데모/실제 분리)
export interface DemoExperienceResult {
  qrId: string;
  storeName: string;
  storeId: string;
  area: string;
  redirectUrl: string;
  isDemoMode: true;
}

// SpotLine 전용 매장 타입 (간소화) - 데모와 실제 운영 공통 사용
export interface SpotlineStore {
  id: string;
  name: string;
  shortDescription: string;
  representativeImage: string;
  category?: string;
  location: {
    address: string;
    mapLink?: string;
    coordinates?: [number, number]; // 데모용 좌표 (선택적)
  };
  externalLinks?: Array<{
    type: string;
    url: string;
    title: string;
  }>;
  spotlineStory?: string | {
    title: string;
    content: string;
    tags?: string[];
  };
  qrCode?: {
    id: string;
    isActive: boolean;
  };
  // 데모 모드 구분용 (선택적)
  isDemoMode?: boolean;
  demoNotice?: string;
}

// SpotLine 전용 다음 Spot 타입
export interface NextSpot {
  id: string;
  name: string;
  shortDescription: string;
  representativeImage: string;
  category: string;
  walkingTime: number;
  distance: number;
  mapLink?: string;
  spotlineStory?: {
    title: string;
    content: string;
  };
}

// SpotLine 전용 분석 이벤트 타입 (VERSION002 - 확장)
export interface SpotlineAnalyticsEvent {
  qrCode: QRCodeId;
  store: string;
  eventType: "page_enter" | "spot_click" | "map_link_click" | "page_exit" | "external_link_click" | "experience_start" | "experience_complete" | "story_expand" | "story_collapse";
  targetStore?: string;
  sessionId: string; // 익명 세션만
  experienceId?: string; // Experience 세션 ID
  metadata?: {
    spotPosition?: number;
    stayDuration?: number;
    nextSpotId?: string;
    completionTime?: number;
    linkType?: string;
    storySection?: string;
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

// ============================================================
// Mockup V2: SpotLine 제휴 Spot + 유저 생태계 타입
// ============================================================

// 유저 프로필
export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  bio?: string;
  joinedAt: string;
  stats: {
    visited: number;
    liked: number;
    recommended: number;
    spotlines: number; // 참여 중인 SpotLine 수
  };
}

// Spot 소스: SpotLine 제휴 vs 유저 추천
export type SpotSource = "spotline" | "user";

// 유저 활동 타입
export type UserActivityType = "visit" | "like" | "recommend";

export interface UserSpotActivity {
  id: string;
  user: UserProfile;
  spotId: string;
  type: UserActivityType;
  createdAt: string;
  review?: string;
  photos?: string[];
  helpfulCount?: number;
}

// SpotLine 제휴 정보
export interface SpotLineAffiliation {
  spotlineId: string;
  spotlineName: string;
  spotlineColor: string; // 브랜딩 컬러
  isPartner: boolean; // 공식 파트너 여부
  partnerSince?: string;
  qrCodeId?: string;
  curatorName?: string; // SpotLine 운영 크루
}

// Mockup V2 용 Spot 타입 (지도 + 유저 활동 통합)
export interface MockupSpot {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  image: string;
  images?: string[];
  distance: number;
  walkingTime: number;
  rating: number;
  tags: string[];
  area: string;
  address: string;
  lat: number;
  lng: number;

  // 소스 구분
  source: SpotSource;

  // SpotLine 제휴 정보 (source === "spotline" 일 때)
  spotlineAffiliation?: SpotLineAffiliation;

  // 유저 활동 집계
  userStats: {
    visitCount: number;
    likeCount: number;
    recommendCount: number;
    recentVisitors: Pick<UserProfile, "id" | "nickname" | "avatar">[];
  };

  // 유저가 추천한 Spot (source === "user" 일 때)
  recommendedBy?: Pick<UserProfile, "id" | "nickname" | "avatar">;

  // 크루 정보 (source === "spotline" 일 때)
  author?: string;
}

// SpotLine 요약 (목록 표시용)
export interface SpotLineSummary {
  id: string;
  name: string;
  description: string;
  color: string;
  curatorName: string;
  curatorAvatar: string;
  spotCount: number;
  totalLikes: number;
  totalVisits: number;
  area: string;
  coverImage: string;
}
