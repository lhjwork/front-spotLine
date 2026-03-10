"use client";

import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Heart,
  ChevronRight,
  Zap,
  User,
  Trophy,
  Route,
  Eye,
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

// ── 루트 인터페이스 ──
interface RouteItem {
  id: string;
  name: string;
  description: string;
  source: "spotline" | "user";
  spotlineName?: string;
  spotlineColor?: string;
  authorName: string;
  authorAvatar: string;
  spots: { name: string; category: string; source: "spotline" | "user" }[];
  totalDistance: string;
  totalTime: string;
  completionCount: number;
  likeCount: number;
  area: string;
  coverImage: string;
  difficulty: "쉬움" | "보통" | "도전";
}

// ── 헬퍼: SpotLine → 루트 변환 ──
function spotlineToRoute(sl: SpotLineSummary): RouteItem {
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
    spotlineColor: sl.color,
    authorName: sl.curatorName,
    authorAvatar: sl.curatorAvatar,
    spots: spots.map((s) => ({
      name: s.name,
      category: s.categoryLabel,
      source: s.source,
    })),
    totalDistance: totalDistance >= 1000 ? `${(totalDistance / 1000).toFixed(1)}km` : `${totalDistance}m`,
    totalTime: `${totalWalkingTime}분`,
    completionCount: Math.round(totalVisits / 3),
    likeCount: totalLikes,
    area: sl.area,
    coverImage: sl.coverImage,
    difficulty: spots.length <= 3 ? "쉬움" : "보통",
  };
}

// ── SpotLine 공식 루트 (MOCK_SPOTLINES 기반) ──
const spotlineRoutes: RouteItem[] = MOCK_SPOTLINES.map(spotlineToRoute);

// ── 유저 루트 (MOCK_USERS + 다양한 MOCK_SPOTS 조합) ──
const userRoutes: RouteItem[] = [
  {
    id: "user-route-1",
    name: `${MOCK_USERS[0].nickname}의 숨은 카페 투어`,
    description: "대형 체인 말고, 진짜 로컬들만 아는 카페를 돌아보는 커피 투어",
    source: "user",
    authorName: MOCK_USERS[0].nickname,
    authorAvatar: MOCK_USERS[0].avatar,
    spots: [
      MOCK_SPOTS.find((s) => s.id === "hidden-alley-cafe")!,
      MOCK_SPOTS.find((s) => s.id === "roasting-house")!,
      MOCK_SPOTS.find((s) => s.id === "ondo-coffee")!,
    ].map((s) => ({
      name: s.name,
      category: s.categoryLabel,
      source: s.source,
    })),
    totalDistance: "1.5km",
    totalTime: "25분",
    completionCount: 45,
    likeCount: 23,
    area: "성수·연남",
    coverImage: "https://picsum.photos/seed/user-route-1/600/300",
    difficulty: "보통",
  },
  {
    id: "user-route-2",
    name: `${MOCK_USERS[1].nickname}의 성수 아트 투어`,
    description: "전시와 카페를 번갈아가며 즐기는 문화 코스",
    source: "user",
    authorName: MOCK_USERS[1].nickname,
    authorAvatar: MOCK_USERS[1].avatar,
    spots: [
      MOCK_SPOTS.find((s) => s.id === "eulji-gallery")!,
      MOCK_SPOTS.find((s) => s.id === "photo-studio-seongsu")!,
      MOCK_SPOTS.find((s) => s.id === "moment-shop")!,
    ].map((s) => ({
      name: s.name,
      category: s.categoryLabel,
      source: s.source,
    })),
    totalDistance: "900m",
    totalTime: "15분",
    completionCount: 32,
    likeCount: 18,
    area: "성수·을지로",
    coverImage: "https://picsum.photos/seed/user-route-2/600/300",
    difficulty: "쉬움",
  },
];

const ROUTES: RouteItem[] = [...spotlineRoutes, ...userRoutes];

const difficultyColor = {
  쉬움: "bg-green-100 text-green-700",
  보통: "bg-yellow-100 text-yellow-700",
  도전: "bg-red-100 text-red-700",
};

