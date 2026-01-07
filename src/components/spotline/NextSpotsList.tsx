"use client";

import { NextSpot } from "@/types";
import NextSpotCard from "./NextSpotCard";
import { PageLoading } from "@/components/common/Loading";

interface NextSpotsListProps {
  spots: NextSpot[];
  qrId: string;
  storeId: string;
  isLoading: boolean;
  onSpotClick: (spot: NextSpot) => void;
}

const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-sm border animate-pulse">
    <div className="w-full h-32 bg-gray-200 rounded-t-lg"></div>
    <div className="p-4">
      <div className="h-5 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-1"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export default function NextSpotsList({ spots, qrId, storeId, isLoading, onSpotClick }: NextSpotsListProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">다음으로 이어지는 Spot</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!spots || spots.length === 0) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">다음으로 이어지는 Spot</h2>
          <p className="text-gray-600">현재 연결된 다음 Spot이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 섹션 제목 */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">다음으로 이어지는 Spot</h2>

        {/* Spot 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spots.slice(0, 4).map((spot, index) => (
            <NextSpotCard key={spot.id} spot={spot} qrId={qrId} storeId={storeId} position={index} onSpotClick={onSpotClick} />
          ))}
        </div>
      </div>
    </div>
  );
}
