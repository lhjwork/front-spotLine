"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  Navigation,
  User,
  Eye,
  TrendingUp,
  Zap,
  Compass,
  MessageCircle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import {
  MOCK_SPOTS,
  getActivitiesForSpot,
} from "@/data/mockup";
import type { MockupSpot } from "@/types";

function getSourceBadge(spot: MockupSpot) {
  if (spot.source === "spotline") {
    return {
      label: "⚡ SpotLine",
      name: spot.spotlineAffiliation?.curatorName || spot.author,
      className: "bg-blue-50 text-blue-700 border border-blue-200",
      badgeBg: "bg-blue-500",
    };
  }
  return {
    label: "👤 유저 추천",
    name: spot.recommendedBy?.nickname || "",
    className: "bg-purple-50 text-purple-700 border border-purple-200",
    badgeBg: "bg-purple-500",
  };
}

// Generate a simple story from spot data
function generateStory(spot: MockupSpot) {
  return {
    title: `${spot.name}의 이야기`,
    content: `${spot.description}\n\n${spot.area} 지역에 위치한 ${spot.categoryLabel} 장소로, ${spot.tags.map((t) => `#${t}`).join(" ")} 등의 특징이 있습니다.\n\n${
      spot.source === "spotline"
        ? `${spot.spotlineAffiliation?.spotlineName}의 ${spot.spotlineAffiliation?.curatorName}이(가) 큐레이션한 공간입니다.`
        : `${spot.recommendedBy?.nickname}님이 추천한 장소입니다.`
    }\n\n방문자 ${spot.userStats.visitCount}명, 좋아요 ${spot.userStats.likeCount}개를 기록하고 있으며 평점 ${spot.rating}의 인기 장소입니다.`,
  };
}

export default function MockupBSpotDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const spotlineId = searchParams.get("spotline");
  const areaId = searchParams.get("area");
  const themeId = searchParams.get("theme");
  const queryString = spotlineId
    ? `spotline=${spotlineId}`
    : areaId
    ? `area=${areaId}`
    : themeId
    ? `theme=${themeId}`
    : "";

  const spot = MOCK_SPOTS.find((s) => s.slug === slug);

  const [liked, setLiked] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!spot) {
    return (
      <Layout showFooter={false} showHeader={false}>
        <div className="max-w-2xl mx-auto bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">스팟 정보를 찾을 수 없습니다</p>
            <Link
              href={`/mockup/b/spots?${queryString}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const badge = getSourceBadge(spot);
  const story = generateStory(spot);
  const activities = getActivitiesForSpot(spot.id);
  const images = spot.images || [spot.image];
  const heroImage = images[selectedImage] || spot.image;

  // Next spots: same area or same category, excluding current
  const nextSpots = MOCK_SPOTS.filter(
    (s) => s.id !== spot.id && (s.area === spot.area || s.category === spot.category)
  ).slice(0, 3);

  return (
    <Layout showFooter={false} showHeader={false}>
      <div className="max-w-2xl mx-auto bg-white min-h-screen">
        {/* 히어로 이미지 */}
        <div className="relative h-72 md:h-96 bg-gray-200">
          <img
            src={heroImage}
            alt={spot.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* 상단 네비게이션 */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <Link
              href={`/mockup/b/spots?${queryString}`}
              className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow"
              >
                <Heart
                  className={`h-5 w-5 ${
                    liked ? "text-red-500 fill-red-500" : "text-gray-700"
                  }`}
                />
              </button>
              <button className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow">
                <Share2 className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* 하단 기본 정보 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs text-white px-2 py-0.5 rounded-full ${badge.badgeBg}`}>
                {spot.categoryLabel}
              </span>
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                {spot.area}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {spot.name}
            </h1>
            <p className="text-white/80 text-sm">{spot.description}</p>
          </div>
        </div>

        {/* 이미지 갤러리 */}
        {images.length > 1 && (
          <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImage === i
                    ? "border-blue-600"
                    : "border-transparent"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* 메타 정보 */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold">{spot.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>{spot.address}</span>
              </div>
            </div>
          </div>

          {/* Source & Author info */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            {spot.source === "spotline" ? (
              <>
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-blue-500" />
                  {spot.spotlineAffiliation?.spotlineName}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {spot.spotlineAffiliation?.curatorName}
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-purple-500" />
                {spot.recommendedBy?.nickname} 추천
              </span>
            )}
          </div>

          {/* User stats */}
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="h-3.5 w-3.5" />
              방문 {spot.userStats.visitCount}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Heart className="h-3.5 w-3.5" />
              좋아요 {spot.userStats.likeCount}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="h-3.5 w-3.5" />
              추천 {spot.userStats.recommendCount}
            </span>
          </div>

          {/* Recent visitors */}
          {spot.userStats.recentVisitors.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex -space-x-2">
                {spot.userStats.recentVisitors.slice(0, 4).map((v) => (
                  <img
                    key={v.id}
                    src={v.avatar}
                    alt={v.nickname}
                    title={v.nickname}
                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">
                {spot.userStats.recentVisitors
                  .slice(0, 2)
                  .map((v) => v.nickname)
                  .join(", ")}
                {spot.userStats.recentVisitors.length > 2 &&
                  ` 외 ${spot.userStats.recentVisitors.length - 2}명`}{" "}
                최근 방문
              </span>
            </div>
          )}

          {/* 태그 */}
          <div className="flex flex-wrap gap-2">
            {spot.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* 지도 링크 */}
        <div className="px-4 py-3 border-b border-gray-100">
          <Link
            href="/mockup/a/explore?view=map"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-xl text-sm text-blue-700 hover:bg-blue-100 transition-colors w-fit"
          >
            <Compass className="h-4 w-4" />
            SpotLine 지도에서 보기
          </Link>
        </div>

        {/* SpotLine Story */}
        <div className="px-4 py-5">
          <button
            onClick={() => setStoryExpanded(!storyExpanded)}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">
                {story.title}
              </h2>
              {storyExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </button>

          <div
            className={`text-sm text-gray-700 leading-relaxed whitespace-pre-line transition-all ${
              storyExpanded ? "" : "line-clamp-4"
            }`}
          >
            {story.content}
          </div>

          {!storyExpanded && (
            <button
              onClick={() => setStoryExpanded(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              더 읽기
            </button>
          )}
        </div>

        {/* 유저 활동 피드 */}
        {activities.length > 0 && (
          <div className="px-4 py-5 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">유저 활동</h2>
              <span className="text-xs text-gray-400">
                {activities.length}개
              </span>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <img
                    src={act.user.avatar}
                    alt={act.user.nickname}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {act.user.nickname}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          act.type === "visit"
                            ? "bg-green-100 text-green-700"
                            : act.type === "like"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {act.type === "visit"
                          ? "방문"
                          : act.type === "like"
                          ? "좋아요"
                          : "추천"}
                      </span>
                    </div>
                    {act.review && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {act.review}
                      </p>
                    )}
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(act.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {act.photos && act.photos.length > 0 && (
                    <img
                      src={act.photos[0]}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 다음 Spot 추천 */}
        {nextSpots.length > 0 && (
          <div className="px-4 py-6 bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-blue-600 rounded-full" />
              <h2 className="text-lg font-bold text-gray-900">
                여기서 이어지는 다음 Spot
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-5 ml-3.5">
              {spot.name}에서 가까운 추천 장소
            </p>

            <div className="space-y-3">
              {nextSpots.map((next) => {
                const nextBadge = getSourceBadge(next);
                return (
                  <Link
                    key={next.id}
                    href={`/mockup/b/spots/${next.slug}?${queryString}`}
                    className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex">
                      <div className="relative w-28 h-28 shrink-0 bg-gray-200">
                        <img
                          src={next.image}
                          alt={next.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                              {next.categoryLabel}
                            </span>
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${nextBadge.className}`}
                            >
                              {nextBadge.label}
                            </span>
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs text-gray-600">
                                {next.rating}
                              </span>
                            </div>
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm truncate">
                            {next.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {next.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {next.distance}m
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {next.walkingTime}분
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Eye className="h-3 w-3" />
                            {next.userStats.visitCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 하단 고정 바 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
          <Link
            href="/mockup/a/explore?view=map"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Compass className="h-4 w-4" />
            SpotLine 지도
          </Link>
          <Link
            href={`/mockup/b/spots?${queryString}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            <Navigation className="h-4 w-4" />
            목록 보기
          </Link>
          <button className="flex items-center justify-center gap-2 py-3 px-5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            <Share2 className="h-4 w-4" />
            공유
          </button>
        </div>
      </div>
    </Layout>
  );
}
