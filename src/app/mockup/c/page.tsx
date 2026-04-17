"use client";

import {
  QrCode,
  MapPin,
  ArrowRight,
  Smartphone,
  Coffee,
  Palette,
  Route,
  Compass,
  ArrowLeft,
  ChevronRight,
  Zap,
  Heart,
  ThumbsUp,
  Eye,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import {
  MOCK_SPOTS,
  MOCK_USER_ACTIVITIES,
  MOCK_USERS,
  getSpotById,
  sortByPopularity,
} from "@/data/mockup";

// ============================================================
// 상대 시간 포맷 헬퍼
// ============================================================
function formatRelativeTime(dateStr: string): string {
  const now = new Date("2026-03-10T12:00:00");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return "어제";
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`;
  return `${Math.floor(diffDay / 30)}개월 전`;
}

// 활동 유형별 설정
const ACTIVITY_CONFIG = {
  visit: {
    label: "방문",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    icon: Eye,
  },
  like: {
    label: "좋아요",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    icon: Heart,
  },
  recommend: {
    label: "추천",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    icon: ThumbsUp,
  },
} as const;

export default function MockupC() {
  const spotlineSpots = MOCK_SPOTS.filter((s) => s.source === "CREW");
  const userSpots = sortByPopularity(
    MOCK_SPOTS.filter((s) => s.source === "USER")
  );

  return (
    <Layout showFooter>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 목업 네비게이션 */}
        <div className="py-4">
          <Link
            href="/mockup"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">목업 목록</span>
          </Link>
        </div>

        {/* ===== 히어로 섹션 ===== */}
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                SpotLine
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              현재 장소를 기준으로
              <br />
              다음 경험을 자연스럽게 제안
            </p>

            {/* 시작하기 + 둘러보기 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                <QrCode className="h-5 w-5" />
                SpotLine 시작하기
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 rounded-xl transition-colors">
                <Compass className="h-5 w-5" />
                Spot 둘러보기
              </button>
            </div>

            {/* 사용 시나리오 카드 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 text-center text-lg">
                이런 순간에 SpotLine을 사용해보세요
              </h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-4 rounded-xl bg-amber-50 p-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-xl shrink-0">
                    <Coffee className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-gray-700 text-sm">{`카페에서 작업을 마친 후 "이제 어디 가지?" 하는 순간`}</p>
                </div>
                <div className="flex items-center gap-4 rounded-xl bg-purple-50 p-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl shrink-0">
                    <Palette className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-gray-700 text-sm">
                    전시를 관람한 후 여운을 이어갈 다음 공간을 찾을 때
                  </p>
                </div>
                <div className="flex items-center gap-4 rounded-xl bg-blue-50 p-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl shrink-0">
                    <Route className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-gray-700 text-sm">
                    무작정 검색하지 않고 의도된 동선으로 움직이고 싶을 때
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 크루가 큐레이션한 Spot ===== */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  크루가 큐레이션한 Spot
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  SpotLine 크루가 직접 발견하고 큐레이션한 장소들
                </p>
              </div>
              <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                전체보기
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 가로 스크롤 카드 */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {spotlineSpots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/mockup/c/spots/${spot.slug}`}
                  className="shrink-0 w-64 bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-36 bg-gray-200">
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-xs bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-gray-700">
                      {spot.area}
                    </span>
                    {/* SpotLine 제휴 뱃지 */}
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-xs font-medium text-white bg-blue-600/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Zap className="h-3 w-3" />
                      SpotLine
                    </span>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-blue-600 font-medium">
                      {spot.categoryLabel}
                    </span>
                    <h3 className="font-bold text-gray-900 mt-1">
                      {spot.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{spot.author}</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {spot.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-3 w-3" />
                        {spot.userStats.visitCount}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3" />
                        {spot.userStats.likeCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 유저 커뮤니티 피드 ===== */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  유저 커뮤니티 피드
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  유저들의 최근 Spot 활동
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>{MOCK_USERS.length}명 참여</span>
              </div>
            </div>

            <div className="space-y-4">
              {MOCK_USER_ACTIVITIES.map((activity) => {
                const spot = getSpotById(activity.spotId);
                if (!spot) return null;
                const config = ACTIVITY_CONFIG[activity.type];
                const ActivityIcon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                  >
                    {/* 유저 정보 + 타임스탬프 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={activity.user.avatar}
                          alt={activity.user.nickname}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                        />
                        <div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {activity.user.nickname}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {/* 활동 유형 뱃지 */}
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}
                            >
                              <ActivityIcon className="h-3 w-3" />
                              {config.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                    </div>

                    {/* Spot 정보 */}
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <Link
                        href={`/mockup/c/spots/${spot.slug}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {spot.name}
                      </Link>
                      <span className="text-xs text-gray-400">
                        {spot.categoryLabel} &middot; {spot.area}
                      </span>
                    </div>

                    {/* 리뷰 텍스트 */}
                    {activity.review && (
                      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3 mt-2">
                        &ldquo;{activity.review}&rdquo;
                      </p>
                    )}

                    {/* 사진 */}
                    {activity.photos && activity.photos.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {activity.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`${activity.user.nickname}의 사진`}
                            className="w-20 h-20 rounded-xl object-cover border border-gray-100"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== 인기 유저 Spot ===== */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  인기 유저 Spot
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  유저들이 직접 추천한 인기 장소
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-purple-600">
                <TrendingUp className="h-4 w-4" />
                <span>인기순</span>
              </div>
            </div>

            <div className="grid gap-4">
              {userSpots.map((spot, index) => (
                <Link
                  key={spot.id}
                  href={`/mockup/c/spots/${spot.slug}`}
                  className="flex gap-4 bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  {/* 순위 */}
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-bold text-sm shrink-0 mt-1">
                    {index + 1}
                  </div>

                  {/* 이미지 */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {spot.name}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                        {spot.categoryLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{spot.area}</span>
                      <span>&middot;</span>
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{spot.rating}</span>
                    </div>
                    {/* 추천자 */}
                    {spot.recommendedBy && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <img
                          src={spot.recommendedBy.avatar}
                          alt={spot.recommendedBy.nickname}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-xs text-purple-600 font-medium">
                          {spot.recommendedBy.nickname} 추천
                        </span>
                      </div>
                    )}
                    {/* 통계 */}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-3 w-3" />
                        {spot.userStats.visitCount}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3" />
                        {spot.userStats.likeCount}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <ThumbsUp className="h-3 w-3" />
                        {spot.userStats.recommendCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 사용법 섹션 (기존 유지) */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
              사용법은 정말 간단해요
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold text-lg">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">QR 스캔</h3>
                <p className="text-sm text-gray-600">
                  매장의 SpotLine QR 코드를 스캔하세요
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold text-lg">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  다음 Spot 확인
                </h3>
                <p className="text-sm text-gray-600">
                  현재 장소와 자연스럽게 이어지는 추천을 확인하세요
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold text-lg">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  지도로 이동
                </h3>
                <p className="text-sm text-gray-600">
                  마음에 드는 장소를 선택하고 지도로 이동하세요
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 특징 섹션 (기존 유지) */}
        <section className="py-16 bg-white rounded-xl border mb-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
              SpotLine은 다릅니다
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">즉시 접근</h3>
                <p className="text-sm text-gray-600">
                  앱 설치 없이 QR 코드만 스캔하면 바로 확인
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">맥락 기반</h3>
                <p className="text-sm text-gray-600">
                  현재 위치와 경험을 고려한 자연스러운 추천
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-4">
                  <ArrowRight className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  신뢰할 수 있는
                </h3>
                <p className="text-sm text-gray-600">
                  광고나 리뷰가 아닌 큐레이션 기반 추천
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="py-16 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              지금 바로 체험해보세요
            </h2>
            <p className="text-gray-600 mb-8">
              다음에 가기 좋은 곳을 찾는 새로운 방법을 경험해보세요
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                SpotLine 시작하기
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 font-medium text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-colors">
                <Compass className="h-5 w-5" />
                Spot 둘러보기
              </button>
            </div>

            <div className="text-sm text-gray-500 mt-4">
              또는{" "}
              <button className="text-purple-600 hover:text-purple-700 underline font-medium">
                데모보기로 먼저 체험해보기
              </button>
            </div>
          </div>
        </section>

        {/* 하단 목업 안내 */}
        <div className="fixed bottom-0 left-0 right-0 bg-green-50 border-t border-green-200 px-4 py-2 text-center z-10">
          <p className="text-xs text-green-700">
            방향 C 목업 — 기존 QR + 소셜 피드 병행 (크루 큐레이션 + 유저 커뮤니티 피드)
          </p>
        </div>
      </div>
    </Layout>
  );
}
