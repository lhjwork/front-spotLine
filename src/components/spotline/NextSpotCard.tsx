"use client";

import { NextSpot } from "@/types";
import { MapPin, Clock } from "lucide-react";
import { logSpotClick, logMapLinkClick } from "@/lib/api";

interface NextSpotCardProps {
  spot: NextSpot;
  qrId: string;
  storeId: string;
  position: number;
  onSpotClick: (spot: NextSpot) => void;
  isDemoMode?: boolean;
}

export default function NextSpotCard({ spot, qrId, storeId, position, onSpotClick, isDemoMode = false }: NextSpotCardProps) {
  const handleSpotClick = () => {
    if (!isDemoMode) {
      // 실제 운영에서만 통계 수집
      logSpotClick(qrId, storeId, spot.id, position);
    } else {
      console.log(`데모 Spot 클릭: ${spot.name} (통계 수집하지 않음)`);
    }
    onSpotClick(spot);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDemoMode) {
      // 실제 운영에서만 통계 수집
      logMapLinkClick(qrId, storeId, spot.id);
    } else {
      console.log(`데모 지도 클릭: ${spot.name} (통계 수집하지 않음)`);
    }
    window.open(spot.mapLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div onClick={handleSpotClick} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
      {/* 매장 이미지 */}
      <div className="relative h-48">
        {spot.representativeImage ? (
          <img src={spot.representativeImage} alt={spot.name} className="w-full h-full object-cover rounded-t-lg" />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded-t-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">이미지가 없습니다</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* 매장 기본 정보 */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{spot.name}</h3>

          {/* 거리와 도보 시간 */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{spot.distance}m</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>도보 {spot.walkingTime}분</span>
            </div>
          </div>

          {/* 설명 */}
          <p className="text-sm text-gray-700 line-clamp-2">{spot.shortDescription}</p>
        </div>

        {/* 지도 보기 버튼 */}
        <button
          onClick={handleMapClick}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <MapPin className="h-4 w-4" />
          <span>지도에서 보기</span>
        </button>
      </div>
    </div>
  );
}
