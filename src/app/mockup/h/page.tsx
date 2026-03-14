"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MapPin,
  Navigation,
  Coffee,
  UtensilsCrossed,
  Clock,
  X,
  ChevronRight,
  ChevronLeft,
  Locate,
  Filter,
  Heart,
  Phone,
  Loader2,
  ExternalLink,
  List,
  Star,
  ArrowLeft,
  Car,
  Bus,
  Footprints,
  Bike,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// 타입 정의
// ============================================================
interface NearbySpot {
  id: string;
  name: string;
  category: "cafe" | "restaurant";
  description: string;
  address: string;
  telephone: string;
  lat: number;
  lng: number;
  distance: number;
  walkingTime: number;
  naverLink: string;
  naverCategory: string;
  thumUrl: string;
  businessStatus: string;
  menuInfo: string;
  reviewCount: number;
}

// ============================================================
// 카테고리 설정
// ============================================================
type DirectionsTab = "transit" | "car" | "walk" | "bicycle";

interface DrivingData {
  distance: number;
  duration: number;
  tollFare: number;
  fuelPrice: number;
  taxiFare: number;
  path: [number, number][];
}

const DIRECTIONS_TABS: { id: DirectionsTab; label: string; icon: typeof Bus }[] = [
  { id: "transit", label: "대중교통", icon: Bus },
  { id: "car", label: "자동차", icon: Car },
  { id: "walk", label: "도보", icon: Footprints },
  { id: "bicycle", label: "자전거", icon: Bike },
];

const CATEGORIES = [
  { id: "cafe", label: "카페", icon: Coffee },
  { id: "restaurant", label: "음식점", icon: UtensilsCrossed },
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
        Polyline: new (opts: Record<string, unknown>) => NaverPolyline;
        LatLngBounds: new (sw: NaverLatLng, ne: NaverLatLng) => NaverLatLngBounds;
      };
    };
  }
}

interface NaverLatLng {
  lat: () => number;
  lng: () => number;
}

interface NaverLatLngBounds {
  getSW: () => NaverLatLng;
  getNE: () => NaverLatLng;
  getMin: () => NaverLatLng;
  getMax: () => NaverLatLng;
}

interface NaverMap {
  setCenter: (latlng: NaverLatLng) => void;
  setZoom: (zoom: number) => void;
  getCenter: () => NaverLatLng;
  getZoom: () => number;
  getBounds: () => NaverLatLngBounds;
  panTo: (latlng: NaverLatLng, opts?: Record<string, unknown>) => void;
  fitBounds: (bounds: NaverLatLngBounds, padding?: Record<string, number>) => void;
}

interface NaverMarker {
  setMap: (map: NaverMap | null) => void;
  getPosition: () => NaverLatLng;
  setIcon: (icon: unknown) => void;
}

interface NaverPolyline {
  setMap: (map: NaverMap | null) => void;
  getPath: () => NaverLatLng[];
}

interface NaverInfoWindow {
  open: (map: NaverMap, marker: NaverMarker) => void;
  close: () => void;
}

// ============================================================
// 쿼리 파라미터 헬퍼
// ============================================================
function updateSearchParams(
  router: ReturnType<typeof useRouter>,
  searchParams: ReturnType<typeof useSearchParams>,
  updates: Record<string, string | null>
) {
  const params = new URLSearchParams(searchParams.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }
  router.replace(`?${params.toString()}`, { scroll: false });
}

// ============================================================
// 메인 컴포넌트
// ============================================================
const DEFAULT_LAT = 37.1495;
const DEFAULT_LNG = 127.0773;

