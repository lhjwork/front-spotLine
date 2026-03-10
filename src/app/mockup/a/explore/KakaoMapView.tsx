"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  Star,
  X,
  Navigation,
  ChevronRight,
  Heart,
  Eye,
  Zap,
  User,
} from "lucide-react";
import Link from "next/link";
import { MOCK_SPOTS } from "@/data/mockup";
import type { MockupSpot } from "@/types";

const CATEGORY_COLORS_CSS: Record<string, { bg: string; border: string }> = {
  cafe: { bg: "bg-amber-500", border: "border-amber-500" },
  restaurant: { bg: "bg-red-500", border: "border-red-500" },
  exhibition: { bg: "bg-purple-500", border: "border-purple-500" },
  shopping: { bg: "bg-green-500", border: "border-green-500" },
  culture: { bg: "bg-indigo-500", border: "border-indigo-500" },
};

// 목업 모드용 좌표 매핑
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

interface KakaoMapViewProps {
  selectedCategory: string;
  selectedSource: "all" | "spotline" | "user";
}

export default function KakaoMapView({ selectedCategory, selectedSource }: KakaoMapViewProps) {
  const [selectedSpot, setSelectedSpot] = useState<MockupSpot | null>(null);

  const filteredSpots = MOCK_SPOTS.filter((s) => {
    const categoryMatch = selectedCategory === "all" || s.category === selectedCategory;
    const sourceMatch = selectedSource === "all" || s.source === selectedSource;
    return categoryMatch && sourceMatch;
  });

  return (
    <div className="relative w-full h-[calc(100vh-120px)] bg-[#f0ede6] overflow-hidden">
      <div className="absolute inset-0">
        {/* SVG 목업 지도 배경 (카카오맵 스타일) */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0ede6" />
          {/* 건물 블록 */}
          <rect x="5%" y="5%" width="20%" height="10%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          <rect x="5%" y="18%" width="12%" height="7%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          <rect x="30%" y="3%" width="16%" height="9%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          <rect x="55%" y="6%" width="10%" height="7%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          <rect x="70%" y="3%" width="22%" height="12%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          <rect x="50%" y="55%" width="12%" height="10%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          <rect x="72%" y="35%" width="10%" height="16%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          <rect x="3%" y="48%" width="16%" height="8%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          <rect x="28%" y="58%" width="18%" height="12%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          <rect x="58%" y="70%" width="14%" height="8%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          <rect x="3%" y="72%" width="18%" height="10%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          <rect x="78%" y="58%" width="14%" height="12%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          <rect x="85%" y="78%" width="10%" height="8%" rx="2" fill="#ddd8ce" stroke="#ccc6ba" strokeWidth="0.5" />
          {/* 공원 */}
          <rect x="80%" y="82%" width="16%" height="10%" rx="4" fill="#b8d8b0" stroke="#9ac590" strokeWidth="0.5" />
          <circle cx="84%" cy="86%" r="2%" fill="#9ac590" opacity="0.5" />
          <circle cx="90%" cy="88%" r="1.5%" fill="#9ac590" opacity="0.5" />
          {/* 주요 도로 */}
          <line x1="0" y1="44%" x2="100%" y2="44%" stroke="#f5d86e" strokeWidth="12" />
          <line x1="0" y1="44%" x2="100%" y2="44%" stroke="#fce76b" strokeWidth="8" />
          <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#f5d86e" strokeWidth="12" />
          <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#fce76b" strokeWidth="8" />
          {/* 보조 도로 */}
          <line x1="0" y1="16%" x2="70%" y2="16%" stroke="#ffffff" strokeWidth="5" />
          <line x1="25%" y1="0" x2="25%" y2="56%" stroke="#ffffff" strokeWidth="5" />
          <line x1="70%" y1="18%" x2="70%" y2="78%" stroke="#ffffff" strokeWidth="5" />
          <line x1="15%" y1="62%" x2="88%" y2="62%" stroke="#ffffff" strokeWidth="5" />
          <line x1="0" y1="33%" x2="42%" y2="33%" stroke="#ffffff" strokeWidth="4" />
          <line x1="54%" y1="26%" x2="88%" y2="26%" stroke="#ffffff" strokeWidth="4" />
          <line x1="38%" y1="72%" x2="38%" y2="95%" stroke="#ffffff" strokeWidth="4" />
          {/* 지역 라벨 */}
          <text x="36%" y="9%" fontSize="12" fill="#888" fontWeight="600" fontFamily="sans-serif">성수동2가</text>
          <text x="62%" y="38%" fontSize="12" fill="#888" fontWeight="600" fontFamily="sans-serif">을지로3가</text>
          <text x="6%" y="38%" fontSize="12" fill="#888" fontWeight="600" fontFamily="sans-serif">연남동</text>
          <text x="6%" y="68%" fontSize="12" fill="#888" fontWeight="600" fontFamily="sans-serif">망원동</text>
          <text x="30%" y="82%" fontSize="11" fill="#888" fontWeight="500" fontFamily="sans-serif">합정역</text>
        </svg>

        {/* 현재 위치 마커 */}
        <div className="absolute z-10" style={{ left: "48%", top: "44%", transform: "translate(-50%, -50%)" }}>
          <div className="relative">
            <div className="w-5 h-5 bg-blue-600 rounded-full border-[3px] border-white shadow-lg" />
            <div className="absolute inset-0 w-5 h-5 bg-blue-600 rounded-full animate-ping opacity-25" />
          </div>
        </div>

        {/* Spot 핀들 */}
        {filteredSpots.map((spot) => {
          const isSelected = selectedSpot?.id === spot.id;
          const colors = CATEGORY_COLORS_CSS[spot.category] || { bg: "bg-gray-500", border: "border-gray-500" };
          const pos = MOCK_MAP_POSITIONS[spot.id] || { x: 50, y: 50 };
          const isSpotline = spot.source === "spotline";
          const sourceBorderClass = isSpotline ? "border-blue-500" : "border-purple-500";

          return (
            <button
              key={spot.id}
              onClick={() => setSelectedSpot(isSelected ? null : spot)}
              className="absolute z-20 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -100%)" }}
            >
              <div className={`relative transition-transform ${isSelected ? "scale-125" : "group-hover:scale-110"}`}>
                {/* 이름 + 소스 라벨 */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all border-2 ${sourceBorderClass} ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 scale-100 opacity-100"
                    : "bg-white text-gray-800 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                }`}>
                  {isSpotline ? "⚡" : "👤"} {spot.name}
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent ${
                    isSelected ? "border-t-blue-600" : "border-t-white"
                  }`} />
                </div>
                {/* 핀 원형 (카테고리 색 + 소스 테두리) */}
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-[3px] ${sourceBorderClass} ${isSelected ? "bg-blue-600" : colors.bg}`}>
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className={`w-2 h-2 rotate-45 -mt-1.5 shadow ${isSelected ? "bg-blue-600" : colors.bg}`} />
                </div>
                {/* 소스 미니 뱃지 */}
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                  isSpotline ? "bg-blue-600 text-white" : "bg-purple-600 text-white"
                }`}>
                  {isSpotline ? "⚡" : "👤"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 카카오맵 라벨 */}
      <div className="absolute top-4 left-4 z-30 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow">
        Kakao Map (목업)
      </div>

      {/* 범례 */}
      <div className="absolute top-12 left-4 z-30 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-medium bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow border border-blue-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            ⚡ SpotLine 제휴
          </span>
          <span className="flex items-center gap-1 text-[10px] font-medium bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow border border-purple-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            👤 유저 추천
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[9px] bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500" />카페
          </span>
          <span className="flex items-center gap-1 text-[9px] bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500" />맛집
          </span>
          <span className="flex items-center gap-1 text-[9px] bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm">
            <span className="w-2 h-2 rounded-full bg-purple-500" />전시
          </span>
          <span className="flex items-center gap-1 text-[9px] bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500" />쇼핑
          </span>
          <span className="flex items-center gap-1 text-[9px] bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />문화
          </span>
        </div>
      </div>

      {/* 줌 컨트롤 */}
      <div className="absolute top-4 right-4 z-30 flex flex-col bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold border-b border-gray-200">+</button>
        <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold">−</button>
      </div>

      {/* 내 위치 버튼 */}
      <div className="absolute bottom-36 right-4 z-30">
        <button className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50">
          <Navigation className="h-5 w-5 text-blue-600" />
        </button>
      </div>

      {/* 선택된 Spot 카드 */}
      {selectedSpot && (
        <SpotCard spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
      )}
    </div>
  );
}

function SpotCard({ spot, onClose }: { spot: MockupSpot; onClose: () => void }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-30">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center bg-black/40 rounded-full">
          <X className="h-4 w-4 text-white" />
        </button>
        <div className="flex">
          <div className="relative w-32 h-32 shrink-0 bg-gray-200">
            <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                {/* 소스 뱃지 */}
                {spot.source === "spotline" ? (
                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    <Zap className="h-2.5 w-2.5" />
                    SpotLine
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                    <User className="h-2.5 w-2.5" />
                    유저 추천
                  </span>
                )}
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                  {spot.categoryLabel}
                </span>
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs">{spot.rating}</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-900">{spot.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{spot.description}</p>
            </div>
            {/* 방문수 / 좋아요 */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />{spot.distance}m
              </span>
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />{spot.walkingTime}분
              </span>
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />{spot.userStats.visitCount}
              </span>
              <span className="flex items-center gap-0.5">
                <Heart className="h-3 w-3" />{spot.userStats.likeCount}
              </span>
            </div>
          </div>
        </div>
        {/* 최근 방문자 + 액션 */}
        <div className="px-3 pb-3">
          {spot.userStats.recentVisitors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex -space-x-1.5">
                {spot.userStats.recentVisitors.slice(0, 3).map((v) => (
                  <img
                    key={v.id}
                    src={v.avatar}
                    alt={v.nickname}
                    className="w-5 h-5 rounded-full border border-white object-cover"
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400">최근 방문</span>
            </div>
          )}
          <div className="flex gap-2">
            <Link
              href={`/mockup/a/spots/${spot.slug}`}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              상세보기
              <ChevronRight className="h-4 w-4" />
            </Link>
            <button className="flex items-center justify-center gap-1 py-2.5 px-4 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              <Navigation className="h-4 w-4" />
              길찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