export default function MockupE() {
  const officialRoutes = ROUTES.filter((r) => r.source === "spotline");
  const communityRoutes = ROUTES.filter((r) => r.source === "user");

  return (
    <Layout showFooter={false}>
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="px-4 py-4">
          <Link
            href="/mockup"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">목업 목록</span>
          </Link>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Route className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                루트 탐색
              </h1>
            </div>
            <p className="text-gray-500">
              큐레이션된 코스를 따라 Spot을 순서대로 탐험하세요
            </p>
          </div>
        </div>

        {/* SpotLine 공식 루트 */}
        <div className="px-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">
              SpotLine 공식 루트
            </h2>
          </div>

          <div className="space-y-4">
            {officialRoutes.map((route) => (
              <Link
                key={route.id}
                href={`/mockup/e/route/${route.id}`}
                className="block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* 커버 이미지 */}
                <div className="relative h-36 bg-gray-200">
                  <img
                    src={route.coverImage}
                    alt={route.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-white bg-blue-600/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {route.spotlineName}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[route.difficulty]}`}
                      >
                        {route.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {route.name}
                    </h3>
                  </div>
                </div>

                {/* 루트 정보 */}
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    {route.description}
                  </p>

                  {/* Spot 순서 */}
                  <div className="flex items-center gap-1 mb-3 overflow-x-auto">
                    {route.spots.map((spot, i) => (
                      <span
                        key={spot.name}
                        className="flex items-center shrink-0"
                      >
                        <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                          <span className="w-4 h-4 flex items-center justify-center bg-blue-600 text-white rounded-full text-[10px] font-bold">
                            {i + 1}
                          </span>
                          {spot.name}
                        </span>
                        {i < route.spots.length - 1 && (
                          <span className="mx-1 text-gray-300 text-xs">
                            →
                          </span>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* 메타 정보 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {route.totalDistance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {route.totalTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {route.completionCount}명 완주
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {route.likeCount}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 유저 루트 */}
        <div className="px-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">
              유저가 만든 루트
            </h2>
          </div>

          <div className="space-y-4">
            {communityRoutes.map((route) => (
              <Link
                key={route.id}
                href={`/mockup/e/route/${route.id}`}
                className="block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={route.authorAvatar}
                      alt={route.authorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {route.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {route.authorName} · {route.area}
                      </p>
                    </div>
                    <span
                      className={`ml-auto text-xs px-2 py-0.5 rounded-full ${difficultyColor[route.difficulty]}`}
                    >
                      {route.difficulty}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {route.description}
                  </p>

                  {/* Spot 순서 + 소스 뱃지 */}
                  <div className="flex items-center gap-1 mb-3 overflow-x-auto">
                    {route.spots.map((spot, i) => (
                      <span
                        key={spot.name}
                        className="flex items-center shrink-0"
                      >
                        <span
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            spot.source === "spotline"
                              ? "bg-blue-50"
                              : "bg-purple-50"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 flex items-center justify-center text-white rounded-full text-[10px] font-bold ${
                              spot.source === "spotline"
                                ? "bg-blue-600"
                                : "bg-purple-600"
                            }`}
                          >
                            {i + 1}
                          </span>
                          {spot.name}
                        </span>
                        {i < route.spots.length - 1 && (
                          <span className="mx-1 text-gray-300 text-xs">
                            →
                          </span>
                        )}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {route.totalDistance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {route.totalTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        {route.completionCount}명 완주
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 루트 만들기 CTA */}
        <div className="px-4 mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white text-center">
            <Route className="h-8 w-8 mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-bold mb-2">나만의 루트 만들기</h3>
            <p className="text-sm text-white/80 mb-4">
              좋아하는 Spot을 연결해서 나만의 코스를 공유해보세요
            </p>
            <button className="px-6 py-2.5 bg-white text-purple-600 rounded-xl font-medium text-sm hover:bg-white/90 transition-colors">
              루트 만들기
            </button>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="fixed bottom-0 left-0 right-0 bg-blue-50 border-t border-blue-200 px-4 py-2 text-center">
          <p className="text-xs text-blue-700">
            방향 E 목업 — 루트(코스) 중심 탐색
          </p>
        </div>
      </div>
    </Layout>
  );
}
