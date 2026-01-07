"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSpotlineStoreByQR, getNextSpots, logPageEnter, logExperienceStart } from "@/lib/api";
import { SpotlineStore, NextSpot, ExperienceSession } from "@/types";
import SpotlineStoreInfo from "@/components/spotline/SpotlineStoreInfo";
import NextSpotsList from "@/components/spotline/NextSpotsList";
import { PageLoading } from "@/components/common/Loading";
import { ErrorMessage } from "@/components/common/ErrorBoundary";

export default function SpotlinePage() {
  const params = useParams();
  const router = useRouter();
  const qrId = params.qrId as string;

  const [store, setStore] = useState<SpotlineStore | null>(null);
  const [nextSpots, setNextSpots] = useState<NextSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [experienceSession, setExperienceSession] = useState<ExperienceSession | null>(null);

  // 체류 시간 측정을 위한 시작 시간
  const [startTime] = useState(Date.now());

  // Experience 세션 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedExperience = localStorage.getItem("spotline_experience");
      if (savedExperience) {
        try {
          const experience = JSON.parse(savedExperience) as ExperienceSession;
          setExperienceSession(experience);
        } catch (error) {
          console.warn("Experience 세션 파싱 실패:", error);
        }
      }
    }
  }, []);

  // 데이터 로딩
  useEffect(() => {
    const loadSpotlineData = async () => {
      if (!qrId) return;

      try {
        setIsLoading(true);
        setError(null);

        // 1. SpotLine 매장 정보 조회
        const storeData = await getSpotlineStoreByQR(qrId);
        setStore(storeData);

        // 2. 페이지 진입 이벤트 로깅
        await logPageEnter(qrId, storeData.id);

        // 3. Experience 시작 이벤트 로깅 (세션이 있는 경우)
        if (experienceSession) {
          await logExperienceStart(qrId, storeData.id, experienceSession.id);
        }

        // 4. 다음 Spot 조회
        const spotsData = await getNextSpots(storeData.id, 4);
        setNextSpots(spotsData);
      } catch (err) {
        console.error("SpotLine 데이터 로딩 실패:", err);
        setError(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다");
      } finally {
        setIsLoading(false);
      }
    };

    loadSpotlineData();
  }, [qrId, experienceSession]);

  // 페이지 이탈 시 체류 시간 로깅
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (store) {
        const stayDuration = Date.now() - startTime;
        // 비동기 로깅은 페이지 이탈 시 완료되지 않을 수 있으므로 navigator.sendBeacon 사용 권장
        // 여기서는 간단히 로그만 남김
        console.log(`SpotLine 체류 시간: ${stayDuration}ms`);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [store, startTime]);

  if (isLoading) {
    return <PageLoading message="SpotLine 정보를 불러오는 중..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message="매장 정보를 찾을 수 없습니다" onRetry={() => router.push("/")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Experience 세션 표시 (개발 환경에서만) */}
      {process.env.NODE_ENV === "development" && experienceSession && (
        <div className="bg-blue-100 border-b border-blue-200 px-4 py-2 text-sm text-blue-800">
          Experience 세션: {experienceSession.id} | 시작: {new Date(experienceSession.startedAt).toLocaleTimeString()}
        </div>
      )}

      {/* 매장 정보 섹션 */}
      <SpotlineStoreInfo store={store} qrId={qrId} />

      {/* 다음 Spot 섹션 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <NextSpotsList nextSpots={nextSpots} currentQrId={qrId} currentStoreId={store.id} />
      </div>

      {/* SpotLine 브랜딩 푸터 */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            이 경험은 <span className="font-semibold text-blue-600">SpotLine</span>이 큐레이션했습니다
          </p>
          <p className="text-xs text-gray-400 mt-1">다음에 가기 좋은 곳을 찾는 새로운 방법</p>
        </div>
      </footer>
    </div>
  );
}
