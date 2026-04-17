"use client";

import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Clock,
  ArrowLeft,
  Star,
  Route,
  Eye,
  Heart,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import {
  MOCK_SPOTS,
  MOCK_SPOTLINES,
  getSpotsBySpotline,
  getSpotsByArea,
  getSpotsByCategory,
} from "@/data/mockup";
import type { MockupSpot, SpotLineSummary } from "@/types";

const THEME_CATEGORY_MAP: Record<string, { name: string; subtitle: string; category: string }> = {
  "cafe-tour": { name: "카페 투어", subtitle: "분위기 좋은 카페를 따라 걷는 하루", category: "cafe" },
  exhibition: { name: "전시 탐방", subtitle: "갤러리와 전시장을 연결하는 문화 루트", category: "exhibition" },
  "local-food": { name: "로컬 맛집", subtitle: "동네 주민이 추천하는 진짜 맛집", category: "restaurant" },
  "photo-spot": { name: "포토 스팟", subtitle: "사진 찍기 좋은 장소 모음", category: "culture" },
  shopping: { name: "쇼핑 스팟", subtitle: "감성 소품부터 빈티지까지", category: "shopping" },
  "nature-walk": { name: "산책 코스", subtitle: "자연과 함께하는 여유로운 산책", category: "nature" },
};

const AREA_INFO: Record<string, { name: string; subtitle: string }> = {
  seongsu: { name: "성수", subtitle: "크리에이티브 핫플레이스" },
  yeonnam: { name: "연남", subtitle: "감성 카페와 골목 맛집" },
  euljiro: { name: "을지로", subtitle: "레트로 감성과 힙한 공간" },
  ikseon: { name: "익선동", subtitle: "한옥 골목의 새로운 발견" },
};

function getSourceBadge(spot: MockupSpot) {
  if (spot.source === "CREW") {
    return {
      label: "⚡ SpotLine",
      name: spot.spotlineAffiliation?.curatorName || spot.author,
      className: "bg-blue-50 text-blue-700 border border-blue-200",
    };
  }
  return {
    label: "👤 유저 추천",
    name: spot.recommendedBy?.nickname || "",
    className: "bg-purple-50 text-purple-700 border border-purple-200",
  };
}

