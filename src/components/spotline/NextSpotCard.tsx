"use client";

import { NextSpot } from "@/types";
import { MapPin } from "lucide-react";
import { logSpotClick, logMapLinkClick } from "@/lib/api";

interface NextSpotCardProps {
  spot: NextSpot;
  qrId: string;
  storeId: string;
  position: number;
  onSpotClick: (spot: NextSpot) => void;
}

export default function NextSpotCard({ spot, qrId, storeId, position, onSpotClick }: NextSpotCardProps) {
  const handleSpotClick = () => {
    logSpotClick(qrId, storeId, spot.id, position);
    onSpotClick(spot);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    logMapLinkClick(qrId, storeId, spot.id);
    window.open(spot.mapLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer" onClick={handleSpotClick} data-testid="spot-card">
      {/* 매장 이미지 */}
      <div className="relative w-full h-32">
        <img
          src={spot.representativeImage}
          alt={spot.name}
          className="w-full h-full object-cover rounded-t-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-image.jpg";
          }}
        />
      </div>

      {/* 매장 정보 */}
      <div className="p-4">
        {/* 매장명 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{spot.name}</h3>

        {/* 한 문장 설명 */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{spot.shortDescription}</p>

        {/* 지도 링크 */}
        <button onClick={handleMapClick} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors">
          <MapPin className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
