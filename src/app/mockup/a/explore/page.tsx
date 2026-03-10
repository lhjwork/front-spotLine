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
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import KakaoMapView from "./KakaoMapView";
import NaverMapView from "./NaverMapView";

type ViewMode = "list" | "kakao" | "naver";

const MOCK_SPOTS = [
  {
    id: "ondo-coffee",
    name: "온도 커피",
    category: "cafe",
    description: "핸드드립 전문 카페. 조용한 분위기에서 원두의 풍미를 즐길 수 있는 곳.",
    image: "https://picsum.photos/seed/cafe1/400/300",
    distance: 120,
    walkingTime: 2,
    rating: 4.8,
    tags: ["핸드드립", "디저트", "작업하기 좋은"],
    author: "크루 민지",
    area: "성수",
  },
  {
    id: "eulji-gallery",
    name: "을지 갤러리",
    category: "exhibition",
    description: "현대미술 기획전이 열리는 소규모 갤러리. 이달의 전시: '도시의 단면'",
    image: "https://picsum.photos/seed/gallery1/400/300",
    distance: 350,
    walkingTime: 5,
    rating: 4.6,
    tags: ["현대미술", "사진전", "무료입장"],
    author: "크루 지훈",
    area: "을지로",
  },
  {
    id: "mido-restaurant",
    name: "미도식당",
    category: "restaurant",
    description: "40년 전통의 수제 돈까스. 점심시간에는 줄을 서야 할 수도 있습니다.",
    image: "https://picsum.photos/seed/restaurant1/400/300",
    distance: 200,
    walkingTime: 3,
    rating: 4.9,
    tags: ["돈까스", "점심맛집", "웨이팅"],
    author: "크루 수연",
    area: "을지로",
  },
  {
    id: "moment-shop",
    name: "소품샵 모먼트",
    category: "shopping",
    description: "감성적인 소품과 문구를 큐레이션하는 작은 가게.",
    image: "https://picsum.photos/seed/shop1/400/300",
    distance: 180,
    walkingTime: 3,
    rating: 4.5,
    tags: ["문구", "소품", "선물"],
    author: "크루 민지",
    area: "성수",
  },
  {
    id: "roasting-house",
    name: "로스팅 하우스",
    category: "cafe",
    description: "직접 로스팅한 원두로 내린 커피와 수제 베이커리를 즐길 수 있는 공간.",
    image: "https://picsum.photos/seed/cafe2/400/300",
    distance: 450,
    walkingTime: 6,
    rating: 4.7,
    tags: ["로스팅", "베이커리", "테라스"],
    author: "크루 지훈",
    area: "연남",
  },
  {
    id: "page-bookcafe",
    name: "북카페 페이지",
    category: "cafe",
    description: "독립출판물과 커피를 함께 즐길 수 있는 조용한 북카페.",
    image: "https://picsum.photos/seed/bookcafe1/400/300",
    distance: 300,
    walkingTime: 4,
    rating: 4.4,
    tags: ["독립출판", "조용한", "읽기좋은"],
    author: "크루 수연",
    area: "망원",
  },
];

const CATEGORIES = [
  { key: "all", label: "전체", icon: SlidersHorizontal },
  { key: "cafe", label: "카페", icon: Coffee },
  { key: "restaurant", label: "맛집", icon: UtensilsCrossed },
  { key: "exhibition", label: "전시", icon: Palette },
  { key: "shopping", label: "쇼핑", icon: ShoppingBag },
];

const SORT_OPTIONS = ["가까운 순", "평점 높은 순", "최신 등록 순"];

export default function MockupAExplore() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const filteredSpots =
    selectedCategory === "all"
      ? MOCK_SPOTS
      : MOCK_SPOTS.filter((s) => s.category === selectedCategory);

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
          <KakaoMapView selectedCategory={selectedCategory} />
        )}

        {viewMode === "naver" && (
          <NaverMapView selectedCategory={selectedCategory} />
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
              {filteredSpots.map((spot) => (
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
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                        {CATEGORIES.find((c) => c.key === spot.category)
                          ?.label || spot.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <User className="h-3 w-3" />
                        {spot.author}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {spot.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {spot.description}
                    </p>

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
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
