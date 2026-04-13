"use client";

import { useCallback, useMemo } from "react";
import { MapMarker } from "react-kakao-maps-sdk";

import { useExploreStore } from "@/store/useExploreStore";
import { CATEGORY_COLORS } from "@/constants/explore";

import type { SpotDetailResponse } from "@/types";

interface ExploreMarkerProps {
  spot: SpotDetailResponse;
}

function createMarkerSvg(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="${color}" stroke="white" stroke-width="2"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function ExploreMarker({ spot }: ExploreMarkerProps) {
  const setSelectedSpot = useExploreStore((s) => s.setSelectedSpot);

  const handleClick = useCallback(() => {
    setSelectedSpot(spot);
  }, [setSelectedSpot, spot]);

  const markerImage = useMemo(() => ({
    src: createMarkerSvg(CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.other),
    size: { width: 28, height: 28 },
  }), [spot.category]);

  return (
    <MapMarker
      position={{ lat: spot.latitude, lng: spot.longitude }}
      image={markerImage}
      onClick={handleClick}
    />
  );
}
