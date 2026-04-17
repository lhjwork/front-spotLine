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
  "ondo-coffee": { x: 48, y: 35 },
  "eulji-gallery": { x: 72, y: 22 },
  "mido-restaurant": { x: 62, y: 52 },
  "moment-shop": { x: 35, y: 55 },
  "roasting-house": { x: 22, y: 28 },
  "hidden-alley-cafe": { x: 55, y: 38 },
  "vintage-bookshop": { x: 15, y: 42 },
  "rooftop-bar-euljiro": { x: 78, y: 45 },
  "photo-studio-seongsu": { x: 42, y: 62 },
};

interface NaverMapViewProps {
  selectedCategory: string;
  selectedSource: "all" | "CREW" | "USER" | "QR";
}

export default function NaverMapView({ selectedCategory, selectedSource }: NaverMapViewProps) {
  const [selectedSpot, setSelectedSpot] = useState<MockupSpot | null>(null);

  const filteredSpots = MOCK_SPOTS.filter((s) => {
    const categoryMatch = selectedCategory === "all" || s.category === selectedCategory;
    const sourceMatch = selectedSource === "all" || s.source === selectedSource;
    return categoryMatch && sourceMatch;
  });

  return (
    <div className="relative w-full h-[calc(100vh-120px)] bg-[#f5f6f4] overflow-hidden">
      <div className="absolute inset-0">
        {/* SVG 목업 지도 배경 (네이버맵 스타일) */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f5f6f4" />
          {/* 건물 블록 */}
          <rect x="3%" y="5%" width="22%" height="12%" rx="2" fill="#e8e8e8" stroke="#d4d4d4" strokeWidth="0.5" />
          <rect x="3%" y="20%" width="15%" height="8%" rx="2" fill="#e8e8e8" stroke="#d4d4d4" strokeWidth="0.5" />
          <rect x="28%" y="5%" width="18%" height="10%" rx="2" fill="#e8e8e8" stroke="#d4d4d4" strokeWidth="0.5" />
          <rect x="55%" y="8%" width="12%" height="8%" rx="2" fill="#e8e8e8" stroke="#d4d4d4" strokeWidth="0.5" />
          <rect x="72%" y="5%" width="20%" height="14%" rx="2" fill="#e8e8e8" stroke="#d4d4d4" strokeWidth="0.5" />
          <rect x="55%" y="55%" width="14%" height="12%" rx="2" fill="#e8e8e8" stroke="#d4d4d4" strokeWidth="0.5" />
          <rect x="75%" y="38%" width="12%" height="18%" rx="2" fill="#e8e8e8" stroke="#d4d4d4" strokeWidth="0.5" />
          <rect x="5%" y="50%" width="18%" height="10%" rx="2" fill="#e8e8e8" stroke="#d4d4d4" strokeWidth="0.5" />
          <rect x="30%" y="60%" width="20%" height="15%" rx="2" fill="#e8e8e8" stroke="#d4d4d4" strokeWidth="0.5" />
          <rect x="60%" y="72%" width="16%" height="10%" rx="2" fill="#e8e8e8" stroke="#d4d4d4" strokeWidth="0.5" />
          <rect x="5%" y="75%" width="20%" height="12%" rx="2" fill="#e8e8e8" stroke="#d4d4d4" strokeWidth="0.5" />
          <rect x="80%" y="62%" width="15%" height="14%" rx="2" fill="#e8e8e8" stroke="#d4d4d4" strokeWidth="0.5" />
          {/* 공원 */}
          <rect x="82%" y="82%" width="15%" height="12%" rx="4" fill="#c7e6c7" stroke="#a8d5a8" strokeWidth="0.5" />
          {/* 주요 도로 */}
          <line x1="0" y1="45%" x2="100%" y2="45%" stroke="#fde68a" strokeWidth="10" />
          <line x1="0" y1="45%" x2="100%" y2="45%" stroke="#fcd34d" strokeWidth="6" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#fde68a" strokeWidth="10" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#fcd34d" strokeWidth="6" />
          {/* 보조 도로 */}
          <line x1="0" y1="18%" x2="72%" y2="18%" stroke="white" strokeWidth="5" />
          <line x1="27%" y1="0" x2="27%" y2="58%" stroke="white" strokeWidth="5" />
          <line x1="72%" y1="20%" x2="72%" y2="80%" stroke="white" strokeWidth="5" />
          <line x1="18%" y1="65%" x2="90%" y2="65%" stroke="white" strokeWidth="5" />
          <line x1="0" y1="35%" x2="45%" y2="35%" stroke="white" strokeWidth="4" />
          <line x1="55%" y1="28%" x2="90%" y2="28%" stroke="white" strokeWidth="4" />
          {/* 지역 라벨 */}
          <text x="40%" y="10%" fontSize="13" fill="#666" fontWeight="600">성수동2가</text>
          <text x="65%" y="40%" fontSize="13" fill="#666" fontWeight="600">을지로</text>
          <text x="8%" y="40%" fontSize="13" fill="#666" fontWeight="600">연남동</text>
          <text x="8%" y="70%" fontSize="13" fill="#666" fontWeight="600">망원동</text>
        </svg>

        {/* 현재 위치 */}
        <div className="absolute z-10" style={{ left: "50%", top: "45%", transform: "translate(-50%, -50%)" }}>
          <div className="relative">
            <div className="w-5 h-5 bg-[#03c75a] rounded-full border-[3px] border-white shadow-lg" />
            <div className="absolute inset-0 w-5 h-5 bg-[#03c75a] rounded-full animate-ping opacity-25" />
          </div>
        </div>

        {/* Spot 핀 */}
        {filteredSpots.map((spot) => {
          const isSelected = selectedSpot?.id === spot.id;
          const colors = CATEGORY_COLORS_CSS[spot.category] || { bg: "bg-gray-500", border: "border-gray-500" };
          const pos = MOCK_MAP_POSITIONS[spot.id] || { x: 50, y: 50 };
          const isSpotline = spot.source === "CREW";
          const sourceBorderClass = isSpotline ? "border-blue-500" : "border-purple-500";
          return (
            <button
              key={spot.id}
              onClick={() => setSelectedSpot(isSelected ? null : spot)}
              className="absolute z-20 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -100%)" }}
            >
              <div className={`relative transition-transform ${isSelected ? "scale-125" : "group-hover:scale-110"}`}>
                {/* 이름 라벨 */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all border-2 ${sourceBorderClass} ${
                  isSelected ? "bg-[#03c75a] text-white border-[#03c75a] scale-100 opacity-100" : "bg-white text-gray-800 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                }`}>
                  {isSpotline ? "⚡" : "👤"} {spot.name}
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent ${isSelected ? "border-t-[#03c75a]" : "border-t-white"}`} />
                </div>
                {/* 핀 */}
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-[3px] ${sourceBorderClass} ${isSelected ? "bg-[#03c75a]" : colors.bg}`}>
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className={`w-2 h-2 rotate-45 -mt-1.5 shadow ${isSelected ? "bg-[#03c75a]" : colors.bg}`} />
                </div>
                {/* 소스 미니 뱃지 */}
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${isSpotline ? "bg-blue-600 text-white" : "bg-purple-600 text-white"}`}>
                  {isSpotline ? "⚡" : "👤"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 네이버맵 라벨 */}
      <div className="absolute top-4 left-4 z-30 bg-[#03c75a] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
        NAVER Map (목업)
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
      <div className="absolute top-4 right-4 z-30 flex flex-col bg-white rounded shadow-md border border-gray-300 overflow-hidden">
        <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold border-b border-gray-200">+</button>
        <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold">−</button>
      </div>

      {/* 내 위치 버튼 */}
      <div className="absolute bottom-36 right-4 z-30">
        <button className="flex items-center justify-center w-10 h-10 bg-white rounded shadow-md border border-gray-300 hover:bg-gray-50">
          <Navigation className="h-5 w-5 text-[#03c75a]" />
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
                {spot.source === "CREW" ? (
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
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{spot.distance}m</span>
              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{spot.walkingTime}분</span>
              <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{spot.userStats.visitCount}</span>
              <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{spot.userStats.likeCount}</span>
            </div>
          </div>
        </div>
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
              className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-[#03c75a] text-white rounded-xl text-sm font-medium hover:bg-[#02b350] transition-colors"
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
