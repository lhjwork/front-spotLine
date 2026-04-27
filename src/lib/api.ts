import axios from "axios";
import {
  Store,
  Recommendation,
  FilterOptions,
  ApiResponse,
  NearbyStoreParams,
  GeocodeResponse,
  CoordinateValidation,
  StatsResponse,
  HealthCheckResponse,
  Coordinates,
  SpotlineStore,
  NextSpot,
  SpotlineAnalyticsEvent,
  ExperienceResult,
  ExperienceResponse,
  QRCodeId,
  DemoExperienceResult,
  DiscoverResponse,
  SpotDetailResponse,
  SpotLineDetailResponse,
  SpotLinePreview,
  PaginatedResponse,
  SocialStatus,
  SocialToggleResponse,
  ReplicateSpotLineResponse,
  MySpotLine,
  UserProfile,
  CreateSpotLineRequest,
  UpdateSpotLineRequest,
  SpotSearchParams,
  BlogDetailResponse,
  BlogResponse,
  BlogListItem,
  BlogBlockResponse,
  FollowingFeedItem,
} from "@/types";
import type {
  CreateBlogRequest,
  UpdateBlogRequest,
  SaveBlogBlocksRequest,
  NotificationItem,
  CreateSpotRequest,
  CreateSpotResponse,
  SpotStatus,
  PartnerApplicationRequest,
  PartnerApplicationResponse,
  PartnerDashboardData,
  PartnerDailyTrend,
  RecommendedSpot,
  SimilarSpotLine,
  RecommendationSource,
} from "@/types";

// 환경 변수에서 API 베이스 URL 가져오기
const getApiBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    if (process.env.NODE_ENV === "development") console.warn("NEXT_PUBLIC_API_BASE_URL 환경 변수가 설정되지 않았습니다. 기본값을 사용합니다.");
    return "http://localhost:4000";
  }

  return baseUrl;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // VERSION002: /api 경로 추가
  headers: {
    "Content-Type": "application/json",
  },
});

// 개발 환경에서 API URL 로깅
if (process.env.NODE_ENV === "development") {
  console.log("🔗 API Base URL:", API_BASE_URL);
}

// 에러 처리 헬퍼 함수
const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || defaultMessage;
    throw new Error(errorMessage);
  }
  throw new Error("네트워크 오류가 발생했습니다");
};

// ==================== SpotLine Experience API (VERSION002) ====================

// SpotLine 체험하기 API (추천)
export const getSpotlineExperience = async (): Promise<ExperienceResult> => {
  try {
    const response = await api.get<ApiResponse<ExperienceResult>>("/experience");

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "SpotLine 체험을 시작할 수 없습니다");
  } catch (error) {
    return handleApiError(error, "SpotLine 체험을 시작할 수 없습니다");
  }
};

// ==================== Demo API (VERSION002 - 데모/실제 분리) ====================

// 데모 체험하기 API (업주 소개용)
export const getDemoExperience = async (): Promise<DemoExperienceResult> => {
  try {
    const demoApiUrl = process.env.NEXT_PUBLIC_DEMO_API_URL;
    if (!demoApiUrl) {
      throw new Error("데모 API URL이 설정되지 않았습니다.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    const response = await axios.get<ApiResponse<DemoExperienceResult>>(`${demoApiUrl}/experience`, {
      signal: controller.signal,
      timeout: 10000,
    });

    clearTimeout(timeoutId);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "데모 체험을 시작할 수 없습니다");
  } catch (error) {
    if (error instanceof Error && (error.name === "AbortError" || error.message.includes("timeout"))) {
      throw new Error("데모 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.");
    }
    return handleApiError(error, "데모 체험을 시작할 수 없습니다");
  }
};

