"use client";

import { NextSpot } from "@/types";
import NextSpotCard from "./NextSpotCard";
import { SkeletonCard } from "@/components/common/Loading";

interface NextSpotsListProps {
  nextSpots: NextSpot[];
  currentQrId: string;
  currentStoreId: string;
  isLoading?: boolean;
  isDemoMode?: boolean;
}

export default function NextSpotsList({ nextSpots, currentQrId, currentStoreId, isLoading = false, isDemoMode = false }: NextSpotsListProps) {
  const handleSpotClick = (spot: NextSpot) => {
    // Spot 클릭 처리 - 새 창에서 해당 매장의 SpotLine 페이지 열기
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    window.open(`${baseUrl}/spotline/${spot.id}`, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">다음으로 이어지는 Spot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!nextSpots || nextSpots.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">다음으로 이어지는 Spot</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">현재 연결된 다음 Spot이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">다음으로 이어지는 Spot</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nextSpots.slice(0, 4).map((spot, index) => (
          <NextSpotCard key={spot.id} spot={spot} qrId={currentQrId} storeId={currentStoreId} position={index} onSpotClick={handleSpotClick} isDemoMode={isDemoMode} />
        ))}
      </div>
    </div>
  );
}
