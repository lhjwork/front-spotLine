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
    kakao: any;
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
  lat: number;
  lng: number;
  author: string;
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
    lat: 37.5445,
    lng: 127.0560,
    author: "크루 민지",
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
    lat: 37.5460,
    lng: 127.0590,
    author: "크루 지훈",
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
    lat: 37.5435,
    lng: 127.0545,
    author: "크루 수연",
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
    lat: 37.5450,
    lng: 127.0530,
    author: "크루 민지",
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
    lat: 37.5470,
    lng: 127.0510,
    author: "크루 지훈",
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
    lat: 37.5425,
    lng: 127.0575,
    author: "크루 수연",
  },
];

const CATEGORY_PIN_COLORS: Record<string, string> = {
  cafe: "#f59e0b",
  restaurant: "#ef4444",
  exhibition: "#a855f7",
  shopping: "#22c55e",
};

interface KakaoMapViewProps {
  selectedCategory: string;
}

export default function KakaoMapView({ selectedCategory }: KakaoMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  const filteredSpots =
    selectedCategory === "all"
      ? MAP_SPOTS
      : MAP_SPOTS.filter((s) => s.category === selectedCategory);

  // 카카오맵 SDK 로드
  useEffect(() => {
    if (window.kakao?.maps) {
      setSdkLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    if (!apiKey || apiKey === "your_kakao_map_key") {
      setSdkError(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        setSdkLoaded(true);
      });
    };
    script.onerror = () => setSdkError(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!sdkLoaded || !mapRef.current) return;

    const { kakao } = window;
    const center = new kakao.maps.LatLng(37.5445, 127.0555);
    const map = new kakao.maps.Map(mapRef.current, {
      center,
      level: 4,
    });
    mapInstanceRef.current = map;

    // 현재 위치 마커
    const currentOverlay = new kakao.maps.CustomOverlay({
      position: center,
      content: `
        <div style="position:relative;">
          <div style="width:16px;height:16px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
          <div style="position:absolute;inset:-6px;width:28px;height:28px;background:rgba(37,99,235,0.15);border-radius:50%;"></div>
        </div>
      `,
      zIndex: 5,
    });
    currentOverlay.setMap(map);

    return () => {
      mapInstanceRef.current = null;
    };
  }, [sdkLoaded]);

  // 마커 업데이트
  useEffect(() => {
    if (!sdkLoaded || !mapInstanceRef.current) return;
    const { kakao } = window;
    const map = mapInstanceRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    filteredSpots.forEach((spot) => {
      const position = new kakao.maps.LatLng(spot.lat, spot.lng);
      const color = CATEGORY_PIN_COLORS[spot.category] || "#6b7280";

      const content = document.createElement("div");
      content.style.cursor = "pointer";
      content.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;">
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
      `;

      content.addEventListener("click", () => {
        setSelectedSpot(spot);
        map.panTo(position);
      });

      const overlay = new kakao.maps.CustomOverlay({
        position,
        content,
        yAnchor: 1.2,
        zIndex: 10,
      });
      overlay.setMap(map);
      markersRef.current.push(overlay);
    });
  }, [sdkLoaded, filteredSpots]);

  // SDK 에러 또는 키 미설정 시 안내
  if (sdkError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] bg-gray-50 px-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            카카오맵 API 키가 필요합니다
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            .env.local 파일에 실제 NEXT_PUBLIC_KAKAO_MAP_API_KEY를 설정해주세요
          </p>
          <code className="text-xs bg-gray-100 px-3 py-2 rounded-lg text-gray-600 block">
            NEXT_PUBLIC_KAKAO_MAP_API_KEY=실제_API_키
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-120px)]">
      {/* 카카오맵 */}
      <div ref={mapRef} className="w-full h-full" />

      {/* 지도 제공 라벨 */}
      <div className="absolute top-4 left-4 z-30 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow">
        Kakao Map
      </div>

      {/* 내 위치 버튼 */}
      <div className="absolute bottom-36 right-4 z-30">
        <button
          onClick={() => {
            if (mapInstanceRef.current && window.kakao) {
              const center = new window.kakao.maps.LatLng(37.5445, 127.0555);
              mapInstanceRef.current.panTo(center);
            }
          }}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50"
        >
          <Navigation className="h-5 w-5 text-blue-600" />
        </button>
      </div>

      {/* 선택된 Spot 카드 */}
      {selectedSpot && (
        <div className="absolute bottom-4 left-4 right-4 z-30">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setSelectedSpot(null)}
              className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center bg-black/40 rounded-full"
            >
              <X className="h-4 w-4 text-white" />
            </button>

            <div className="flex">
              <div className="relative w-32 h-32 shrink-0 bg-gray-200">
                <img
                  src={selectedSpot.image}
                  alt={selectedSpot.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                      {selectedSpot.categoryLabel}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs">{selectedSpot.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900">{selectedSpot.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {selectedSpot.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {selectedSpot.distance}m
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    도보 {selectedSpot.walkingTime}분
                  </span>
                </div>
              </div>
            </div>

            <div className="px-3 pb-3 flex gap-2">
              <Link
                href={`/mockup/a/spots/${selectedSpot.id}`}
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
      )}
    </div>
  );
}
