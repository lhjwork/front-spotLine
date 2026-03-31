"use client";

import { useEffect, useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/utils";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useDiscoverStore } from "@/store/useDiscoverStore";
import { fetchDiscover } from "@/lib/api";
import Link from "next/link";
import LocationHeader from "./LocationHeader";
import LocationPermissionBanner from "./LocationPermissionBanner";
import SpotBlock from "./SpotBlock";
import TransitionInfo from "./TransitionInfo";
import NearbySpotScroll from "./NearbySpotScroll";
import PopularRoutesList from "./PopularRoutesList";
import DiscoverSkeleton from "./DiscoverSkeleton";
import ExploreNavBar from "@/components/shared/ExploreNavBar";

export default function DiscoverPage() {
  const { coordinates, status, requestLocation } = useGeolocation();
  const { data, isLoading, error, setData, setIsLoading, setError } =
    useDiscoverStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDiscover = useCallback(
    async (excludeSpotId?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchDiscover(
          coordinates?.lat,
          coordinates?.lng,
          excludeSpotId
        );
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Spot 정보를 불러올 수 없습니다"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [coordinates, setData, setIsLoading, setError]
  );

  // Load when location is determined or denied
  useEffect(() => {
    if (status === "granted" || status === "denied" || status === "unavailable") {
      loadDiscover();
    }
  }, [status, loadDiscover]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const currentSpotId = data?.currentSpot?.spot?.id;
    await loadDiscover(currentSpotId);
    setIsRefreshing(false);
  };

  // Requesting location
  if (status === "idle" || status === "requesting") {
    return (
      <div className="max-w-lg mx-auto">
        <DiscoverSkeleton />
      </div>
    );
  }

  // Loading API data
  if (isLoading && !data) {
    return (
      <div className="max-w-lg mx-auto">
        <DiscoverSkeleton />
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="mb-4 text-gray-500">{error}</p>
        <button
          onClick={() => loadDiscover()}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-lg mx-auto pb-8">
      <ExploreNavBar activeTab="discover" />

      {/* Location denied banner */}
      {!data.locationGranted && status === "denied" && (
        <div className="px-4 pt-4">
          <LocationPermissionBanner onRequestLocation={requestLocation} />
        </div>
      )}

      {/* Location header */}
      <div className="px-4 pt-4 pb-2">
        <LocationHeader
          area={data.area}
          locationGranted={data.locationGranted}
        />
      </div>

      {/* Spot blocks with dim effect on refresh */}
      <div className={cn("transition-opacity duration-200", isRefreshing && "opacity-50")}>
        {/* Current Spot Block */}
        {data.currentSpot && (
          <div className="px-4">
            <SpotBlock
              key={data.currentSpot.spot.id}
              spot={data.currentSpot.spot}
              placeInfo={data.currentSpot.placeInfo}
              variant="current"
              distanceLabel={
                data.locationGranted
                  ? `약 ${formatDistance(data.currentSpot.distanceFromUser)}`
                  : "인기 Spot"
              }
            />
          </div>
        )}

        {/* Transition Info */}
        {data.currentSpot && data.nextSpot && (
          <TransitionInfo
            distanceMeters={data.nextSpot.distanceFromCurrent}
            walkingTimeMinutes={data.nextSpot.walkingTime}
          />
        )}

        {/* Next Spot Block */}
        {data.nextSpot && (
          <div className="px-4">
            <SpotBlock
              key={data.nextSpot.spot.id}
              spot={data.nextSpot.spot}
              placeInfo={data.nextSpot.placeInfo}
              variant="next"
              distanceLabel={`도보 ${data.nextSpot.walkingTime}분`}
            />
          </div>
        )}
      </div>

      {/* Refresh button */}
      <div className="flex justify-center py-4">
        <button
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className={cn(
            "flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 active:bg-gray-100",
            (isLoading || isRefreshing) && "opacity-50"
          )}
        >
          <RefreshCw className={cn("h-4 w-4", (isLoading || isRefreshing) && "animate-spin")} />
          다른 추천 보기
        </button>
      </div>

      {/* Nearby spots scroll */}
      {data.nearbySpots.length > 0 && (
        <NearbySpotScroll spots={data.nearbySpots} className="mt-2" />
      )}

      {/* Popular routes in the area */}
      {data.popularRoutes?.length > 0 && (
        <PopularRoutesList routes={data.popularRoutes} className="mt-6" />
      )}

      {/* Link to full feed */}
      <div className="px-4 mt-4">
        <Link
          href="/feed"
          className="block w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          모든 Route 보기 →
        </Link>
      </div>
    </div>
  );
}
