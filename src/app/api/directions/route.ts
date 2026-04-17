import { NextRequest, NextResponse } from "next/server";

interface NaverDirectionsResponse {
  code: number;
  message: string;
  currentDateTime: string;
  route?: {
    trafast?: Array<{
      summary: {
        start: { location: [number, number] };
        goal: { location: [number, number] };
        distance: number;
        duration: number;
        tollFare: number;
        fuelPrice: number;
        taxiFare: number;
      };
      path: [number, number][];
    }>;
  };
}

interface OSRMResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
      type: string;
    };
  }>;
}

type DirectionsProfile = "car" | "walk" | "bicycle";

// OSRM 프로필 매핑
const osrmProfileMap: Record<DirectionsProfile, string> = {
  car: "car",
  walk: "foot",
  bicycle: "bike",
};

// OSRM 무료 라우팅 API (실제 도로 경로)
async function fetchOSRM(
  startLat: string,
  startLng: string,
  endLat: string,
  endLng: string,
  profile: DirectionsProfile
) {
  const osrmProfile = osrmProfileMap[profile];
  const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data: OSRMResponse = await res.json();
  if (data.code !== "Ok" || !data.routes?.[0]) return null;

  const route = data.routes[0];
  // OSRM은 [lng, lat] 순서로 반환 — Naver와 동일
  return {
    distance: Math.round(route.distance),
    duration: Math.round(route.duration * 1000), // ms 단위로 변환 (Naver와 동일)
    path: route.geometry.coordinates as [number, number][],
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startLat = searchParams.get("startLat");
    const startLng = searchParams.get("startLng");
    const endLat = searchParams.get("endLat");
    const endLng = searchParams.get("endLng");
    const profile = (searchParams.get("profile") || "car") as DirectionsProfile;

    if (!startLat || !startLng || !endLat || !endLng) {
      return NextResponse.json(
        { success: false, error: "출발지와 도착지 좌표가 필요합니다." },
        { status: 400 }
      );
    }

    // 자동차 모드: 네이버 Directions API 시도 → 실패 시 OSRM 폴백
    if (profile === "car") {
      const naverResult = await tryNaverDirections(startLat, startLng, endLat, endLng);
      if (naverResult) {
        return NextResponse.json({ success: true, data: naverResult, source: "naver" });
      }
    }

    // OSRM 폴백 (도보/자전거는 직접, 자동차는 네이버 실패 시)
    const osrmResult = await fetchOSRM(startLat, startLng, endLat, endLng, profile);
    if (osrmResult) {
      return NextResponse.json({ success: true, data: osrmResult, source: "osrm" });
    }

    return NextResponse.json({
      success: false,
      error: "경로를 찾을 수 없습니다.",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("길찾기 API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// 네이버 Directions 5 API 호출
async function tryNaverDirections(
  startLat: string,
  startLng: string,
  endLat: string,
  endLng: string
) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const clientSecret = process.env.NAVER_NCP_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  try {
    const start = `${startLng},${startLat}`;
    const goal = `${endLng},${endLat}`;

    const res = await fetch(
      `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${start}&goal=${goal}&option=trafast`,
      {
        headers: {
          "X-NCP-APIGW-API-KEY-ID": clientId,
          "X-NCP-APIGW-API-KEY": clientSecret,
        },
      }
    );

    if (!res.ok) return null;

    const data: NaverDirectionsResponse = await res.json();
    if (data.code !== 0 || !data.route?.trafast?.[0]) return null;

    const route = data.route.trafast[0];
    return {
      distance: route.summary.distance,
      duration: route.summary.duration,
      tollFare: route.summary.tollFare,
      fuelPrice: route.summary.fuelPrice,
      taxiFare: route.summary.taxiFare,
      path: route.path,
    };
  } catch {
    return null;
  }
}
