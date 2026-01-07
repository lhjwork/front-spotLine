"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSpotlineStoreByQR, getNextSpots, logPageEnter } from "@/lib/api";
import { getSessionId } from "@/lib/utils";
import { SpotlineStore, NextSpot } from "@/types";
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

  // 체류 시간 측정을 위한 시작 시간
  const [startTime] = useState(Date.now());

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

        // 3. 다음 Spot 조회
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
  }, [qrId]);

  // 페이지 이탈 시 체류 시간 로깅
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (store) {
        const stayDuration = Math.floor((Date.now() - startTime) / 1000);
        // 페이지 이탈 이벤트는 navigator.sendBeacon 사용 (비동기)
        const eventData = {
          qrCode: qrId,
          store: store.id,
          eventType: "page_exit" as const,
          sessionId: getSessionId(),
          metadata: { stayDuration },
        };

        navigator.sendBeacon(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analytics/spotline-event`, JSON.stringify(eventData));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [qrId, store, startTime]);

  // Spot 클릭 핸들러
  const handleSpotClick = (spot: NextSpot) => {
    // 다음 SpotLine 페이지로 이동 (QR ID가 있다고 가정)
    router.push(`/spotline/${spot.id}`);
  };

  // 로딩 상태
  if (isLoading) {
    return <PageLoading />;
  }

  // 에러 상태
  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error || "매장을 찾을 수 없습니다"} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 매장 정보 섹션 */}
      <SpotlineStoreInfo store={store} qrId={qrId} />

      {/* 다음 Spot 섹션 */}
      <NextSpotsList spots={nextSpots} qrId={qrId} storeId={store.id} isLoading={false} onSpotClick={handleSpotClick} />
    </div>
  );
}
