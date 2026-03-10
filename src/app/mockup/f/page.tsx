"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Star,
  Trophy,
  Target,
  Medal,
  Flame,
  MapPin,
  Coffee,
  Palette,
  UtensilsCrossed,
  Camera,
  MessageSquare,
  Route,
  Crown,
  ChevronRight,
  Lock,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { MOCK_USERS, MOCK_SPOTS } from "@/data/mockup";

// 공유 데이터에서 현재 유저 프로필 파생
const currentUser = MOCK_USERS[0]; // 커피탐험가

// 레벨/포인트 시스템 (공유 타입에 없는 로컬 데이터)
const LEVEL_INFO = {
  level: 3,
  levelName: "도시 탐험가",
  nextLevelName: "로컬 마스터",
  totalPoints: 1250,
  nextLevelPoints: 2000,
};

// MOCK_SPOTS 카테고리 기반 미션 데이터 생성
const cafeSpotCount = MOCK_SPOTS.filter((s) => s.category === "cafe").length;
const restaurantSpotCount = MOCK_SPOTS.filter(
  (s) => s.category === "restaurant"
).length;
const exhibitionSpotCount = MOCK_SPOTS.filter(
  (s) =>
    s.category === "exhibition" ||
    s.category === "culture"
).length;
const seongsooSpotCount = MOCK_SPOTS.filter(
  (s) => s.area === "성수"
).length;

// 미션
interface Mission {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  progress: number;
  total: number;
  reward: string;
  rewardBadge: string;
  category: "방문" | "리뷰" | "루트" | "지역";
}

const MISSIONS: Mission[] = [
  {
    id: "cafe-hunter",
    title: "카페 헌터",
    description: `카페 ${cafeSpotCount}곳 방문하기`,
    icon: Coffee,
    iconColor: "text-amber-600",
    progress: 3,
    total: cafeSpotCount,
    reward: "카페 헌터 뱃지",
    rewardBadge: "☕",
    category: "방문",
  },
  {
    id: "seongsu-master",
    title: "성수 마스터",
    description: `성수 지역 ${seongsooSpotCount}곳 방문하기`,
    icon: MapPin,
    iconColor: "text-blue-600",
    progress: 5,
    total: seongsooSpotCount,
    reward: "성수 마스터 뱃지",
    rewardBadge: "🏅",
    category: "지역",
  },
  {
    id: "reviewer",
    title: "리뷰어 데뷔",
    description: "Spot 3곳에 한줄 후기 남기기",
    icon: MessageSquare,
    iconColor: "text-green-600",
    progress: 2,
    total: 3,
    reward: "리뷰어 뱃지",
    rewardBadge: "✍️",
    category: "리뷰",
  },
  {
    id: "route-runner",
    title: "루트 러너",
    description: "SpotLine 루트 1개 완주하기",
    icon: Route,
    iconColor: "text-purple-600",
    progress: 1,
    total: 1,
    reward: "루트 마스터 뱃지",
    rewardBadge: "🚶",
    category: "루트",
  },
  {
    id: "art-lover",
    title: "전시 탐방가",
    description: `전시/갤러리 ${exhibitionSpotCount}곳 방문하기`,
    icon: Palette,
    iconColor: "text-rose-600",
    progress: 1,
    total: exhibitionSpotCount,
    reward: "문화인 뱃지",
    rewardBadge: "🎨",
    category: "방문",
  },
  {
    id: "photo-master",
    title: "포토 마스터",
    description: "Spot 후기에 사진 5장 올리기",
    icon: Camera,
    iconColor: "text-indigo-600",
    progress: 2,
    total: 5,
    reward: "포토 마스터 뱃지",
    rewardBadge: "📸",
    category: "리뷰",
  },
  {
    id: "foodie",
    title: "맛집 탐험가",
    description: `맛집 ${restaurantSpotCount}곳 방문하기`,
    icon: UtensilsCrossed,
    iconColor: "text-red-600",
    progress: 2,
    total: restaurantSpotCount,
    reward: "맛집 탐험가 뱃지",
    rewardBadge: "🍽️",
    category: "방문",
  },
];

// 뱃지
interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
}

