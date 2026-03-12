"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Coffee,
  UtensilsCrossed,
  Star,
  Clock,
  X,
  ChevronRight,
  Locate,
  Filter,
  Eye,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// 근처 스팟 Mock 데이터 (사용자 위치 기반으로 오프셋 적용)
// ============================================================
interface NearbySpot {
  id: string;
  name: string;
  category: "cafe" | "restaurant";
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  distance: number;
  walkingTime: number;
  address: string;
  tags: string[];
  latOffset: number;
  lngOffset: number;
  isOpen: boolean;
  priceRange: string;
}

const NEARBY_SPOTS: NearbySpot[] = [
  {
    id: "spot-1",
    name: "온도 커피 로스터스",
    category: "cafe",
    description: "직접 로스팅한 스페셜티 원두로 내리는 핸드드립 전문 카페",
    image: "https://picsum.photos/seed/hcafe1/400/300",
    rating: 4.8,
    reviewCount: 1518,
    distance: 120,
    walkingTime: 2,
    address: "오산시 오산로 157 1층",
    tags: ["핸드드립", "디저트", "조용한"],
    latOffset: 0.0012,
    lngOffset: 0.0008,
    isOpen: true,
    priceRange: "₩5,000~8,000",
  },
  {
    id: "spot-2",
    name: "미도식당",
    category: "restaurant",
    description: "40년 전통 수제 돈까스와 짬뽕의 환상 궁합",
    image: "https://picsum.photos/seed/hrest1/400/300",
    rating: 4.9,
    reviewCount: 2340,
    distance: 200,
    walkingTime: 3,
    address: "오산시 오산로 142",
    tags: ["돈까스", "점심맛집", "웨이팅"],
    latOffset: -0.0008,
    lngOffset: 0.0015,
    isOpen: true,
    priceRange: "₩8,000~12,000",
  },
  {
    id: "spot-3",
    name: "카페 모먼트",
    category: "cafe",
    description: "넓은 창가 좌석과 따뜻한 인테리어의 감성 카페",
    image: "https://picsum.photos/seed/hcafe2/400/300",
    rating: 4.6,
    reviewCount: 876,
    distance: 350,
    walkingTime: 5,
    address: "오산시 대원동 28-3",
    tags: ["브런치", "감성", "넓은공간"],
    latOffset: 0.002,
    lngOffset: -0.001,
    isOpen: true,
    priceRange: "₩6,000~15,000",
  },
  {
    id: "spot-4",
    name: "골목 라멘",
    category: "restaurant",
    description: "진한 돈코츠 라멘과 수제 교자가 맛있는 일본 라멘 전문점",
    image: "https://picsum.photos/seed/hrest2/400/300",
    rating: 4.7,
    reviewCount: 1203,
    distance: 280,
    walkingTime: 4,
    address: "오산시 오산로 168",
    tags: ["라멘", "교자", "혼밥"],
    latOffset: -0.0015,
    lngOffset: -0.0012,
    isOpen: true,
    priceRange: "₩9,000~13,000",
  },
  {
    id: "spot-5",
    name: "로스팅 하우스",
    category: "cafe",
    description: "매장에서 직접 로스팅하는 모습을 볼 수 있는 카페",
    image: "https://picsum.photos/seed/hcafe3/400/300",
    rating: 4.5,
    reviewCount: 542,
    distance: 450,
    walkingTime: 6,
    address: "오산시 원동 15-2",
    tags: ["로스팅", "베이커리", "테라스"],
    latOffset: 0.0025,
    lngOffset: 0.002,
    isOpen: false,
    priceRange: "₩5,500~9,000",
  },
  {
    id: "spot-6",
    name: "한우 곱창집",
    category: "restaurant",
    description: "신선한 한우 곱창을 숯불에 구워먹는 로컬 맛집",
    image: "https://picsum.photos/seed/hrest3/400/300",
    rating: 4.4,
    reviewCount: 980,
    distance: 380,
    walkingTime: 5,
    address: "오산시 대원동 45-1",
    tags: ["곱창", "숯불", "회식"],
    latOffset: -0.002,
    lngOffset: 0.0025,
    isOpen: true,
    priceRange: "₩15,000~25,000",
  },
  {
    id: "spot-7",
    name: "디저트 팩토리",
    category: "cafe",
    description: "수제 케이크와 마카롱이 유명한 디저트 전문 카페",
    image: "https://picsum.photos/seed/hcafe4/400/300",
    rating: 4.7,
    reviewCount: 1120,
    distance: 300,
    walkingTime: 4,
    address: "오산시 오산로 183",
    tags: ["케이크", "마카롱", "선물"],
    latOffset: 0.001,
    lngOffset: -0.002,
    isOpen: true,
    priceRange: "₩4,000~8,000",
  },
  {
    id: "spot-8",
    name: "피자 스토리",
    category: "restaurant",
    description: "화덕에서 구운 나폴리 스타일 피자 전문점",
    image: "https://picsum.photos/seed/hrest4/400/300",
    rating: 4.6,
    reviewCount: 756,
    distance: 500,
    walkingTime: 7,
    address: "오산시 원동 22-8",
    tags: ["화덕피자", "파스타", "데이트"],
    latOffset: -0.003,
    lngOffset: -0.001,
    isOpen: true,
    priceRange: "₩12,000~20,000",
  },
];

