"use client";

import { Recommendation } from "@/types";
import { MapPin, Clock, Star } from "lucide-react";
import { formatDistance, formatWalkingTime, getCategoryLabel, getCategoryColor, isCurrentlyOpen } from "@/lib/utils";
import { logRecommendationClick } from "@/lib/api";
import Button from "@/components/common/Button";
import StoreImage from "@/components/store/StoreImage";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onMapClick: (recommendation: Recommendation) => void;
  onStoreClick: (recommendation: Recommendation) => void;
  qrId: string;
  index: number;
}

export default function RecommendationCard({ recommendation, onMapClick, onStoreClick, qrId, index }: RecommendationCardProps) {
  const { toStore } = recommendation;
  const isOpen = isCurrentlyOpen(toStore.businessHours);

  const handleStoreClick = () => {
    // 추천 클릭 이벤트 로깅
    logRecommendationClick(qrId, toStore._id, recommendation.category, index);
    onStoreClick(recommendation);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* 매장 이미지 */}
      <StoreImage images={toStore.images || []} storeName={toStore.name} className="h-48" />

      <div className="p-4">
        {/* 매장 기본 정보 */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{toStore.name}</h3>
            <div className="flex items-center space-x-1 ml-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-700">{recommendation.priority}/10</span>
            </div>
          </div>

          {/* 카테고리와 영업 상태 */}
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(toStore.category)}`}>{getCategoryLabel(toStore.category)}</span>
            {toStore.businessHours && <span className={`text-xs font-medium ${isOpen ? "text-green-600" : "text-red-600"}`}>{isOpen ? "영업 중" : "영업 종료"}</span>}
          </div>

          {/* 거리와 도보 시간 */}
          {(recommendation.distance || recommendation.walkingTime) && (
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              {recommendation.distance && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{formatDistance(recommendation.distance)}</span>
                </div>
              )}
              {recommendation.walkingTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatWalkingTime(recommendation.walkingTime)}</span>
                </div>
              )}
            </div>
          )}

          {/* 추천 이유 */}
          {recommendation.description && <p className="text-sm text-gray-700 line-clamp-2 mb-3">{recommendation.description}</p>}

          {/* 태그 */}
          {recommendation.tags && recommendation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {recommendation.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
              {recommendation.tags.length > 3 && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+{recommendation.tags.length - 3}</span>}
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onMapClick(recommendation)} className="flex-1">
            <MapPin className="mr-1 h-4 w-4" />
            지도 보기
          </Button>
          <Button size="sm" onClick={handleStoreClick} className="flex-1">
            자세히 보기
          </Button>
        </div>
      </div>
    </div>
  );
}