const BADGES: Badge[] = [
  { id: "first-step", emoji: "👣", name: "첫 발자국", description: "첫 Spot 방문", earned: true, earnedDate: "2026.02.15" },
  { id: "route-master", emoji: "🚶", name: "루트 마스터", description: "첫 루트 완주", earned: true, earnedDate: "2026.02.28" },
  { id: "cafe-hunter", emoji: "☕", name: "카페 헌터", description: `카페 ${cafeSpotCount}곳 방문`, earned: false },
  { id: "seongsu-master", emoji: "🏅", name: "성수 마스터", description: `성수 ${seongsooSpotCount}곳 방문`, earned: false },
  { id: "reviewer", emoji: "✍️", name: "리뷰어", description: "후기 3개 작성", earned: false },
  { id: "social-star", emoji: "⭐", name: "소셜 스타", description: "좋아요 50개 받기", earned: false },
  { id: "explorer", emoji: "🧭", name: "탐험가", description: "5개 지역 방문", earned: false },
  { id: "local-master", emoji: "👑", name: "로컬 마스터", description: "레벨 5 달성", earned: false },
];

// MOCK_USERS 기반 리더보드 (방문수 내림차순 정렬)
const sortedUsers = [...MOCK_USERS].sort(
  (a, b) => b.stats.visited - a.stats.visited
);
const RANK_BADGES = ["🥇", "🥈", "🥉", "", ""];

const LEADERBOARD = sortedUsers.map((user, idx) => ({
  rank: idx + 1,
  nickname: user.nickname,
  avatar: user.avatar,
  visits: user.stats.visited,
  badge: RANK_BADGES[idx] || "",
  isMe: user.id === currentUser.id,
}));

// 주간 챌린지
const WEEKLY_CHALLENGE = {
  title: "이번 주 5곳 방문하기",
  progress: 3,
  total: 5,
  reward: "주간 챌린저 뱃지 + 50pt",
  daysLeft: 3,
};

type Tab = "missions" | "badges" | "ranking";

