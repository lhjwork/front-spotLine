"use client";

import { ExternalLink, MapPin, Navigation2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExternalMapButtonsProps {
  storeName: string;
  address: string;
  lat?: number;
  lng?: number;
  className?: string;
}

export default function ExternalMapButtons({
  storeName,
  address,
  lat = 37.4979,
  lng = 127.0276,
  className,
}: ExternalMapButtonsProps) {
  const handleKakaoMap = () => {
    const params = new URLSearchParams({
      name: storeName,
      urlX: lng.toString(),
      urlY: lat.toString(),
    });
    window.open(
      `https://map.kakao.com/link/map?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleNaverMap = () => {
    window.open(
      `https://map.naver.com/v5/search/${encodeURIComponent(storeName + " " + address)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-semibold text-gray-600">외부 지도 앱으로 보기</p>

      <div className="grid grid-cols-2 gap-3">
        {/* 카카오맵 버튼 */}
        <button
          onClick={handleKakaoMap}
          className="group relative flex flex-col items-center gap-2 rounded-xl border-2 border-yellow-300 bg-gradient-to-b from-yellow-50 to-yellow-100 px-4 py-4 transition-all hover:border-yellow-400 hover:shadow-md hover:shadow-yellow-100 active:scale-[0.97]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-white shadow-sm">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-yellow-900">카카오맵</p>
            <p className="text-[10px] text-yellow-700">Kakao Map</p>
          </div>
          <ExternalLink className="absolute right-2 top-2 h-3 w-3 text-yellow-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>

        {/* 네이버지도 버튼 */}
        <button
          onClick={handleNaverMap}
          className="group relative flex flex-col items-center gap-2 rounded-xl border-2 border-green-300 bg-gradient-to-b from-green-50 to-green-100 px-4 py-4 transition-all hover:border-green-400 hover:shadow-md hover:shadow-green-100 active:scale-[0.97]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
            <Navigation2 className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-green-900">네이버지도</p>
            <p className="text-[10px] text-green-700">Naver Map</p>
          </div>
          <ExternalLink className="absolute right-2 top-2 h-3 w-3 text-green-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </div>

      <p className="text-center text-[11px] text-gray-400">
        각 지도 앱에서 길찾기, 주변 정보를 확인할 수 있어요
      </p>
    </div>
  );
}
