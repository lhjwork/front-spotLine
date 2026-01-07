"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSpotlineStoreByQR, getNextSpots, logPageEnter, logExperienceStart } from "@/lib/api";
import { SpotlineStore, NextSpot, ExperienceSession } from "@/types";
import Layout from "@/components/layout/Layout";
import StoreImage from "@/components/store/StoreImage";
import SpotlineStoreInfo from "@/components/spotline/SpotlineStoreInfo";
import NextSpotsList from "@/components/spotline/NextSpotsList";
import MapButton from "@/components/map/MapButton";
import { PageLoading } from "@/components/common/Loading";
import { ErrorMessage } from "@/components/common/ErrorBoundary";

export default function SpotlinePage() {
  const params = useParams();
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
        console.log(`SpotLine 체류 시간: ${stayDuration}ms`);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [store, startTime]);

  if (isLoading) {
    return <PageLoading message="SpotLine 정보를 불러오는 중..." />;
  }

  if (error && !store) {
    return (
      <Layout showBackButton>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage title="매장을 찾을 수 없습니다" message={error} onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={store?.name}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Experience 세션 표시 (개발 환경에서만) */}
          {process.env.NODE_ENV === "development" && experienceSession && (
            <div className="bg-blue-100 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
              Experience 세션: {experienceSession.id} | 시작: {new Date(experienceSession.startedAt).toLocaleTimeString()}
            </div>
          )}

          {/* 매장 정보 섹션 */}
          {store && (
            <>
              {/* 매장 이미지 */}
              <StoreImage images={store.representativeImage ? [store.representativeImage] : []} storeName={store.name} className="h-64 md:h-80" />

              {/* 매장 상세 정보 */}
              <SpotlineStoreInfo store={store} qrId={qrId} />

              {/* 지도 버튼 */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <MapButton
                  store={{
                    _id: store.id,
                    name: store.name,
                    category: "other" as const,
                    location: {
                      address: store.location.address,
                      coordinates: {
                        type: "Point" as const,
                        coordinates: [127.0276, 37.4979], // 기본 좌표 (실제로는 store에서 가져와야 함)
                      },
                    },
                    qrCode: {
                      id: store.qrCode.id,
                      isActive: store.qrCode.isActive,
                    },
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }}
                  qrId={qrId}
                  storeId={store.id}
                />
              </div>
            </>
          )}

          {/* 추천 목록 섹션 */}
          <NextSpotsList nextSpots={nextSpots} currentQrId={qrId} currentStoreId={store?.id || ""} isLoading={false} />
        </div>
      </div>
    </Layout>
  );
}
