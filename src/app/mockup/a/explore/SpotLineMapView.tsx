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
  Layers,
  LocateFixed,
  Bus,
  Bike,
  Car,
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

export type MapStyle = "kakao" | "naver";

/* ============================================================
 * 카카오맵 vs 네이버지도 — 실제 UI/UX 특성 반영 테마
 * ============================================================
 * 카카오: 따뜻한 베이지 배경, 노란 주요도로, 갈색 건물, 둥근 UI
 * 네이버: 차갑고 밝은 회색 배경, 흰 도로, 파란-회색 건물, 각진 UI
 * ============================================================ */
const MAP_THEMES = {
  kakao: {
    // 지도 배경
    bg: "#f0ede6",
    bgSub: "#e8e4da",
    // 건물
    building: "#ddd8ce",
    buildingStroke: "#ccc6ba",
    buildingHighlight: "#d5cfc3",
    // 도로
    roadMajor: "#f5d86e",
    roadMajorCenter: "#fce76b",
    roadMinor: "#ffffff",
    roadMinorWidth: 5,
    roadOutline: "#e8e3d8",
    // 공원/녹지
    park: "#b8d8b0",
    parkTree: "#9ac590",
    parkLabel: "#5a8a50",
    // 물
    water: "#aad4e5",
    waterStroke: "#8ec4d8",
    // 라벨
    areaLabel: "#7a7060",
    areaLabelSize: 11,
    roadLabel: "#998a70",
    stationLabel: "#3a7bd5",
    stationBg: "#3a7bd5",
    // 브랜드/UI
    accentColor: "#FEE500",
    accentText: "#3C1E1E",
    locationDotColor: "#3a7bd5",
    locationDotBorder: "#ffffff",
    locationPulse: "#3a7bd5",
    // 핀 선택
    selectedPinBg: "#FEE500",
    selectedPinText: "#3C1E1E",
    selectedPinBorder: "#e6cf00",
    // UI 컨트롤
    brandLabel: "카카오맵",
    brandIcon: "🟡",
    controlRadius: "rounded-2xl",
    controlShadow: "shadow-md",
    searchBg: "bg-white",
    searchBorder: "border-gray-200",
    searchRadius: "rounded-full",
    panelBg: "bg-white",
    panelHeaderBg: "bg-[#FEE500]/5",
    activeTabBg: "bg-[#FEE500]",
    activeTabText: "text-[#3C1E1E]",
    mapTypeLabels: ["일반", "스카이뷰"],
    zoomRadius: "rounded-2xl",
    // 범례
    legendBg: "bg-[#FEE500]/10",
    legendBorder: "border-[#FEE500]/30",
    // 하단 교통 탭 (카카오 고유)
    showTrafficTab: true,
    // 스팟카드
    cardRadius: "rounded-3xl",
    cardActionBg: "bg-[#FEE500]",
    cardActionText: "text-[#3C1E1E]",
  },
  naver: {
    // 지도 배경
    bg: "#f7f8f6",
    bgSub: "#eef0ec",
    // 건물
    building: "#dfe1dd",
    buildingStroke: "#c8cbc5",
    buildingHighlight: "#d3d6d0",
    // 도로
    roadMajor: "#fde68a",
    roadMajorCenter: "#fcd34d",
    roadMinor: "#ffffff",
    roadMinorWidth: 6,
    roadOutline: "#d1d5ca",
    // 공원/녹지
    park: "#c7e6c7",
    parkTree: "#a8d5a8",
    parkLabel: "#4a8a4a",
    // 물
    water: "#b5dae8",
    waterStroke: "#9acede",
    // 라벨
    areaLabel: "#555",
    areaLabelSize: 12,
    roadLabel: "#777",
    stationLabel: "#ffffff",
    stationBg: "#03c75a",
    // 브랜드/UI
    accentColor: "#03c75a",
    accentText: "#ffffff",
    locationDotColor: "#03c75a",
    locationDotBorder: "#ffffff",
    locationPulse: "#03c75a",
    // 핀 선택
    selectedPinBg: "#03c75a",
    selectedPinText: "#ffffff",
    selectedPinBorder: "#02a84c",
    // UI 컨트롤
    brandLabel: "네이버 지도",
    brandIcon: "🟢",
    controlRadius: "rounded-lg",
    controlShadow: "shadow-sm",
    searchBg: "bg-white",
    searchBorder: "border-gray-300",
    searchRadius: "rounded-lg",
    panelBg: "bg-white",
    panelHeaderBg: "bg-[#03c75a]/5",
    activeTabBg: "bg-[#03c75a]",
    activeTabText: "text-white",
    mapTypeLabels: ["일반지도", "위성지도"],
    zoomRadius: "rounded-md",
    // 범례
    legendBg: "bg-[#03c75a]/5",
    legendBorder: "border-[#03c75a]/20",
    // 하단 교통 탭 (네이버 고유)
    showTrafficTab: false,
    // 스팟카드
    cardRadius: "rounded-xl",
    cardActionBg: "bg-[#03c75a]",
    cardActionText: "text-white",
  },
} as const;

