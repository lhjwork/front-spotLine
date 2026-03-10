"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Clock,
  Star,
  X,
  Navigation,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    naver: any;
  }
}

interface Spot {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  image: string;
  distance: number;
  walkingTime: number;
  rating: number;
  author: string;
  lat: number;
  lng: number;
  // 목업 모드용 좌표
  mapX: number;
  mapY: number;
}

const MAP_SPOTS: Spot[] = [
  {
    id: "ondo-coffee",
    name: "온도 커피",
    category: "cafe",
    categoryLabel: "카페",
    description: "핸드드립 전문 카페. 조용한 분위기에서 원두의 풍미를 즐길 수 있는 곳.",
    image: "https://picsum.photos/seed/cafe1/400/300",
    distance: 120,
    walkingTime: 2,
    rating: 4.8,
    author: "크루 민지",
    lat: 37.5445,
    lng: 127.0560,
    mapX: 48,
    mapY: 35,
  },
  {
    id: "eulji-gallery",
    name: "을지 갤러리",
    category: "exhibition",
    categoryLabel: "전시",
    description: "현대미술 기획전이 열리는 소규모 갤러리.",
    image: "https://picsum.photos/seed/gallery1/400/300",
    distance: 350,
    walkingTime: 5,
    rating: 4.6,
    author: "크루 지훈",
    lat: 37.5460,
    lng: 127.0590,
    mapX: 72,
    mapY: 22,
  },
  {
    id: "mido-restaurant",
    name: "미도식당",
    category: "restaurant",
    categoryLabel: "맛집",
    description: "40년 전통의 수제 돈까스.",
    image: "https://picsum.photos/seed/restaurant1/400/300",
    distance: 200,
    walkingTime: 3,
    rating: 4.9,
    author: "크루 수연",
    lat: 37.5435,
    lng: 127.0545,
    mapX: 62,
    mapY: 52,
  },
  {
    id: "moment-shop",
    name: "소품샵 모먼트",
    category: "shopping",
    categoryLabel: "쇼핑",
    description: "감성적인 소품과 문구를 큐레이션하는 작은 가게.",
    image: "https://picsum.photos/seed/shop1/400/300",
    distance: 180,
    walkingTime: 3,
    rating: 4.5,
    author: "크루 민지",
    lat: 37.5450,
    lng: 127.0530,
    mapX: 35,
    mapY: 55,
  },
  {
    id: "roasting-house",
    name: "로스팅 하우스",
    category: "cafe",
    categoryLabel: "카페",
    description: "직접 로스팅한 원두로 내린 커피와 수제 베이커리.",
    image: "https://picsum.photos/seed/cafe2/400/300",
    distance: 450,
    walkingTime: 6,
    rating: 4.7,
    author: "크루 지훈",
    lat: 37.5470,
    lng: 127.0510,
    mapX: 22,
    mapY: 28,
  },
  {
    id: "page-bookcafe",
    name: "북카페 페이지",
    category: "cafe",
    categoryLabel: "카페",
    description: "독립출판물과 커피를 함께 즐길 수 있는 조용한 북카페.",
    image: "https://picsum.photos/seed/bookcafe1/400/300",
    distance: 300,
    walkingTime: 4,
    rating: 4.4,
    author: "크루 수연",
    lat: 37.5425,
    lng: 127.0575,
    mapX: 15,
    mapY: 65,
  },
];

const CATEGORY_PIN_COLORS: Record<string, string> = {
  cafe: "#f59e0b",
  restaurant: "#ef4444",
  exhibition: "#a855f7",
  shopping: "#22c55e",
};

const CATEGORY_COLORS_CSS: Record<string, { bg: string; border: string }> = {
  cafe: { bg: "bg-amber-500", border: "border-amber-500" },
  restaurant: { bg: "bg-red-500", border: "border-red-500" },
  exhibition: { bg: "bg-purple-500", border: "border-purple-500" },
  shopping: { bg: "bg-green-500", border: "border-green-500" },
};

interface NaverMapViewProps {
  selectedCategory: string;
}

