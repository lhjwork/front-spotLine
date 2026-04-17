"use client";

import { useState } from "react";
import {
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Heart,
  Eye,
  Users,
  Coffee,
  Palette,
  UtensilsCrossed,
  Camera,
  TreePine,
  TrendingUp,
  Zap,
  User,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import {
  MOCK_SPOTLINES,
  MOCK_SPOTS,
  sortByPopularity,
  getUserSpots,
} from "@/data/mockup";

const THEMES = [
  {
    id: "cafe-tour",
    name: "카페 투어",
    description: "분위기 좋은 카페를 따라 걷는 하루",
    icon: Coffee,
    category: "cafe",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200",
  },
  {
    id: "exhibition",
    name: "전시 탐방",
    description: "갤러리와 전시장을 연결하는 문화 루트",
    icon: Palette,
    category: "exhibition",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  {
    id: "local-food",
    name: "로컬 맛집",
    description: "동네 주민이 추천하는 진짜 맛집",
    icon: UtensilsCrossed,
    category: "restaurant",
    color: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-red-200",
  },
  {
    id: "photo-spot",
    name: "포토 스팟",
    description: "사진 찍기 좋은 장소 모음",
    icon: Camera,
    category: "culture",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    id: "shopping",
    name: "쇼핑 스팟",
    description: "감성 소품부터 빈티지까지",
    icon: Sparkles,
    category: "shopping",
    color: "bg-pink-50",
    iconColor: "text-pink-600",
    borderColor: "border-pink-200",
  },
  {
    id: "nature-walk",
    name: "산책 코스",
    description: "자연과 함께하는 여유로운 산책",
    icon: TreePine,
    category: "nature",
    color: "bg-green-50",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
];

type Tab = "spotline" | "popular" | "theme";

export default function MockupB() {
  const [activeTab, setActiveTab] = useState<Tab>("spotline");

  const popularSpots = sortByPopularity(MOCK_SPOTS);
  const userSpotCount = getUserSpots().length;

  // Compute spot counts per theme category from shared data
  const themesWithCounts = THEMES.map((theme) => ({
    ...theme,
    spotCount: MOCK_SPOTS.filter((s) => s.category === theme.category).length,
  }));

  return (
    <Layout showFooter={false}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="px-4 py-4">
          <Link
            href="/mockup"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">목업 목록</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              어디를 둘러볼까요?
            </h1>
            <p className="text-gray-500">
              큐레이션된 루트, 인기 스팟, 테마별로 탐색해보세요
            </p>
          </div>

          {/* 3-tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => setActiveTab("spotline")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "spotline"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Zap className="h-4 w-4 inline-block mr-1" />
              큐레이션
            </button>
            <button
              onClick={() => setActiveTab("popular")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "popular"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <TrendingUp className="h-4 w-4 inline-block mr-1" />
              유저 인기
            </button>
            <button
              onClick={() => setActiveTab("theme")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "theme"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Sparkles className="h-4 w-4 inline-block mr-1" />
              테마별
            </button>
          </div>
        </div>

        {/* SpotLine 큐레이션 탭 */}
        {activeTab === "spotline" && (
          <div className="px-4 pb-8 space-y-4">
            <p className="text-sm text-gray-500 mb-2">
              SpotLine 크루가 직접 큐레이션한 루트
            </p>
            {MOCK_SPOTLINES.map((sl) => (
              <Link
                key={sl.id}
                href={`/mockup/b/spots?spotline=${sl.id}`}
                className="block rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-white"
              >
                {/* Cover image with color accent */}
                <div className="relative h-32">
                  <img
                    src={sl.coverImage}
                    alt={sl.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div
                    className="absolute top-0 left-0 w-full h-1"
                    style={{ backgroundColor: sl.color }}
                  />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-bold text-white">{sl.name}</h3>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">{sl.description}</p>

                  {/* Curator */}
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={sl.curatorAvatar}
                      alt={sl.curatorName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-500">
                      {sl.curatorName}
                    </span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-xs text-gray-400">{sl.area}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {sl.spotCount}개 스팟
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {sl.totalLikes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {sl.totalVisits}
                    </span>
                    <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}

            {/* User spots teaser */}
            <div className="rounded-2xl border border-dashed border-gray-300 p-5 text-center">
              <User className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                유저 추천 스팟도 있어요
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {userSpotCount}개의 유저 추천 스팟이 함께 표시됩니다
              </p>
              <button
                onClick={() => setActiveTab("popular")}
                className="text-xs text-blue-600 font-medium hover:text-blue-700"
              >
                유저 인기 탭 보기 →
              </button>
            </div>
          </div>
        )}

        {/* 유저 인기 탭 */}
        {activeTab === "popular" && (
          <div className="px-4 pb-8 space-y-3">
            <p className="text-sm text-gray-500 mb-2">
              방문 · 좋아요 · 추천 기반 인기순
            </p>
            {popularSpots.map((spot, idx) => (
              <Link
                key={spot.id}
                href={`/mockup/b/spots/${spot.slug}`}
                className="block rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex">
                  {/* Thumbnail */}
                  <div className="relative w-28 h-28 shrink-0">
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Rank badge */}
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/70 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate">
                          {spot.name}
                        </h3>
                        {/* Source badge */}
                        {spot.source === "CREW" ? (
                          <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            ⚡ SpotLine
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                            👤 유저
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {spot.categoryLabel} · {spot.area}
                      </p>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="h-3 w-3" />
                        {spot.userStats.visitCount}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Heart className="h-3 w-3" />
                        {spot.userStats.likeCount}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp className="h-3 w-3" />
                        {spot.userStats.recommendCount}
                      </span>

                      {/* Recent visitors */}
                      {spot.userStats.recentVisitors.length > 0 && (
                        <div className="flex items-center ml-auto -space-x-1.5">
                          {spot.userStats.recentVisitors
                            .slice(0, 3)
                            .map((v) => (
                              <img
                                key={v.id}
                                src={v.avatar}
                                alt={v.nickname}
                                title={v.nickname}
                                className="w-5 h-5 rounded-full border border-white object-cover"
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 테마별 탭 */}
        {activeTab === "theme" && (
          <div className="px-4 pb-8 space-y-3">
            {themesWithCounts.map((theme) => {
              const Icon = theme.icon;
              return (
                <Link
                  key={theme.id}
                  href={`/mockup/b/spots?theme=${theme.id}`}
                  className={`block rounded-2xl border ${theme.borderColor} ${theme.color} p-5 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shrink-0">
                      <Icon className={`h-6 w-6 ${theme.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900">
                          {theme.name}
                        </h3>
                        <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {theme.description}
                      </p>
                      <span className="text-xs text-gray-500">
                        {theme.spotCount}개의 Spot
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom mockup banner */}
        <div className="fixed bottom-0 left-0 right-0 bg-purple-50 border-t border-purple-200 px-4 py-2 text-center">
          <p className="text-xs text-purple-700">
            방향 B 목업 — SpotLine 큐레이션 + 유저 생태계 이중 소스 구조
          </p>
        </div>
      </div>
    </Layout>
  );
}
