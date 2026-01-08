"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getSpotlineStoreById, getDemoStoreByQR, getNextSpots, getDemoNextSpots, logPageEnter, logExperienceStart } from "@/lib/api";
import { SpotlineStore, NextSpot, ExperienceSession } from "@/types";
import Layout from "@/components/layout/Layout";
import StoreImage from "@/components/store/StoreImage";
import SpotlineStoreInfo from "@/components/spotline/SpotlineStoreInfo";
import NextSpotsList from "@/components/spotline/NextSpotsList";
import MapButton from "@/components/map/MapButton";
import { PageLoading } from "@/components/common/Loading";
import { ErrorMessage } from "@/components/common/ErrorBoundary";
import Link from "next/link";

export default function SpotlinePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = params.qrId as string; // URL에서는 storeId를 받음
  const qrId = searchParams.get("qr"); // QR 코드 ID는 쿼리 파라미터로

  const [store, setStore] = useState<SpotlineStore | null>(null);
  const [nextSpots, setNextSpots] = useState<NextSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [experienceSession, setExperienceSession] = useState<ExperienceSession | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // 체류 시간 측정을 위한 시작 시간
  const [startTime] = useState(Date.now());

  // 데모 모드 확인 (Store ID로 판단)
  useEffect(() => {
    if (storeId && storeId.startsWith("demo_")) {
      setIsDemoMode(true);
    }
  }, [storeId]);

  // Experience 세션 확인 (실제 운영 모드에서만)
  useEffect(() => {
    if (!isDemoMode && typeof window !== "undefined") {
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
  }, [isDemoMode]);

  // 데이터 로딩
  useEffect(() => {
    const loadSpotlineData = async () => {
      if (!storeId) return;

      try {
        setIsLoading(true);
        setError(null);

        let storeData: SpotlineStore;
        let spotsData: NextSpot[];

        if (isDemoMode) {
          // 데모 모드: 데모 API 사용, 통계 수집 없음
          storeData = await getDemoStoreByQR(storeId);
          spotsData = await getDemoNextSpots(storeData.id, 4);
          console.log("데모 모드: 통계 수집하지 않음");
        } else {
          // 실제 운영 모드: 실제 API 사용, 통계 수집
          storeData = await getSpotlineStoreById(storeId);

          // 페이지 진입 이벤트 로깅
          await logPageEnter(storeId, qrId || undefined);

          // Experience 시작 이벤트 로깅 (세션이 있는 경우)
          if (experienceSession) {
            await logExperienceStart(qrId || storeId, storeData.id, experienceSession.id);
          }

          spotsData = await getNextSpots(storeData.id, 4);
        }

        setStore(storeData);
        setNextSpots(spotsData);
      } catch (err) {
        console.error("SpotLine 데이터 로딩 실패:", err);
        setError(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다");
      } finally {
        setIsLoading(false);
      }
    };

    loadSpotlineData();
  }, [storeId, qrId, experienceSession, isDemoMode]);

  // 페이지 이탈 시 체류 시간 로깅 (실제 운영 모드에서만)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (store) {
        const stayDuration = Date.now() - startTime;
        if (isDemoMode) {
          console.log(`데모 체류 시간: ${stayDuration}ms (로깅하지 않음)`);
        } else {
          console.log(`SpotLine 체류 시간: ${stayDuration}ms`);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [store, startTime, isDemoMode]);

  if (isLoading) {
    return <PageLoading message={isDemoMode ? "데모 정보를 불러오는 중..." : "SpotLine 정보를 불러오는 중..."} />;
  }

  if (error && !store) {
    return (
      <Layout showBackButton>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage title={isDemoMode ? "데모 매장을 찾을 수 없습니다" : "매장을 찾을 수 없습니다"} message={error} onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={store?.name}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* 데모 모드 안내 배너 */}
          {isDemoMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <div className="flex items-center">
                <div className="shrink-0">
                  <span className="text-amber-600 text-lg">🎭</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-800">
                    <strong>데모 모드</strong> - {store?.demoNotice || "이것은 업주 소개용 데모 페이지입니다."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* QR 스캔 안내 (QR로 접근한 경우) */}
          {qrId && !isDemoMode && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <div className="flex items-center">
                <div className="shrink-0">
                  <span className="text-green-600 text-lg">📍</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    <strong>현재 방문 중인 매장</strong> - QR 코드를 통해 접속하셨습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Experience 세션 표시 (개발 환경에서만, 실제 운영 모드에서만) */}
          {process.env.NODE_ENV === "development" && !isDemoMode && experienceSession && (
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
              <SpotlineStoreInfo store={store} qrId={qrId || storeId} isDemoMode={isDemoMode} />

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
                      id: store.qrCode?.id || storeId,
                      isActive: store.qrCode?.isActive || true,
                    },
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }}
                  qrId={qrId || storeId}
                  storeId={store.id}
                />
              </div>
            </>
          )}

          {/* 추천 목록 섹션 */}
          <NextSpotsList nextSpots={nextSpots} currentQrId={qrId || storeId} currentStoreId={store?.id || ""} isLoading={false} isDemoMode={isDemoMode} />

          {/* 데모 모드 푸터 안내 */}
          {isDemoMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
              <p className="text-sm text-blue-800">실제 서비스에서는 이와 동일한 방식으로 작동하며, 실제 매장 데이터와 통계가 수집됩니다.</p>
              <div className="mt-2">
                <Link href="/" className="text-blue-600 hover:text-blue-700 underline text-sm font-medium">
                  실제 SpotLine 시작하기 →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
