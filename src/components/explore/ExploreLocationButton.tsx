"use client";

import { useCallback } from "react";

import { useGeolocation } from "@/hooks/useGeolocation";
import { useExploreStore } from "@/store/useExploreStore";
import { cn } from "@/lib/utils";

export default function ExploreLocationButton() {
  const { coordinates, status, requestLocation } = useGeolocation();
  const setCenter = useExploreStore((s) => s.setCenter);

  const handleClick = useCallback(() => {
    if (coordinates) {
      setCenter(coordinates);
    } else {
      requestLocation();
    }
  }, [coordinates, setCenter, requestLocation]);

  const isRequesting = status === "requesting";

  return (
    <button
      onClick={handleClick}
      disabled={isRequesting}
      className={cn(
        "absolute bottom-32 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-md",
        "flex items-center justify-center border border-gray-200",
        "hover:bg-gray-50 active:bg-gray-100 transition-colors",
        isRequesting && "opacity-50 cursor-not-allowed"
      )}
      aria-label="현재 위치로 이동"
      title={status === "denied" ? "위치 권한이 필요합니다" : "현재 위치로 이동"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("w-5 h-5", coordinates ? "text-blue-600" : "text-gray-600")}
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      </svg>
    </button>
  );
}
