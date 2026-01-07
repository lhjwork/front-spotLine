"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSpotlineStoreByQR, getDemoStoreByQR, getNextSpots, getDemoNextSpots, logPageEnter, logExperienceStart } from "@/lib/api";
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
  const [isDemoMode, setIsDemoMode] = useState(false);

  // 체류 시간 측정을 위한 시작 시간
  const [startTime] = useState(Date.now());

  // 데모 모드 확인 (QR ID로 판단)
  useEffect(() => {
    if (qrId && qrId.startsWith("demo_")) {
      setIsDemoMode(true);
    }
  }, [qrId]);

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
      if (!qrId) return;

      try {
        setIsLoading(true);
        setError(null);

        let storeData: SpotlineStore;
        let spotsData: NextSpot[];

        if (isDemoMode) {
          // 데모 모드: 로컬 데이터 우선 사용
          console.log("데모 모드: 로컬 데이터 사용");
          
          // 로컬 폴백 데이터 즉시 사용 (API 호출 없음)
          storeData = {
            id: "demo_cafe_001",
            name: "데모 카페",
            category: "카페",
            description: "SpotLine 데모용 카페입니다. 실제 매장이 아닌 서비스 소개용 샘플 데이터입니다.",
            location: {
              address: "서울시 강남구 테헤란로 123",
              coordinates: {
                lat: 37.4979,
                lng: 127.0276
              }
            },
            representativeImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
            qrCode: {
              id: qrId,
              isActive: true
            },
            spotlineStory: {
              title: "편안한 분위기의 데모 카페",
              content: "이곳은 SpotLine 서비스 데모를 위한 샘플 카페입니다. 실제 서비스에서는 진짜 매장 정보가 표시됩니다.",
              highlights: ["무료 WiFi", "조용한 분위기", "맛있는 커피"]
            },
            externalLinks: {
              instagram: "https://instagram.com/demo_cafe",
              website: "https://demo-cafe.com"
            },
            demoNotice: "이것은 서비스 소개용 데모 데이터입니다."
          };

          spotsData = [
            {
              id: "demo_restaurant_001",
              name: "데모 레스토랑",
              category: "음식점",
              description: "데모용 레스토랑입니다.",
              distance: 150,
              walkingTime: 2,
              representativeImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
              qrCode: {
                id: "demo_restaurant_001",
                isActive: true
              },
              location: {
                address: "서울시 강남구 테헤란로 456",
                coordinates: { lat: 37.4985, lng: 127.0285 }
              }
            },
            {
              id: "demo_bookstore_001", 
              name: "데모 서점",
              category: "서점",
              description: "데모용 서점입니다.",
              distance: 200,
              walkingTime: 3,
              representativeImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
              qrCode: {
                id: "demo_bookstore_001",
                isActive: true
              },
              location: {
                address: "서울시 강남구 테헤란로 789",
                coordinates: { lat: 37.4975, lng: 127.0290 }
              }
            },
            {
              id: "demo_bakery_001",
              name: "데모 베이커리",
              category: "베이커리",
              description: "데모용 베이커리입니다.",
              distance: 300,
              walkingTime: 4,
              representativeImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
              qrCode: {
                id: "demo_bakery_001",
                isActive: true
              },
              location: {
                address: "서울시 강남구 테헤란로 321",
                coordinates: { lat: 37.4970, lng: 127.0295 }
              }
            }
          ];

          // 백그라운드에서 실제 데모 API 시도 (실패해도 무시)
          Promise.all([
            getDemoStoreByQR(qrId).then(apiStore => {
              console.log("데모 API 성공, 데이터 업데이트:", apiStore);
              setStore(apiStore);
            }).catch(err => console.log("데모 API 실패 (무시):", err)),
            
            getDemoNextSpots(storeData.id, 4).then(apiSpots => {
              console.log("데모 API 성공, 추천 목록 업데이트:", apiSpots);
              setNextSpots(apiSpots);
            }).catch(err => console.log("데모 API 실패 (무시):", err))
          ]);
        } else {
          // 실제 운영 모드: 실제 API 사용, 통계 수집
          storeData = await getSpotlineStoreByQR(qrId);
          spotsData = await getNextSpots(storeData.id, 4);

          // 백그라운드에서 비동기로 이벤트 로깅 (UI 블로킹 방지)
          Promise.all([
            logPageEnter(qrId, storeData.id).catch(err => 
              console.warn("페이지 진입 이벤트 로깅 실패:", err)
            ),
            experienceSession ? 
              logExperienceStart(qrId, storeData.id, experienceSession.id).catch(err => 
                console.warn("Experience 시작 이벤트 로깅 실패:", err)
              ) : 
              Promise.resolve()
          ]);
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
  }, [qrId, experienceSession, isDemoMode]);

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
    return (
      <PageLoading 
        message={isDemoMode ? "데모 매장 정보를 불러오는 중..." : "SpotLine 정보를 불러오는 중..."} 
        subMessage={isDemoMode ? "데모 데이터를 준비하고 있습니다" : "매장 정보와 추천 목록을 가져오고 있습니다"}
        showProgress={true}
      />
    );
  }

  if (error && !store) {
    const isTimeoutError = error.includes("지연") || error.includes("timeout");
    const errorTitle = isDemoMode ? "데모 매장을 불러올 수 없습니다" : "매장을 찾을 수 없습니다";
    const errorMessage = isTimeoutError 
      ? "서버 응답이 지연되고 있습니다. 네트워크 상태를 확인하고 다시 시도해주세요."
      : error;

    return (
      <Layout showBackButton>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage 
            title={errorTitle} 
            message={errorMessage} 
            onRetry={() => window.location.reload()} 
          />
          {isDemoMode && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">데모 서버에 일시적인 문제가 있을 수 있습니다.</p>
              <Link href="/demo" className="text-blue-600 hover:text-blue-700 underline">
                데모 페이지로 돌아가기
              </Link>
            </div>
          )}
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
              <SpotlineStoreInfo store={store} qrId={qrId} isDemoMode={isDemoMode} />

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
                      id: store.qrCode?.id || qrId,
                      isActive: store.qrCode?.isActive || true,
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
          <NextSpotsList nextSpots={nextSpots} currentQrId={qrId} currentStoreId={store?.id || ""} isLoading={false} isDemoMode={isDemoMode} />

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
