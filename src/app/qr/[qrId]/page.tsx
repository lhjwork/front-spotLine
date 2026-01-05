'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSpotlineStore } from '@/store/useSpotlineStore';
import { getStoreByQR, getRecommendationsByQR } from '@/lib/api';
import { getSessionId } from '@/lib/utils';
import { useAnalytics } from '@/components/analytics/EventTracker';
import Layout from '@/components/layout/Layout';
import StoreInfo from '@/components/store/StoreInfo';
import StoreImage from '@/components/store/StoreImage';
import RecommendationList from '@/components/recommendation/RecommendationList';
import MapButton from '@/components/map/MapButton';
import { PageLoading } from '@/components/common/Loading';
import { ErrorMessage } from '@/components/common/ErrorBoundary';
import EventTracker from '@/components/analytics/EventTracker';

export default function QRPage() {
  const params = useParams();
  const qrId = params.qrId as string;
  
  const {
    currentStore,
    recommendations,
    selectedCategory,
    isLoading,
    error,
    setCurrentStore,
    setRecommendations,
    setSelectedCategory,
    setIsLoading,
    setError,
    setSessionId,
    clearError,
  } = useSpotlineStore();

  const analytics = useAnalytics(qrId);
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
        
        // QR 스캔 이벤트 로깅
        analytics.trackQRScan();
        
        // 매장 정보와 추천 정보를 병렬로 로드
        const [storeData, recommendationData] = await Promise.all([
          getStoreByQR(qrId),
          getRecommendationsByQR(qrId),
        ]);
        
        setCurrentStore(storeData);
        setRecommendations(recommendationData);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        setInitialLoading(false);
      }
    };

    loadData();
  }, [qrId]);

  // 카테고리 변경 핸들러
  const handleCategoryChange = async (category: typeof selectedCategory) => {
    setSelectedCategory(category);
    
    if (!qrId) return;
    
    try {
      setIsLoading(true);
      const recommendationData = await getRecommendationsByQR(qrId, { category: category || undefined });
      setRecommendations(recommendationData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '추천 정보를 불러올 수 없습니다';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 지도 클릭 핸들러
  const handleMapClick = (recommendation: any) => {
    analytics.trackMapClick(recommendation.store._id);
    // 지도 버튼 컴포넌트에서 실제 지도 앱 열기는 처리됨
  };

  // 매장 상세 클릭 핸들러
  const handleStoreClick = (recommendation: any) => {
    analytics.trackRecommendationClick(
      recommendation.store._id,
      recommendation.category,
      recommendations?.recommendations.findIndex(r => r.id === recommendation.id)
    );
    
    // 매장 상세 페이지로 이동 (향후 구현)
    console.log('Store detail click:', recommendation.store);
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
          <ErrorMessage 
            title="매장을 찾을 수 없습니다"
            message={error}
            onRetry={() => window.location.reload()}
          />
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
                <StoreImage
                  images={currentStore.images}
                  storeName={currentStore.name}
                  className="h-64 md:h-80"
                />
                
                {/* 매장 상세 정보 */}
                <StoreInfo store={currentStore} />
                
                {/* 지도 버튼 */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <MapButton store={currentStore} />
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
            />
          </div>
        </div>
      </Layout>
    </EventTracker>
  );
}