export default function MockupBSpots() {
  const searchParams = useSearchParams();
  const areaId = searchParams.get("area");
  const themeId = searchParams.get("theme");
  const spotlineId = searchParams.get("spotline");

  // Determine title, subtitle, and spots based on query
  let title = "탐색";
  let subtitle = "";
  let spots: MockupSpot[] = [];
  let spotlineInfo: SpotLineSummary | undefined;

  if (spotlineId) {
    spotlineInfo = MOCK_SPOTLINES.find((sl) => sl.id === spotlineId);
    title = spotlineInfo?.name || "SpotLine";
    subtitle = spotlineInfo?.description || "";
    spots = getSpotsBySpotline(spotlineId);
  } else if (areaId) {
    const areaInfo = AREA_INFO[areaId];
    title = areaInfo?.name || areaId;
    subtitle = areaInfo?.subtitle || "";
    spots = getSpotsByArea(title);
  } else if (themeId) {
    const themeInfo = THEME_CATEGORY_MAP[themeId];
    title = themeInfo?.name || themeId;
    subtitle = themeInfo?.subtitle || "";
    spots = themeInfo ? getSpotsByCategory(themeInfo.category) : [];
  } else {
    spots = MOCK_SPOTS;
  }

  const queryString = spotlineId
    ? `spotline=${spotlineId}`
    : areaId
    ? `area=${areaId}`
    : themeId
    ? `theme=${themeId}`
    : "";

  // Build a suggested route from first 3 spots
  const routeSpots = spots.slice(0, 3);
  const totalDistance = routeSpots.reduce((sum, s) => sum + s.distance, 0);
  const totalTime = routeSpots.reduce((sum, s) => sum + s.walkingTime, 0);

  return (
    <Layout showFooter={false}>
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="px-4 py-4">
          <Link
            href="/mockup/b"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">돌아가기</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {title}
            </h1>
            <p className="text-gray-500">{subtitle}</p>
          </div>
        </div>

        {/* SpotLine 정보 카드 (spotline 쿼리일 때) */}
        {spotlineInfo && (
          <div className="mx-4 mb-4 p-4 rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={spotlineInfo.curatorAvatar}
                alt={spotlineInfo.curatorName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {spotlineInfo.curatorName}
                </p>
                <p className="text-xs text-gray-500">{spotlineInfo.area} 지역</p>
              </div>
              <div
                className="ml-auto w-3 h-3 rounded-full"
                style={{ backgroundColor: spotlineInfo.color }}
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                {spotlineInfo.spotCount}개 스팟
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {spotlineInfo.totalLikes}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {spotlineInfo.totalVisits}
              </span>
            </div>
          </div>
        )}

        {/* 루트 제안 배너 */}
        {routeSpots.length >= 2 && (
          <div className="mx-4 mb-6 p-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Route className="h-5 w-5" />
              <span className="text-sm font-medium text-blue-200">
                추천 루트
              </span>
            </div>
            <h3 className="text-lg font-bold mb-2">
              {spotlineId
                ? `${spotlineInfo?.name} 코스`
                : areaId
                ? `${title} 탐방 코스`
                : `${title} 코스`}
            </h3>
            <div className="flex flex-wrap items-center gap-1 mb-3">
              {routeSpots.map((spot, i) => (
                <span
                  key={spot.id}
                  className="flex items-center text-sm text-blue-100"
                >
                  {spot.name}
                  {i < routeSpots.length - 1 && (
                    <span className="mx-1.5 text-blue-300">→</span>
                  )}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-blue-200">
              <span>약 {totalTime}분</span>
              <span>{(totalDistance / 1000).toFixed(1)}km</span>
            </div>
            <button className="mt-3 w-full py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
              루트 따라가기
            </button>
          </div>
        )}

        {/* 개별 Spot 리스트 */}
        <div className="px-4 mb-2">
          <h2 className="text-lg font-bold text-gray-900">
            개별 Spot
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {spots.length}개의 장소
          </p>
        </div>

        <div className="px-4 pb-16 space-y-4">
          {spots.map((spot) => {
            const badge = getSourceBadge(spot);
            return (
              <Link
                key={spot.id}
                href={`/mockup/b/spots/${spot.slug}?${queryString}`}
                className="block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {/* 이미지 */}
                  <div className="relative w-32 h-32 shrink-0 bg-gray-200">
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                          {spot.categoryLabel}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-600">
                            {spot.rating}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-0.5 truncate">
                        {spot.name}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {spot.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {spot.distance}m
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {spot.walkingTime}분
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-3 w-3" />
                          {spot.userStats.visitCount}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Heart className="h-3 w-3" />
                          {spot.userStats.likeCount}
                        </span>
                      </div>

                      {/* Recent visitors */}
                      {spot.userStats.recentVisitors.length > 0 && (
                        <div className="flex -space-x-1.5 ml-1">
                          {spot.userStats.recentVisitors
                            .slice(0, 2)
                            .map((v) => (
                              <img
                                key={v.id}
                                src={v.avatar}
                                alt={v.nickname}
                                title={v.nickname}
                                className="w-4 h-4 rounded-full border border-white object-cover"
                              />
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                      <User className="h-3 w-3" />
                      {badge.name}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {spots.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">해당하는 스팟이 없습니다</p>
            </div>
          )}
        </div>

        {/* 하단 안내 */}
        <div className="fixed bottom-0 left-0 right-0 bg-purple-50 border-t border-purple-200 px-4 py-2 text-center">
          <p className="text-xs text-purple-700">
            방향 B 목업 —{" "}
            {spotlineId
              ? "SpotLine 큐레이션"
              : areaId
              ? "지역"
              : themeId
              ? "테마"
              : "전체"}{" "}
            리스트 + 루트 제안
          </p>
        </div>
      </div>
    </Layout>
  );
}
