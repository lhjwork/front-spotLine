"use client";

import { useCallback } from "react";
import { Map } from "react-kakao-maps-sdk";

import { useExploreStore } from "@/store/useExploreStore";

import ExploreMarker from "./ExploreMarker";
import ExploreSpotPreview from "./ExploreSpotPreview";

export default function ExploreMap() {
  const center = useExploreStore((s) => s.center);
  const zoom = useExploreStore((s) => s.zoom);
  const spots = useExploreStore((s) => s.spots);
  const selectedSpot = useExploreStore((s) => s.selectedSpot);
  const setSelectedSpot = useExploreStore((s) => s.setSelectedSpot);

  const handleMapClick = useCallback(() => {
    setSelectedSpot(null);
  }, [setSelectedSpot]);

  return (
    <Map
      center={center}
      level={zoom}
      className="w-full h-full"
      onClick={handleMapClick}
    >
      {spots.map((spot) => (
        <ExploreMarker key={spot.id} spot={spot} />
      ))}

      {selectedSpot && (
        <ExploreSpotPreview spot={selectedSpot} />
      )}
    </Map>
  );
}
