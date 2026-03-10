"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  Star,
  X,
  Navigation,
  ChevronRight,
  ChevronLeft,
  Heart,
  Eye,
  Zap,
  User,
  Search,
  Coffee,
  Palette,
  UtensilsCrossed,
  ShoppingBag,
  BookOpen,
  SlidersHorizontal,
  Compass,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { MOCK_SPOTS } from "@/data/mockup";
import type { MockupSpot } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  cafe: "#f59e0b",
  restaurant: "#ef4444",
  exhibition: "#a855f7",
  shopping: "#22c55e",
  culture: "#6366f1",
};

const CATEGORY_TABS = [
  { key: "all", label: "전체", icon: SlidersHorizontal },
  { key: "cafe", label: "카페", icon: Coffee },
  { key: "restaurant", label: "맛집", icon: UtensilsCrossed },
  { key: "exhibition", label: "전시", icon: Palette },
  { key: "shopping", label: "쇼핑", icon: ShoppingBag },
  { key: "culture", label: "문화", icon: BookOpen },
];

const MOCK_MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  "ondo-coffee": { x: 45, y: 30 },
  "eulji-gallery": { x: 70, y: 20 },
  "mido-restaurant": { x: 58, y: 50 },
  "moment-shop": { x: 32, y: 52 },
  "roasting-house": { x: 18, y: 25 },
  "hidden-alley-cafe": { x: 52, y: 40 },
  "vintage-bookshop": { x: 12, y: 45 },
  "rooftop-bar-euljiro": { x: 75, y: 42 },
  "photo-studio-seongsu": { x: 40, y: 65 },
};

type MapStyle = "kakao" | "naver";

const MAP_THEMES: Record<MapStyle, {
  bg: string;
  building: string;
  buildingStroke: string;
  roadMain: string;
  roadMainCenter: string;
  park: string;
  parkTree: string;
  label: string;
  labelColor: string;
  accentColor: string;
  locationDot: string;
  brandLabel: string;
  selectedBg: string;
}> = {
  kakao: {
    bg: "#f0ede6",
    building: "#ddd8ce",
    buildingStroke: "#ccc6ba",
    roadMain: "#f5d86e",
    roadMainCenter: "#fce76b",
    park: "#b8d8b0",
    parkTree: "#9ac590",
    label: "#888",
    labelColor: "Kakao",
    accentColor: "#FEE500",
    locationDot: "bg-blue-600",
    brandLabel: "카카오 스타일",
    selectedBg: "bg-[#FEE500]",
  },
  naver: {
    bg: "#f5f6f4",
    building: "#e8e8e8",
    buildingStroke: "#d4d4d4",
    roadMain: "#fde68a",
    roadMainCenter: "#fcd34d",
    park: "#c7e6c7",
    parkTree: "#a8d5a8",
    label: "#666",
    labelColor: "Naver",
    accentColor: "#03c75a",
    locationDot: "bg-[#03c75a]",
    brandLabel: "네이버 스타일",
    selectedBg: "bg-[#03c75a]",
  },
};

interface SpotLineMapViewProps {
  selectedCategory: string;
  selectedSource: "all" | "spotline" | "user";
  onCategoryChange: (cat: string) => void;
  onSourceChange: (src: "all" | "spotline" | "user") => void;
  mapStyle?: MapStyle;
}

