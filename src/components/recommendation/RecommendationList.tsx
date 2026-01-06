"use client";

import { Recommendation, RecommendationCategory } from "@/types";
import { SkeletonCard } from "@/components/common/Loading";
import { ErrorMessage } from "@/components/common/ErrorBoundary";
import RecommendationCard from "./RecommendationCard";
import CategoryFilter from "./CategoryFilter";
import { useMemo } from "react";

interface RecommendationListProps {
  recommendations: Recommendation[] | null;
  selectedCategory: RecommendationCategory | null;
  onCategoryChange: (category: RecommendationCategory | null) => void;
  onMapClick: (recommendation: Recommendation) => void;
  onStoreClick: (recommendation: Recommendation, index: number) => void;
  isLoading?: boolean;
  error?: string | null;
  qrId: string;
}

export default function RecommendationList({ recommendations, selectedCategory, onCategoryChange, onMapClick, onStoreClick, isLoading = false, error = null, qrId }: RecommendationListProps) {
  // 카테고리 필터링된 추천 목록
  const filteredRecommendations = useMemo(() => {
    if (!recommendations) return [];

    if (!selectedCategory) {
      return recommendations;
    }

    return recommendations.filter((rec) => rec.category === selectedCategory);
  }, [recommendations, selectedCategory]);

  if (error) {
    return (
      <div className="space-y-6">
        <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={onCategoryChange} />
        <ErrorMessage title="추천 정보를 불러올 수 없습니다" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 카테고리 필터 */}
      <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={onCategoryChange} />

      {/* 추천 목록 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">다음에 가기 좋은 곳</h2>
            <p className="text-sm text-gray-600 mt-1">현재 위치에서 추천하는 장소들입니다</p>
          </div>
          {!isLoading && filteredRecommendations.length > 0 && <div className="text-sm text-gray-500">{filteredRecommendations.length}개 장소</div>}
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}

      {/* 추천 목록 */}
      {!isLoading && filteredRecommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecommendations.map((recommendation, index) => (
            <RecommendationCard key={recommendation._id} recommendation={recommendation} onMapClick={onMapClick} onStoreClick={(rec) => onStoreClick(rec, index)} qrId={qrId} index={index} />
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && !error && filteredRecommendations.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedCategory ? "해당 카테고리의 추천이 없습니다" : "추천 장소가 없습니다"}</h3>
          <p className="text-gray-600 mb-4">{selectedCategory ? "다른 카테고리를 선택해보세요" : "현재 이 매장에서 추천할 수 있는 장소가 없습니다"}</p>
          {selectedCategory && (
            <button onClick={() => onCategoryChange(null)} className="text-blue-600 hover:text-blue-700 font-medium">
              전체 카테고리 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