interface SpotLineMapViewProps {
  selectedCategory: string;
  selectedSource: "all" | "CREW" | "USER" | "QR";
  onCategoryChange: (cat: string) => void;
  onSourceChange: (src: "all" | "CREW" | "USER" | "QR") => void;
  mapStyle?: MapStyle;
}

export default function SpotLineMapView({
  selectedCategory,
  selectedSource,
  onCategoryChange,
  onSourceChange,
  mapStyle = "kakao",
}: SpotLineMapViewProps) {
  const t = MAP_THEMES[mapStyle];
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

  // 건물 데이터
  const buildings = [
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
  ];

  return (
    <div className="relative w-full h-[calc(100vh-56px)] flex overflow-hidden">
      {/* ===== 좌측 사이드 패널 ===== */}
      <div
        className={`relative z-20 ${t.panelBg} border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
          panelOpen ? "w-[280px]" : "w-0"
        }`}
      >
        {panelOpen && (
          <>
            {/* 패널 헤더 - 브랜드 */}
            <div className={`px-3 py-2.5 ${t.panelHeaderBg} border-b border-gray-100`}>
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4" style={{ color: t.accentColor }} />
                <span className="text-sm font-bold text-gray-900">SpotLine</span>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: t.accentColor, color: t.accentText }}
                >
                  {t.brandLabel}
                </span>
              </div>
            </div>

            {/* 검색바 */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={mapStyle === "kakao" ? "장소, 주소 검색" : "장소·주소 검색"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 ${t.searchBg} border ${t.searchBorder} ${t.searchRadius} text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent`}
                  style={{ ["--tw-ring-color" as string]: t.accentColor }}
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

            {/* 카테고리 탭 */}
            <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-hide border-b border-gray-100">
              {CATEGORY_TABS.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.key;
                const color = CATEGORY_COLORS[cat.key];
                return (
                  <button
                    key={cat.key}
                    onClick={() => onCategoryChange(cat.key)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs whitespace-nowrap transition-colors shrink-0 ${
                      mapStyle === "kakao" ? "rounded-full" : "rounded-md"
                    } ${
                      isActive
                        ? `${t.activeTabBg} ${t.activeTabText} font-bold`
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
              {(["all", "CREW", "USER"] as const).map((src) => {
                const isActive = selectedSource === src;
                const label =
                  src === "all"
                    ? "전체"
                    : src === "CREW"
                    ? "⚡ SpotLine"
                    : "👤 유저";
                return (
                  <button
                    key={src}
                    onClick={() => onSourceChange(src)}
                    className={`flex-1 py-1.5 text-[11px] font-medium transition-colors ${
                      mapStyle === "kakao" ? "rounded-full" : "rounded-md"
                    } ${
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

            {/* Spot 리스트 */}
            <div className="flex-1 overflow-y-auto">
              {filteredSpots.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Search className="h-8 w-8 mb-2" />
                  <p className="text-sm">조건에 맞는 Spot이 없습니다</p>
                </div>
              )}
              {filteredSpots.map((spot) => {
                const isActive = selectedSpot?.id === spot.id;
                const isSpotline = spot.source === "CREW";
                return (
                  <button
                    key={spot.id}
                    onClick={() => handleSpotClick(spot)}
                    className={`w-full text-left border-b border-gray-50 transition-colors ${
                      isActive
                        ? mapStyle === "kakao"
                          ? "bg-[#FEE500]/10"
                          : "bg-[#03c75a]/5"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex gap-3 p-3">
                      <div className={`relative w-16 h-16 overflow-hidden bg-gray-200 shrink-0 ${
                        mapStyle === "kakao" ? "rounded-xl" : "rounded-md"
                      }`}>
                        <img
                          src={spot.image}
                          alt={spot.name}
                          className="w-full h-full object-cover"
                        />
                        {isActive && (
                          <div
                            className="absolute inset-0 border-2"
                            style={{ borderColor: t.accentColor }}
                          />
                        )}
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

            {/* 카카오 고유: 하단 교통 탭 */}
            {t.showTrafficTab && (
              <div className="border-t border-gray-200 px-3 py-2 flex items-center gap-3">
                <button className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700">
                  <Bus className="h-3 w-3" />
                  버스
                </button>
                <button className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700">
                  <Car className="h-3 w-3" />
                  자동차
                </button>
                <button className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700">
                  <Bike className="h-3 w-3" />
                  자전거
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 패널 토글 버튼 */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="absolute z-30 top-1/2 -translate-y-1/2 transition-all duration-300"
        style={{ left: panelOpen ? "268px" : "0px" }}
      >
        <div className={`flex items-center justify-center w-6 h-14 bg-white border border-gray-200 rounded-r-lg ${t.controlShadow} hover:bg-gray-50`}>
          {panelOpen ? (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* ===== 우측 지도 영역 ===== */}
      <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: t.bg }}>
        {/* SVG 지도 */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill={t.bg} />

          {/* 물/하천 (카카오: 더 따뜻한 블루, 네이버: 더 선명한 블루) */}
          <path
            d="M 0,75% Q 15%,72% 30%,76% T 60%,73% T 95%,77% L 100%,82% L 100%,78% Q 80%,80% 60%,76% T 30%,79% T 0,78% Z"
            fill={t.water}
            stroke={t.waterStroke}
            strokeWidth="0.5"
          />

          {/* 공원/녹지 */}
          <rect x="80%" y="82%" width="16%" height="10%" rx={mapStyle === "kakao" ? "6" : "2"} fill={t.park} stroke={t.parkTree} strokeWidth="0.5" />
          <circle cx="84%" cy="86%" r="2%" fill={t.parkTree} opacity="0.5" />
          <circle cx="90%" cy="88%" r="1.5%" fill={t.parkTree} opacity="0.5" />
          {/* 추가 공원 */}
          <rect x="2%" y="85%" width="10%" height="8%" rx={mapStyle === "kakao" ? "5" : "2"} fill={t.park} stroke={t.parkTree} strokeWidth="0.5" opacity="0.8" />
          <circle cx="5%" cy="88%" r="1.2%" fill={t.parkTree} opacity="0.4" />
          {/* 공원 라벨 */}
          <text x="83%" y="90%" fontSize="8" fill={t.parkLabel} fontWeight="400" fontFamily="sans-serif">서울숲</text>
          <text x="3%" y="92%" fontSize="7" fill={t.parkLabel} fontWeight="400" fontFamily="sans-serif">망원공원</text>

          {/* 주요 도로 (카카오: 노란색, 네이버: 연노란) */}
          <line x1="0" y1="44%" x2="100%" y2="44%" stroke={t.roadOutline} strokeWidth="14" />
          <line x1="0" y1="44%" x2="100%" y2="44%" stroke={t.roadMajor} strokeWidth="10" />
          <line x1="0" y1="44%" x2="100%" y2="44%" stroke={t.roadMajorCenter} strokeWidth="1" strokeDasharray={mapStyle === "naver" ? "8,6" : "0"} />
          <line x1="48%" y1="0" x2="48%" y2="100%" stroke={t.roadOutline} strokeWidth="14" />
          <line x1="48%" y1="0" x2="48%" y2="100%" stroke={t.roadMajor} strokeWidth="10" />
          <line x1="48%" y1="0" x2="48%" y2="100%" stroke={t.roadMajorCenter} strokeWidth="1" strokeDasharray={mapStyle === "naver" ? "8,6" : "0"} />

          {/* 도로명 라벨 (카카오: 도로 위, 네이버: 방패형 라벨) */}
          {mapStyle === "kakao" ? (
            <>
              <text x="20%" y="43%" fontSize="9" fill={t.roadLabel} fontWeight="400" fontFamily="sans-serif">서울숲길</text>
              <text x="65%" y="43%" fontSize="9" fill={t.roadLabel} fontWeight="400" fontFamily="sans-serif">독서당로</text>
              <text x="47%" y="20%" fontSize="9" fill={t.roadLabel} fontWeight="400" fontFamily="sans-serif" transform="rotate(-90, 47%, 20%)">왕십리로</text>
            </>
          ) : (
            <>
              {/* 네이버 스타일: 도로명 방패형 */}
              <rect x="18%" y="40.5%" width="8%" height="3.5%" rx="2" fill="#fff" stroke="#aaa" strokeWidth="0.5" />
              <text x="19%" y="43%" fontSize="8" fill="#333" fontWeight="600" fontFamily="sans-serif">서울숲길</text>
              <rect x="63%" y="40.5%" width="8%" height="3.5%" rx="2" fill="#fff" stroke="#aaa" strokeWidth="0.5" />
              <text x="64%" y="43%" fontSize="8" fill="#333" fontWeight="600" fontFamily="sans-serif">독서당로</text>
            </>
          )}

          {/* 보조 도로 */}
          <line x1="0" y1="16%" x2="70%" y2="16%" stroke={t.roadMinor} strokeWidth={t.roadMinorWidth} />
          <line x1="25%" y1="0" x2="25%" y2="56%" stroke={t.roadMinor} strokeWidth={t.roadMinorWidth} />
          <line x1="70%" y1="18%" x2="70%" y2="78%" stroke={t.roadMinor} strokeWidth={t.roadMinorWidth} />
          <line x1="15%" y1="62%" x2="88%" y2="62%" stroke={t.roadMinor} strokeWidth={t.roadMinorWidth} />
          <line x1="0" y1="33%" x2="42%" y2="33%" stroke={t.roadMinor} strokeWidth={t.roadMinorWidth - 1} />
          <line x1="54%" y1="26%" x2="88%" y2="26%" stroke={t.roadMinor} strokeWidth={t.roadMinorWidth - 1} />
          <line x1="38%" y1="72%" x2="38%" y2="95%" stroke={t.roadMinor} strokeWidth={t.roadMinorWidth - 1} />

          {/* 건물 블록 */}
          {buildings.map((b, i) => (
            <g key={i}>
              <rect
                x={b.x} y={b.y} width={b.w} height={b.h}
                rx={mapStyle === "kakao" ? "3" : "1"}
                fill={i % 3 === 0 ? t.buildingHighlight : t.building}
                stroke={t.buildingStroke}
                strokeWidth={mapStyle === "kakao" ? "0.5" : "0.8"}
              />
              {/* 네이버: 건물에 작은 3D 효과 */}
              {mapStyle === "naver" && (
                <line
                  x1={b.x} y1={b.y} x2={b.x} y2={`calc(${b.y} + ${b.h})`}
                  stroke={t.buildingStroke}
                  strokeWidth="1.5"
                  opacity="0.3"
                />
              )}
            </g>
          ))}

          {/* 지하철역 표시 */}
          {mapStyle === "kakao" ? (
            <>
              {/* 카카오: 원형 역 마커 */}
              <circle cx="30%" cy="82%" r="1.5%" fill="#ffffff" stroke={t.stationBg} strokeWidth="1.5" />
              <text x="30%" y="82.5%" fontSize="6" fill={t.stationBg} fontWeight="700" textAnchor="middle" fontFamily="sans-serif">2</text>
              <text x="34%" y="83%" fontSize="9" fill={t.stationBg} fontWeight="500" fontFamily="sans-serif">합정역</text>

              <circle cx="48%" cy="96%" r="1.5%" fill="#ffffff" stroke="#e8450e" strokeWidth="1.5" />
              <text x="48%" y="96.5%" fontSize="6" fill="#e8450e" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">K</text>
              <text x="52%" y="97%" fontSize="9" fill="#e8450e" fontWeight="500" fontFamily="sans-serif">뚝섬역</text>
            </>
          ) : (
            <>
              {/* 네이버: 둥근 사각 역 마커 */}
              <rect x="28.5%" y="80.5%" width="3%" height="3%" rx="3" fill={t.stationBg} />
              <text x="30%" y="82.5%" fontSize="7" fill="#fff" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">2</text>
              <text x="34%" y="83%" fontSize="10" fill="#333" fontWeight="600" fontFamily="sans-serif">합정역</text>

              <rect x="46.5%" y="94.5%" width="3%" height="3%" rx="3" fill="#e55c00" />
              <text x="48%" y="96.5%" fontSize="7" fill="#fff" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">K</text>
              <text x="52%" y="97%" fontSize="10" fill="#333" fontWeight="600" fontFamily="sans-serif">뚝섬역</text>
            </>
          )}

          {/* 지역 라벨 */}
          {mapStyle === "kakao" ? (
            <>
              <text x="36%" y="9%" fontSize={t.areaLabelSize} fill={t.areaLabel} fontWeight="500" fontFamily="sans-serif" opacity="0.7">성수동2가</text>
              <text x="62%" y="38%" fontSize={t.areaLabelSize} fill={t.areaLabel} fontWeight="500" fontFamily="sans-serif" opacity="0.7">을지로3가</text>
              <text x="6%" y="38%" fontSize={t.areaLabelSize} fill={t.areaLabel} fontWeight="500" fontFamily="sans-serif" opacity="0.7">연남동</text>
              <text x="6%" y="68%" fontSize={t.areaLabelSize} fill={t.areaLabel} fontWeight="500" fontFamily="sans-serif" opacity="0.7">망원동</text>
            </>
          ) : (
            <>
              {/* 네이버: 더 굵고 진한 동네 라벨, 살짝 큰 크기 */}
              <text x="36%" y="9%" fontSize={t.areaLabelSize} fill={t.areaLabel} fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5">성수동2가</text>
              <text x="62%" y="38%" fontSize={t.areaLabelSize} fill={t.areaLabel} fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5">을지로3가</text>
              <text x="6%" y="38%" fontSize={t.areaLabelSize} fill={t.areaLabel} fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5">연남동</text>
              <text x="6%" y="68%" fontSize={t.areaLabelSize} fill={t.areaLabel} fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5">망원동</text>
            </>
          )}

          {/* 카카오 고유: 반투명 스카이뷰 격자 힌트 */}
          {mapStyle === "kakao" && (
            <g opacity="0.03">
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`gh${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="#000" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`gv${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="#000" strokeWidth="0.5" />
              ))}
            </g>
          )}
        </svg>

        {/* 현재 위치 마커 */}
        <div
          className="absolute z-10"
          style={{ left: "48%", top: "44%", transform: "translate(-50%, -50%)" }}
        >
          <div className="relative">
            {mapStyle === "kakao" ? (
              <>
                {/* 카카오: 파란 원 + 넓은 반경 표시 */}
                <div className="absolute -inset-4 rounded-full opacity-10" style={{ backgroundColor: t.locationDotColor }} />
                <div
                  className="w-5 h-5 rounded-full border-[3px] shadow-lg"
                  style={{ backgroundColor: t.locationDotColor, borderColor: t.locationDotBorder }}
                />
                <div
                  className="absolute inset-0 w-5 h-5 rounded-full animate-ping opacity-25"
                  style={{ backgroundColor: t.locationPulse }}
                />
              </>
            ) : (
              <>
                {/* 네이버: 초록 원 + 방향 삼각형 */}
                <div className="absolute -inset-3 rounded-full opacity-8" style={{ backgroundColor: t.locationDotColor }} />
                <div
                  className="w-6 h-6 rounded-full border-[3px] shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: t.locationDotColor, borderColor: t.locationDotBorder }}
                >
                  <Navigation className="h-3 w-3 text-white" style={{ transform: "rotate(45deg)" }} />
                </div>
                <div
                  className="absolute inset-0 w-6 h-6 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: t.locationPulse }}
                />
              </>
            )}
          </div>
        </div>

        {/* Spot 핀들 */}
        {filteredSpots.map((spot) => {
          const isSelected = selectedSpot?.id === spot.id;
          const pos = MOCK_MAP_POSITIONS[spot.id] || { x: 50, y: 50 };
          const isSpotline = spot.source === "CREW";
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
                {mapStyle === "kakao" ? (
                  /* 카카오: 둥근 말풍선 라벨 */
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md transition-all ${
                      isSelected
                        ? "scale-100 opacity-100"
                        : "bg-white text-gray-800 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 border border-gray-200"
                    }`}
                    style={isSelected ? { backgroundColor: t.selectedPinBg, color: t.selectedPinText } : undefined}
                  >
                    {isSpotline ? "⚡" : "👤"} {spot.name}
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent"
                      style={isSelected ? { borderTopColor: t.selectedPinBg } : { borderTopColor: "white" }}
                    />
                  </div>
                ) : (
                  /* 네이버: 각진 직사각 라벨 + 좌측 컬러 바 */
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap text-[11px] font-bold shadow-md transition-all overflow-hidden ${
                      isSelected
                        ? "scale-100 opacity-100 rounded-md"
                        : "bg-white text-gray-800 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 border border-gray-200 rounded-md"
                    }`}
                    style={isSelected ? { backgroundColor: t.selectedPinBg, color: t.selectedPinText } : undefined}
                  >
                    <div className="flex items-stretch">
                      <div className="w-1" style={{ backgroundColor: isSelected ? t.selectedPinBorder : catColor }} />
                      <div className="px-2 py-1">
                        {isSpotline ? "⚡" : "👤"} {spot.name}
                      </div>
                    </div>
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent"
                      style={isSelected ? { borderTopColor: t.selectedPinBg } : { borderTopColor: "white" }}
                    />
                  </div>
                )}

                {/* 핀 마커 */}
                <div className="flex flex-col items-center">
                  {mapStyle === "kakao" ? (
                    /* 카카오: 둥근 원형 핀 */
                    <>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-[3px] ${
                          isSelected ? "" : isSpotline ? "border-blue-400" : "border-purple-400"
                        }`}
                        style={
                          isSelected
                            ? { backgroundColor: t.selectedPinBg, borderColor: t.selectedPinBorder }
                            : { backgroundColor: catColor }
                        }
                      >
                        <MapPin className={`h-3.5 w-3.5 ${isSelected && mapStyle === "kakao" ? "text-[#3C1E1E]" : "text-white"}`} />
                      </div>
                      <div
                        className="w-1.5 h-1.5 rotate-45 -mt-1 shadow"
                        style={{ backgroundColor: isSelected ? t.selectedPinBg : catColor }}
                      />
                    </>
                  ) : (
                    /* 네이버: 물방울(드롭) 핀 */
                    <>
                      <div
                        className="relative w-8 h-10 flex items-start justify-center"
                        style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }}
                      >
                        <svg width="32" height="40" viewBox="0 0 32 40">
                          <path
                            d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z"
                            fill={isSelected ? t.selectedPinBg : catColor}
                            stroke={isSelected ? t.selectedPinBorder : isSpotline ? "#3b82f6" : "#a855f7"}
                            strokeWidth="1.5"
                          />
                          <circle cx="16" cy="14" r="6" fill="white" opacity="0.9" />
                        </svg>
                        <MapPin
                          className="absolute top-[6px] h-3.5 w-3.5"
                          style={{ color: isSelected ? t.selectedPinBg : catColor }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* 브랜드 라벨 */}
        <div className="absolute top-3 left-3 z-30">
          <div className={`flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-2 ${t.controlRadius} ${t.controlShadow} border border-gray-200`}>
            <Compass className="h-4 w-4" style={{ color: t.accentColor }} />
            <span className="text-sm font-bold text-gray-900">SpotLine</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 ${mapStyle === "kakao" ? "rounded-full" : "rounded"}`}
              style={{ backgroundColor: t.accentColor, color: t.accentText }}
            >
              {t.brandLabel}
            </span>
          </div>
        </div>

        {/* 지도 유형 토글 */}
        <div className={`absolute top-3 right-3 z-30 flex bg-white ${t.controlRadius} ${t.controlShadow} border border-gray-200 overflow-hidden`}>
          <button
            className="px-3 py-1.5 text-[10px] font-medium border-r border-gray-200"
            style={{ backgroundColor: t.accentColor + "20", color: t.accentColor === "#FEE500" ? "#8B7000" : t.accentColor }}
          >
            {t.mapTypeLabels[0]}
          </button>
          <button className="px-3 py-1.5 text-[10px] font-medium text-gray-500 hover:bg-gray-50">
            {t.mapTypeLabels[1]}
          </button>
        </div>

        {/* 우측 컨트롤 */}
        <div className="absolute right-3 top-14 z-30 flex flex-col gap-2">
          {/* 줌 컨트롤 */}
          <div className={`flex flex-col bg-white ${t.zoomRadius} ${t.controlShadow} border border-gray-200 overflow-hidden`}>
            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 border-b border-gray-200">
              <Plus className="h-4 w-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50">
              <Minus className="h-4 w-4" />
            </button>
          </div>

          {/* 내 위치 */}
          <button className={`flex items-center justify-center w-8 h-8 bg-white ${t.zoomRadius} ${t.controlShadow} border border-gray-200 hover:bg-gray-50`}>
            {mapStyle === "kakao" ? (
              <Navigation className="h-4 w-4" style={{ color: t.locationDotColor }} />
            ) : (
              <LocateFixed className="h-4 w-4" style={{ color: t.locationDotColor }} />
            )}
          </button>

          {/* 레이어 (네이버 고유) */}
          {mapStyle === "naver" && (
            <button className={`flex items-center justify-center w-8 h-8 bg-white ${t.zoomRadius} ${t.controlShadow} border border-gray-200 hover:bg-gray-50`}>
              <Layers className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* 축척 표시 (네이버 고유) */}
        {mapStyle === "naver" && (
          <div className="absolute bottom-16 right-3 z-30 flex items-center gap-1">
            <div className="w-16 h-[2px] bg-gray-600" />
            <span className="text-[9px] text-gray-600 font-medium">100m</span>
          </div>
        )}

        {/* 범례 */}
        <div className={`absolute bottom-3 left-3 z-30 ${t.legendBg} backdrop-blur-sm ${t.controlRadius} ${t.controlShadow} border ${t.legendBorder} p-2.5`}>
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
                    className={`w-2 h-2 ${mapStyle === "kakao" ? "rounded-full" : "rounded-sm"}`}
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* 카카오 고유: 로드뷰 / 교통정보 버튼 */}
        {mapStyle === "kakao" && (
          <div className="absolute bottom-3 right-3 z-30 flex gap-1.5">
            <button className="px-2.5 py-1.5 bg-white/95 rounded-full shadow-md border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50">
              🚦 교통정보
            </button>
            <button className="px-2.5 py-1.5 bg-white/95 rounded-full shadow-md border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50">
              📷 로드뷰
            </button>
          </div>
        )}

        {/* 네이버 고유: 즐겨찾기 / 거리뷰 버튼 */}
        {mapStyle === "naver" && (
          <div className="absolute bottom-3 right-3 z-30 flex gap-1.5">
            <button className="px-2.5 py-1.5 bg-white/95 rounded-md shadow-sm border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50">
              거리뷰
            </button>
          </div>
        )}

        {/* 선택된 Spot 카드 */}
        {selectedSpot && (
          <SpotCard
            spot={selectedSpot}
            onClose={() => setSelectedSpot(null)}
            mapStyle={mapStyle}
            theme={t}
          />
        )}
      </div>
    </div>
  );
}

function SpotCard({
  spot,
  onClose,
  mapStyle,
  theme: t,
}: {
  spot: MockupSpot;
  onClose: () => void;
  mapStyle: MapStyle;
  theme: (typeof MAP_THEMES)[MapStyle];
}) {
  const isSpotline = spot.source === "CREW";
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-[360px]">
      <div className={`bg-white ${t.cardRadius} ${t.controlShadow} border border-gray-200 overflow-hidden`}>
        <button
          onClick={onClose}
          className={`absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center bg-black/40 ${
            mapStyle === "kakao" ? "rounded-full" : "rounded-md"
          }`}
        >
          <X className="h-3.5 w-3.5 text-white" />
        </button>
        <div className="flex">
          <div className={`relative w-28 h-28 shrink-0 bg-gray-200 ${
            mapStyle === "kakao" ? "" : ""
          }`}>
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
            className={`flex items-center justify-center gap-1 py-2 px-4 ${t.cardActionBg} ${t.cardActionText} text-xs font-medium transition-colors ${
              mapStyle === "kakao" ? "rounded-full hover:brightness-95" : "rounded-lg hover:brightness-95"
            }`}
          >
            상세보기
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <button className={`flex items-center justify-center gap-1 py-2 px-3 border border-gray-200 text-xs text-gray-700 font-medium hover:bg-gray-50 transition-colors ${
            mapStyle === "kakao" ? "rounded-full" : "rounded-lg"
          }`}>
            <Navigation className="h-3.5 w-3.5" />
            길찾기
          </button>
        </div>
      </div>
    </div>
  );
}
