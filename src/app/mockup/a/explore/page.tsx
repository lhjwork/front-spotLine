"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  Coffee,
  Palette,
  UtensilsCrossed,
  ShoppingBag,
  Navigation,
  SlidersHorizontal,
  ArrowLeft,
  Star,
  ChevronDown,
  Heart,
  User,
  List,
  Map,
  Eye,
  BookOpen,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import KakaoMapView from "./KakaoMapView";
import NaverMapView from "./NaverMapView";
import { MOCK_SPOTS } from "@/data/mockup";
import type { MockupSpot } from "@/types";

type ViewMode = "list" | "kakao" | "naver";
type SourceFilter = "all" | "spotline" | "user";

const CATEGORIES = [
  { key: "all", label: "전체", icon: SlidersHorizontal },
  { key: "cafe", label: "카페", icon: Coffee },
  { key: "restaurant", label: "맛집", icon: UtensilsCrossed },
  { key: "exhibition", label: "전시", icon: Palette },
  { key: "shopping", label: "쇼핑", icon: ShoppingBag },
  { key: "culture", label: "문화", icon: BookOpen },
];

const SOURCE_FILTERS: { key: SourceFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "spotline", label: "⚡ SpotLine" },
  { key: "user", label: "👤 유저" },
];

const SORT_OPTIONS = ["가까운 순", "평점 높은 순", "최신 등록 순"];

export default function MockupAExplore() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSource, setSelectedSource] = useState<SourceFilter>("all");
  const [sortBy, setSortBy] = useState("가까운 순");
  const [showSort, setShowSort] = useState(false);
  const [likedSpots, setLikedSpots] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedSpots((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredSpots = MOCK_SPOTS.filter((s) => {
    const categoryMatch =
      selectedCategory === "all" || s.category === selectedCategory;
    const sourceMatch =
      selectedSource === "all" || s.source === selectedSource;
    return categoryMatch && sourceMatch;
  });

  const getSourceBadge = (spot: MockupSpot) => {
    if (spot.source === "spotline") {
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
  };

  return (
    <Layout showFooter={false} showHeader={false}>
      <div className="max-w-2xl mx-auto">
        {/* 상단 헤더 */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <Link
              href="/mockup/a"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900">주변 Spot</h1>
              <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                <Navigation className="h-3 w-3" />
                <span>성수동 부근</span>
              </div>
            </div>

            {/* 뷰 모드 토글 */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="리스트 보기"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("kakao")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "kakao"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="카카오맵"
              >
                <Map className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("naver")}
                className={`p-1.5 rounded-md transition-colors text-[10px] font-bold leading-none ${
                  viewMode === "naver"
                    ? "bg-white text-[#03c75a] shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="네이버맵"
              >
                N
              </button>
            </div>
          </div>

          {/* 소스 필터 */}
          <div className="px-4 pb-2 flex gap-2">
            {SOURCE_FILTERS.map((sf) => {
              const isActive = selectedSource === sf.key;
              return (
                <button
                  key={sf.key}
                  onClick={() => setSelectedSource(sf.key)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {sf.label}
                </button>
              );
            })}
          </div>

          {/* 카테고리 필터 */}
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 지도 뷰 */}
        {viewMode === "kakao" && (
          <KakaoMapView selectedCategory={selectedCategory} selectedSource={selectedSource} />
        )}

        {viewMode === "naver" && (
          <NaverMapView selectedCategory={selectedCategory} selectedSource={selectedSource} />
        )}

        {/* 리스트 뷰 */}
        {viewMode === "list" && (
          <>
            {/* 정렬 & 결과 수 */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {filteredSpots.length}개의 Spot
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {sortBy}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSortBy(opt);
                          setShowSort(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          sortBy === opt
                            ? "text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Spot 카드 리스트 */}
            <div className="px-4 pb-24 space-y-4">
              {filteredSpots.map((spot) => {
                const badge = getSourceBadge(spot);
                return (
                  <Link
                    key={spot.id}
                    href={`/mockup/a/spots/${spot.id}`}
                    className="block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48 bg-gray-200">
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-xs bg-black/60 text-white backdrop-blur-sm px-2.5 py-1 rounded-full">
                          {spot.area}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium">
                            {spot.rating}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleLike(spot.id);
                          }}
                          className="flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              likedSpots.has(spot.id)
                                ? "text-red-500 fill-red-500"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                          {spot.categoryLabel}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <User className="h-3 w-3" />
                          {badge.name}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {spot.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {spot.description}
                      </p>

                      {/* User activity stats */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Eye className="h-3.5 w-3.5" />
                          {spot.userStats.visitCount}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Heart className="h-3.5 w-3.5" />
                          {spot.userStats.likeCount}
                        </span>
                        {spot.userStats.recentVisitors.length > 0 && (
                          <div className="flex items-center gap-1.5 ml-auto">
                            <div className="flex -space-x-2">
                              {spot.userStats.recentVisitors
                                .slice(0, 3)
                                .map((visitor) => (
                                  <img
                                    key={visitor.id}
                                    src={visitor.avatar}
                                    alt={visitor.nickname}
                                    title={visitor.nickname}
                                    className="w-5 h-5 rounded-full border-2 border-white object-cover"
                                  />
                                ))}
                            </div>
                            <span className="text-[10px] text-gray-400">
                              최근 방문
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {spot.distance}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            도보 {spot.walkingTime}분
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          {spot.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
