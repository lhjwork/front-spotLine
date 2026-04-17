"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Heart,
  Sparkles,
  Coffee,
  Palette,
  UtensilsCrossed,
  TreePine,
  ShoppingBag,
  User,
  Zap,
  Eye,
  Check,
  Users,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import {
  MOCK_SPOTS,
  MOCK_SPOTLINES,
  MOCK_USERS,
  sortByPopularity,
} from "@/data/mockup";

// 취향 설문 옵션
const TASTE_OPTIONS = [
  { id: "cafe", label: "카페", icon: Coffee, color: "bg-amber-50 border-amber-200 text-amber-700", activeColor: "bg-amber-500 border-amber-500 text-white", categories: ["cafe"] },
  { id: "food", label: "맛집", icon: UtensilsCrossed, color: "bg-red-50 border-red-200 text-red-700", activeColor: "bg-red-500 border-red-500 text-white", categories: ["restaurant"] },
  { id: "exhibition", label: "전시/갤러리", icon: Palette, color: "bg-purple-50 border-purple-200 text-purple-700", activeColor: "bg-purple-500 border-purple-500 text-white", categories: ["exhibition", "culture"] },
  { id: "walk", label: "산책/자연", icon: TreePine, color: "bg-green-50 border-green-200 text-green-700", activeColor: "bg-green-500 border-green-500 text-white", categories: ["nature", "walk"] },
  { id: "shopping", label: "쇼핑/소품", icon: ShoppingBag, color: "bg-blue-50 border-blue-200 text-blue-700", activeColor: "bg-blue-500 border-blue-500 text-white", categories: ["shopping"] },
];

// 카테고리 → 취향 ID 매핑
const CATEGORY_TO_TASTE: Record<string, string> = {
  cafe: "cafe",
  restaurant: "food",
  exhibition: "exhibition",
  culture: "exhibition",
  nature: "walk",
  walk: "walk",
  shopping: "shopping",
};

// 취향 ID → 한글 이름 매핑
const TASTE_LABELS: Record<string, string> = {
  cafe: "카페",
  food: "맛집",
  exhibition: "전시",
  walk: "산책",
  shopping: "쇼핑",
};

// 추천 이유 생성
function generateReason(
  spot: (typeof MOCK_SPOTS)[number],
  selectedTastes: Set<string>
): string {
  const tasteId = CATEGORY_TO_TASTE[spot.category];
  const parts: string[] = [];

  if (tasteId && selectedTastes.has(tasteId)) {
    parts.push(`${TASTE_LABELS[tasteId]} 취향`);
  }
  parts.push(`${spot.area} 지역`);
  if (spot.rating >= 4.7) parts.push("높은 평점");
  if (spot.userStats.likeCount >= 30) parts.push("인기 스팟");
  if (spot.tags.length > 0) parts.push(spot.tags[0]);

  return parts.slice(0, 3).join(" + ");
}

// 매치율 계산
function computeMatchRate(
  spot: (typeof MOCK_SPOTS)[number],
  selectedTastes: Set<string>
): number {
  let score = 50; // base score
  const tasteId = CATEGORY_TO_TASTE[spot.category];
  if (tasteId && selectedTastes.has(tasteId)) score += 30;
  if (spot.rating >= 4.7) score += 10;
  if (spot.userStats.likeCount >= 30) score += 5;
  if (spot.userStats.visitCount >= 50) score += 5;
  return Math.min(score, 98);
}

// SpotLine 매치율 계산
function computeSpotlineMatchRate(
  line: (typeof MOCK_SPOTLINES)[number],
  selectedTastes: Set<string>
): number {
  // SpotLine에 속한 spot들의 카테고리가 선택 취향과 겹치는 비율로 계산
  const spots = MOCK_SPOTS.filter(
    (s) => s.spotlineAffiliation?.spotlineId === line.id
  );
  if (spots.length === 0) return 60;

  const matchCount = spots.filter((s) => {
    const tasteId = CATEGORY_TO_TASTE[s.category];
    return tasteId && selectedTastes.has(tasteId);
  }).length;

  const ratio = matchCount / spots.length;
  return Math.round(60 + ratio * 35);
}

type Phase = "survey" | "feed";