export default function MockupHPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 쿼리 파라미터에서 상태 읽기
  const qpLat = searchParams.get("lat");
  const qpLng = searchParams.get("lng");
  const selectedCategory = searchParams.get("category") || "cafe";
  const selectedSpotId = searchParams.get("spot");

  const mapRef = useRef<HTMLDivElement>(null);
  const naverMapRef = useRef<NaverMap | null>(null);
  const markersRef = useRef<NaverMarker[]>([]);
  const myMarkerRef = useRef<NaverMarker | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const lastBoundaryRef = useRef<string>("");

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(!qpLat || !qpLng);
  const [spots, setSpots] = useState<NearbySpot[]>([]);
  const [isLoadingSpots, setIsLoadingSpots] = useState(false);
  const [spotsError, setSpotsError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSearchHere, setShowSearchHere] = useState(false);

  // 길찾기 상태
  const [directionsMode, setDirectionsMode] = useState(false);
  const [directionsTab, setDirectionsTab] = useState<DirectionsTab>("walk");
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [drivingData, setDrivingData] = useState<DrivingData | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const routePolylineRef = useRef<NaverPolyline | null>(null);
  const routeMarkersRef = useRef<NaverMarker[]>([]);
  const directionsAbortRef = useRef<AbortController | null>(null);

  // 쿼리 파라미터에서 위치 파생
  const userLocation = qpLat && qpLng
    ? { lat: parseFloat(qpLat), lng: parseFloat(qpLng) }
    : null;

  // 선택된 스팟을 spots 배열에서 찾기
  const selectedSpot = selectedSpotId
    ? spots.find((s) => s.id === selectedSpotId) ?? null
    : null;

  // 필터링된 스팟
  const filteredSpots = spots.filter((s) => s.category === selectedCategory);

  // 쿼리 파라미터 업데이트 헬퍼
  const setParam = useCallback(
    (updates: Record<string, string | null>) => {
      updateSearchParams(router, searchParams, updates);
    },
    [router, searchParams]
  );

  // 카테고리 변경
  const handleCategoryChange = useCallback(
    (cat: string) => {
      setParam({ category: cat, spot: null });
    },
    [setParam]
  );

  // 스팟 선택/해제
  const handleSpotSelect = useCallback(
    (spot: NearbySpot | null) => {
      setParam({ spot: spot ? spot.id : null });
    },
    [setParam]
  );

  // 사이드바 아이템 클릭
  const handleSidebarSpotClick = useCallback(
    (spot: NearbySpot) => {
      setParam({
        spot: selectedSpotId === spot.id ? null : spot.id,
      });
    },
    [setParam, selectedSpotId]
  );

  // 커스텀 마커 생성 함수
  const createMarkerIcon = useCallback(
    (spot: NearbySpot, isSelected: boolean) => {
      const style = CATEGORY_STYLES[spot.category];
      const bg = isSelected ? "#03c75a" : style.markerBg;
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

  // 지도 바운더리 기반 스팟 검색 (ref 기반, 의존성 없음)
  const doFetchSpots = useCallback(() => {
    const map = naverMapRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();
    const boundary = `${sw.lng()};${sw.lat()};${ne.lng()};${ne.lat()}`;

    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category") || "cafe";
    const query = cat === "cafe" ? "카페" : "음식점";
    const center = map.getCenter();

    // 같은 boundary + 같은 query면 재요청 안 함
    const cacheKey = `${boundary}__${query}`;
    if (cacheKey === lastBoundaryRef.current) return;
    lastBoundaryRef.current = cacheKey;

    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const abort = new AbortController();
    fetchAbortRef.current = abort;

    setIsLoadingSpots(true);
    setSpotsError(null);

    fetch(
      `/api/nearby-spots?lat=${center.lat()}&lng=${center.lng()}&query=${encodeURIComponent(query)}&boundary=${encodeURIComponent(boundary)}`,
      { signal: abort.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        if (abort.signal.aborted) return;
        if (data.success) {
          setSpots(data.data);
        } else {
          setSpotsError(data.error || "스팟 데이터를 불러오지 못했습니다.");
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSpotsError("네트워크 오류가 발생했습니다.");
      })
      .finally(() => {
        if (!abort.signal.aborted) setIsLoadingSpots(false);
      });
  }, []);

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

  // 경로 오버레이 모두 제거
  const clearRouteOverlay = useCallback(() => {
    routePolylineRef.current?.setMap(null);
    routePolylineRef.current = null;
    routeMarkersRef.current.forEach((m) => m.setMap(null));
    routeMarkersRef.current = [];
  }, []);

  // 경로 폴리라인 + 출발/도착 마커 그리기
  const drawRouteOnMap = useCallback((
    startLat: number, startLng: number,
    endLat: number, endLng: number,
    path?: [number, number][],
    mode: "car" | "walk" | "bicycle" = "walk"
  ) => {
    const map = naverMapRef.current;
    if (!map || !window.naver?.maps) return;
    const { naver } = window;

    clearRouteOverlay();

    // 경로가 있을 때만 폴리라인 그리기 (없으면 출발/도착 마커만)
    if (path && path.length > 1) {
      const naverPath = path.map(([lng, lat]) => new naver.maps.LatLng(lat, lng));
      const isDriving = mode === "car";

      const polyline = new naver.maps.Polyline({
        map,
        path: naverPath,
        strokeColor: isDriving ? "#4A89DC" : "#5B8FF9",
        strokeWeight: isDriving ? 6 : 5,
        strokeOpacity: isDriving ? 0.9 : 0.8,
        strokeLineCap: "round",
        strokeLineJoin: "round",
        strokeStyle: isDriving ? "solid" : "shortdash",
      });
      routePolylineRef.current = polyline;
    }

    // 출발 마커 (초록)
    const startMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(startLat, startLng),
      map,
      icon: {
        content: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="background:#03c75a;color:white;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);">출발</div>
            <div style="width:14px;height:14px;background:#03c75a;border:3px solid white;border-radius:50%;margin-top:4px;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        size: new naver.maps.Size(40, 40),
        anchor: new naver.maps.Point(20, 40),
      },
      zIndex: 200,
    });

    // 도착 마커 (빨강)
    const endMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(endLat, endLng),
      map,
      icon: {
        content: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="background:#EF4444;color:white;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);">도착</div>
            <div style="width:14px;height:14px;background:#EF4444;border:3px solid white;border-radius:50%;margin-top:4px;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        size: new naver.maps.Size(40, 40),
        anchor: new naver.maps.Point(20, 40),
      },
      zIndex: 200,
    });

    routeMarkersRef.current = [startMarker, endMarker];

    // 경로가 보이도록 map bounds 조정
    let minLat = Math.min(startLat, endLat);
    let maxLat = Math.max(startLat, endLat);
    let minLng = Math.min(startLng, endLng);
    let maxLng = Math.max(startLng, endLng);
    if (path) {
      for (const [lng, lat] of path) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      }
    }
    const bounds = new naver.maps.LatLngBounds(
      new naver.maps.LatLng(minLat, minLng),
      new naver.maps.LatLng(maxLat, maxLng)
    );
    map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 420 });
  }, [clearRouteOverlay]);

  // 경로 API 호출 (모든 모드 지원)
  const fetchDirections = useCallback(async (
    startLat: number, startLng: number, endLat: number, endLng: number,
    profile: "car" | "walk" | "bicycle" = "car"
  ) => {
    if (directionsAbortRef.current) directionsAbortRef.current.abort();
    const abort = new AbortController();
    directionsAbortRef.current = abort;

    setDirectionsLoading(true);
    setDirectionsError(null);

    try {
      const res = await fetch(
        `/api/directions?startLat=${startLat}&startLng=${startLng}&endLat=${endLat}&endLng=${endLng}&profile=${profile}`,
        { signal: abort.signal }
      );
      const data = await res.json();
      if (abort.signal.aborted) return;

      if (data.success && data.data) {
        if (profile === "car") setDrivingData(data.data);
        if (data.data.path) {
          drawRouteOnMap(startLat, startLng, endLat, endLng, data.data.path, profile);
        }
      } else {
        setDirectionsError(data.error || "경로를 찾을 수 없습니다.");
        // 경로 없음 — 출발/도착 마커만 표시
        drawRouteOnMap(startLat, startLng, endLat, endLng);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setDirectionsError("네트워크 오류가 발생했습니다.");
      // 경로 없음 — 출발/도착 마커만 표시
      drawRouteOnMap(startLat, startLng, endLat, endLng);
    } finally {
      if (!abort.signal.aborted) setDirectionsLoading(false);
    }
  }, [drawRouteOnMap]);

  // 길찾기 모드 진입
  const handleOpenDirections = useCallback(() => {
    setDirectionsMode(true);
    setDirectionsTab("walk");
    setDrivingData(null);
    setDirectionsError(null);
    setShowSidebar(true);

    // 도보 경로 API 호출
    if (userLocation && selectedSpot) {
      fetchDirections(userLocation.lat, userLocation.lng, selectedSpot.lat, selectedSpot.lng, "walk");
    }
  }, [userLocation, selectedSpot, fetchDirections]);

  // 길찾기 모드 종료
  const handleCloseDirections = useCallback(() => {
    setDirectionsMode(false);
    setDrivingData(null);
    setDirectionsError(null);
    clearRouteOverlay();
    if (directionsAbortRef.current) directionsAbortRef.current.abort();
  }, [clearRouteOverlay]);

  // 길찾기 탭 변경
  const handleDirectionsTabChange = useCallback((tab: DirectionsTab) => {
    setDirectionsTab(tab);
    setDirectionsError(null);
    if (tab !== "car") setDrivingData(null);

    if (!userLocation || !selectedSpot) return;

    const profileMap: Record<DirectionsTab, "car" | "walk" | "bicycle"> = {
      car: "car",
      walk: "walk",
      bicycle: "bicycle",
      transit: "walk", // 대중교통은 도보 경로로 대체 표시
    };
    fetchDirections(userLocation.lat, userLocation.lng, selectedSpot.lat, selectedSpot.lng, profileMap[tab]);
  }, [userLocation, selectedSpot, fetchDirections]);

  // 네이버 지도 길찾기 외부 링크 생성
  const getNaverDirectionsUrl = useCallback((spot: NearbySpot, mode: DirectionsTab) => {
    if (!userLocation) return "#";
    const modeMap: Record<DirectionsTab, string> = {
      transit: "transit",
      car: "car",
      walk: "walk",
      bicycle: "bicycle",
    };
    return `https://map.naver.com/p/directions/${userLocation.lat},${userLocation.lng},내 위치,/${spot.lat},${spot.lng},${encodeURIComponent(spot.name)},/-/${modeMap[mode]}`;
  }, [userLocation]);

  // 사용자 위치 가져오기 → 쿼리 파라미터에 저장
  useEffect(() => {
    // 이미 쿼리 파라미터에 위치가 있으면 geolocation 건너뜀
    if (qpLat && qpLng) {
      setIsLocating(false);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          setParam({ lat, lng });
          setIsLocating(false);
        },
        () => {
          setParam({
            lat: String(DEFAULT_LAT),
            lng: String(DEFAULT_LNG),
          });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setParam({
        lat: String(DEFAULT_LAT),
        lng: String(DEFAULT_LNG),
      });
      setIsLocating(false);
    }
  }, [qpLat, qpLng, setParam]);

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

  // 지도 초기화 + idle 이벤트로 스팟 검색
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !userLocation) return;

    const { naver } = window;
    if (!naver?.maps?.Map) {
      setMapError("네이버 지도 API 인증에 실패했습니다. NCP 콘솔에서 서비스 URL에 localhost:3003을 등록해주세요.");
      return;
    }

    // 이미 초기화된 경우 건너뜀
    if (naverMapRef.current) return;

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

      // 지도 이동/줌 시 "이 지역 검색" 버튼 표시
      naver.maps.Event.addListener(map, "idle", () => {
        const bounds = map.getBounds();
        const sw = bounds.getSW();
        const ne = bounds.getNE();
        const boundary = `${sw.lng()};${sw.lat()};${ne.lng()};${ne.lat()}`;
        const params = new URLSearchParams(window.location.search);
        const cat = params.get("category") || "cafe";
        const cacheKey = `${boundary}__${cat === "cafe" ? "카페" : "음식점"}`;

        if (cacheKey !== lastBoundaryRef.current) {
          setShowSearchHere(true);
        }
      });

      // 초기 검색 1회 실행
      doFetchSpots();
      setShowSearchHere(false);
    } catch (e) {
      console.error("지도 초기화 실패:", e);
      setMapError("지도를 초기화하는데 실패했습니다.");
    }
  }, [isMapLoaded, userLocation]);

  // 카테고리 변경 시 현재 바운드로 재검색
  useEffect(() => {
    if (!naverMapRef.current || !isMapLoaded) return;
    lastBoundaryRef.current = "";
    doFetchSpots();
    setShowSearchHere(false);
  }, [selectedCategory, doFetchSpots, isMapLoaded]);

  // 마커 배치 (spots/카테고리 변경 시에만 실행)
  useEffect(() => {
    if (!naverMapRef.current || !isMapLoaded || spots.length === 0) return;

    const { naver } = window;
    if (!naver?.maps) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const spotsToShow = spots.filter((s) => s.category === selectedCategory);

    spotsToShow.forEach((spot, index) => {
      setTimeout(() => {
        if (!naverMapRef.current) return;

        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(spot.lat, spot.lng),
          map: naverMapRef.current,
          icon: {
            content: createMarkerIcon(spot, false),
            size: new naver.maps.Size(100, 70),
            anchor: new naver.maps.Point(50, 70),
          },
          zIndex: 10,
        });

        naver.maps.Event.addListener(marker, "click", () => {
          // 클릭 시점의 최신 선택 상태를 URL에서 읽음
          const params = new URLSearchParams(window.location.search);
          const currentSpot = params.get("spot");
          handleSpotSelect(currentSpot === spot.id ? null : spot);
        });

        markersRef.current.push(marker);
      }, index * 80);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, spots, selectedCategory]);

  // 선택된 스팟 변경 시 마커 아이콘 업데이트
  useEffect(() => {
    if (!window.naver?.maps || markersRef.current.length === 0) return;
    const { naver } = window;

    const spotsToShow = spots.filter((s) => s.category === selectedCategory);

    markersRef.current.forEach((marker, idx) => {
      const spot = spotsToShow[idx];
      if (!spot) return;
      const isSelected = selectedSpotId === spot.id;
      marker.setIcon({
        content: createMarkerIcon(spot, isSelected),
        size: new naver.maps.Size(100, 70),
        anchor: new naver.maps.Point(50, 70),
      });
    });

  }, [selectedSpotId, selectedSpot, spots, selectedCategory, createMarkerIcon]);

  // 웰컴 배너 자동 숨김
  useEffect(() => {
    if (showWelcome && spots.length > 0) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, spots.length]);

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
          <p className="text-sm text-gray-500 mt-1">근처 카페와 음식점을 불러옵니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* 상단 헤더 */}
      <div className="relative z-40 bg-white border-b border-gray-200">
        {/* 검색바 */}
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={() => setShowSidebar((v) => !v)}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl border transition-colors",
              showSidebar
                ? "bg-[#03c75a] border-[#03c75a] text-white"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
            <MapPin className="h-4 w-4 text-[#03c75a] shrink-0" />
            <span className="text-sm text-gray-700 font-medium truncate">
              내 주변 카페 · 음식점
            </span>
          </div>
          <button
            onClick={() => handleCategoryChange("cafe")}
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
            const count = spots.filter((s) => s.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  handleCategoryChange(cat.id);
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
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 메인 영역: 사이드바 + 지도 */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* 좌측 사이드바 */}
        <div
          className={cn(
            "h-full bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 overflow-hidden z-20",
            showSidebar ? "w-[380px]" : "w-0 border-r-0"
          )}
        >
          {directionsMode && selectedSpot && userLocation ? (
            /* 길찾기 사이드바 */
            <SidebarDirections
              spot={selectedSpot}
              userLocation={userLocation}
              activeTab={directionsTab}
              onTabChange={handleDirectionsTabChange}
              onClose={handleCloseDirections}
              loading={directionsLoading}
              drivingData={drivingData}
              error={directionsError}
              naverUrl={getNaverDirectionsUrl(selectedSpot, directionsTab)}
            />
          ) : (
            <>
              {/* 사이드바 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#03c75a] animate-pulse" />
                  <span className="text-sm font-bold text-gray-900">
                    주변 {filteredSpots.length}개 Spot
                  </span>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              {/* 스팟 목록 */}
              <div className="flex-1 overflow-y-auto">
                {isLoadingSpots && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 text-[#03c75a] animate-spin" />
                    <span className="ml-2 text-sm text-gray-500">검색 중...</span>
                  </div>
                )}

                {spotsError && !isLoadingSpots && (
                  <div className="p-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                      <p className="text-sm text-red-700">{spotsError}</p>
                    </div>
                  </div>
                )}

                {!isLoadingSpots && filteredSpots.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <MapPin className="h-8 w-8 mb-2" />
                    <p className="text-sm">검색 결과가 없습니다</p>
                  </div>
                )}

                {filteredSpots.map((spot, idx) => (
                  <SidebarSpotItem
                    key={spot.id}
                    spot={spot}
                    index={idx + 1}
                    isSelected={selectedSpotId === spot.id}
                    onClick={() => handleSidebarSpotClick(spot)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 사이드바 열기 탭 (닫혀 있을 때) */}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-l-0 border-gray-200 rounded-r-xl shadow-lg px-1.5 py-4 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        )}

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
            </div>
          )}

          {/* 이 지역 검색 버튼 */}
          {showSearchHere && !isLoadingSpots && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
              <button
                onClick={() => {
                  lastBoundaryRef.current = "";
                  doFetchSpots();
                  setShowSearchHere(false);
                }}
                className="bg-[#03c75a] text-white rounded-full shadow-lg px-5 py-2.5 flex items-center gap-2 text-sm font-bold hover:bg-[#02b350] active:bg-[#029a46] transition-colors"
              >
                <MapPin className="h-4 w-4" />
                이 지역 검색
              </button>
            </div>
          )}

          {/* 스팟 로딩 중 */}
          {isLoadingSpots && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
              <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-[#03c75a] animate-spin" />
                <span className="text-sm font-medium text-gray-700">검색 중...</span>
              </div>
            </div>
          )}

          {/* 웰컴 배너 */}
          {showWelcome && spots.length > 0 && !isLoadingSpots && (
            <div className="absolute top-4 left-4 right-4 z-30 animate-in slide-in-from-top duration-500">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-green-100 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#03c75a]/10 flex items-center justify-center shrink-0">
                  <Navigation className="h-5 w-5 text-[#03c75a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    내 주변 SpotLine
                  </p>
                  <p className="text-xs text-gray-500">
                    지도 영역에서 {spots.length}개의 카페와 음식점을 찾았어요
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
          <div
            className="absolute right-4 z-30 transition-all duration-300"
            style={{ bottom: selectedSpot && !directionsMode ? "240px" : "16px" }}
          >
            <button
              onClick={handleMyLocation}
              className="flex items-center justify-center w-11 h-11 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <Locate className="h-5 w-5 text-[#03c75a]" />
            </button>
          </div>

          {/* 선택된 Spot 카드 (길찾기 모드가 아닐 때만) */}
          {selectedSpot && !directionsMode && (
            <div className="absolute bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom duration-300">
              <SpotDetailCard
                spot={selectedSpot}
                onClose={() => handleSpotSelect(null)}
                onDirections={handleOpenDirections}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 사이드바 스팟 아이템
// ============================================================
function SidebarSpotItem({
  spot,
  index,
  isSelected,
  onClick,
}: {
  spot: NearbySpot;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const style = CATEGORY_STYLES[spot.category];
  const categoryLabel = spot.category === "cafe" ? "카페" : "음식점";
  const [imgError, setImgError] = useState(false);
  const hasImage = spot.thumUrl && !imgError;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left border-b border-gray-100 transition-colors hover:bg-gray-50",
        isSelected && "bg-green-50/70"
      )}
    >
      {/* 매장 정보 */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={cn("text-[11px] font-medium px-1.5 py-0.5 rounded", style.badge)}>
            {spot.naverCategory || categoryLabel}
          </span>
          {spot.businessStatus && (
            <span className={cn(
              "text-[11px] font-medium px-1.5 py-0.5 rounded",
              spot.businessStatus === "영업중"
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-500"
            )}>
              {spot.businessStatus}
            </span>
          )}
        </div>

        <h4 className={cn(
          "text-[15px] font-bold leading-tight",
          isSelected ? "text-[#03c75a]" : "text-gray-900"
        )}>
          {spot.name}
        </h4>

        <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-gray-500">
          {spot.reviewCount > 0 && (
            <>
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                리뷰 {spot.reviewCount}
              </span>
              <span className="text-gray-300">·</span>
            </>
          )}
          <span className="truncate">{spot.address}</span>
        </div>
      </div>

      {/* 이미지 영역 */}
      {hasImage ? (
        <div className="px-4 pb-3">
          <div className="relative w-full h-[130px] rounded-lg overflow-hidden bg-gray-100">
            <img
              src={spot.thumUrl}
              alt={spot.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-10" />
            <div className="absolute bottom-2 left-2.5 flex items-center gap-2 text-white text-[11px]">
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {spot.distance >= 1000
                  ? `${(spot.distance / 1000).toFixed(1)}km`
                  : `${spot.distance}m`}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2.5 text-[11px] text-gray-400">
            <span className="flex items-center gap-0.5 text-[#03c75a] font-semibold">
              <MapPin className="h-3 w-3" />
              {spot.distance >= 1000
                ? `${(spot.distance / 1000).toFixed(1)}km`
                : `${spot.distance}m`}
            </span>
            {spot.telephone && (
              <span className="flex items-center gap-0.5">
                <Phone className="h-3 w-3" />
                {spot.telephone}
              </span>
            )}
          </div>
        </div>
      )}
    </button>
  );
}

// ============================================================
// 스팟 디테일 카드
// ============================================================
function SpotDetailCard({
  spot,
  onClose,
  onDirections,
}: {
  spot: NearbySpot;
  onClose: () => void;
  onDirections: () => void;
}) {
  const style = CATEGORY_STYLES[spot.category];
  const categoryIcon = spot.category === "cafe" ? "☕" : "🍽️";

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors"
      >
        <X className="h-4 w-4 text-white" />
      </button>

      <div className="flex">
        <div className="relative w-28 h-28 shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center">
          <span className="text-4xl mb-1">{categoryIcon}</span>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", style.badge)}>
            {spot.category === "cafe" ? "카페" : "음식점"}
          </span>
          <div className="absolute top-2 left-2">
            <span className="bg-[#03c75a] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              place+
            </span>
          </div>
        </div>

        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-[10px] text-gray-400 line-clamp-1">
                {spot.naverCategory}
              </span>
              {spot.businessStatus && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded",
                  spot.businessStatus === "영업중"
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-500"
                )}>
                  {spot.businessStatus}
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-base truncate">{spot.name}</h3>
            {spot.menuInfo && (
              <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{spot.menuInfo}</p>
            )}
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{spot.address}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5">
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {spot.distance >= 1000
                ? `${(spot.distance / 1000).toFixed(1)}km`
                : `${spot.distance}m`}
            </span>
            {spot.telephone && (
              <span className="flex items-center gap-0.5">
                <Phone className="h-3 w-3" />
                {spot.telephone}
              </span>
            )}
            {spot.reviewCount > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3" />
                리뷰 {spot.reviewCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="flex gap-2">
          <a
            href={spot.naverLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#03c75a] text-white rounded-xl text-sm font-medium hover:bg-[#02b350] active:bg-[#029a46] transition-colors"
          >
            네이버 상세보기
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={onDirections}
            className="flex items-center justify-center gap-1 py-2.5 px-4 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
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

// ============================================================
// 길찾기 패널
// ============================================================
function calcStraightDistance(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function SidebarDirections({
  spot,
  userLocation,
  activeTab,
  onTabChange,
  onClose,
  loading,
  drivingData,
  naverUrl,
}: {
  spot: NearbySpot;
  userLocation: { lat: number; lng: number };
  activeTab: DirectionsTab;
  onTabChange: (tab: DirectionsTab) => void;
  onClose: () => void;
  loading: boolean;
  drivingData: DrivingData | null;
  error: string | null;
  naverUrl: string;
}) {
  const dist = calcStraightDistance(userLocation.lat, userLocation.lng, spot.lat, spot.lng);

  return (
    <>
      {/* 탭 바 */}
      <div className="flex border-b border-gray-200 shrink-0">
        {DIRECTIONS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-white bg-[#03c75a]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 출발/도착 정보 */}
      <div className="px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#03c75a] border-2 border-green-200" />
            <div className="w-px h-6 bg-gray-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-red-200" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 mb-3">내 위치</p>
            <p className="text-sm font-bold text-gray-900 truncate">{spot.name}</p>
          </div>
        </div>
      </div>

      {/* 경로 결과 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 className="h-5 w-5 text-[#03c75a] animate-spin" />
              <span className="text-sm text-gray-500">경로 검색 중...</span>
            </div>
          )}

          {!loading && activeTab === "walk" && (
            <WalkContent dist={dist} />
          )}

          {!loading && activeTab === "car" && drivingData && (
            <CarContent data={drivingData} />
          )}

          {!loading && activeTab === "car" && !drivingData && (
            <CarFallbackContent dist={dist} />
          )}

          {!loading && activeTab === "transit" && (
            <TransitContent dist={dist} />
          )}

          {!loading && activeTab === "bicycle" && (
            <BicycleContent dist={dist} />
          )}
        </div>

        {/* 네이버 지도에서 보기 */}
        <div className="px-4 pb-4">
          <a
            href={naverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#03c75a] text-white rounded-xl text-sm font-medium hover:bg-[#02b350] transition-colors"
          >
            네이버 지도에서 보기
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* 뒤로가기 */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            목록으로 돌아가기
          </button>
        </div>
      </div>
    </>
  );
}

function WalkContent({ dist }: { dist: number }) {
  const time = Math.max(1, Math.round(dist / 67));
  const steps = Math.round(dist * 1.3);
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{time}</span>
        <span className="text-sm text-gray-500">분</span>
        <span className="mx-1 text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-700">{dist >= 1000 ? `${(dist / 1000).toFixed(1)}km` : `${dist}m`}</span>
        <span className="mx-1 text-gray-300">|</span>
        <span className="text-sm text-gray-500">{steps.toLocaleString()}걸음</span>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">직선 거리 기준 예상 시간입니다</p>
    </div>
  );
}

function CarContent({ data }: { data: DrivingData }) {
  const km = (data.distance / 1000).toFixed(1);
  const min = Math.round(data.duration / 1000 / 60);
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{min}</span>
        <span className="text-sm text-gray-500">분</span>
        <span className="mx-1 text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-700">{km}km</span>
      </div>
      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500">
        {data.taxiFare > 0 && <span>택시비 약 {data.taxiFare.toLocaleString()}원</span>}
        {data.tollFare > 0 && (
          <>
            <span className="text-gray-300">·</span>
            <span>통행료 {data.tollFare.toLocaleString()}원</span>
          </>
        )}
        {data.fuelPrice > 0 && (
          <>
            <span className="text-gray-300">·</span>
            <span>연료비 약 {data.fuelPrice.toLocaleString()}원</span>
          </>
        )}
      </div>
    </div>
  );
}

function TransitContent({ dist }: { dist: number }) {
  if (dist < 500) {
    return (
      <div className="py-2 text-center">
        <p className="text-sm text-gray-600">가까운 거리는 도보를 추천합니다</p>
        <p className="text-[11px] text-gray-400 mt-1">직선 거리 {dist}m</p>
      </div>
    );
  }
  return (
    <div className="py-2 text-center">
      <p className="text-sm text-gray-600">대중교통 경로는 네이버 지도에서 확인해주세요</p>
      <p className="text-[11px] text-gray-400 mt-1">직선 거리 {dist >= 1000 ? `${(dist / 1000).toFixed(1)}km` : `${dist}m`}</p>
    </div>
  );
}

function CarFallbackContent({ dist }: { dist: number }) {
  const time = Math.max(1, Math.round(dist / 500));
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{time}</span>
        <span className="text-sm text-gray-500">분</span>
        <span className="mx-1 text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-700">{dist >= 1000 ? `${(dist / 1000).toFixed(1)}km` : `${dist}m`}</span>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">자동차 경로는 네이버 지도에서 확인해주세요</p>
    </div>
  );
}

function BicycleContent({ dist }: { dist: number }) {
  const time = Math.max(1, Math.round(dist / 250));
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{time}</span>
        <span className="text-sm text-gray-500">분</span>
        <span className="mx-1 text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-700">{dist >= 1000 ? `${(dist / 1000).toFixed(1)}km` : `${dist}m`}</span>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">직선 거리 기준 예상 시간입니다</p>
    </div>
  );
}
