"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Heart,
  Star,
  CheckCircle2,
  Circle,
  Navigation,
  Share2,
  Zap,
  Trophy,
  Eye,
  ThumbsUp,
  User,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import {
  MOCK_SPOTLINES,
  MOCK_SPOTS,
  MOCK_USERS,
  getSpotsBySpotline,
} from "@/data/mockup";
import type { MockupSpot, SpotLineSummary } from "@/types";

// ── 루트 Spot (표시용) ──
interface RouteSpot {
  id: string;
  name: string;
  category: string;
  address: string;
  image: string;
  rating: number;
  description: string;
  distance: string;
  walkingTime: string;
  source: "spotline" | "user";
  spotlineName?: string;
  userStats: {
    visitCount: number;
    likeCount: number;
    recommendCount: number;
  };
}

interface RouteDetail {
  id: string;
  name: string;
  description: string;
  source: "spotline" | "user";
  spotlineName?: string;
  authorName: string;
  authorAvatar: string;
  area: string;
  totalDistance: string;
  totalTime: string;
  completionCount: number;
  likeCount: number;
  coverImage: string;
  spots: RouteSpot[];
}

// ── 헬퍼: MockupSpot → RouteSpot 변환 ──
function toRouteSpot(
  spot: MockupSpot,
  index: number,
  prevSpot?: MockupSpot
): RouteSpot {
  return {
    id: spot.id,
    name: spot.name,
    category: spot.categoryLabel,
    address: spot.address,
    image: spot.image,
    rating: spot.rating,
    description: spot.description,
    distance: index === 0 ? "출발" : `${spot.distance}m`,
    walkingTime: index === 0 ? "" : `${spot.walkingTime}분`,
    source: spot.source,
    spotlineName: spot.spotlineAffiliation?.spotlineName,
    userStats: {
      visitCount: spot.userStats.visitCount,
      likeCount: spot.userStats.likeCount,
      recommendCount: spot.userStats.recommendCount,
    },
  };
}

// ── SpotLine 기반 루트 상세 생성 ──
function buildSpotlineRoute(sl: SpotLineSummary): RouteDetail {
  const spots = getSpotsBySpotline(sl.id);
  const totalDistance = spots.reduce((sum, s) => sum + s.distance, 0);
  const totalWalkingTime = spots.reduce((sum, s) => sum + s.walkingTime, 0);
  const totalLikes = spots.reduce(
    (sum, s) => sum + s.userStats.likeCount,
    0
  );
  const totalVisits = spots.reduce(
    (sum, s) => sum + s.userStats.visitCount,
    0
  );

  return {
    id: sl.id,
    name: `${sl.area} ${spots.length}곳 코스`,
    description: sl.description,
    source: "spotline",
    spotlineName: sl.name,
    authorName: sl.curatorName,
    authorAvatar: sl.curatorAvatar,
    area: sl.area,
    totalDistance:
      totalDistance >= 1000
        ? `${(totalDistance / 1000).toFixed(1)}km`
        : `${totalDistance}m`,
    totalTime: `${totalWalkingTime}분`,
    completionCount: Math.round(totalVisits / 3),
    likeCount: totalLikes,
    coverImage: sl.coverImage,
    spots: spots.map((s, i) => toRouteSpot(s, i, i > 0 ? spots[i - 1] : undefined)),
  };
}

// ── 유저 루트 상세 ──
const USER_ROUTE_SPOT_IDS: Record<string, string[]> = {
  "user-route-1": ["hidden-alley-cafe", "roasting-house", "ondo-coffee"],
  "user-route-2": ["eulji-gallery", "photo-studio-seongsu", "moment-shop"],
};

const USER_ROUTE_META: Record<
  string,
  { userId: number; name: string; description: string; area: string }
