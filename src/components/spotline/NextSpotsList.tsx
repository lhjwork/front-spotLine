"use client";

import { NextSpot } from "@/types";
import NextSpotCard from "./NextSpotCard";

const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-sm border animate-pulse">
    <div className="w-full h-40 bg-gray-200 rounded-t-lg"></div>
    <div className="p-4">
      <div className="h-5 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-1"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

interface NextSpotsListProps {
  nextSpots: NextSpot[];
  currentQrId: string;
  currentStoreId: string;
  isLoading?: boolean;
}

export default function NextSpotsList({ nextSpots, currentQrId, currentStoreId, isLoading = false }: NextSpotsListProps) {
  const handleSpotClick = (spot: NextSpot) => {
    // Spot 클릭 처리 - 새 창에서 해당 매장의 SpotLine 페이지 열기
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    window.open(`${baseUrl}/spotline/${spot.id}`, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">다음으로 이어지는 Spot</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!nextSpots || nextSpots.length === 0) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">다음으로 이어지는 Spot</h2>
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-600">현재 연결된 다음 Spot이 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 섹션 제목 */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">다음으로 이어지는 Spot</h2>

        {/* Spot 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nextSpots.slice(0, 4).map((spot, index) => (
            <NextSpotCard key={spot.id} spot={spot} qrId={currentQrId} storeId={currentStoreId} position={index} onSpotClick={handleSpotClick} />
          ))}
        </div>
      </div>
    </div>
  );
}
