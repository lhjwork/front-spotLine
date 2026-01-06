"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSpotlineStore } from "@/store/useSpotlineStore";
import { getStoreByQR, getRecommendationsByQR, logQRScan, logPageView } from "@/lib/api";
import { getSessionId } from "@/lib/utils";
import Layout from "@/components/layout/Layout";
import StoreInfo from "@/components/store/StoreInfo";
import StoreImage from "@/components/store/StoreImage";
import RecommendationList from "@/components/recommendation/RecommendationList";
import MapButton from "@/components/map/MapButton";
import { PageLoading } from "@/components/common/Loading";
import { ErrorMessage } from "@/components/common/ErrorBoundary";
import EventTracker from "@/components/analytics/EventTracker";
import { Store, Recommendation, RecommendationCategory } from "@/types";

export default function QRPage() {
  const params = useParams();
  const qrId = params.qrId as string;

  const { currentStore, recommendations, selectedCategory, isLoading, error, setCurrentStore, setRecommendations, setSelectedCategory, setIsLoading, setError, setSessionId, clearError } =
    useSpotlineStore();

  const [initialLoading, setInitialLoading] = useState(true);

  // 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      if (!qrId) return;

      try {
        setIsLoading(true);
        clearError();

        // 세션 ID 설정
        const sessionId = getSessionId();
        setSessionId(sessionId);

        // 매장 정보 로드
        const storeData = await getStoreByQR(qrId);
        setCurrentStore(storeData);

        // QR 스캔 및 페이지 뷰 이벤트 로깅
        await Promise.all([logQRScan(qrId, storeData._id), logPageView(qrId, storeData._id)]);

        // 추천 정보 로드
        const recommendationData = await getRecommendationsByQR(qrId);
        setRecommendations(recommendationData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        setInitialLoading(false);
      }
    };

    loadData();
  }, [qrId]);

  // 카테고리 변경 핸들러
  const handleCategoryChange = async (category: RecommendationCategory | null) => {
    setSelectedCategory(category);

    if (!qrId) return;

    try {
      setIsLoading(true);
      const recommendationData = await getRecommendationsByQR(qrId, {
        category: category || undefined,
      });
      setRecommendations(recommendationData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "추천 정보를 불러올 수 없습니다";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 지도 클릭 핸들러
  const handleMapClick = (recommendation: Recommendation) => {
    // 지도 클릭 이벤트 로깅은 MapButton 컴포넌트에서 처리
  };

  // 매장 상세 클릭 핸들러
  const handleStoreClick = (recommendation: Recommendation, index: number) => {
    // 추천 클릭 이벤트 로깅은 RecommendationCard 컴포넌트에서 처리
    console.log("Store detail click:", recommendation.toStore);
  };

  // 초기 로딩 중
  if (initialLoading) {
    return <PageLoading />;
  }

  // 에러 상태
  if (error && !currentStore) {
    return (
      <Layout showBackButton>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage title="매장을 찾을 수 없습니다" message={error} onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    );
  }

  return (
    <EventTracker qrCode={qrId}>
      <Layout title={currentStore?.name}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* 매장 정보 섹션 */}
            {currentStore && (
              <>
                {/* 매장 이미지 */}
                <StoreImage images={currentStore.images || []} storeName={currentStore.name} className="h-64 md:h-80" />

                {/* 매장 상세 정보 */}
                <StoreInfo store={currentStore} />

                {/* 지도 버튼 */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <MapButton store={currentStore} qrId={qrId} />
                </div>
              </>
            )}

            {/* 추천 목록 섹션 */}
            <RecommendationList
              recommendations={recommendations}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              onMapClick={handleMapClick}
              onStoreClick={handleStoreClick}
              isLoading={isLoading}
              error={error}
              qrId={qrId}
            />
          </div>
        </div>
      </Layout>
    </EventTracker>
  );
}