export default function MockupF() {
  const [activeTab, setActiveTab] = useState<Tab>("missions");

  const completedMissions = MISSIONS.filter((m) => m.progress >= m.total);
  const inProgressMissions = MISSIONS.filter((m) => m.progress < m.total);
  const earnedBadges = BADGES.filter((b) => b.earned);

  const levelProgress = Math.round(
    (LEVEL_INFO.totalPoints / LEVEL_INFO.nextLevelPoints) * 100
  );

  // 현재 유저의 랭킹에서 다음 순위까지 필요한 방문수 계산
  const myRankEntry = LEADERBOARD.find((u) => u.isMe);
  const nextRankEntry = myRankEntry
    ? LEADERBOARD.find((u) => u.rank === myRankEntry.rank - 1)
    : null;
  const visitsToNextRank = nextRankEntry
    ? nextRankEntry.visits - (myRankEntry?.visits ?? 0) + 1
    : 0;

  return (
    <Layout showFooter={false}>
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="px-4 py-4">
          <Link
            href="/mockup"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">목업 목록</span>
          </Link>
        </div>

        {/* 유저 프로필 카드 */}
        <div className="mx-4 mb-6 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.nickname}
              className="w-16 h-16 rounded-full border-3 border-white/30 object-cover"
            />
            <div>
              <h2 className="text-xl font-bold">{currentUser.nickname}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-blue-100">
                  Lv.{LEVEL_INFO.level} {LEVEL_INFO.levelName}
                </span>
              </div>
            </div>
          </div>

          {/* 레벨 프로그레스 */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
              <span>{LEVEL_INFO.totalPoints}pt</span>
              <span>{LEVEL_INFO.nextLevelPoints}pt ({LEVEL_INFO.nextLevelName})</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* 통계 — 공유 데이터의 stats 사용 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-white/10 rounded-xl">
              <p className="text-lg font-bold">{currentUser.stats.visited}</p>
              <p className="text-[10px] text-blue-200">방문</p>
            </div>
            <div className="text-center p-2 bg-white/10 rounded-xl">
              <p className="text-lg font-bold">{currentUser.stats.liked}</p>
              <p className="text-[10px] text-blue-200">좋아요</p>
            </div>
            <div className="text-center p-2 bg-white/10 rounded-xl">
              <p className="text-lg font-bold">{currentUser.stats.recommended}</p>
              <p className="text-[10px] text-blue-200">추천</p>
            </div>
            <div className="text-center p-2 bg-white/10 rounded-xl">
              <p className="text-lg font-bold">{currentUser.stats.spotlines}</p>
              <p className="text-[10px] text-blue-200">완주</p>
            </div>
          </div>
        </div>

        {/* 주간 챌린지 */}
        <div className="mx-4 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">주간 챌린지</span>
            <span className="ml-auto text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
              D-{WEEKLY_CHALLENGE.daysLeft}
            </span>
          </div>
          <p className="text-sm text-amber-900 font-medium mb-2">
            {WEEKLY_CHALLENGE.title}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{
                  width: `${(WEEKLY_CHALLENGE.progress / WEEKLY_CHALLENGE.total) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-bold text-amber-700">
              {WEEKLY_CHALLENGE.progress}/{WEEKLY_CHALLENGE.total}
            </span>
          </div>
          <p className="text-xs text-amber-600 mt-2">
            보상: {WEEKLY_CHALLENGE.reward}
          </p>
        </div>

        {/* 탭 */}
        <div className="px-4 mb-4">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[
              { key: "missions" as Tab, label: "미션", icon: Target },
              { key: "badges" as Tab, label: "뱃지", icon: Medal },
              { key: "ranking" as Tab, label: "랭킹", icon: Trophy },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 미션 탭 */}
        {activeTab === "missions" && (
          <div className="px-4 pb-16">
            {/* 진행 중 */}
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">
              진행 중 ({inProgressMissions.length})
            </h3>
            <div className="space-y-3 mb-8">
              {inProgressMissions.map((mission) => {
                const Icon = mission.icon;
                const pct = Math.round((mission.progress / mission.total) * 100);
                return (
                  <div
                    key={mission.id}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl shrink-0">
                        <Icon className={`h-5 w-5 ${mission.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-900 text-sm">
                            {mission.title}
                          </h4>
                          <span className="text-xs font-bold text-blue-600">
                            {mission.progress}/{mission.total}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {mission.description}
                        </p>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400">
                          보상: {mission.rewardBadge} {mission.reward}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 완료 */}
            {completedMissions.length > 0 && (
              <>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">
                  완료 ({completedMissions.length})
                </h3>
                <div className="space-y-3">
                  {completedMissions.map((mission) => {
                    const Icon = mission.icon;
                    return (
                      <div
                        key={mission.id}
                        className="bg-green-50 rounded-xl border border-green-200 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl shrink-0">
                            <Icon className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-green-800 text-sm">
                              {mission.title}
                            </h4>
                            <p className="text-xs text-green-600">
                              {mission.rewardBadge} {mission.reward} 획득!
                            </p>
                          </div>
                          <span className="text-green-500 text-lg">✓</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* 뱃지 탭 */}
        {activeTab === "badges" && (
          <div className="px-4 pb-16">
            <p className="text-sm text-gray-500 mb-4">
              획득한 뱃지: {earnedBadges.length} / {BADGES.length}
            </p>
            <div className="grid grid-cols-4 gap-3">
              {BADGES.map((badge) => (
                <div
                  key={badge.id}
                  className={`text-center p-3 rounded-xl border transition-colors ${
                    badge.earned
                      ? "bg-white border-gray-200"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <div className={`text-3xl mb-1 ${badge.earned ? "" : "grayscale opacity-30"}`}>
                    {badge.earned ? badge.emoji : <Lock className="h-7 w-7 mx-auto text-gray-300" />}
                  </div>
                  <p className={`text-xs font-medium ${badge.earned ? "text-gray-900" : "text-gray-400"}`}>
                    {badge.name}
                  </p>
                  {badge.earned && badge.earnedDate && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {badge.earnedDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 랭킹 탭 */}
        {activeTab === "ranking" && (
          <div className="px-4 pb-16">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase">
                이번 주 방문왕
              </h3>
              <span className="text-xs text-gray-400">매주 월요일 초기화</span>
            </div>

            <div className="space-y-2">
              {LEADERBOARD.map((user) => (
                <div
                  key={user.rank}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    user.isMe
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-white border border-gray-100"
                  }`}
                >
                  <span className="w-8 text-center font-bold text-lg">
                    {user.badge || user.rank}
                  </span>
                  <img
                    src={user.avatar}
                    alt={user.nickname}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${user.isMe ? "text-blue-700" : "text-gray-900"}`}>
                        {user.nickname}
                      </span>
                      {user.isMe && (
                        <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                          나
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {user.visits}곳
                    </span>
                    <p className="text-[10px] text-gray-400">방문</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              ))}
            </div>

            {/* 나의 순위 하이라이트 */}
            {myRankEntry && nextRankEntry && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
                <Crown className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  이번 주 <span className="font-bold text-gray-900">{visitsToNextRank}곳</span> 더 방문하면
                </p>
                <p className="text-sm font-bold text-blue-600">
                  {myRankEntry.rank - 1}위로 올라갈 수 있어요!
                </p>
              </div>
            )}
          </div>
        )}

        {/* 하단 안내 */}
        <div className="fixed bottom-0 left-0 right-0 bg-orange-50 border-t border-orange-200 px-4 py-2 text-center">
          <p className="text-xs text-orange-700">
            방향 F 목업 — 게이미피케이션 탐험
          </p>
        </div>
      </div>
    </Layout>
  );
}