// 데모 매장 정보 조회 (동일한 SpotlineStore 타입 사용)
export const getDemoStoreByQR = async (qrId: string): Promise<SpotlineStore> => {
  try {
    const demoApiUrl = process.env.NEXT_PUBLIC_DEMO_API_URL;
    if (!demoApiUrl) {
      throw new Error("데모 API URL이 설정되지 않았습니다.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초로 단축

    const response = await axios.get<ApiResponse<SpotlineStore>>(`${demoApiUrl}/stores/${qrId}`, {
      signal: controller.signal,
      timeout: 3000,
    });

    clearTimeout(timeoutId);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "데모 매장을 찾을 수 없습니다");
  } catch (error) {
    if (error instanceof Error && (error.name === "AbortError" || error.message.includes("timeout"))) {
      throw new Error("데모 서버 응답이 지연되고 있습니다. 로컬 데이터를 사용합니다.");
    }
    return handleApiError(error, "데모 매장을 찾을 수 없습니다");
  }
};

// 데모 다음 Spot 조회
export const getDemoNextSpots = async (storeId: string, limit: number = 4): Promise<NextSpot[]> => {
  try {
    const demoApiUrl = process.env.NEXT_PUBLIC_DEMO_API_URL;
    if (!demoApiUrl) {
      throw new Error("데모 API URL이 설정되지 않았습니다.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초로 단축

    const response = await axios.get<ApiResponse<NextSpot[]>>(`${demoApiUrl}/next-spots/${storeId}?limit=${limit}`, {
      signal: controller.signal,
      timeout: 3000,
    });

    clearTimeout(timeoutId);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "데모 다음 Spot을 가져올 수 없습니다");
  } catch (error) {
    if (error instanceof Error && (error.name === "AbortError" || error.message.includes("timeout"))) {
      throw new Error("데모 서버 응답이 지연되고 있습니다. 로컬 데이터를 사용합니다.");
    }
    return handleApiError(error, "데모 다음 Spot을 가져올 수 없습니다");
  }
};

// 데모 매장 목록 조회 (새로운 API 구조)
export const getDemoStores = async (): Promise<SpotlineStore[]> => {
  try {
    const demoApiUrl = process.env.NEXT_PUBLIC_DEMO_API_URL;
    if (!demoApiUrl) {
      throw new Error("데모 API URL이 설정되지 않았습니다.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await axios.get<ApiResponse<SpotlineStore[]>>(`${demoApiUrl}/stores`, {
      signal: controller.signal,
      timeout: 5000,
    });

    clearTimeout(timeoutId);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "데모 매장 목록을 가져올 수 없습니다");
  } catch (error) {
    if (error instanceof Error && (error.name === "AbortError" || error.message.includes("timeout"))) {
      throw new Error("데모 서버 응답이 지연되고 있습니다.");
    }
    return handleApiError(error, "데모 매장 목록을 가져올 수 없습니다");
  }
};

// QR ID 또는 매장 ID로 매장 정보 조회하는 통합 함수 (새로운 API 구조)
export const getStoreInfo = async (identifier: string, isStoreId: boolean = false): Promise<{ data: SpotlineStore; isDemo?: boolean }> => {
  try {
    if (isStoreId) {
      // 매장 ID로 직접 조회
      const storeData = await getSpotlineStoreById(identifier);
      return { data: storeData };
    } else {
      // QR ID로 2단계 조회
      const qrData = await getStoreIdByQR(identifier);
      const storeData = await getSpotlineStoreById(qrData.storeId);
      return {
        data: storeData,
        isDemo: qrData.isDemo,
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("매장 정보 조회 오류:", error);
    throw error;
  }
};

// Experience 세션 시작 (고급 기능)
export const startExperienceSession = async (qrId: QRCodeId, area?: string): Promise<ExperienceResponse> => {
  try {
    const response = await api.post<ApiResponse<ExperienceResponse>>("/experience/start", {
      qrId,
      area,
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Experience 세션을 시작할 수 없습니다");
  } catch (error) {
    return handleApiError(error, "Experience 세션을 시작할 수 없습니다");
  }
};

// Experience 세션 조회
export const getExperienceSession = async (experienceId: string): Promise<ExperienceResponse> => {
  try {
    const response = await api.get<ApiResponse<ExperienceResponse>>(`/experience/${experienceId}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Experience 세션을 찾을 수 없습니다");
  } catch (error) {
    return handleApiError(error, "Experience 세션을 찾을 수 없습니다");
  }
};

// Experience 세션 완료
export const completeExperienceSession = async (experienceId: string): Promise<void> => {
  try {
    const response = await api.post<ApiResponse<void>>(`/experience/${experienceId}/complete`);

    if (!response.data.success) {
      throw new Error(response.data.message || "Experience 세션을 완료할 수 없습니다");
    }
  } catch (error) {
    return handleApiError(error, "Experience 세션을 완료할 수 없습니다");
  }
};

// ==================== Discover API (v2 — Location-Based Discovery) ====================

// v2 API client (Spring Boot backend)
const apiV2 = axios.create({
  baseURL: `${API_BASE_URL}/api/v2`,
  headers: { "Content-Type": "application/json" },
});

export const fetchDiscover = async (
  lat?: number,
  lng?: number,
  excludeSpotId?: string
): Promise<DiscoverResponse> => {
  try {
    const params = new URLSearchParams();
    if (lat != null) params.append("lat", lat.toString());
    if (lng != null) params.append("lng", lng.toString());
    if (excludeSpotId) params.append("excludeSpotId", excludeSpotId);

    const url = `/spots/discover${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiV2.get<DiscoverResponse>(url, { timeout: 5000 });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Spot 발견 정보를 가져올 수 없습니다");
  }
};

// ==================== Spot 상세 API (v2) ====================

// Spot 상세 조회 (SSR에서 사용)
export const fetchSpotDetail = async (slug: string): Promise<SpotDetailResponse | null> => {
  try {
    const response = await apiV2.get<SpotDetailResponse>(`/spots/${slug}`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    return handleApiError(error, "Spot 정보를 가져올 수 없습니다");
  }
};

// Spot에 포함된 SpotLine 목록 조회
export const fetchSpotSpotLines = async (spotId: string): Promise<SpotLinePreview[]> => {
  try {
    const response = await apiV2.get<SpotLinePreview[]>(`/spots/${spotId}/spotlines`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.warn("Spot SpotLines 조회 실패:", error);
    return [];
  }
};

// 근처 Spot 조회 (v2)
export const fetchNearbySpots = async (
  lat: number,
  lng: number,
  excludeSpotId?: string,
  limit: number = 6
): Promise<SpotDetailResponse[]> => {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      limit: limit.toString(),
    });
    if (excludeSpotId) params.append("excludeSpotId", excludeSpotId);

    const response = await apiV2.get<SpotDetailResponse[]>(`/spots/nearby?${params.toString()}`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.warn("근처 Spot 조회 실패:", error);
    return [];
  }
};

// ==================== SpotLine 상세 API (v2) ====================

// SpotLine 상세 조회 (SSR에서 사용)
export const fetchSpotLineDetail = async (slug: string): Promise<SpotLineDetailResponse | null> => {
  try {
    const response = await apiV2.get<SpotLineDetailResponse>(`/spotlines/${slug}`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    return handleApiError(error, "SpotLine 정보를 가져올 수 없습니다");
  }
};

// 인기 SpotLine 조회
export const fetchPopularSpotLines = async (area?: string, limit: number = 10): Promise<SpotLinePreview[]> => {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (area) params.append("area", area);

    const response = await apiV2.get<{ content: SpotLinePreview[] }>(`/spotlines/popular?${params.toString()}`, { timeout: 5000 });
    return response.data.content;
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.warn("인기 SpotLine 조회 실패:", error);
    return [];
  }
};

// ==================== Feed API (v2 — Paginated Lists) ====================

// Paginated Spot 목록 (Feed, City 페이지용)
export const fetchFeedSpots = async (
  area?: string,
  category?: string,
  page = 0,
  size = 20,
  sort?: string,
  keyword?: string,
  partner?: boolean,
  createdAfter?: string
): Promise<PaginatedResponse<SpotDetailResponse>> => {
  try {
    const params: Record<string, string | number | boolean> = { page, size };
    if (area) params.area = area;
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (keyword) params.keyword = keyword;
    if (partner) params.partner = true;
    if (createdAfter) params.createdAfter = createdAfter;
    const response = await apiV2.get<PaginatedResponse<SpotDetailResponse>>("/spots", { params, timeout: 5000 });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Spot 목록을 불러올 수 없습니다");
  }
};

// Paginated SpotLine 목록 (Feed, City, Theme 페이지용)
export const fetchFeedSpotLines = async (
  area?: string,
  theme?: string,
  page = 0,
  size = 10,
  keyword?: string,
  sort?: string
): Promise<PaginatedResponse<SpotLinePreview>> => {
  try {
    const params: Record<string, string | number> = { page, size };
    if (area) params.area = area;
    if (theme) params.theme = theme.replace(/-/g, "_");
    if (keyword) params.keyword = keyword;
    if (sort) params.sort = sort;
    const response = await apiV2.get<PaginatedResponse<SpotLinePreview>>("/spotlines/popular", { params, timeout: 5000 });
    return response.data;
  } catch (error) {
    return handleApiError(error, "SpotLine 목록을 불러올 수 없습니다");
  }
};

// ==================== 매장 API ====================

// 모든 매장 조회
export const getAllStores = async (options?: FilterOptions): Promise<Store[]> => {
  try {
    const params = new URLSearchParams();
    if (options?.category) params.append("category", options.category);
    if (options?.area) params.append("area", options.area);
    if (options?.limit) params.append("limit", options.limit.toString());

    const url = `/stores${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await api.get<ApiResponse<Store[]>>(url);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "매장 목록을 가져올 수 없습니다");
  } catch (error) {
    return handleApiError(error, "매장 목록을 가져올 수 없습니다");
  }
};

// QR 코드로 매장 정보 조회 (핵심 기능)
export const getStoreByQR = async (qrId: string): Promise<Store> => {
  try {
    const response = await api.get<ApiResponse<Store>>(`/stores/qr/${qrId}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "매장을 찾을 수 없습니다");
  } catch (error) {
    return handleApiError(error, "매장을 찾을 수 없습니다");
  }
};

// SpotLine QR 스캔 전용 매장 조회 (매장 ID 기반) - 새로운 API 구조
export const getSpotlineStoreById = async (storeId: string): Promise<SpotlineStore> => {
  try {
    const response = await api.get(`/stores/spotline/store/${storeId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "매장을 찾을 수 없습니다");
  } catch (error) {
    return handleApiError(error, "매장을 찾을 수 없습니다");
  }
};

// QR 코드로 매장 ID 조회 (QR → Store ID 매핑) - 새로운 API 구조
export const getStoreIdByQR = async (qrId: string): Promise<{ storeId: string; qrId: string; storeName?: string; isDemo?: boolean }> => {
  try {
    const response = await api.get(`/qr/${qrId}/store`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "QR 코드를 찾을 수 없습니다");
  } catch (error) {
    return handleApiError(error, "QR 코드를 찾을 수 없습니다");
  }
};

// QR ID → Spot slug 조회 (v2 우선, 레거시 fallback)
export interface QrSpotResolution {
  slug: string;
  spotId: string;
  source: "v2" | "legacy";
}

export const resolveQrToSpot = async (qrId: string): Promise<QrSpotResolution | null> => {
  // 1. v2 API 시도
  try {
    const response = await apiV2.get<{ slug: string; spotId: string }>(`/qr/${qrId}/spot`, { timeout: 3000 });
    if (response.data?.slug) {
      return { slug: response.data.slug, spotId: response.data.spotId, source: "v2" };
    }
  } catch {
    // v2 실패 → 레거시 fallback
  }

  // 2. 레거시 API fallback
  try {
    const legacy = await getStoreIdByQR(qrId);
    return { slug: legacy.storeId, spotId: legacy.storeId, source: "legacy" };
  } catch {
    // 모두 실패
  }

  return null;
};

// ==================== QR Scan Recording (v2 — Partner Analytics) ====================

// QR 스캔 기록 (fire-and-forget, 파트너 분석용)
export const recordQrScan = async (qrId: string, sessionId: string): Promise<void> => {
  try {
    await apiV2.post(`/qr/${qrId}/scan`, null, {
      params: { sessionId },
      timeout: 3000,
    });
  } catch {
    // fire-and-forget: 실패해도 사용자 경험에 영향 없음
  }
};

// 파트너 혜택 전환 이벤트 기록 (fire-and-forget)
export const recordPartnerEvent = async (
  qrId: string,
  eventType: "benefit_view" | "benefit_click",
  sessionId: string,
): Promise<void> => {
  try {
    await apiV2.post(`/qr/${qrId}/event`, null, {
      params: { sessionId, eventType },
      timeout: 3000,
    });
  } catch {
    // fire-and-forget: 실패해도 사용자 경험에 영향 없음
  }
};

// 근처 매장 검색
export const getNearbyStores = async (params: NearbyStoreParams): Promise<Store[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.radius) queryParams.append("radius", params.radius.toString());
    if (params.category) queryParams.append("category", params.category);

    const url = `/stores/nearby/${params.lat}/${params.lng}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await api.get<ApiResponse<Store[]>>(url);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "근처 매장을 찾을 수 없습니다");
  } catch (error) {
    return handleApiError(error, "근처 매장을 찾을 수 없습니다");
  }
};

// 특정 매장 조회
export const getStoreById = async (storeId: string): Promise<Store> => {
  try {
    const response = await api.get<ApiResponse<Store>>(`/stores/${storeId}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "매장을 찾을 수 없습니다");
  } catch (error) {
    return handleApiError(error, "매장을 찾을 수 없습니다");
  }
};

// ==================== 추천 API ====================

// QR 기반 추천 조회 (핵심 기능)
export const getRecommendationsByQR = async (qrId: string, options?: FilterOptions): Promise<Recommendation[]> => {
  try {
    const params = new URLSearchParams();
    if (options?.category) params.append("category", options.category);
    if (options?.limit) params.append("limit", options.limit.toString());

    const url = `/recommendations/qr/${qrId}${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await api.get<ApiResponse<Recommendation[]>>(url);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "추천 정보를 가져올 수 없습니다");
  } catch (error) {
    return handleApiError(error, "추천 정보를 가져올 수 없습니다");
  }
};

// 다음으로 이어지는 Spot 조회 (SpotLine 전용)
export const getNextSpots = async (storeId: string, limit: number = 4): Promise<NextSpot[]> => {
  try {
    const response = await api.get(`/recommendations/next-spots/${storeId}?limit=${limit}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "다음 Spot을 가져올 수 없습니다");
  } catch (error) {
    return handleApiError(error, "다음 Spot을 가져올 수 없습니다");
  }
};

// 매장별 추천 조회
export const getRecommendationsByStore = async (storeId: string, options?: FilterOptions): Promise<Recommendation[]> => {
  try {
    const params = new URLSearchParams();
    if (options?.category) params.append("category", options.category);

    const url = `/recommendations/store/${storeId}${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await api.get<ApiResponse<Recommendation[]>>(url);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "추천 정보를 가져올 수 없습니다");
  } catch (error) {
    return handleApiError(error, "추천 정보를 가져올 수 없습니다");
  }
};

// 카테고리별 추천 통계
export const getRecommendationStats = async (): Promise<StatsResponse> => {
  try {
    const response = await api.get<ApiResponse<StatsResponse>>("/recommendations/stats/categories");

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "통계 정보를 가져올 수 없습니다");
  } catch (error) {
    return handleApiError(error, "통계 정보를 가져올 수 없습니다");
  }
};

// ==================== 분석 API ====================

// 분석 데이터 타입 정의
interface QRAnalyticsData {
  qrId: string;
  totalScans: number;
  uniqueVisitors: number;
  averageStayTime: number;
  topNextSpots: Array<{
    spotId: string;
    spotName: string;
    clickCount: number;
  }>;
  dailyStats: Array<{
    date: string;
    scans: number;
    visitors: number;
  }>;
}

interface StoreAnalyticsData {
  storeId: string;
  storeName: string;
  totalVisits: number;
  averageStayTime: number;
  conversionRate: number;
  topSources: Array<{
    source: string;
    count: number;
  }>;
  periodStats: Array<{
    period: string;
    visits: number;
    stayTime: number;
  }>;
}

// QR 코드별 통계 조회
export const getQRAnalytics = async (qrId: string, startDate?: string, endDate?: string): Promise<QRAnalyticsData> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const url = `/analytics/qr/${qrId}${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await api.get<ApiResponse<QRAnalyticsData>>(url);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "분석 데이터를 가져올 수 없습니다");
  } catch (error) {
    return handleApiError(error, "분석 데이터를 가져올 수 없습니다");
  }
};

// 매장별 통계 조회
export const getStoreAnalytics = async (storeId: string, period?: "day" | "week" | "month"): Promise<StoreAnalyticsData> => {
  try {
    const params = new URLSearchParams();
    if (period) params.append("period", period);

    const url = `/analytics/store/${storeId}${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await api.get<ApiResponse<StoreAnalyticsData>>(url);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "분석 데이터를 가져올 수 없습니다");
  } catch (error) {
    return handleApiError(error, "분석 데이터를 가져올 수 없습니다");
  }
};

// ==================== 지오코딩 API ====================

// 통합 지오코딩
export const geocodeAddress = async (address: string): Promise<GeocodeResponse> => {
  try {
    const response = await api.get<GeocodeResponse>(`/geocoding/unified?address=${encodeURIComponent(address)}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "주소를 좌표로 변환할 수 없습니다");
  }
};

// 좌표 유효성 검증
export const validateCoordinates = async (coordinates: Coordinates): Promise<CoordinateValidation> => {
  try {
    const response = await api.post<CoordinateValidation>("/geocoding/validate", coordinates);
    return response.data;
  } catch (error) {
    return handleApiError(error, "좌표 유효성을 검증할 수 없습니다");
  }
};

// ==================== 헬스 체크 ====================

// 헬스 체크
export const healthCheck = async (): Promise<HealthCheckResponse> => {
  try {
    const response = await api.get<HealthCheckResponse>("/health");
    return response.data;
  } catch (error) {
    throw new Error("서버에 연결할 수 없습니다");
  }
};

// ==================== 유틸리티 함수 ====================

// 세션 ID 생성 (deprecated substr 제거)
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// 이벤트 로깅 헬퍼 함수들
// SpotLine 전용 이벤트 로깅 (개인 식별 데이터 최소화)
export const logSpotlineEvent = async (eventData: SpotlineAnalyticsEvent): Promise<void> => {
  try {
    // 타임아웃 설정 (5초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await api.post("/analytics/spotline-event", eventData, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch (error) {
    // 분석 이벤트 실패는 사용자 경험에 영향을 주지 않도록 조용히 처리
    if (error instanceof Error && error.name === "AbortError") {
      if (process.env.NODE_ENV === "development") console.warn("SpotLine 이벤트 로깅 타임아웃:", error);
    } else {
      if (process.env.NODE_ENV === "development") console.warn("SpotLine 이벤트 로깅 실패:", error);
    }
  }
};

// 페이지 진입 이벤트 (SpotLine 전용) - 매장 ID 기반
export const logPageEnter = (storeId: string, qrId?: string) => {
  const sessionId = generateSessionId();
  return logSpotlineEvent({
    qrCode: qrId || storeId,
    store: storeId,
    eventType: "page_enter",
    sessionId,
  });
};

// Spot 클릭 이벤트 (SpotLine 전용)
export const logSpotClick = (qrId: string, storeId: string, targetStoreId: string, position: number) => {
  const sessionId = generateSessionId();
  return logSpotlineEvent({
    qrCode: qrId,
    store: storeId,
    eventType: "spot_click",
    targetStore: targetStoreId,
    sessionId,
    metadata: {
      spotPosition: position,
      nextSpotId: targetStoreId,
    },
  });
};

// 지도 링크 클릭 이벤트 (SpotLine 전용)
export const logMapLinkClick = (qrId: string, storeId: string, targetStoreId: string) => {
  const sessionId = generateSessionId();
  return logSpotlineEvent({
    qrCode: qrId,
    store: storeId,
    eventType: "map_link_click",
    targetStore: targetStoreId,
    sessionId,
  });
};

// 외부 링크 클릭 이벤트 (SpotLine 전용)
export const logExternalLinkClick = (qrId: string, storeId: string, linkType?: string) => {
  const sessionId = generateSessionId();
  return logSpotlineEvent({
    qrCode: qrId,
    store: storeId,
    eventType: "external_link_click",
    sessionId,
    metadata: {
      linkType,
    },
  });
};

// Experience 시작 이벤트 (VERSION002)
export const logExperienceStart = (qrId: QRCodeId, storeId: string, experienceId?: string) => {
  const sessionId = generateSessionId();
  return logSpotlineEvent({
    qrCode: qrId,
    store: storeId,
    eventType: "experience_start",
    sessionId,
    experienceId,
  });
};

// Experience 완료 이벤트 (VERSION002)
export const logExperienceComplete = (qrId: QRCodeId, storeId: string, experienceId: string, completionTime: number) => {
  const sessionId = generateSessionId();
  return logSpotlineEvent({
    qrCode: qrId,
    store: storeId,
    eventType: "experience_complete",
    sessionId,
    experienceId,
    metadata: {
      completionTime,
    },
  });
};

// SpotLine 스토리 확장 이벤트 (VERSION002)
export const logStoryExpand = (qrId: QRCodeId, storeId: string, storySection?: string) => {
  const sessionId = generateSessionId();
  return logSpotlineEvent({
    qrCode: qrId,
    store: storeId,
    eventType: "story_expand",
    sessionId,
    metadata: {
      storySection,
    },
  });
};

// SpotLine 스토리 접기 이벤트 (VERSION002)
export const logStoryCollapse = (qrId: QRCodeId, storeId: string, storySection?: string) => {
  const sessionId = generateSessionId();
  return logSpotlineEvent({
    qrCode: qrId,
    store: storeId,
    eventType: "story_collapse",
    sessionId,
    metadata: {
      storySection,
    },
  });
};

// ==================== Social API (v2 — 좋아요/저장) ====================

// Auth 토큰 헬퍼 (Supabase session에서 access_token 추출)
import { useAuthStore } from "@/store/useAuthStore";
const getAuthToken = (): string => {
  const session = useAuthStore.getState().session;
  return session?.access_token || "";
};

// 좋아요 토글
export const toggleLike = async (
  type: "spot" | "spotline" | "blog",
  id: string
): Promise<SocialToggleResponse> => {
  const path = type === "blog" ? "blogs" : type === "spotline" ? "spotlines" : "spots";
  const response = await apiV2.post<SocialToggleResponse>(
    `/${path}/${id}/like`,
    {},
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return response.data;
};

// 저장 토글
export const toggleSave = async (
  type: "spot" | "spotline" | "blog",
  id: string
): Promise<SocialToggleResponse> => {
  const path = type === "blog" ? "blogs" : type === "spotline" ? "spotlines" : "spots";
  const response = await apiV2.post<SocialToggleResponse>(
    `/${path}/${id}/save`,
    {},
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return response.data;
};

// 소셜 상태 조회 (로그인 사용자)
export const fetchSocialStatus = async (
  type: "spot" | "spotline" | "blog",
  id: string
): Promise<SocialStatus> => {
  try {
    const path = type === "blog" ? "blogs" : type === "spotline" ? "spotlines" : "spots";
    const response = await apiV2.get<SocialStatus>(
      `/${path}/${id}/social`,
      { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
    );
    return response.data;
  } catch {
    return { isLiked: false, isSaved: false, isVisited: false };
  }
};

// 방문 토글 (Spot 전용)
export const toggleVisit = async (
  id: string
): Promise<SocialToggleResponse> => {
  const response = await apiV2.post<SocialToggleResponse>(
    `/spots/${id}/visit`,
    {},
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return response.data;
};

// 방문한 Spot 목록 조회
export const fetchVisitedSpots = async (
  userId: string,
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<SpotDetailResponse>> => {
  const response = await apiV2.get<PaginatedResponse<SpotDetailResponse>>(
    `/users/${userId}/visited-spots`,
    { params: { page, size }, headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 10000 }
  );
  return response.data;
};

// ==================== Checkin API (GPS 기반 체크인) ====================

export const checkinSpot = async (
  spotId: string,
  data: { latitude?: number; longitude?: number; memo?: string }
): Promise<import("@/types").CheckinResponse> => {
  const response = await apiV2.post<import("@/types").CheckinResponse>(
    `/spots/${spotId}/checkin`,
    data,
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return response.data;
};

export const fetchMyCheckins = async (
  page: number = 0,
  size: number = 20
): Promise<import("@/types").PaginatedResponse<import("@/types").CheckinListItem>> => {
  const response = await apiV2.get<import("@/types").PaginatedResponse<import("@/types").CheckinListItem>>(
    `/me/checkins`,
    { params: { page, size }, headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 10000 }
  );
  return response.data;
};

export const fetchSpotCheckins = async (
  spotId: string,
  page: number = 0,
  size: number = 20
): Promise<import("@/types").PaginatedResponse<import("@/types").CheckinListItem>> => {
  const response = await apiV2.get<import("@/types").PaginatedResponse<import("@/types").CheckinListItem>>(
    `/spots/${spotId}/checkins`,
    { params: { page, size }, timeout: 10000 }
  );
  return response.data;
};

// ==================== Replication API (v2 — SpotLine 복제/내 일정) ====================

// SpotLine 복제
export const replicateSpotLine = async (
  spotLineId: string,
  scheduledDate: string | null
): Promise<ReplicateSpotLineResponse> => {
  const response = await apiV2.post<ReplicateSpotLineResponse>(
    `/spotlines/${spotLineId}/replicate`,
    { scheduledDate },
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return response.data;
};

// 내 SpotLine 목록
export const fetchMySpotLines = async (
  status?: "scheduled" | "completed",
  page: number = 0
): Promise<{ items: MySpotLine[]; hasMore: boolean }> => {
  try {
    const params: Record<string, string | number> = { page };
    if (status) params.status = status;
    const response = await apiV2.get<{ items: MySpotLine[]; hasMore: boolean }>(
      "/users/me/spotlines",
      { params, headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
    );
    return response.data;
  } catch {
    return { items: [], hasMore: false };
  }
};

// 내 Spot 목록 조회
export const fetchMySpots = async (
  page = 0,
  size = 20
): Promise<PaginatedResponse<SpotDetailResponse>> => {
  try {
    const response = await apiV2.get<PaginatedResponse<SpotDetailResponse>>(
      "/users/me/spots",
      { params: { page, size }, headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "내 Spot을 불러올 수 없습니다");
  }
};

// 내 SpotLine 상태 변경 (완주/취소)
export const updateMySpotLineStatus = async (
  mySpotLineId: string,
  status: "completed" | "cancelled"
): Promise<MySpotLine> => {
  const response = await apiV2.patch<MySpotLine>(
    `/users/me/spotlines/${mySpotLineId}`,
    { status },
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return response.data;
};

// 내 SpotLine 날짜 수정
export const updateMySpotLineDate = async (
  mySpotLineId: string,
  scheduledDate: string | null
): Promise<MySpotLine> => {
  const response = await apiV2.patch<MySpotLine>(
    `/users/me/spotlines/${mySpotLineId}`,
    { scheduledDate },
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return response.data;
};

// 내 SpotLine 삭제
export const deleteMySpotLine = async (mySpotLineId: string): Promise<void> => {
  await apiV2.delete(`/users/me/spotlines/${mySpotLineId}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
};

// SpotLine 변형 목록
export const fetchSpotLineVariations = async (
  spotLineId: string,
  page: number = 0,
  sort: "latest" | "popular" = "latest"
): Promise<{ items: SpotLinePreview[]; hasMore: boolean }> => {
  try {
    const response = await apiV2.get<{ items: SpotLinePreview[]; hasMore: boolean }>(
      `/spotlines/${spotLineId}/variations`,
      { params: { page, sort }, timeout: 5000 }
    );
    return response.data;
  } catch {
    return { items: [], hasMore: false };
  }
};

// ==================== Follow API (v2 — 팔로우/팔로잉) ====================

// 유저 프로필 조회
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const res = await apiV2.get<UserProfile>(`/users/${userId}/profile`, { timeout: 5000 });
    return res.data;
  } catch {
    return null;
  }
};

// 팔로우
export const followUser = async (userId: string): Promise<{ followed: boolean; followersCount: number }> => {
  const res = await apiV2.post(
    `/users/${userId}/follow`,
    {},
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return res.data;
};

// 언팔로우
export const unfollowUser = async (userId: string): Promise<{ followed: boolean; followersCount: number }> => {
  const res = await apiV2.delete(
    `/users/${userId}/follow`,
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return res.data;
};

// 팔로워 목록
export const fetchFollowers = async (
  userId: string,
  page = 1,
  size = 20
): Promise<PaginatedResponse<UserProfile>> => {
  const res = await apiV2.get<PaginatedResponse<UserProfile>>(
    `/users/${userId}/followers`,
    { params: { page: page - 1, size }, timeout: 5000 }
  );
  return res.data;
};

// 팔로잉 목록
export const fetchFollowing = async (
  userId: string,
  page = 1,
  size = 20
): Promise<PaginatedResponse<UserProfile>> => {
  const res = await apiV2.get<PaginatedResponse<UserProfile>>(
    `/users/${userId}/following`,
    { params: { page: page - 1, size }, timeout: 5000 }
  );
  return res.data;
};

// 팔로잉 피드 (콘텐츠)
export const fetchFollowingFeed = async (
  page = 0,
  size = 20
): Promise<PaginatedResponse<FollowingFeedItem>> => {
  const res = await apiV2.get<PaginatedResponse<FollowingFeedItem>>(
    "/feed/following",
    { params: { page, size }, timeout: 5000 }
  );
  return res.data;
};

// 팔로우 상태 확인
export const fetchFollowStatus = async (userId: string): Promise<{ isFollowing: boolean }> => {
  try {
    const res = await apiV2.get<{ isFollowing: boolean }>(
      `/users/${userId}/follow/status`,
      { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
    );
    return res.data;
  } catch {
    return { isFollowing: false };
  }
};

// ==================== Profile Edit API (v2 — 프로필 수정) ====================

/** 내 프로필 수정 (partial update) */
export async function updateMyProfile(request: {
  nickname?: string;
  bio?: string;
  instagramId?: string;
}): Promise<UserProfile> {
  const { data } = await apiV2.put<UserProfile>("/users/me/profile", request, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
  return data;
}

/** 아바타 업로드 URL 생성 */
export async function requestAvatarUploadUrl(
  filename: string,
  contentType: string
): Promise<{ presignedUrl: string; avatarKey: string; avatarUrl: string }> {
  const { data } = await apiV2.post<{ presignedUrl: string; avatarKey: string; avatarUrl: string }>(
    "/users/me/avatar",
    { filename, contentType },
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 },
  );
  return data;
}

/** 아바타 삭제 */
export async function deleteMyAvatar(): Promise<UserProfile> {
  const { data } = await apiV2.delete<UserProfile>("/users/me/avatar", {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
  return data;
}

// 유저의 좋아요 Spot 목록 (공개 프로필용)
export const fetchUserLikedSpots = async (
  userId: string,
  page = 1,
  size = 12
): Promise<PaginatedResponse<SpotDetailResponse>> => {
  const res = await apiV2.get<PaginatedResponse<SpotDetailResponse>>(
    `/users/${userId}/likes/spots`,
    { params: { page: page - 1, size }, timeout: 5000 }
  );
  return res.data;
};

// 유저의 저장 SpotLine 목록 (공개 프로필용)
export const fetchUserSavedSpotLines = async (
  userId: string,
  page = 1,
  size = 12
): Promise<PaginatedResponse<SpotLinePreview>> => {
  const res = await apiV2.get<PaginatedResponse<SpotLinePreview>>(
    `/users/${userId}/saves/spotlines`,
    { params: { page: page - 1, size }, timeout: 5000 }
  );
  return res.data;
};

// 사용자 생성 SpotLine 목록 (공개)
export const fetchUserSpotLines = async (
  userId: string,
  page = 1,
  size = 20
): Promise<{ items: SpotLinePreview[]; hasMore: boolean }> => {
  const res = await apiV2.get<{ items: SpotLinePreview[]; hasMore: boolean }>(
    `/users/${userId}/spotlines-created`,
    { params: { page: page - 1, size }, timeout: 5000 }
  );
  return res.data;
};

// 사용자 생성 Spot 목록 (공개)
export const fetchUserSpots = async (
  userId: string,
  page = 1,
  size = 20
): Promise<{ items: SpotDetailResponse[]; hasMore: boolean }> => {
  const res = await apiV2.get<{ items: SpotDetailResponse[]; hasMore: boolean }>(
    `/users/${userId}/spots`,
    { params: { page: page - 1, size }, timeout: 5000 }
  );
  return res.data;
};

// 사용자 작성 Blog 목록 (공개)
export const fetchUserBlogs = async (
  userId: string,
  page = 1,
  size = 20
): Promise<{ items: BlogListItem[]; hasMore: boolean }> => {
  const res = await apiV2.get<{ items: BlogListItem[]; hasMore: boolean }>(
    `/users/${userId}/blogs`,
    { params: { page: page - 1, size }, timeout: 5000 }
  );
  return res.data;
};

// 내 저장 목록
export const fetchMySaves = async (
  type: "spot" | "spotline",
  page: number = 0
): Promise<{ items: SpotDetailResponse[]; hasMore: boolean }> => {
  try {
    const response = await apiV2.get<{ items: SpotDetailResponse[]; hasMore: boolean }>(
      `/users/me/saves`,
      {
        params: { type, page },
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        timeout: 5000,
      }
    );
    return response.data;
  } catch {
    return { items: [], hasMore: false };
  }
};

// ==================== Comment API ====================

import type {
  CommentResponse as CommentResponseType,
  CommentTargetType,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/types";

export async function fetchComments(
  targetType: CommentTargetType,
  targetId: string,
  page = 0,
  size = 20
): Promise<PaginatedResponse<CommentResponseType>> {
  try {
    const res = await apiV2.get<PaginatedResponse<CommentResponseType>>("/comments", {
      params: { targetType, targetId, page, size },
      timeout: 5000,
    });
    return res.data;
  } catch {
    return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, last: true, first: true };
  }
}

export async function createComment(request: CreateCommentRequest): Promise<CommentResponseType> {
  const res = await apiV2.post<CommentResponseType>("/comments", request, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
  return res.data;
}

export async function updateComment(commentId: string, request: UpdateCommentRequest): Promise<CommentResponseType> {
  const res = await apiV2.put<CommentResponseType>(`/comments/${commentId}`, request, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
  return res.data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiV2.delete(`/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
}

// ==================== Report API (v2 — 콘텐츠 신고) ====================

export async function createReport(request: {
  targetType: string;
  targetId: string;
  reason: string;
  description?: string;
}): Promise<void> {
  await apiV2.post("/reports", request, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
}

// ==================== View Count API (v2 — 조회수 증가) ====================

export async function incrementSpotView(spotId: string): Promise<void> {
  try {
    await apiV2.post(`/spots/${spotId}/view`, null, { timeout: 3000 });
  } catch {
    // fire-and-forget: 에러 무시
  }
}

export async function incrementSpotLineView(spotLineId: string): Promise<void> {
  try {
    await apiV2.post(`/spotlines/${spotLineId}/view`, null, { timeout: 3000 });
  } catch {
    // fire-and-forget: 에러 무시
  }
}

export async function incrementBlogView(blogId: string): Promise<void> {
  try {
    await apiV2.post(`/blogs/${blogId}/view`, null, { timeout: 3000 });
  } catch {
    // fire-and-forget: 에러 무시
  }
}

// ==================== Share Tracking (v2 — 공유 추적) ====================

/** 공유 이벤트 추적 (fire-and-forget) */
export async function trackShare(
  targetType: "SPOT" | "SPOTLINE",
  targetId: string,
  channel: "LINK" | "KAKAO" | "QR" | "NATIVE",
  referrerId?: string | null
): Promise<void> {
  try {
    await apiV2.post("/shares", {
      targetType,
      targetId,
      channel,
      referrerId: referrerId || undefined,
    }, { timeout: 3000 });
  } catch {
    // fire-and-forget: 에러 무시
  }
}

// ==================== Sitemap API (v2 — slug 목록) ====================

export interface SlugEntry {
  slug: string;
  updatedAt: string;
}

/** 전체 active Spot slug 목록 (sitemap용) */
export async function fetchAllSpotSlugs(): Promise<SlugEntry[]> {
  try {
    const res = await apiV2.get<SlugEntry[]>("/spots/slugs", { timeout: 10000 });
    return res.data;
  } catch {
    return [];
  }
}

/** 전체 active SpotLine slug 목록 (sitemap용) */
export async function fetchAllSpotLineSlugs(): Promise<SlugEntry[]> {
  try {
    const res = await apiV2.get<SlugEntry[]>("/spotlines/slugs", { timeout: 10000 });
    return res.data;
  } catch {
    return [];
  }
}

// ==================== User Spot Creation API ====================

/** Spot 생성 (유저용) */
export async function createSpot(
  request: CreateSpotRequest
): Promise<CreateSpotResponse> {
  const { data } = await apiV2.post<CreateSpotResponse>(
    "/spots",
    request,
    {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      timeout: 10000,
    }
  );
  return data;
}


/** Spot 수정 */
export async function updateSpot(
  slug: string,
  request: Partial<CreateSpotRequest>
): Promise<SpotDetailResponse> {
  const { data } = await apiV2.put<SpotDetailResponse>(
    `/spots/${slug}`,
    request,
    {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      timeout: 10000,
    }
  );
  return data;
}

/** Spot 삭제 */
export async function deleteSpot(slug: string): Promise<void> {
  await apiV2.delete(`/spots/${slug}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
}

// ==================== SpotLine Builder API ====================

/** SpotLine 생성 */
export async function createSpotLine(
  request: CreateSpotLineRequest
): Promise<SpotLineDetailResponse> {
  const { data } = await apiV2.post<SpotLineDetailResponse>(
    "/spotlines",
    request,
    {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      timeout: 10000,
    }
  );
  return data;
}

/** SpotLine 수정 */
export async function updateSpotLine(
  slug: string,
  request: UpdateSpotLineRequest
): Promise<SpotLineDetailResponse> {
  const { data } = await apiV2.put<SpotLineDetailResponse>(
    `/spotlines/${slug}`,
    request,
    {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      timeout: 10000,
    }
  );
  return data;
}

/** SpotLine 삭제 */
export async function deleteSpotLine(slug: string): Promise<void> {
  await apiV2.delete(`/spotlines/${slug}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
}

/** Spot 검색 (Builder용) */
export async function searchSpots(
  params: SpotSearchParams
): Promise<PaginatedResponse<SpotDetailResponse>> {
  const { data } = await apiV2.get<PaginatedResponse<SpotDetailResponse>>(
    "/spots",
    {
      params: {
        keyword: params.keyword || undefined,
        area: params.area || undefined,
        category: params.category?.toUpperCase() || undefined,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
      timeout: 5000,
    }
  );
  return data;
}

// ============================================================
// Blog API (SpotLine Blog Builder)
// ============================================================

/** 블로그 생성 (초안 + 블록 자동 생성) */
export async function createBlog(
  request: CreateBlogRequest
): Promise<BlogDetailResponse> {
  const { data } = await apiV2.post<BlogDetailResponse>("/blogs", request, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
  return data;
}

/** 블로그 상세 조회 (slug) */
export async function getBlogBySlug(
  slug: string
): Promise<BlogDetailResponse | null> {
  try {
    const token = typeof window !== "undefined" ? getAuthToken() : null;
    const { data } = await apiV2.get<BlogDetailResponse>(`/blogs/${slug}`, {
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      timeout: 5000,
    });
    return data;
  } catch {
    return null;
  }
}

/** 블로그 메타 수정 (제목, 소개, 커버) */
export async function updateBlog(
  slug: string,
  request: UpdateBlogRequest
): Promise<BlogResponse> {
  const { data } = await apiV2.put<BlogResponse>(`/blogs/${slug}`, request, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
  return data;
}

/** 블로그 삭제 (soft delete) */
export async function deleteBlog(slug: string): Promise<void> {
  await apiV2.delete(`/blogs/${slug}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
}

/** 블로그 발행 */
export async function publishBlog(slug: string): Promise<BlogResponse> {
  const { data } = await apiV2.patch<BlogResponse>(
    `/blogs/${slug}/publish`,
    null,
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return data;
}

/** 블로그 비공개 전환 */
export async function unpublishBlog(slug: string): Promise<BlogResponse> {
  const { data } = await apiV2.patch<BlogResponse>(
    `/blogs/${slug}/unpublish`,
    null,
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return data;
}

/** 공개 블로그 목록 */
export async function fetchBlogs(
  page = 0,
  size = 20,
  area?: string,
  sort?: string
): Promise<PaginatedResponse<BlogListItem>> {
  const { data } = await apiV2.get<PaginatedResponse<BlogListItem>>("/blogs", {
    params: { page, size, area: area || undefined, sort: sort || undefined },
    timeout: 5000,
  });
  return data;
}

/** 내 블로그 목록 */
export async function fetchMyBlogs(
  status?: string,
  page = 0,
  size = 20,
  sort?: string
): Promise<PaginatedResponse<BlogListItem>> {
  const { data } = await apiV2.get<PaginatedResponse<BlogListItem>>(
    "/blogs/me",
    {
      params: { status: status || undefined, page, size, sort: sort || undefined },
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      timeout: 5000,
    }
  );
  return data;
}

/** 블로그 slug 목록 (SSR/sitemap) */
export async function fetchBlogSlugs(): Promise<string[]> {
  const { data } = await apiV2.get<string[]>("/blogs/slugs", {
    timeout: 5000,
  });
  return data;
}

/** S3 Presigned URL 생성 (이미지 업로드용) */
export async function getPresignedUrl(
  filename: string,
  contentType: string,
  contentLength: number
): Promise<{ uploadUrl: string; fileUrl: string; s3Key: string }> {
  const { data } = await apiV2.post<{
    uploadUrl: string;
    s3Key: string;
    publicUrl: string;
    mediaType: string;
  }>("/media/presigned-url", { filename, contentType, contentLength }, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
  return { uploadUrl: data.uploadUrl, fileUrl: data.publicUrl, s3Key: data.s3Key };
}

/** Spot 미디어 업데이트 */
export async function updateSpotMedia(
  spotId: string,
  mediaItems: import("@/types").MediaItemRequest[]
): Promise<void> {
  await apiV2.put(`/spots/${spotId}`, { mediaItems }, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 10000,
  });
}

/** 블록 일괄 저장 (자동 저장) */
export async function saveBlogBlocks(
  blogId: string,
  request: SaveBlogBlocksRequest
): Promise<BlogBlockResponse[]> {
  const { data } = await apiV2.put<BlogBlockResponse[]>(
    `/blogs/${blogId}/blocks`,
    request,
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 10000 }
  );
  return data;
}

// ==================== Notification API ====================

export async function fetchNotifications(
  page = 0,
  size = 20
): Promise<PaginatedResponse<NotificationItem>> {
  const { data } = await apiV2.get<PaginatedResponse<NotificationItem>>(
    "/notifications",
    { params: { page, size }, headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await apiV2.get<{ count: number }>(
    "/notifications/unread-count",
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return data.count;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await apiV2.put(`/notifications/${id}/read`, null, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
}

export async function markAllNotificationsAsRead(): Promise<{ updated: number }> {
  const { data } = await apiV2.put<{ updated: number }>(
    "/notifications/read-all",
    null,
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return data;
}

export async function deleteNotification(id: string): Promise<void> {
  await apiV2.delete(`/notifications/${id}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
}

// ==================== Partner Registration & Dashboard ====================

export const submitPartnerApplication = async (
  data: PartnerApplicationRequest
): Promise<PartnerApplicationResponse> => {
  try {
    const response = await apiV2.post<PartnerApplicationResponse>(
      "/partners/apply",
      data
    );
    return response.data;
  } catch {
    console.log("[Partner Apply] 신청 데이터:", data);
    return {
      success: true,
      message: "신청이 접수되었습니다. 관리자가 확인 후 연락드리겠습니다.",
    };
  }
};

export const fetchPartnerDashboard = async (
  token: string
): Promise<PartnerDashboardData | null> => {
  try {
    const response = await apiV2.get<PartnerDashboardData>(
      "/partners/dashboard",
      { params: { token } }
    );
    return response.data;
  } catch {
    return null;
  }
};

export const fetchPartnerTrends = async (
  token: string,
  period: "7d" | "30d" | "90d"
): Promise<PartnerDailyTrend[]> => {
  try {
    const response = await apiV2.get<PartnerDailyTrend[]>(
      "/partners/trends",
      { params: { token, period } }
    );
    return response.data;
  } catch {
    return [];
  }
};

// ── 날씨 & 지금 추천 ──

import type { WeatherInfo, NowRecommendationResponse } from "@/types";

export async function getCurrentWeather(
  lat: number,
  lng: number
): Promise<WeatherInfo> {
  const res = await apiV2.get<WeatherInfo>("/weather/current", {
    params: { lat, lng },
  });
  return res.data;
}

export async function getNowRecommendations(
  lat: number,
  lng: number,
  size = 10
): Promise<NowRecommendationResponse> {
  const res = await apiV2.get<NowRecommendationResponse>("/recommendations/now", {
    params: { lat, lng, size },
  });
  return res.data;
}

// ── 추천 엔진 ──

export async function fetchRecommendedSpots(
  page = 0,
  size = 10
): Promise<PaginatedResponse<RecommendedSpot>> {
  const sessionId = generateSessionId();
  const res = await apiV2.get("/recommendations/feed", {
    params: { page, size, sessionId },
  });
  return res.data;
}

export async function fetchSimilarSpots(
  spotId: string,
  size = 6
): Promise<RecommendedSpot[]> {
  const res = await apiV2.get(`/spots/${spotId}/similar`, {
    params: { size },
  });
  return res.data;
}

export async function fetchSimilarSpotLines(
  spotlineId: string,
  size = 4
): Promise<SimilarSpotLine[]> {
  const res = await apiV2.get(`/spotlines/${spotlineId}/similar`, {
    params: { size },
  });
  return res.data;
}

export function logRecommendationEvent(
  eventType: "impression" | "click",
  source: RecommendationSource,
  itemId: string
): void {
  const sessionId = generateSessionId();
  apiV2
    .post("/recommendations/events", { eventType, source, itemId, sessionId })
    .catch(() => {});
}

// ==================== Collection API (큐레이션 컬렉션) ====================

import type { CollectionDetail, CollectionPreview } from "@/types";

export async function fetchFeaturedCollections(): Promise<CollectionPreview[]> {
  try {
    const { data } = await apiV2.get<CollectionPreview[]>("/collections/featured");
    return data;
  } catch {
    return [];
  }
}

export async function fetchCollections(params?: {
  area?: string;
  theme?: string;
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<CollectionPreview>> {
  const { data } = await apiV2.get<PaginatedResponse<CollectionPreview>>("/collections", { params });
  return data;
}

export async function fetchCollectionDetail(slug: string): Promise<CollectionDetail | null> {
  try {
    const { data } = await apiV2.get<CollectionDetail>(`/collections/${slug}`);
    return data;
  } catch {
    return null;
  }
}
