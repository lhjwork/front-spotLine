"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
  ThumbsUp,
  MessageCircle,
  Zap,
  Compass,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MOCK_SPOTS, getActivitiesForSpot } from "@/data/mockup";
import type { MockupSpot, UserSpotActivity } from "@/types";

// Generate a story object from spot description
function generateStory(spot: MockupSpot): { title: string; content: string } {
  const areaName = spot.area;
  const categoryLabel = spot.categoryLabel;

  if (spot.source === "spotline") {
    return {
      title: `${areaName}에서 만나는 ${spot.name}`,
      content: `${spot.description}\n\n${spot.name}은(는) ${areaName} 지역의 ${categoryLabel} 중에서도 특별한 매력을 가진 곳입니다. SpotLine 크루가 직접 방문하고 엄선한 이 장소는 방문자들에게 잊지 못할 경험을 선사합니다.\n\n${spot.tags.map((t) => `#${t}`).join(" ")} 등의 키워드로 사랑받고 있으며, 지금까지 ${spot.userStats.visitCount}명이 방문했습니다.\n\n${spot.address}에 위치해 있으니, 가까운 곳에 계시다면 꼭 한번 들러보세요.`,
    };
  }

  return {
    title: `유저가 발견한 숨은 명소, ${spot.name}`,
    content: `${spot.description}\n\n${spot.recommendedBy?.nickname || "유저"}님이 직접 추천한 이 장소는 ${areaName} 지역에서 ${categoryLabel}을(를) 찾는 분들에게 딱 맞는 곳입니다.\n\n${spot.tags.map((t) => `#${t}`).join(" ")} 같은 매력 포인트를 가지고 있어, 이미 ${spot.userStats.likeCount}명이 좋아요를 눌렀습니다.\n\n실제 방문자들의 생생한 후기와 함께, 이 장소의 진짜 매력을 느껴보세요.`,
  };
}

// Get recommended next spots (same area or same category, excluding current)
function getNextSpots(current: MockupSpot): MockupSpot[] {
  const sameArea = MOCK_SPOTS.filter(
    (s) => s.id !== current.id && s.area === current.area
  );
  const sameCategory = MOCK_SPOTS.filter(
    (s) =>
      s.id !== current.id &&
      s.category === current.category &&
      !sameArea.some((a) => a.id === s.id)
  );
  return [...sameArea, ...sameCategory].slice(0, 3);
}

// Activity type label
function activityTypeLabel(type: UserSpotActivity["type"]): string {
  switch (type) {
    case "visit":
      return "방문";
    case "like":
      return "좋아요";
    case "recommend":
      return "추천";
    default:
      return "";
  }
}