> = {
  "user-route-1": {
    userId: 0,
    name: `${MOCK_USERS[0].nickname}의 숨은 카페 투어`,
    description:
      "대형 체인 말고, 진짜 로컬들만 아는 카페를 돌아보는 커피 투어입니다.",
    area: "성수·연남",
  },
  "user-route-2": {
    userId: 1,
    name: `${MOCK_USERS[1].nickname}의 성수 아트 투어`,
    description: "전시와 카페를 번갈아가며 즐기는 문화 코스입니다.",
    area: "성수·을지로",
  },
};

function buildUserRoute(routeId: string): RouteDetail | null {
  const spotIds = USER_ROUTE_SPOT_IDS[routeId];
  const meta = USER_ROUTE_META[routeId];
  if (!spotIds || !meta) return null;

  const spots = spotIds
    .map((id) => MOCK_SPOTS.find((s) => s.id === id))
    .filter(Boolean) as MockupSpot[];

  const user = MOCK_USERS[meta.userId];
  const totalDistance = spots.reduce((sum, s) => sum + s.distance, 0);
  const totalWalkingTime = spots.reduce((sum, s) => sum + s.walkingTime, 0);
  const totalLikes = spots.reduce(
    (sum, s) => sum + s.userStats.likeCount,
    0
  );
  const totalVisits = spots.reduce(
    (sum, s) => sum + s.userStats.visitCount,
    0
  );

  return {
    id: routeId,
    name: meta.name,
    description: meta.description,
    source: "user",
    authorName: user.nickname,
    authorAvatar: user.avatar,
    area: meta.area,
    totalDistance:
      totalDistance >= 1000
        ? `${(totalDistance / 1000).toFixed(1)}km`
        : `${totalDistance}m`,
    totalTime: `${totalWalkingTime}분`,
    completionCount: Math.round(totalVisits / 5),
    likeCount: totalLikes,
    coverImage: `https://picsum.photos/seed/${routeId}/800/400`,
    spots: spots.map((s, i) => toRouteSpot(s, i)),
  };
}

// ── 전체 루트 상세 조회 ──
function getRouteDetail(routeId: string): RouteDetail | null {
  // SpotLine 공식 루트
  const sl = MOCK_SPOTLINES.find((s) => s.id === routeId);
  if (sl) return buildSpotlineRoute(sl);

  // 유저 루트
  return buildUserRoute(routeId);
}

// ── 소스 뱃지 컴포넌트 ──
function SourceBadge({
  source,
  spotlineName,
}: {
  source: "spotline" | "user";
  spotlineName?: string;
}) {
  if (source === "spotline") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full">
        <Zap className="h-2.5 w-2.5" />
        {spotlineName ?? "SpotLine"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full">
      <User className="h-2.5 w-2.5" />
      유저 추천
    </span>
  );
}

