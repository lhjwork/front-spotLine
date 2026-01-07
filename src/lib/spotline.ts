// SpotLine 체험하기 버튼 TypeScript 구현 (VERSION002)

import { useState, useCallback } from "react";
import { getSpotlineExperience, startExperienceSession, logExperienceStart } from "@/lib/api";
import { ExperienceResult, ExperienceResponse, QRCodeId } from "@/types";

// 타입 정의
export type AreaType = "gangnam" | "hongdae" | "random";

// 상수 정의
export const AVAILABLE_STORES: Record<string, QRCodeId[]> = {
  gangnam: [
    "cafe_gangnam_001", // 카페 스팟라인
    "dessert_gangnam_001", // 디저트 하우스
    "culture_gangnam_001", // 북카페 리딩룸
    "gallery_gangnam_001", // 아트 갤러리 모던
    "brunch_gangnam_001", // 브런치 스팟
  ],
  hongdae: [
    "cafe_hongdae_001", // 바이닐 카페
    "food_hongdae_001", // 스트리트 푸드 마켓
    "record_hongdae_001", // 인디 레코드샵
  ],
} as const;

export const DEFAULT_QR_CODE: QRCodeId = "cafe_gangnam_001";

// 환경별 URL 설정
const getBaseUrl = (): string => {
  // 프론트엔드 URL (현재 페이지의 origin)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // SSR 환경에서는 환경 변수 사용
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.app";
  }

  return "http://localhost:3000"; // 로컬 개발 포트
};

// 유틸리티 함수들
export const getRandomQRCode = (area?: AreaType): QRCodeId => {
  let selectedStores: QRCodeId[];

  if (!area || area === "random") {
    selectedStores = [...AVAILABLE_STORES.gangnam, ...AVAILABLE_STORES.hongdae];
  } else {
    selectedStores = AVAILABLE_STORES[area] || AVAILABLE_STORES.gangnam;
  }

  const randomIndex: number = Math.floor(Math.random() * selectedStores.length);
  return selectedStores[randomIndex] || DEFAULT_QR_CODE;
};

export const getQRCodeByArea = (area: AreaType): QRCodeId => {
  if (area === "random") {
    return getRandomQRCode();
  }

  const stores = AVAILABLE_STORES[area];
  if (!stores || stores.length === 0) {
    return DEFAULT_QR_CODE;
  }

  const randomIndex = Math.floor(Math.random() * stores.length);
  return stores[randomIndex] || DEFAULT_QR_CODE;
};

export const buildSpotlineUrl = (qrCodeId: QRCodeId): string => {
  const baseUrl: string = getBaseUrl();
  return `${baseUrl}/spotline/${qrCodeId}`;
};

// VERSION002: Experience API 기반 체험하기 (추천)
export const handleSpotlineExperience = async (): Promise<void> => {
  try {
    const experienceResult = await getSpotlineExperience();

    // Experience 시작 이벤트 로깅
    await logExperienceStart(experienceResult.qrId, experienceResult.storeId);

    // 관리자 설정에 따라 선택된 매장으로 이동
    if (experienceResult.redirectUrl) {
      window.location.href = experienceResult.redirectUrl;
    } else {
      // 폴백: 직접 SpotLine 페이지로 이동
      const baseUrl = getBaseUrl();
      window.location.href = `${baseUrl}/spotline/${experienceResult.qrId}`;
    }
  } catch (error) {
    console.error("SpotLine 체험 중 오류:", error);
    // 폴백: 기본 매장으로 이동
    const baseUrl = getBaseUrl();
    window.location.href = `${baseUrl}/spotline/${DEFAULT_QR_CODE}`;
  }
};

// 고급 기능: Experience 세션 기반 체험하기
export const handleSpotlineExperienceWithSession = async (area?: AreaType): Promise<void> => {
  try {
    const qrId = area === "random" ? getRandomQRCode() : getQRCodeByArea(area || "gangnam");
    const experienceResponse = await startExperienceSession(qrId, area);

    // Experience 시작 이벤트 로깅
    await logExperienceStart(qrId, experienceResponse.data.store.id, experienceResponse.data.experience.id);

    // Experience 세션 정보를 로컬 스토리지에 저장
    if (typeof window !== "undefined") {
      localStorage.setItem("spotline_experience", JSON.stringify(experienceResponse.data.experience));
    }

    // SpotLine 페이지로 이동
    const baseUrl = getBaseUrl();
    window.location.href = `${baseUrl}/spotline/${qrId}`;
  } catch (error) {
    console.error("SpotLine Experience 세션 시작 중 오류:", error);
    // 폴백: 기본 체험하기
    await handleSpotlineExperience();
  }
};

// 1. 기본 구현 (추천) - Experience API 사용
export const handleSpotlineExperienceBasic = (): void => {
  handleSpotlineExperience().catch((error) => {
    console.error("SpotLine 체험 실패:", error);
  });
};

// 2. 랜덤 매장 선택 구현 (로컬 로직)
export const handleSpotlineExperienceRandom = (): void => {
  const qrCodeId: QRCodeId = getRandomQRCode();
  const baseUrl: string = getBaseUrl();
  window.location.href = `${baseUrl}/spotline/${qrCodeId}`;
};

// 3. 지역별 선택 구현
export const handleSpotlineExperienceByArea = (area: AreaType = "random"): void => {
  const selectedQrId: QRCodeId = getQRCodeByArea(area);
  const baseUrl: string = getBaseUrl();
  window.location.href = `${baseUrl}/spotline/${selectedQrId}`;
};

// React Hook 구현
interface UseSpotlineExperienceReturn {
  isLoading: boolean;
  error: string | null;
  goToExperience: (area?: AreaType) => void;
  goToExperienceWithAPI: () => Promise<void>;
  getRandomStore: (area?: AreaType) => QRCodeId;
}

export const useSpotlineExperience = (): UseSpotlineExperienceReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const goToExperience = useCallback((area: AreaType = "random"): void => {
    setIsLoading(true);
    setError(null);

    try {
      handleSpotlineExperienceByArea(area);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const goToExperienceWithAPI = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await handleSpotlineExperience();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRandomStore = useCallback((area?: AreaType): QRCodeId => {
    return getRandomQRCode(area);
  }, []);

  return {
    isLoading,
    error,
    goToExperience,
    goToExperienceWithAPI,
    getRandomStore,
  };
};
