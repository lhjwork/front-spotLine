"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SpotlineStore, NextSpot } from "@/types";
import Layout from "@/components/layout/Layout";
import StoreImage from "@/components/store/StoreImage";
import SpotlineStoreInfo from "@/components/spotline/SpotlineStoreInfo";
import NextSpotsList from "@/components/spotline/NextSpotsList";
import MapButton from "@/components/map/MapButton";
import { PageLoading } from "@/components/common/Loading";
import { ErrorMessage } from "@/components/common/ErrorBoundary";
import Link from "next/link";

export default function DemoStorePage() {
  const searchParams = useSearchParams();
  const qrId = searchParams.get("qr") || "demo_cafe_001";
  
  const [store, setStore] = useState<SpotlineStore | null>(null);
  const [nextSpots, setNextSpots] = useState<NextSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데모 데이터 로딩 (백엔드 API 연동)
  useEffect(() => {
    const loadDemoData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 백엔드 데모 API 호출
        const response = await fetch('/api/demo/store');
        if (!response.ok) {
          throw new Error('데모 데이터를 가져올 수 없습니다.');
        }
        
        const result = await response.json();
        if (result.success) {
          setStore(result.data.store);
          setNextSpots(result.data.nextSpots);
        } else {
          throw new Error(result.message || '데모 데이터 로딩에 실패했습니다.');
        }
      } catch (err) {
        console.error('데모 데이터 로딩 실패:', err);
        setError(err instanceof Error ? err.message : '데모 데이터를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
        console.log("데모 모드: 통계 수집하지 않음");
      }
    };

    loadDemoData();
  }, []);

  if (isLoading) {
    return <PageLoading message="데모 매장 정보를 불러오는 중..." />;
  }

  if (error || !store) {
    return (
      <Layout showBackButton>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage 
            title="데모 매장을 찾을 수 없습니다" 
            message={error || "데모 데이터를 불러올 수 없습니다."} 
            onRetry={() => window.location.reload()} 
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${store.name} (데모)`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* 데모 모드 안내 배너 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 rounded-lg px-6 py-4">
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-2xl">🎭</span>
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-purple-900 text-lg">SpotLine 데모 체험</h3>
                <p className="text-sm text-purple-800 mt-1">
                  {store.demoNotice || "이것은 업주 소개용 데모입니다. 실제 매장 데이터가 아닌 샘플 데이터를 사용합니다."}
                </p>
              </div>
            </div>
          </div>

          {/* QR 스캔 안내 */}
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-green-600 text-lg">📱</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  <strong>QR 스캔 체험</strong> - 실제 서비스에서는 매장의 QR 코드를 스캔하여 이 페이지에 접속합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 매장 정보 섹션 */}
          <StoreImage 
            images={store.representativeImage ? [store.representativeImage] : []} 
            storeName={store.name} 
            className="h-64 md:h-80" 
          />

          {/* 매장 상세 정보 */}
          <SpotlineStoreInfo 
            store={store} 
            qrId={qrId} 
            isDemoMode={true} 
          />

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
                    coordinates: store.location.coordinates || [127.0276, 37.4979], // 기본 좌표 사용
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

          {/* 추천 목록 섹션 */}
          <NextSpotsList 
            nextSpots={nextSpots} 
            currentQrId={qrId} 
            currentStoreId={store.id} 
            isLoading={false} 
            isDemoMode={true} 
          />

          {/* 데모 체험 완료 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">🎉 데모 체험 완료!</h3>
            <p className="text-sm text-blue-800 mb-4">
              SpotLine의 핵심 기능을 체험해보셨습니다. 실제 서비스에서는 이와 동일한 방식으로 
              매장 간 자연스러운 연결을 통해 고객 경험을 확장할 수 있습니다.
            </p>
            <div className="space-y-2">
              <div className="text-sm text-blue-700">
                <p>✅ QR 코드 스캔 → 매장 정보 확인</p>
                <p>✅ 근처 추천 매장 연결</p>
                <p>✅ 지도 연동 및 외부 링크</p>
                <p>✅ SpotLine 스토리 체험</p>
              </div>
            </div>
          </div>

          {/* 실제 서비스 문의 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">실제 서비스 도입 문의</h3>
            <p className="text-sm text-gray-600 mb-4">
              데모를 체험해보시고 관심이 있으시다면, 실제 매장 데이터로 SpotLine을 시작할 수 있습니다.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>📧 이메일: contact@spotline.com</p>
              <p>📱 카카오톡: @spotline</p>
              <p>📞 전화: 02-1234-5678</p>
            </div>
          </div>

          {/* 홈으로 돌아가기 */}
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              SpotLine 홈으로 돌아가기 →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}