export default function RouteDetailPage() {
  const params = useParams();
  const routeId = params.id as string;
  const route = getRouteDetail(routeId);

  const [visitedSpots, setVisitedSpots] = useState<Set<string>>(new Set());
  const [liked, setLiked] = useState(false);

  if (!route) {
    return (
      <Layout showFooter={false}>
        <div className="max-w-2xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-500 mb-4">루트 정보를 찾을 수 없습니다</p>
            <Link href="/mockup/e" className="text-blue-600 font-medium">
              루트 목록으로
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const toggleVisit = (spotId: string) => {
    setVisitedSpots((prev) => {
      const next = new Set(prev);
      if (next.has(spotId)) next.delete(spotId);
      else next.add(spotId);
      return next;
    });
  };

  const completionRate = Math.round(
    (visitedSpots.size / route.spots.length) * 100
  );
  const isCompleted = visitedSpots.size === route.spots.length;

  return (
    <Layout showFooter={false} showHeader={false}>
      <div className="max-w-2xl mx-auto bg-white min-h-screen">
        {/* 커버 이미지 */}
        <div className="relative h-56 bg-gray-200">
          <img
            src={route.coverImage}
            alt={route.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute top-4 left-4">
            <Link
              href="/mockup/e"
              className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Link>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            {route.source === "spotline" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-blue-600/80 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2">
                <Zap className="h-3 w-3" />
                {route.spotlineName}
              </span>
            )}
            <h1 className="text-2xl font-bold text-white">{route.name}</h1>
          </div>
        </div>

        {/* 루트 메타 */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={route.authorAvatar}
              alt={route.authorName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-700">
              {route.authorName}
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">{route.area}</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{route.description}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {route.totalDistance}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {route.totalTime}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {route.completionCount}명 완주
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {route.likeCount}
            </span>
          </div>
        </div>

        {/* 완주 진행도 */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-900">
              완주 진행도
            </span>
            <span className="text-sm font-bold text-blue-600">
              {completionRate}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-blue-500 to-blue-600"
              }`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
          {isCompleted && (
            <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 rounded-xl p-3">
              <Trophy className="h-5 w-5" />
              <span className="text-sm font-bold">
                루트 완주! 뱃지를 획득했어요
              </span>
            </div>
          )}
        </div>

        {/* Spot 리스트 */}
        <div className="px-4 py-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            코스 ({route.spots.length}개 Spot)
          </h2>

          <div className="space-y-0">
            {route.spots.map((spot, index) => {
              const isVisited = visitedSpots.has(spot.id);
              return (
                <div key={spot.id}>
                  {/* 연결선 */}
                  {index > 0 && (
                    <div className="flex items-center gap-3 pl-5 py-1">
                      <div className="w-0.5 h-8 bg-gray-200 ml-[7px]" />
                      <span className="text-xs text-gray-400">
                        {spot.distance} · 도보 {spot.walkingTime}
                      </span>
                    </div>
                  )}

                  {/* Spot 카드 */}
                  <div
                    className={`flex gap-3 p-3 rounded-xl transition-colors ${
                      isVisited ? "bg-green-50" : "bg-white"
                    }`}
                  >
                    {/* 순번 + 체크 */}
                    <button
                      onClick={() => toggleVisit(spot.id)}
                      className="shrink-0 mt-1"
                    >
                      {isVisited ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <div className="relative">
                          <Circle className="h-6 w-6 text-gray-300" />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-400">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* 이미지 */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className={`w-full h-full object-cover ${
                          isVisited ? "opacity-70" : ""
                        }`}
                      />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {spot.category}
                        </span>
                        <SourceBadge
                          source={spot.source}
                          spotlineName={spot.spotlineName}
                        />
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-600">
                            {spot.rating}
                          </span>
                        </div>
                      </div>
                      <h3
                        className={`font-bold text-sm ${
                          isVisited
                            ? "text-gray-400 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {spot.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {spot.description}
                      </p>

                      {/* userStats */}
                      <div className="flex items-center gap-2.5 mt-1.5 text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-2.5 w-2.5" />
                          {spot.userStats.visitCount}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Heart className="h-2.5 w-2.5" />
                          {spot.userStats.likeCount}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <ThumbsUp className="h-2.5 w-2.5" />
                          {spot.userStats.recommendCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 고정 바 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center justify-center gap-2 py-3 px-5 border rounded-xl font-medium transition-colors ${
              liked
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} />
            {route.likeCount + (liked ? 1 : 0)}
          </button>
          <button
            onClick={() => {
              const firstUnvisited = route.spots.find(
                (s) => !visitedSpots.has(s.id)
              );
              if (firstUnvisited) {
                window.open(
                  `https://map.kakao.com/link/search/${encodeURIComponent(
                    firstUnvisited.name + " " + firstUnvisited.address
                  )}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Navigation className="h-4 w-4" />
            {isCompleted ? "다시 돌아보기" : "다음 Spot으로 안내"}
          </button>
          <button className="flex items-center justify-center gap-2 py-3 px-5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Layout>
  );
}