// ============================================================
// 카테고리 설정
// ============================================================
const CATEGORIES = [
  { id: "all", label: "전체", icon: MapPin },
  { id: "cafe", label: "카페", icon: Coffee },
  { id: "restaurant", label: "맛집", icon: UtensilsCrossed },
] as const;

const CATEGORY_STYLES: Record<string, { markerBg: string; markerBorder: string; badge: string }> = {
  cafe: {
    markerBg: "#F59E0B",
    markerBorder: "#D97706",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  restaurant: {
    markerBg: "#EF4444",
    markerBorder: "#DC2626",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
};

// ============================================================
// 네이버 지도 타입 선언
// ============================================================
declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (el: HTMLElement, opts: Record<string, unknown>) => NaverMap;
        LatLng: new (lat: number, lng: number) => NaverLatLng;
        Marker: new (opts: Record<string, unknown>) => NaverMarker;
        InfoWindow: new (opts: Record<string, unknown>) => NaverInfoWindow;
        Event: {
          addListener: (target: unknown, event: string, handler: () => void) => void;
        };
        Size: new (w: number, h: number) => unknown;
        Point: new (x: number, y: number) => unknown;
      };
    };
  }
}

interface NaverLatLng {
  lat: () => number;
  lng: () => number;
}

interface NaverMap {
  setCenter: (latlng: NaverLatLng) => void;
  setZoom: (zoom: number) => void;
  getCenter: () => NaverLatLng;
  getZoom: () => number;
  panTo: (latlng: NaverLatLng, opts?: Record<string, unknown>) => void;
}

interface NaverMarker {
  setMap: (map: NaverMap | null) => void;
  getPosition: () => NaverLatLng;
  setIcon: (icon: unknown) => void;
}

interface NaverInfoWindow {
  open: (map: NaverMap, marker: NaverMarker) => void;
  close: () => void;
}

// ============================================================
// 메인 컴포넌트
// ============================================================
const DEFAULT_LAT = 37.1495;
const DEFAULT_LNG = 127.0773;