export default function NaverMapView({ selectedCategory }: NaverMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [useMockMap, setUseMockMap] = useState(false);

  const filteredSpots =
    selectedCategory === "all"
      ? MAP_SPOTS
      : MAP_SPOTS.filter((s) => s.category === selectedCategory);

  // 네이버맵 SDK 로드
  useEffect(() => {
    if (window.naver?.maps) {
      setSdkLoaded(true);
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    if (!clientId || clientId === "your_naver_map_client_id") {
      setUseMockMap(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => setUseMockMap(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 네이버맵 초기화
  useEffect(() => {
    if (!sdkLoaded || !mapRef.current || useMockMap) return;

    const { naver } = window;
    const center = new naver.maps.LatLng(37.5445, 127.0555);
    const map = new naver.maps.Map(mapRef.current, {
      center,
      zoom: 16,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
      },
    });
    mapInstanceRef.current = map;

    return () => {
      mapInstanceRef.current = null;
    };
  }, [sdkLoaded, useMockMap]);

  // 네이버맵 마커 업데이트
  useEffect(() => {
    if (!sdkLoaded || !mapInstanceRef.current || useMockMap) return;

    const { naver } = window;
    const map = mapInstanceRef.current;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    filteredSpots.forEach((spot) => {
      const position = new naver.maps.LatLng(spot.lat, spot.lng);
      const color = CATEGORY_PIN_COLORS[spot.category] || "#6b7280";

      const marker = new naver.maps.Marker({
        position,
        map,
        icon: {
          content: `
            <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
              <div style="
                background:white;
                padding:4px 10px;
                border-radius:8px;
                box-shadow:0 2px 8px rgba(0,0,0,0.15);
                font-size:12px;
                font-weight:600;
                color:#1f2937;
                margin-bottom:4px;
                white-space:nowrap;
                border:2px solid ${color};
              ">${spot.name}</div>
              <div style="
                width:32px;height:32px;
                background:${color};
                border:3px solid white;
                border-radius:50%;
                box-shadow:0 2px 8px rgba(0,0,0,0.2);
                display:flex;align-items:center;justify-content:center;
              ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>
          `,
          anchor: new naver.maps.Point(16, 50),
        },
      });

      naver.maps.Event.addListener(marker, "click", () => {
        setSelectedSpot(spot);
        map.panTo(position);
      });

      markersRef.current.push(marker);
    });
  }, [sdkLoaded, useMockMap, filteredSpots]);

  // 목업 모드 (네이버 API 키 없을 때)
  if (useMockMap) {
    return (
      <div className="relative w-full h-[calc(100vh-120px)] bg-[#f5f6f4] overflow-hidden">
        <div className="absolute inset-0">
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
            return (
              <button
                key={spot.id}
                onClick={() => setSelectedSpot(isSelected ? null : spot)}
                className="absolute z-20 group"
                style={{ left: `${spot.mapX}%`, top: `${spot.mapY}%`, transform: "translate(-50%, -100%)" }}
              >
                <div className={`relative transition-transform ${isSelected ? "scale-125" : "group-hover:scale-110"}`}>
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap px-2.5 py-1.5 rounded text-xs font-bold shadow-md transition-all ${
                    isSelected ? "bg-[#03c75a] text-white scale-100 opacity-100" : "bg-white text-gray-800 border border-gray-300 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                  }`}>
                    {spot.name}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent ${isSelected ? "border-t-[#03c75a]" : "border-t-white"}`} />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-[3px] border-white ${isSelected ? "bg-[#03c75a]" : colors.bg}`}>
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div className={`w-2 h-2 rotate-45 -mt-1.5 shadow ${isSelected ? "bg-[#03c75a]" : colors.bg}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 네이버맵 라벨 */}
        <div className="absolute top-4 left-4 z-30 bg-[#03c75a] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
          NAVER Map (목업 - API 키 설정 시 실제 지도로 전환)
        </div>

        {/* 줌 컨트롤 */}
        <div className="absolute top-4 right-4 z-30 flex flex-col bg-white rounded shadow-md border border-gray-300 overflow-hidden">
          <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold border-b border-gray-200">+</button>
          <button className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold">−</button>
        </div>

        <div className="absolute bottom-36 right-4 z-30">
          <button className="flex items-center justify-center w-10 h-10 bg-white rounded shadow-md border border-gray-300 hover:bg-gray-50">
            <Navigation className="h-5 w-5 text-[#03c75a]" />
          </button>
        </div>

        {/* 선택된 Spot 카드 */}
        {selectedSpot && (
          <SpotCard spot={selectedSpot} onClose={() => setSelectedSpot(null)} accentColor="#03c75a" />
        )}
      </div>
    );
  }

  // 실제 네이버맵 SDK 모드
  return (
    <div className="relative w-full h-[calc(100vh-120px)]">
      <div ref={mapRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 z-30 bg-[#03c75a] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
        NAVER Map
      </div>

      <div className="absolute bottom-36 right-4 z-30">
        <button
          onClick={() => {
            if (mapInstanceRef.current && window.naver) {
              const center = new window.naver.maps.LatLng(37.5445, 127.0555);
              mapInstanceRef.current.panTo(center);
            }
          }}
          className="flex items-center justify-center w-10 h-10 bg-white rounded shadow-md border border-gray-300 hover:bg-gray-50"
        >
          <Navigation className="h-5 w-5 text-[#03c75a]" />
        </button>
      </div>

      {selectedSpot && (
        <SpotCard spot={selectedSpot} onClose={() => setSelectedSpot(null)} accentColor="#03c75a" />
      )}
    </div>
  );
}

// 공유 Spot 카드 컴포넌트
function SpotCard({ spot, onClose, accentColor }: { spot: Spot; onClose: () => void; accentColor: string }) {
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
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">{spot.categoryLabel}</span>
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs">{spot.rating}</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-900">{spot.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{spot.description}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{spot.distance}m</span>
              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />도보 {spot.walkingTime}분</span>
            </div>
          </div>
        </div>
        <div className="px-3 pb-3 flex gap-2">
          <Link
            href={`/mockup/a/spots/${spot.id}`}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 text-white rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: accentColor }}
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
  );
}
