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
  DemoStore,
} from "@/types";

// 환경 변수에서 API 베이스 URL 가져오기
const getApiBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    console.warn("NEXT_PUBLIC_API_BASE_URL 환경 변수가 설정되지 않았습니다. 기본값을 사용합니다.");
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

    const response = await axios.get<ApiResponse<DemoExperienceResult>>(`${demoApiUrl}/experience`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "데모 체험을 시작할 수 없습니다");
  } catch (error) {
    return handleApiError(error, "데모 체험을 시작할 수 없습니다");
  }
};

// 데모 매장 정보 조회
export const getDemoStoreByQR = async (qrId: string): Promise<DemoStore> => {
  try {
    const demoApiUrl = process.env.NEXT_PUBLIC_DEMO_API_URL;
    if (!demoApiUrl) {
      throw new Error("데모 API URL이 설정되지 않았습니다.");
    }

    const response = await axios.get<ApiResponse<DemoStore>>(`${demoApiUrl}/stores/${qrId}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "데모 매장을 찾을 수 없습니다");
  } catch (error) {
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

    const response = await axios.get<ApiResponse<NextSpot[]>>(`${demoApiUrl}/next-spots/${storeId}?limit=${limit}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "데모 다음 Spot을 가져올 수 없습니다");
  } catch (error) {
    return handleApiError(error, "데모 다음 Spot을 가져올 수 없습니다");
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

// SpotLine QR 스캔 전용 매장 조회
export const getSpotlineStoreByQR = async (qrId: string): Promise<SpotlineStore> => {
  try {
    const response = await api.get(`/stores/spotline/${qrId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "매장을 찾을 수 없습니다");
  } catch (error) {
    return handleApiError(error, "매장을 찾을 수 없습니다");
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
    await api.post("/analytics/spotline-event", eventData);
  } catch (error) {
    // 분석 이벤트 실패는 사용자 경험에 영향을 주지 않도록 조용히 처리
    console.warn("SpotLine 이벤트 로깅 실패:", error);
  }
};

// 페이지 진입 이벤트 (SpotLine 전용)
export const logPageEnter = (qrId: string, storeId: string) => {
  const sessionId = generateSessionId();
  return logSpotlineEvent({
    qrCode: qrId,
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
