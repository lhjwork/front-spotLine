"use client";

import { NextSpot } from "@/types";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { logSpotClick, logMapLinkClick } from "@/lib/api";

interface NextSpotCardProps {
  spot: NextSpot;
  qrId: string;
  storeId: string;
  position: number;
  onSpotClick: (spot: NextSpot) => void;
  isDemo?: boolean;
}

export default function NextSpotCard({ spot, qrId, storeId, position, onSpotClick, isDemo = false }: NextSpotCardProps) {
  const handleSpotClick = () => {
    logSpotClick(qrId, storeId, spot.id, position);
    onSpotClick(spot);
  };

  const handleMapClick = (mapType: "kakao" | "google" | "naver", e: React.MouseEvent) => {
    e.stopPropagation();
    logMapLinkClick(qrId, storeId, spot.id);

    let url = "";
    switch (mapType) {
      case "kakao":
        url = `https://map.kakao.com/link/search/${encodeURIComponent(spot.name)}`;
        break;
      case "google":
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}`;
        break;
      case "naver":
        url = `https://map.naver.com/v5/search/${encodeURIComponent(spot.name)}`;
        break;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* 이미지 */}
      <div className="relative h-40">
        <img src={spot.representativeImage} alt={spot.name} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">{spot.category}</span>
        </div>
      </div>

      {/* 내용 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{spot.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{spot.shortDescription}</p>

        {/* 거리 및 시간 정보 */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{spot.distance}m</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>도보 {spot.walkingTime}분</span>
          </div>
        </div>

        {/* 지도 버튼들 */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">지도에서 보기</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={(e) => handleMapClick("kakao", e)}
              className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-yellow-50 text-yellow-700 rounded text-xs hover:bg-yellow-100 transition-colors"
            >
              <span>카카오</span>
              <ExternalLink className="h-3 w-3" />
            </button>

            <button
              onClick={(e) => handleMapClick("google", e)}
              className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
            >
              <span>구글</span>
              <ExternalLink className="h-3 w-3" />
            </button>

            <button
              onClick={(e) => handleMapClick("naver", e)}
              className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100 transition-colors"
            >
              <span>네이버</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* 자세히 보기 버튼 */}
        <button onClick={handleSpotClick} className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          자세히 보기
        </button>
      </div>
    </div>
  );
}
