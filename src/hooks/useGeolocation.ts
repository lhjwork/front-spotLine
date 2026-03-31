"use client";

import { useState, useCallback } from "react";
import type { GeolocationState } from "@/types";

function getInitialGeolocationState(): GeolocationState {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return {
      coordinates: null,
      status: "unavailable",
      error: "이 브라우저에서는 위치 서비스를 사용할 수 없습니다",
      accuracy: null,
    };
  }
  return {
    coordinates: null,
    status: "requesting",
    error: null,
    accuracy: null,
  };
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(getInitialGeolocationState);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        coordinates: null,
        status: "unavailable",
        error: "이 브라우저에서는 위치 서비스를 사용할 수 없습니다",
        accuracy: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, status: "requesting", error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          status: "granted",
          error: null,
          accuracy: position.coords.accuracy,
        });
      },
      (geoError) => {
        const errorMessages: Record<number, string> = {
          1: "위치 권한이 거부되었습니다",
          2: "위치 정보를 가져올 수 없습니다",
          3: "위치 요청 시간이 초과되었습니다",
        };
        setState({
          coordinates: null,
          status: geoError.code === 1 ? "denied" : "unavailable",
          error: errorMessages[geoError.code] || "위치를 확인할 수 없습니다",
          accuracy: null,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  // Trigger geolocation request on first client render
  // Using a module-level flag to avoid useEffect setState issues
  useState(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      // Schedule the geolocation request in the next microtask
      Promise.resolve().then(() => requestLocation());
    }
    return true;
  });

  return { ...state, requestLocation };
}