export default function MockupHPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const naverMapRef = useRef<NaverMap | null>(null);
  const markersRef = useRef<NaverMarker[]>([]);
  const myMarkerRef = useRef<NaverMarker | null>(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<NearbySpot | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [spotsWithCoords, setSpotsWithCoords] = useState<(NearbySpot & { lat: number; lng: number })[]>([]);
  const [animatedSpots, setAnimatedSpots] = useState<Set<string>>(new Set());
  const [showWelcome, setShowWelcome] = useState(true);

  // 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        () => {
          // 위치 권한 거부 시 기본값 사용 (오산역 근처)
          setUserLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      setIsLocating(false);
    }
  }, []);

  // 위치 기반 좌표 계산
  useEffect(() => {
    if (!userLocation) return;
    const spots = NEARBY_SPOTS.map((spot) => ({
      ...spot,
      lat: userLocation.lat + spot.latOffset,
      lng: userLocation.lng + spot.lngOffset,
    }));
    setSpotsWithCoords(spots);
  }, [userLocation]);

  // 네이버 지도 스크립트 로드 (NCP)
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    if (!clientId) return;

    if (window.naver?.maps) {
      setIsMapLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => setIsMapLoaded(true);
    script.onerror = () => {
      setMapError("네이버 지도 스크립트를 불러올 수 없습니다.");
    };
    document.head.appendChild(script);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !userLocation) return;

    const { naver } = window;
    if (!naver?.maps?.Map) {
      setMapError("네이버 지도 API 인증에 실패했습니다. NCP 콘솔에서 서비스 URL에 localhost:3003을 등록해주세요.");
      return;
    }

    try {
      const map = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(userLocation.lat, userLocation.lng),
      zoom: 16,
      mapTypeControl: false,
      scaleControl: false,
      logoControl: true,
      mapDataControl: false,
      zoomControl: false,
    });

    naverMapRef.current = map;

    // 현재 위치 마커
    const myMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(userLocation.lat, userLocation.lng),
      map,
      icon: {
        content: `
          <div style="position:relative;">
            <div style="width:20px;height:20px;background:#03c75a;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);position:relative;z-index:2;"></div>
            <div style="position:absolute;top:0;left:0;width:20px;height:20px;background:#03c75a;border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;opacity:0.3;"></div>
            <style>@keyframes ping{75%,100%{transform:scale(2.5);opacity:0;}}</style>
          </div>
        `,
        size: new naver.maps.Size(20, 20),
        anchor: new naver.maps.Point(10, 10),
      },
      zIndex: 100,
    });
    myMarkerRef.current = myMarker;
    } catch (e) {
      console.error("지도 초기화 실패:", e);
      setMapError("지도를 초기화하는데 실패했습니다.");
    }
  }, [isMapLoaded, userLocation]);

  // 커스텀 마커 생성 함수
  const createMarkerIcon = useCallback(
    (spot: NearbySpot, isSelected: boolean) => {
      const style = CATEGORY_STYLES[spot.category];
      const bg = isSelected ? "#03c75a" : style.markerBg;
      const border = isSelected ? "#02a84d" : style.markerBorder;
      const icon = spot.category === "cafe" ? "☕" : "🍽️";
      const scale = isSelected ? "transform:scale(1.2);" : "";

      return `
      <div style="display:flex;flex-direction:column;align-items:center;${scale}transition:transform 0.2s;">
        <div style="background:white;border-radius:12px;padding:4px 10px;margin-bottom:4px;box-shadow:0 2px 12px rgba(0,0,0,0.15);border:2px solid ${bg};white-space:nowrap;font-size:12px;font-weight:700;color:#333;">
          ${icon} ${spot.name}
        </div>
        <div style="width:36px;height:36px;background:${bg};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,0,0,0.25);font-size:16px;">
          ${icon}
        </div>
        <div style="width:8px;height:8px;background:${bg};transform:rotate(45deg);margin-top:-6px;box-shadow:2px 2px 4px rgba(0,0,0,0.1);"></div>
      </div>
    `;
    },
    []
  );

  // 마커 배치 (애니메이션 포함)
  useEffect(() => {
    if (!naverMapRef.current || !isMapLoaded || spotsWithCoords.length === 0) return;

    const { naver } = window;
    if (!naver?.maps) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const filteredSpots =
      selectedCategory === "all"
        ? spotsWithCoords
        : spotsWithCoords.filter((s) => s.category === selectedCategory);

    // 하나씩 순차적으로 나타나는 애니메이션
    filteredSpots.forEach((spot, index) => {
      setTimeout(() => {
        if (!naverMapRef.current) return;

        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(spot.lat, spot.lng),
          map: naverMapRef.current,
          icon: {
            content: createMarkerIcon(spot, selectedSpot?.id === spot.id),
            size: new naver.maps.Size(100, 70),
            anchor: new naver.maps.Point(50, 70),
          },
          zIndex: selectedSpot?.id === spot.id ? 50 : 10,
        });

        naver.maps.Event.addListener(marker, "click", () => {
          setSelectedSpot((prev) => (prev?.id === spot.id ? null : spot));
        });

        markersRef.current.push(marker);

        // 애니메이션 상태 업데이트
        setAnimatedSpots((prev) => new Set(prev).add(spot.id));
      }, index * 150);
    });
  }, [isMapLoaded, spotsWithCoords, selectedCategory, createMarkerIcon, selectedSpot?.id]);

  // 선택된 스팟 변경 시 마커 아이콘 업데이트
  useEffect(() => {
    if (!window.naver?.maps || markersRef.current.length === 0) return;
    const { naver } = window;

    const filteredSpots =
      selectedCategory === "all"
        ? spotsWithCoords
        : spotsWithCoords.filter((s) => s.category === selectedCategory);

    markersRef.current.forEach((marker, idx) => {
      const spot = filteredSpots[idx];
      if (!spot) return;
      const isSelected = selectedSpot?.id === spot.id;
      marker.setIcon({
        content: createMarkerIcon(spot, isSelected),
        size: new naver.maps.Size(100, 70),
        anchor: new naver.maps.Point(50, 70),
      });
    });

    // 선택된 스팟으로 지도 이동
    if (selectedSpot && naverMapRef.current) {
      const spotWithCoord = spotsWithCoords.find((s) => s.id === selectedSpot.id);
      if (spotWithCoord) {
        naverMapRef.current.panTo(
          new naver.maps.LatLng(spotWithCoord.lat, spotWithCoord.lng),
          { duration: 300 }
        );
      }
    }
  }, [selectedSpot, spotsWithCoords, selectedCategory, createMarkerIcon]);

  // 내 위치로 이동
  const handleMyLocation = useCallback(() => {
    if (!naverMapRef.current || !userLocation) return;
    const { naver } = window;
    naverMapRef.current.panTo(
      new naver.maps.LatLng(userLocation.lat, userLocation.lng),
      { duration: 300 }
    );
    naverMapRef.current.setZoom(16);
  }, [userLocation]);

  // 줌 컨트롤
  const handleZoom = useCallback((delta: number) => {
    if (!naverMapRef.current) return;
    const currentZoom = naverMapRef.current.getZoom();
    naverMapRef.current.setZoom(currentZoom + delta);
  }, []);

  // 웰컴 배너 자동 숨김
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // 로딩 화면
  if (isLocating || !userLocation) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-[#03c75a]/10 flex items-center justify-center">
            <Navigation className="h-8 w-8 text-[#03c75a] animate-pulse" />
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-[#03c75a]/30 animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">위치를 찾고 있어요</p>
          <p className="text-sm text-gray-500 mt-1">근처 카페와 맛집을 불러옵니다...</p>
        </div>
      </div>
    );
  }

  const filteredCount =
    selectedCategory === "all"
      ? spotsWithCoords.length
      : spotsWithCoords.filter((s) => s.category === selectedCategory).length;

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* 상단 헤더 */}
      <div className="relative z-40 bg-white border-b border-gray-200">
        {/* 검색바 */}
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
            <MapPin className="h-4 w-4 text-[#03c75a] shrink-0" />
            <span className="text-sm text-gray-700 font-medium truncate">
              내 주변 카페 · 맛집
            </span>
          </div>
          <button
            onClick={() => setSelectedCategory("all")}
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedSpot(null);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "bg-[#03c75a] text-white shadow-md shadow-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
                {isActive && (
                  <span className="bg-white/25 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {filteredCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* API 인증 에러 */}
        {mapError && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-lg font-bold text-gray-900 mb-2">지도를 불러올 수 없습니다</p>
            <p className="text-sm text-gray-500 mb-4 max-w-sm">{mapError}</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left text-xs text-gray-600 max-w-md">
              <p className="font-bold mb-2">해결 방법:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li><a href="https://console.ncloud.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">NCP 콘솔</a> 접속</li>
                <li>AI·NAVER API &gt; Application &gt; 내 앱 선택</li>
                <li>Web Dynamic Map 서비스 URL에 <code className="bg-gray-200 px-1 rounded">http://localhost:3003</code> 추가</li>
                <li>저장 후 페이지 새로고침</li>
              </ol>
            </div>
          </div>
        )}

        {/* 웰컴 배너 */}
        {showWelcome && (
          <div className="absolute top-4 left-4 right-4 z-30 animate-in slide-in-from-top duration-500">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-green-100 px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#03c75a]/10 flex items-center justify-center shrink-0">
                <Navigation className="h-5 w-5 text-[#03c75a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">내 주변 SpotLine</p>
                <p className="text-xs text-gray-500">
                  근처 {spotsWithCoords.length}개의 카페와 맛집을 찾았어요
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* 줌 컨트롤 */}
        <div className="absolute top-4 right-4 z-30 flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => handleZoom(1)}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold border-b border-gray-100 active:bg-gray-100"
          >
            +
          </button>
          <button
            onClick={() => handleZoom(-1)}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold active:bg-gray-100"
          >
            −
          </button>
        </div>

        {/* 내 위치 버튼 */}
        <div className="absolute bottom-[calc(theme(spacing.4)+var(--card-height,0px))] right-4 z-30"
          style={{ "--card-height": selectedSpot ? "220px" : "0px" } as React.CSSProperties}
        >
          <button
            onClick={handleMyLocation}
            className="flex items-center justify-center w-11 h-11 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <Locate className="h-5 w-5 text-[#03c75a]" />
          </button>
        </div>

        {/* 스팟 수 표시 */}
        <div className="absolute bottom-4 left-4 z-30" style={{ marginBottom: selectedSpot ? "220px" : "0px" }}>
          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200 px-3 py-1.5 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#03c75a] animate-pulse" />
            <span className="text-xs font-medium text-gray-700">
              주변 {filteredCount}개 Spot
            </span>
          </div>
        </div>

        {/* 선택된 Spot 카드 */}
        {selectedSpot && (
          <div className="absolute bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom duration-300">
            <SpotDetailCard spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 스팟 디테일 카드
// ============================================================
function SpotDetailCard({
  spot,
  onClose,
}: {
  spot: NearbySpot;
  onClose: () => void;
}) {
  const style = CATEGORY_STYLES[spot.category];

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* 닫기 */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors"
      >
        <X className="h-4 w-4 text-white" />
      </button>

      <div className="flex">
        {/* 이미지 */}
        <div className="relative w-32 h-32 shrink-0 bg-gray-200">
          <img
            src={spot.image}
            alt={spot.name}
            className="w-full h-full object-cover"
          />
          {!spot.isOpen && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-bold">영업 종료</span>
            </div>
          )}
          {/* place+ 뱃지 */}
          <div className="absolute top-2 left-2">
            <span className="bg-[#03c75a] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              place+
            </span>
          </div>
        </div>

        {/* 정보 */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", style.badge)}>
                {spot.category === "cafe" ? "카페" : "맛집"}
              </span>
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium">{spot.rating}</span>
              </div>
              <span className="text-[10px] text-gray-400">
                리뷰 {spot.reviewCount.toLocaleString()}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-base truncate">{spot.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{spot.description}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5">
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {spot.distance}m
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              도보 {spot.walkingTime}분
            </span>
            <span className="text-[10px] text-gray-400">{spot.priceRange}</span>
          </div>
        </div>
      </div>

      {/* 태그 + 액션 */}
      <div className="px-3 pb-3">
        {/* 태그 */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-none">
          {spot.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#03c75a] text-white rounded-xl text-sm font-medium hover:bg-[#02b350] active:bg-[#029a46] transition-colors">
            상세보기
            <ChevronRight className="h-4 w-4" />
          </button>
          <button className="flex items-center justify-center gap-1 py-2.5 px-4 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <Navigation className="h-4 w-4" />
            길찾기
          </button>
          <button className="flex items-center justify-center w-10 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