// Format relative time
function formatRelativeTime(dateStr: string): string {
  const now = new Date("2026-03-10T12:00:00");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "방금 전";
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${Math.floor(diffDays / 7)}주 전`;
}

export default function SpotDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const spot = MOCK_SPOTS.find((s) => s.slug === slug);

  const [liked, setLiked] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!spot) {
    return (
      <Layout showFooter={false} showHeader={false}>
        <div className="max-w-2xl mx-auto bg-white min-h-screen flex flex-col items-center justify-center p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            장소를 찾을 수 없습니다
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            요청하신 Spot 정보가 존재하지 않습니다.
          </p>
          <Link
            href="/mockup/a/explore"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            탐색으로 돌아가기
          </Link>
        </div>
      </Layout>
    );
  }

  const story = generateStory(spot);
  const nextSpots = getNextSpots(spot);
  const activities = getActivitiesForSpot(spot.id);
  const images = spot.images || [spot.image];

  return (
    <Layout showFooter={false} showHeader={false}>
      <div className="max-w-2xl mx-auto bg-white min-h-screen">
        {/* 히어로 이미지 */}
        <div className="relative h-72 md:h-96 bg-gray-200">
          <img
            src={spot.image}
            alt={spot.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* 상단 네비게이션 */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <Link
              href="/mockup/a/explore"
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
                  className={cn(
                    "h-5 w-5",
                    liked ? "text-red-500 fill-red-500" : "text-gray-700"
                  )}
                />
              </button>
              <button className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow">
                <Share2 className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* 소스 배지 */}
          <div className="absolute top-16 left-4">
            {spot.source === "spotline" ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-600 text-white px-2.5 py-1 rounded-full shadow">
                <Zap className="h-3 w-3" />
                SpotLine 제휴
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-600 text-white px-2.5 py-1 rounded-full shadow">
                <User className="h-3 w-3" />
                유저 추천
              </span>
            )}
          </div>

          {/* 하단 기본 정보 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                {spot.categoryLabel}
              </span>
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                {spot.area}
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
                className={cn(
                  "shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                  selectedImage === i
                    ? "border-blue-600"
                    : "border-transparent"
                )}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                />
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

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {spot.author || spot.recommendedBy?.nickname || "익명"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {spot.distance}m · 도보 {spot.walkingTime}분
            </span>
          </div>

          {/* 태그 */}
          <div className="flex flex-wrap gap-2 mt-3">
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

        {/* 유저 활동 섹션 */}
        <div className="px-4 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3">유저 활동</h2>

          {/* 통계 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Eye className="h-4 w-4 text-blue-500" />
              <span>
                방문{" "}
                <span className="font-bold text-gray-900">
                  {spot.userStats.visitCount}
                </span>
              </span>
            </div>
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <ThumbsUp className="h-4 w-4 text-red-500" />
              <span>
                좋아요{" "}
                <span className="font-bold text-gray-900">
                  {spot.userStats.likeCount}
                </span>
              </span>
            </div>
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MessageCircle className="h-4 w-4 text-green-500" />
              <span>
                추천{" "}
                <span className="font-bold text-gray-900">
                  {spot.userStats.recommendCount}
                </span>
              </span>
            </div>
          </div>

          {/* 최근 방문자 */}
          {spot.userStats.recentVisitors.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">최근 방문자</p>
              <div className="flex items-center gap-3">
                {spot.userStats.recentVisitors.map((visitor) => (
                  <div
                    key={visitor.id}
                    className="flex items-center gap-1.5"
                  >
                    <img
                      src={visitor.avatar}
                      alt={visitor.nickname}
                      className="w-7 h-7 rounded-full object-cover border border-gray-200"
                    />
                    <span className="text-xs text-gray-600">
                      {visitor.nickname}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 최근 활동 피드 */}
          {activities.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">최근 활동</p>
              <div className="space-y-2">
                {activities.slice(0, 3).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={activity.user.avatar}
                      alt={activity.user.nickname}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-gray-900">
                          {activity.user.nickname}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                            activity.type === "visit" &&
                              "bg-blue-100 text-blue-700",
                            activity.type === "like" &&
                              "bg-red-100 text-red-700",
                            activity.type === "recommend" &&
                              "bg-green-100 text-green-700"
                          )}
                        >
                          {activityTypeLabel(activity.type)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatRelativeTime(activity.createdAt)}
                        </span>
                      </div>
                      {activity.review && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {activity.review}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SpotLine 정보 (제휴 Spot) */}
        {spot.source === "spotline" && spot.spotlineAffiliation && (
          <div className="px-4 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              SpotLine 정보
            </h2>
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: spot.spotlineAffiliation.spotlineColor + "40",
                backgroundColor:
                  spot.spotlineAffiliation.spotlineColor + "08",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    backgroundColor:
                      spot.spotlineAffiliation.spotlineColor,
                  }}
                >
                  SL
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900">
                    {spot.spotlineAffiliation.spotlineName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    큐레이터: {spot.spotlineAffiliation.curatorName}
                  </p>
                </div>
                {spot.spotlineAffiliation.isPartner && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    공식 파트너
                  </span>
                )}
              </div>
              {spot.spotlineAffiliation.partnerSince && (
                <p className="text-[10px] text-gray-400 mt-2 ml-13">
                  제휴 시작: {spot.spotlineAffiliation.partnerSince}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 추천한 유저 (유저 Spot) */}
        {spot.source === "user" && spot.recommendedBy && (
          <div className="px-4 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              추천한 유저
            </h2>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <img
                src={spot.recommendedBy.avatar}
                alt={spot.recommendedBy.nickname}
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
              />
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {spot.recommendedBy.nickname}
                </h3>
                <p className="text-xs text-gray-500">
                  이 장소를 추천했습니다
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* SpotLine Story (확장 가능) */}
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
            className={cn(
              "text-sm text-gray-700 leading-relaxed whitespace-pre-line transition-all",
              !storyExpanded && "line-clamp-4"
            )}
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

        {/* 다음 Spot 추천 */}
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
            {nextSpots.map((next) => (
              <Link
                key={next.id}
                href={`/mockup/a/spots/${next.slug}`}
                className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {/* 이미지 */}
                  <div className="relative w-28 h-28 shrink-0 bg-gray-200">
                    <img
                      src={next.image}
                      alt={next.name}
                      className="w-full h-full object-cover"
                    />
                    {/* 소스 인디케이터 */}
                    <div className="absolute top-1.5 left-1.5">
                      {next.source === "spotline" ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-medium bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                          <Zap className="h-2.5 w-2.5" />
                          제휴
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-medium bg-purple-600 text-white px-1.5 py-0.5 rounded-full">
                          <User className="h-2.5 w-2.5" />
                          유저
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                          {next.categoryLabel}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-600">
                            {next.rating}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {next.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {next.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {next.distance}m
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {next.walkingTime}분
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

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
            href="/mockup/a/explore"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            <Navigation className="h-4 w-4" />
            주변 탐색
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