export default function MockupG() {
  const [phase, setPhase] = useState<Phase>("survey");
  const [selectedTastes, setSelectedTastes] = useState<Set<string>>(new Set());
  const [likedSpots, setLikedSpots] = useState<Set<string>>(new Set());

  // 추천 Spot: 인기순 정렬 + matchRate/reason 계산
  const recommendedSpots = useMemo(() => {
    const sorted = sortByPopularity(MOCK_SPOTS);
    return sorted.map((spot) => ({
      ...spot,
      matchRate: computeMatchRate(spot, selectedTastes),
      reason: generateReason(spot, selectedTastes),
    }));
  }, [selectedTastes]);

  // 유사 유저: MOCK_USERS[1] (도시산책러), MOCK_USERS[2] (전시덕후)
  const similarUsers = useMemo(() => {
    const userIndices = [1, 2]; // 도시산책러, 전시덕후
    return userIndices.map((idx) => {
      const user = MOCK_USERS[idx];
      // 각 유저가 좋아한 spot 목록 (mock 데이터 기반)
      const likedSpotNames =
        idx === 1
          ? [
              MOCK_SPOTS.find((s) => s.id === "eulji-gallery")?.name ?? "을지 갤러리",
              MOCK_SPOTS.find((s) => s.id === "hidden-alley-cafe")?.name ?? "골목 끝 카페",
              MOCK_SPOTS.find((s) => s.id === "ondo-coffee")?.name ?? "온도 커피",
            ]
          : [
              MOCK_SPOTS.find((s) => s.id === "eulji-gallery")?.name ?? "을지 갤러리",
              MOCK_SPOTS.find((s) => s.id === "vintage-bookshop")?.name ?? "빈티지 서점",
              MOCK_SPOTS.find((s) => s.id === "photo-studio-seongsu")?.name ?? "스튜디오 포레",
            ];
      const matchRate = idx === 1 ? 78 : 72;
      return { ...user, matchRate, likedSpotNames };
    });
  }, []);

  // 추천 SpotLine: MOCK_SPOTLINES + matchRate, visitedCount 계산
  const recommendedSpotlines = useMemo(() => {
    return MOCK_SPOTLINES.map((line, i) => ({
      ...line,
      matchRate: computeSpotlineMatchRate(line, selectedTastes),
      visitedCount: [3, 1, 2, 0][i] ?? 0, // simulated visited count
    }));
  }, [selectedTastes]);

  // 취향 프로필: 선택된 취향 기반 동적 생성
  const tasteProfile = useMemo(() => {
    const items = [
      { category: "카페", percentage: 80, color: "bg-amber-500" },
      { category: "전시", percentage: 60, color: "bg-purple-500" },
      { category: "맛집", percentage: 40, color: "bg-red-500" },
      { category: "산책", percentage: 30, color: "bg-green-500" },
      { category: "쇼핑", percentage: 20, color: "bg-blue-500" },
    ];
    // Boost selected categories
    return items.map((item) => {
      const tasteOpt = TASTE_OPTIONS.find((t) => t.label.startsWith(item.category));
      const isSelected = tasteOpt && selectedTastes.has(tasteOpt.id);
      return {
        ...item,
        percentage: isSelected
          ? Math.min(item.percentage + 20, 100)
          : Math.max(item.percentage - 10, 10),
      };
    });
  }, [selectedTastes]);

  const toggleTaste = (id: string) => {
    setSelectedTastes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLike = (id: string) => {
    setLikedSpots((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (phase === "survey") {
    return (
      <Layout showFooter={false}>
        <div className="max-w-2xl mx-auto">
          <div className="px-4 py-4">
            <Link
              href="/mockup"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-8"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">목업 목록</span>
            </Link>

            <div className="text-center mb-10">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                어떤 경험을 좋아하세요?
              </h1>
              <p className="text-gray-500">
                선택한 취향에 맞춰 Spot을 추천해드릴게요
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {TASTE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedTastes.has(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleTaste(opt.id)}
                    className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                      isSelected ? opt.activeColor : opt.color
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    <Icon className="h-8 w-8" />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPhase("feed")}
              disabled={selectedTastes.size === 0}
              className={`w-full py-4 rounded-xl font-medium text-lg transition-colors ${
                selectedTastes.size > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              맞춤 추천 받기
              <ArrowRight className="h-5 w-5 inline-block ml-2" />
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              나중에 언제든 취향을 변경할 수 있어요
            </p>
          </div>

          {/* 하단 안내 */}
          <div className="fixed bottom-0 left-0 right-0 bg-indigo-50 border-t border-indigo-200 px-4 py-2 text-center">
            <p className="text-xs text-indigo-700">
              방향 G 목업 — AI 개인화 추천 (취향 설문)
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // 추천 피드
  return (
    <Layout showFooter={false}>
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/mockup"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">목업 목록</span>
            </Link>
            <button
              onClick={() => setPhase("survey")}
              className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full"
            >
              취향 재설정
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {MOCK_USERS[0].nickname}님을 위한 추천
            </h1>
            <p className="text-sm text-gray-500">
              취향 분석 기반으로 선별된 Spot이에요
            </p>
          </div>
        </div>

        {/* 맞춤 추천 Spot */}
        <div className="px-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">
              당신을 위한 추천
            </h2>
          </div>

          <div className="space-y-3">
            {recommendedSpots.map((spot) => (
              <div
                key={spot.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <div className="flex">
                  <div className="relative w-28 h-28 shrink-0 bg-gray-200">
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                    {/* 매치율 뱃지 */}
                    <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {spot.matchRate}%
                    </div>
                  </div>

                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {spot.source === "CREW" && spot.spotlineAffiliation ? (
                          <span className="flex items-center gap-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            <Zap className="h-2.5 w-2.5" />
                            {spot.spotlineAffiliation.spotlineName}
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                            <User className="h-2.5 w-2.5" />
                            유저 추천
                          </span>
                        )}
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-600">{spot.rating}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {spot.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {spot.area} · {spot.categoryLabel}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full truncate">
                          {spot.reason}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <Users className="h-3 w-3" />
                          {spot.userStats.visitCount}
                        </span>
                        <button onClick={() => toggleLike(spot.id)}>
                          <Heart
                            className={`h-4 w-4 ${
                              likedSpots.has(spot.id)
                                ? "text-red-500 fill-red-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 비슷한 취향의 유저 */}
        <div className="px-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">
              비슷한 취향의 유저가 좋아한
            </h2>
          </div>

          <div className="space-y-3">
            {similarUsers.map((user) => (
              <div
                key={user.id}
                className="bg-purple-50 rounded-2xl border border-purple-100 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={user.avatar}
                    alt={user.nickname}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">
                      {user.nickname}님과 취향{" "}
                      <span className="text-purple-600">{user.matchRate}%</span>{" "}
                      일치
                    </p>
                    <p className="text-[11px] text-gray-500">
                      방문 {user.stats.visited} · 좋아요 {user.stats.liked} · 추천 {user.stats.recommended}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.likedSpotNames.map((spotName) => (
                    <span
                      key={spotName}
                      className="text-xs bg-white text-purple-700 px-2.5 py-1 rounded-full border border-purple-200"
                    >
                      {spotName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 추천 SpotLine */}
        <div className="px-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">
              추천 SpotLine
            </h2>
          </div>

          <div className="space-y-3">
            {recommendedSpotlines.map((line) => (
              <div
                key={line.id}
                className="bg-white rounded-2xl border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: line.color }}
                    />
                    <h3 className="font-bold text-gray-900 text-sm">
                      {line.name}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    매치 {line.matchRate}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {line.curatorName} · {line.spotCount}개 Spot 중{" "}
                  {line.visitedCount}곳 방문 완료
                </p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(line.visitedCount / line.spotCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 취향 프로필 */}
        <div className="px-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">
              나의 취향 프로필
            </h2>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5">
            <div className="space-y-3">
              {tasteProfile.map((item) => (
                <div key={item.category} className="flex items-center gap-3">
                  <span className="w-12 text-xs text-gray-600 shrink-0">
                    {item.category}
                  </span>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              방문·좋아요 데이터 기반으로 자동 업데이트됩니다
            </p>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="fixed bottom-0 left-0 right-0 bg-indigo-50 border-t border-indigo-200 px-4 py-2 text-center">
          <p className="text-xs text-indigo-700">
            방향 G 목업 — AI 개인화 추천 피드
          </p>
        </div>
      </div>
    </Layout>
  );
}