export default function SpotLineMapView({
  selectedCategory,
  selectedSource,
  onCategoryChange,
  onSourceChange,
  mapStyle = "kakao",
}: SpotLineMapViewProps) {
  const theme = MAP_THEMES[mapStyle];
  const [selectedSpot, setSelectedSpot] = useState<MockupSpot | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpots = MOCK_SPOTS.filter((s) => {
    const categoryMatch =
      selectedCategory === "all" || s.category === selectedCategory;
    const sourceMatch =
      selectedSource === "all" || s.source === selectedSource;
    const searchMatch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.categoryLabel.includes(searchQuery);
    return categoryMatch && sourceMatch && searchMatch;
  });

  const handleSpotClick = (spot: MockupSpot) => {
    setSelectedSpot(selectedSpot?.id === spot.id ? null : spot);
  };

  return (
    <div className="relative w-full h-[calc(100vh-56px)] flex overflow-hidden">
      {/* ===== 좌측 사이드 패널 ===== */}
      <div
        className={`relative z-20 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
          panelOpen ? "w-[280px]" : "w-0"
        }`}
      >
        {panelOpen && (
          <>
            {/* 검색바 */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="SpotLine 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* 카테고리 탭 (가로 스크롤) */}
            <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-hide border-b border-gray-100">
              {CATEGORY_TABS.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.key;
                const color = CATEGORY_COLORS[cat.key];
                return (
                  <button
                    key={cat.key}
                    onClick={() => onCategoryChange(cat.key)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors shrink-0 ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {color && !isActive ? (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    ) : (
                      <Icon className="h-3 w-3 shrink-0" />
                    )}
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* 소스 필터 */}
            <div className="flex gap-1 px-3 py-2 border-b border-gray-100">
              {(["all", "spotline", "user"] as const).map((src) => {
                const isActive = selectedSource === src;
                const label =
                  src === "all"
                    ? "전체"
                    : src === "spotline"
                    ? "⚡ SpotLine"
                    : "👤 유저";
                return (
                  <button
                    key={src}
                    onClick={() => onSourceChange(src)}
                    className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* 결과 수 */}
            <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-50">
              {filteredSpots.length}개의 Spot
            </div>

            {/* Spot 리스트 (스크롤) */}
            <div className="flex-1 overflow-y-auto">
              {filteredSpots.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Search className="h-8 w-8 mb-2" />
                  <p className="text-sm">조건에 맞는 Spot이 없습니다</p>
                </div>
              )}
              {filteredSpots.map((spot) => {
                const isActive = selectedSpot?.id === spot.id;
                const isSpotline = spot.source === "spotline";
                return (
                  <button
                    key={spot.id}
                    onClick={() => handleSpotClick(spot)}
                    className={`w-full text-left border-b border-gray-50 transition-colors ${
                      isActive ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex gap-3 p-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                        <img
                          src={spot.image}
                          alt={spot.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          {isSpotline ? (
                            <span className="text-[9px] font-medium text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
                              ⚡
                            </span>
                          ) : (
                            <span className="text-[9px] font-medium text-purple-600 bg-purple-50 px-1 py-0.5 rounded border border-purple-200">
                              👤
                            </span>
                          )}
                          <span className="text-[9px] text-gray-500">
                            {spot.categoryLabel}
                          </span>
                          <div className="flex items-center gap-0.5 ml-auto">
                            <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-[10px] font-medium">
                              {spot.rating}
                            </span>
                          </div>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 truncate">
                          {spot.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {spot.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {spot.distance}m
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Eye className="h-2.5 w-2.5" />
                            {spot.userStats.visitCount}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Heart className="h-2.5 w-2.5" />
                            {spot.userStats.likeCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 패널 토글 버튼 */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="absolute z-30 top-1/2 -translate-y-1/2 transition-all duration-300"
        style={{ left: panelOpen ? "268px" : "0px" }}
      >
        <div className="flex items-center justify-center w-6 h-14 bg-white border border-gray-200 rounded-r-lg shadow-md hover:bg-gray-50">
          {panelOpen ? (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* ===== 우측 지도 영역 ===== */}
      <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: theme.bg }}>
        {/* SVG 지도 */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill={theme.bg} />
          {/* 건물 블록 */}
          {[
            { x: "5%", y: "5%", w: "20%", h: "10%" },
            { x: "5%", y: "18%", w: "12%", h: "7%" },
            { x: "30%", y: "3%", w: "16%", h: "9%" },
            { x: "55%", y: "6%", w: "10%", h: "7%" },
            { x: "70%", y: "3%", w: "22%", h: "12%" },
            { x: "50%", y: "55%", w: "12%", h: "10%" },
            { x: "72%", y: "35%", w: "10%", h: "16%" },
            { x: "3%", y: "48%", w: "16%", h: "8%" },
            { x: "28%", y: "58%", w: "18%", h: "12%" },
            { x: "58%", y: "70%", w: "14%", h: "8%" },
            { x: "3%", y: "72%", w: "18%", h: "10%" },
            { x: "78%", y: "58%", w: "14%", h: "12%" },
            { x: "85%", y: "78%", w: "10%", h: "8%" },
          ].map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill={theme.building} stroke={theme.buildingStroke} strokeWidth="0.5" />
          ))}
          {/* 공원 */}
          <rect x="80%" y="82%" width="16%" height="10%" rx="4" fill={theme.park} stroke={theme.parkTree} strokeWidth="0.5" />
          <circle cx="84%" cy="86%" r="2%" fill={theme.parkTree} opacity="0.5" />
          <circle cx="90%" cy="88%" r="1.5%" fill={theme.parkTree} opacity="0.5" />
          {/* 주요 도로 */}
          <line x1="0" y1="44%" x2="100%" y2="44%" stroke={theme.roadMain} strokeWidth="12" />
          <line x1="0" y1="44%" x2="100%" y2="44%" stroke={theme.roadMainCenter} strokeWidth="8" />
          <line x1="48%" y1="0" x2="48%" y2="100%" stroke={theme.roadMain} strokeWidth="12" />
          <line x1="48%" y1="0" x2="48%" y2="100%" stroke={theme.roadMainCenter} strokeWidth="8" />
          {/* 보조 도로 */}
          <line x1="0" y1="16%" x2="70%" y2="16%" stroke="#ffffff" strokeWidth="5" />
          <line x1="25%" y1="0" x2="25%" y2="56%" stroke="#ffffff" strokeWidth="5" />
          <line x1="70%" y1="18%" x2="70%" y2="78%" stroke="#ffffff" strokeWidth="5" />
          <line x1="15%" y1="62%" x2="88%" y2="62%" stroke="#ffffff" strokeWidth="5" />
          <line x1="0" y1="33%" x2="42%" y2="33%" stroke="#ffffff" strokeWidth="4" />
          <line x1="54%" y1="26%" x2="88%" y2="26%" stroke="#ffffff" strokeWidth="4" />
          <line x1="38%" y1="72%" x2="38%" y2="95%" stroke="#ffffff" strokeWidth="4" />
          {/* 지역 라벨 */}
          <text x="36%" y="9%" fontSize="11" fill={theme.label} fontWeight="500" fontFamily="sans-serif">성수동2가</text>
          <text x="62%" y="38%" fontSize="11" fill={theme.label} fontWeight="500" fontFamily="sans-serif">을지로3가</text>
          <text x="6%" y="38%" fontSize="11" fill={theme.label} fontWeight="500" fontFamily="sans-serif">연남동</text>
          <text x="6%" y="68%" fontSize="11" fill={theme.label} fontWeight="500" fontFamily="sans-serif">망원동</text>
          <text x="30%" y="82%" fontSize="10" fill={theme.label} fontWeight="400" fontFamily="sans-serif">합정역</text>
        </svg>

        {/* 현재 위치 마커 */}
        <div
          className="absolute z-10"
          style={{ left: "48%", top: "44%", transform: "translate(-50%, -50%)" }}
        >
          <div className="relative">
            <div className={`w-5 h-5 ${theme.locationDot} rounded-full border-[3px] border-white shadow-lg`} />
            <div className={`absolute inset-0 w-5 h-5 ${theme.locationDot} rounded-full animate-ping opacity-25`} />
          </div>
        </div>

        {/* Spot 핀들 */}
        {filteredSpots.map((spot) => {
          const isSelected = selectedSpot?.id === spot.id;
          const pos = MOCK_MAP_POSITIONS[spot.id] || { x: 50, y: 50 };
          const isSpotline = spot.source === "spotline";
          const catColor = CATEGORY_COLORS[spot.category] || "#6b7280";

          return (
            <button
              key={spot.id}
              onClick={() => handleSpotClick(spot)}
              className="absolute z-20 group"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div
                className={`relative transition-transform ${
                  isSelected ? "scale-125" : "group-hover:scale-110"
                }`}
              >
                {/* 이름 라벨 */}
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap px-2 py-1 rounded-lg text-[11px] font-bold shadow-md transition-all ${
                    isSelected
                      ? "text-white scale-100 opacity-100"
                      : "bg-white text-gray-800 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 border border-gray-200"
                  }`}
                  style={isSelected ? { backgroundColor: theme.accentColor, color: mapStyle === "kakao" ? "#000" : "#fff" } : undefined}
                >
                  {isSpotline ? "⚡" : "👤"} {spot.name}
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent"
                    style={isSelected ? { borderTopColor: theme.accentColor } : { borderTopColor: "white" }}
                  />
                </div>
                {/* 핀 마커 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-[3px] ${
                      isSelected
                        ? ""
                        : isSpotline
                        ? "border-blue-400"
                        : "border-purple-400"
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: theme.accentColor, borderColor: theme.accentColor }
                        : { backgroundColor: catColor }
                    }
                  >
                    <MapPin className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div
                    className="w-1.5 h-1.5 rotate-45 -mt-1 shadow"
                    style={{
                      backgroundColor: isSelected ? theme.accentColor : catColor,
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}

        {/* SpotLine 브랜드 라벨 */}
        <div className="absolute top-3 left-3 z-30">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm border border-gray-200">
            <Compass className="h-4 w-4" style={{ color: theme.accentColor }} />
            <span className="text-sm font-bold text-gray-900">SpotLine</span>
            <span className="text-[10px] font-medium" style={{ color: theme.accentColor }}>
              {theme.brandLabel}
            </span>
          </div>
        </div>

        {/* 지도 유형 토글 */}
        <div className="absolute top-3 right-3 z-30 flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button className="px-3 py-1.5 text-[10px] font-medium text-blue-600 bg-blue-50 border-r border-gray-200">
            일반
          </button>
          <button className="px-3 py-1.5 text-[10px] font-medium text-gray-500 hover:bg-gray-50">
            위성
          </button>
        </div>

        {/* 우측 컨트롤 */}
        <div className="absolute right-3 top-14 z-30 flex flex-col gap-2">
          {/* 줌 컨트롤 */}
          <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 border-b border-gray-200">
              <Plus className="h-4 w-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50">
              <Minus className="h-4 w-4" />
            </button>
          </div>

          {/* 내 위치 */}
          <button className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
            <Navigation className="h-4 w-4" style={{ color: theme.accentColor }} />
          </button>
        </div>

        {/* 범례 */}
        <div className="absolute bottom-3 left-3 z-30 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-2.5">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="flex items-center gap-1 text-[10px] font-medium">
              <span className="w-3 h-3 rounded-full bg-blue-600 border-2 border-blue-300" />
              SpotLine
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium">
              <span className="w-3 h-3 rounded-full bg-purple-600 border-2 border-purple-300" />
              유저 추천
            </span>
          </div>
          <div className="flex items-center gap-2">
            {Object.entries(CATEGORY_COLORS).map(([key, color]) => {
              const label =
                key === "cafe"
                  ? "카페"
                  : key === "restaurant"
                  ? "맛집"
                  : key === "exhibition"
                  ? "전시"
                  : key === "shopping"
                  ? "쇼핑"
                  : "문화";
              return (
                <span
                  key={key}
                  className="flex items-center gap-0.5 text-[9px] text-gray-500"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* 선택된 Spot 카드 */}
        {selectedSpot && (
          <SpotCard
            spot={selectedSpot}
            onClose={() => setSelectedSpot(null)}
          />
        )}
      </div>
    </div>
  );
}

function SpotCard({
  spot,
  onClose,
}: {
  spot: MockupSpot;
  onClose: () => void;
}) {
  const isSpotline = spot.source === "spotline";
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-[360px]">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center bg-black/40 rounded-full"
        >
          <X className="h-3.5 w-3.5 text-white" />
        </button>
        <div className="flex">
          <div className="relative w-28 h-28 shrink-0 bg-gray-200">
            <img
              src={spot.image}
              alt={spot.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                {isSpotline ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-medium text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
                    <Zap className="h-2.5 w-2.5" />
                    SpotLine
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[9px] font-medium text-purple-600 bg-purple-50 px-1 py-0.5 rounded border border-purple-200">
                    <User className="h-2.5 w-2.5" />
                    유저 추천
                  </span>
                )}
                <span className="text-[9px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                  {spot.categoryLabel}
                </span>
                <div className="flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] font-medium">{spot.rating}</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-sm truncate">
                {spot.name}
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                {spot.description}
              </p>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] text-gray-400 mt-1">
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {spot.distance}m
              </span>
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {spot.walkingTime}분
              </span>
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
        </div>
        {/* 하단 액션 */}
        <div className="px-3 pb-3 flex gap-2">
          {spot.userStats.recentVisitors.length > 0 && (
            <div className="flex items-center gap-1.5 mr-auto">
              <div className="flex -space-x-1.5">
                {spot.userStats.recentVisitors.slice(0, 3).map((v) => (
                  <img
                    key={v.id}
                    src={v.avatar}
                    alt={v.nickname}
                    className="w-4 h-4 rounded-full border border-white object-cover"
                  />
                ))}
              </div>
              <span className="text-[9px] text-gray-400">최근 방문</span>
            </div>
          )}
          <Link
            href={`/mockup/a/spots/${spot.slug}`}
            className="flex items-center justify-center gap-1 py-2 px-4 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            상세보기
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <button className="flex items-center justify-center gap-1 py-2 px-3 border border-gray-200 rounded-lg text-xs text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            <Navigation className="h-3.5 w-3.5" />
            길찾기
          </button>
        </div>
      </div>
    </div>
  );
}
