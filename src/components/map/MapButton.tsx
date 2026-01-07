"use client";

import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Store } from "@/types";
import { logMapLinkClick } from "@/lib/api";
import Button from "@/components/common/Button";

interface MapButtonProps {
  store: Store;
  qrId?: string;
  storeId?: string; // SpotLine용 storeId 추가
  variant?: "button" | "link";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function MapButton({ store, qrId, storeId, variant = "button", size = "md", className }: MapButtonProps) {
  const [lng, lat] = store.location.coordinates.coordinates;

  // 카카오맵 URL 생성
  const getKakaoMapUrl = () => {
    const baseUrl = "https://map.kakao.com/link/map";
    const params = new URLSearchParams({
      name: store.name,
      urlX: lng.toString(),
      urlY: lat.toString(),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  // 구글맵 URL 생성
  const getGoogleMapUrl = () => {
    const baseUrl = "https://www.google.com/maps/search/";
    const query = `${store.name} ${store.location.address}`;
    return `${baseUrl}?api=1&query=${encodeURIComponent(query)}`;
  };

  // 네이버맵 URL 생성
  const getNaverMapUrl = () => {
    const baseUrl = "https://map.naver.com/v5/search";
    return `${baseUrl}/${encodeURIComponent(store.name)}`;
  };

  const handleMapClick = (mapType: "kakao" | "google" | "naver") => {
    // 지도 클릭 이벤트 로깅 (SpotLine 전용)
    if (qrId && storeId) {
      logMapLinkClick(qrId, storeId, store._id);
    }

    let url = "";

    switch (mapType) {
      case "kakao":
        url = getKakaoMapUrl();
        break;
      case "google":
        url = getGoogleMapUrl();
        break;
      case "naver":
        url = getNaverMapUrl();
        break;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (variant === "link") {
    return (
      <div className={className}>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleMapClick("kakao")} className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700">
            <MapPin className="h-4 w-4" />
            <span>카카오맵</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          <button onClick={() => handleMapClick("google")} className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700">
            <MapPin className="h-4 w-4" />
            <span>구글맵</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          <button onClick={() => handleMapClick("naver")} className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700">
            <MapPin className="h-4 w-4" />
            <span>네이버맵</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 mb-2">지도에서 보기</p>
        <div className="grid grid-cols-1 gap-2">
          <Button variant="outline" size={size} onClick={() => handleMapClick("kakao")} className="justify-start">
            <MapPin className="mr-2 h-4 w-4" />
            카카오맵에서 보기
            <ExternalLink className="ml-auto h-4 w-4" />
          </Button>

          <Button variant="outline" size={size} onClick={() => handleMapClick("google")} className="justify-start">
            <Navigation className="mr-2 h-4 w-4" />
            구글맵에서 보기
            <ExternalLink className="ml-auto h-4 w-4" />
          </Button>

          <Button variant="outline" size={size} onClick={() => handleMapClick("naver")} className="justify-start">
            <MapPin className="mr-2 h-4 w-4" />
            네이버맵에서 보기
            <ExternalLink className="ml-auto h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
