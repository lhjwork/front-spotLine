import type { SpotLineBuilderSpot } from "@/types";

const EARTH_RADIUS_M = 6_371_000;
const WALKING_SPEED_MPS = 4_000 / 3_600; // 4km/h → m/s

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine formula — 두 좌표 간 거리 (미터) */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 거리 → 도보 시간 (분, 올림) */
export function estimateWalkingTime(distanceMeters: number): number {
  return Math.ceil(distanceMeters / WALKING_SPEED_MPS / 60);
}

/** Builder spots의 인접 Spot 간 거리/시간 일괄 계산 */
export function calculateSpotDistances(
  spots: SpotLineBuilderSpot[]
): SpotLineBuilderSpot[] {
  return spots.map((s, i) => {
    if (i >= spots.length - 1) {
      return { ...s, distanceToNext: null, walkingTimeToNext: null };
    }
    const next = spots[i + 1];
    const dist = Math.round(
      calculateDistance(
        s.spot.latitude,
        s.spot.longitude,
        next.spot.latitude,
        next.spot.longitude
      )
    );
    return {
      ...s,
      distanceToNext: dist,
      walkingTimeToNext: estimateWalkingTime(dist),
    };
  });
}
