"use client";

import { useState, useRef, useCallback } from "react";
import {
  Heart,
  MapPin,
  Bookmark,
  Share2,
  ArrowLeft,
  Eye,
  MessageCircle,
  ChevronUp,
  Navigation,
  ExternalLink,
  Zap,
  User,
  Users,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { MOCK_SPOTS, MOCK_SPOTLINES } from "@/data/mockup";

// Build reels data from shared spots
const REELS_SPOTS = MOCK_SPOTS.map((spot) => {
  // Find curator avatar from MOCK_SPOTLINES if spotline affiliated
  const spotline = spot.spotlineAffiliation
    ? MOCK_SPOTLINES.find(
        (sl) => sl.id === spot.spotlineAffiliation!.spotlineId
      )
    : undefined;

  const authorAvatar =
    spotline?.curatorAvatar ??
    spot.recommendedBy?.avatar ??
    "https://picsum.photos/seed/default-avatar/100/100";

  const authorName =
    spot.author ?? spot.recommendedBy?.nickname ?? "익명";

  const spotlineName = spot.spotlineAffiliation?.spotlineName;

  // Generate a story string from description
  const story = spot.description.endsWith(".")
    ? spot.description.slice(0, -1) + "을 경험해 보세요."
    : spot.description;

  return {
    id: spot.id,
    slug: spot.slug,
    name: spot.name,
    category: spot.categoryLabel,
    area: spot.area,
    address: spot.address,
    image: `https://picsum.photos/seed/${spot.slug}/800/1200`,
    story,
    author: authorName,
    authorAvatar,
    source: spot.source,
    spotlineName,
    spotlineColor: spot.spotlineAffiliation?.spotlineColor,
    distance: spot.distance,
    walkingTime: spot.walkingTime,
    stats: {
      likes: spot.userStats.likeCount,
      views: spot.userStats.visitCount + spot.userStats.likeCount,
      visits: spot.userStats.visitCount,
    },
    recentVisitors: spot.userStats.recentVisitors,
  };
});

export default function MockupD() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedSpots, setLikedSpots] = useState<Set<string>>(new Set());
  const [savedSpots, setSavedSpots] = useState<Set<string>>(new Set());
  const [showDetail, setShowDetail] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const currentSpot = REELS_SPOTS[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < REELS_SPOTS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowDetail(false);
    }
  }, [currentIndex]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowDetail(false);
    }
  }, [currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const toggleLike = () => {
    setLikedSpots((prev) => {
      const next = new Set(prev);
      if (next.has(currentSpot.id)) next.delete(currentSpot.id);
      else next.add(currentSpot.id);
      return next;
    });
  };

  const toggleSave = () => {
    setSavedSpots((prev) => {
      const next = new Set(prev);
      if (next.has(currentSpot.id)) next.delete(currentSpot.id);
      else next.add(currentSpot.id);
      return next;
    });
  };

  const isLiked = likedSpots.has(currentSpot.id);
  const isSaved = savedSpots.has(currentSpot.id);

  return (
    <Layout showFooter={false} showHeader={false}>
      <div
        ref={containerRef}
        className="relative w-full h-screen max-w-2xl mx-auto overflow-hidden bg-black select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 배경 이미지 */}
        <img
          src={currentSpot.image}
          alt={currentSpot.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

        {/* 상단 네비게이션 */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
          <Link
            href="/mockup"
            className="flex items-center justify-center w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {currentIndex + 1} / {REELS_SPOTS.length}
            </span>
          </div>
        </div>

        {/* 우측 액션 버튼 */}
        <div className="absolute right-4 bottom-48 z-10 flex flex-col items-center gap-5">
          <button onClick={toggleLike} className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full">
              <Heart
                className={`h-6 w-6 ${
                  isLiked ? "text-red-500 fill-red-500" : "text-white"
                }`}
              />
            </div>
            <span className="text-xs text-white font-medium">
              {currentSpot.stats.likes + (isLiked ? 1 : 0)}
            </span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-white font-medium">
              {currentSpot.stats.visits}
            </span>
          </button>

          <button onClick={toggleSave} className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full">
              <Bookmark
                className={`h-6 w-6 ${
                  isSaved ? "text-yellow-400 fill-yellow-400" : "text-white"
                }`}
              />
            </div>
            <span className="text-xs text-white font-medium">저장</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-white font-medium">공유</span>
          </button>
        </div>

        {/* 하단 정보 */}
        <div className="absolute bottom-0 left-0 right-20 z-10 p-5 pb-8">
          {/* 소스 뱃지 */}
          {currentSpot.source === "CREW" ? (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="flex items-center gap-1 text-xs font-medium text-white bg-blue-600/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <Zap className="h-3 w-3" />
                {currentSpot.spotlineName}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="flex items-center gap-1 text-xs font-medium text-white bg-purple-600/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <User className="h-3 w-3" />
                유저 추천
              </span>
            </div>
          )}

          {/* 작성자 */}
          <div className="flex items-center gap-2 mb-3">
            <img
              src={currentSpot.authorAvatar}
              alt={currentSpot.author}
              className="w-8 h-8 rounded-full border-2 border-white/50 object-cover"
            />
            <span className="text-sm font-bold text-white">
              {currentSpot.author}
            </span>
          </div>

          {/* Spot 이름 + 카테고리 */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-white">
                {currentSpot.name}
              </h2>
              <span className="text-xs text-white/70 bg-white/20 px-2 py-0.5 rounded-full">
                {currentSpot.category}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {currentSpot.area} · {currentSpot.distance}m
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {currentSpot.stats.views}
              </span>
            </div>
          </div>

          {/* 스토리 */}
          <p className="text-sm text-white/90 leading-relaxed mb-4">
            &quot;{currentSpot.story}&quot;
          </p>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                window.open(
                  `https://map.kakao.com/link/search/${encodeURIComponent(currentSpot.name + " " + currentSpot.address)}`,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="flex items-center gap-1.5 px-4 py-2.5 bg-yellow-500 text-white rounded-xl text-sm font-medium"
            >
              <Navigation className="h-4 w-4" />
              카카오맵
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://map.naver.com/v5/search/${encodeURIComponent(currentSpot.name + " " + currentSpot.address)}`,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="flex items-center gap-1.5 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium"
            >
              <Navigation className="h-4 w-4" />
              네이버지도
            </button>
            <button
              onClick={() => setShowDetail(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              상세
            </button>
          </div>
        </div>

        {/* 스와이프 인디케이터 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-16 z-10">
          {currentIndex > 0 && (
            <button
              onClick={goPrev}
              className="flex items-center justify-center w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full animate-bounce"
            >
              <ChevronUp className="h-5 w-5 text-white" />
            </button>
          )}
        </div>

        {/* 하단 스와이프 힌트 */}
        {currentIndex < REELS_SPOTS.length - 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={goNext}
              className="text-xs text-white/50 animate-pulse"
            >
              위로 스와이프하여 다음 Spot
            </button>
          </div>
        )}

        {/* 진행 바 */}
        <div className="absolute top-14 left-4 right-4 z-10 flex gap-1">
          {REELS_SPOTS.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-colors ${
                i <= currentIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* 상세 패널 (슬라이드업) */}
        {showDetail && (
          <div
            className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetail(false)}
          >
            <div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-5 pb-8">
                <div className="flex items-center gap-2 mb-2">
                  {currentSpot.source === "CREW" && (
                    <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      <Zap className="h-3 w-3" />
                      {currentSpot.spotlineName}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {currentSpot.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {currentSpot.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {currentSpot.address}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mb-6">
                  {currentSpot.story}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-gray-900">
                      {currentSpot.stats.likes}
                    </p>
                    <p className="text-xs text-gray-500">좋아요</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-gray-900">
                      {currentSpot.stats.views}
                    </p>
                    <p className="text-xs text-gray-500">조회</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-gray-900">
                      {currentSpot.stats.visits}
                    </p>
                    <p className="text-xs text-gray-500">방문</p>
                  </div>
                </div>

                {/* 최근 방문자 */}
                {currentSpot.recentVisitors.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        최근 방문자
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {currentSpot.recentVisitors.map((visitor) => (
                          <img
                            key={visitor.id}
                            src={visitor.avatar}
                            alt={visitor.nickname}
                            title={visitor.nickname}
                            className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {currentSpot.recentVisitors
                          .map((v) => v.nickname)
                          .join(", ")}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      window.open(
                        `https://map.kakao.com/link/search/${encodeURIComponent(currentSpot.name + " " + currentSpot.address)}`,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-500 text-white rounded-xl font-medium"
                  >
                    <Navigation className="h-4 w-4" />
                    카카오맵
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://map.naver.com/v5/search/${encodeURIComponent(currentSpot.name + " " + currentSpot.address)}`,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-medium"
                  >
                    <Navigation className="h-4 w-4" />
                    네이버지도
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 목업 안내 */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <Link
            href="/mockup"
            className="text-xs text-white/50 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full"
          >
            방향 D 목업 — 릴스형 탐색
          </Link>
        </div>
      </div>
    </Layout>
  );
}
