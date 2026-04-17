import { NextRequest, NextResponse } from "next/server";

// ============================================================
// 타입 정의
// ============================================================
interface NaverSearchItem {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

interface NaverSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverSearchItem[];
}

interface NominatimAddress {
  road?: string;
  city_district?: string;
  suburb?: string;
  borough?: string;
  city?: string;
  town?: string;
  county?: string;
  neighbourhood?: string;
  quarter?: string;
  village?: string;
}

interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

interface SpotResult {
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
// 유틸리티 함수
// ============================================================
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

function calcDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function detectCategory(naverCategory: string): "cafe" | "restaurant" {
  const lower = naverCategory.toLowerCase();
  if (
    lower.includes("카페") ||
    lower.includes("커피") ||
    lower.includes("디저트") ||
    lower.includes("베이커리") ||
    lower.includes("제과") ||
    lower.includes("아이스크림") ||
    lower.includes("빙수") ||
    lower.includes("cafe") ||
    lower.includes("coffee")
  ) {
    return "cafe";
  }
  return "restaurant";
}

function parseNaverCoord(mapx: string, mapy: string): { lat: number; lng: number } {
  let lng = parseFloat(mapx);
  let lat = parseFloat(mapy);
  if (lng > 1000) lng = lng / 10000000;
  if (lat > 1000) lat = lat / 10000000;
  return { lat, lng };
}

function parseBoundary(boundary: string): {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
} | null {
  const parts = boundary.split(";").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return null;
  return { minLng: parts[0], minLat: parts[1], maxLng: parts[2], maxLat: parts[3] };
}

function isInBoundary(
  lat: number,
  lng: number,
  b: { minLng: number; minLat: number; maxLng: number; maxLat: number }
): boolean {
  return lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng;
}

// ============================================================
// 외부 API 호출
// ============================================================

// Nominatim Reverse Geocoding — 여러 레벨의 지역명 추출
async function getAreaNames(
  lat: number,
  lng: number
): Promise<{ city: string; district: string; neighborhood: string; full: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko&zoom=18&addressdetails=1`,
      { headers: { "User-Agent": "SpotLine-Dev/1.0" } }
    );

    if (res.ok) {
      const data = await res.json();
      const addr: NominatimAddress = data.address || {};
      const city = addr.city || addr.town || addr.county || "";
      const district =
        addr.city_district || addr.suburb || addr.borough || "";
      const neighborhood =
        addr.neighbourhood || addr.quarter || addr.village || "";
      const full = [city, district, neighborhood].filter(Boolean).join(" ");
      return { city, district, neighborhood, full };
    }
  } catch {
    // fallback
  }
  return { city: "", district: "", neighborhood: "", full: "" };
}

// 네이버 검색 API (display 최대 5)
async function searchNaver(
  query: string,
  display: number = 5
): Promise<NaverSearchItem[]> {
  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) return [];

  const params = new URLSearchParams({
    query,
    display: String(Math.min(display, 5)),
  });

  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/local.json?${params}`,
      {
        headers: {
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
      }
    );
    if (!res.ok) return [];
    const data: NaverSearchResponse = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

// 네이버 이미지 검색 API — 장소 썸네일 가져오기
async function searchNaverImage(query: string): Promise<string> {
  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) return "";

  const params = new URLSearchParams({
    query,
    display: "1",
    sort: "sim",
  });

  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/image?${params}`,
      {
        headers: {
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
      }
    );
    if (!res.ok) return "";
    const data = await res.json();
    const items = data.items || [];
    return items[0]?.thumbnail || "";
  } catch {
    return "";
  }
}

// 스팟 목록에 썸네일 일괄 추가
async function enrichWithThumbnails(
  spots: SpotResult[],
  maxCount: number = 15
): Promise<void> {
  const targets = spots.slice(0, maxCount);
  const BATCH_SIZE = 5;

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((spot) =>
        searchNaverImage(`${spot.name} ${spot.category === "cafe" ? "카페" : "음식점"}`)
      )
    );
    batch.forEach((spot, idx) => {
      spot.thumUrl = results[idx];
    });
    if (i + BATCH_SIZE < targets.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
}

// Overpass API — boundary 기반, 확장된 태그
async function searchOverpassByBoundary(
  minLat: number,
  minLng: number,
  maxLat: number,
  maxLng: number,
  category: string
): Promise<OverpassElement[]> {
  const bbox = `${minLat},${minLng},${maxLat},${maxLng}`;
  const amenities: string[] = [];

  if (category === "all" || category === "cafe") {
    amenities.push(`node["amenity"="cafe"](${bbox})`);
    amenities.push(`node["shop"="coffee"](${bbox})`);
    amenities.push(`node["cuisine"~"coffee|tea|dessert|ice_cream"](${bbox})`);
    amenities.push(`node["amenity"="ice_cream"](${bbox})`);
  }
  if (category === "all" || category === "restaurant") {
    amenities.push(`node["amenity"="restaurant"](${bbox})`);
    amenities.push(`node["amenity"="fast_food"](${bbox})`);
  }

  const query = `[out:json][timeout:10];(${amenities.join(";")};);out body;`;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return (data.elements || []).filter(
      (e: OverpassElement) => e.tags?.name
    );
  } catch {
    return [];
  }
}

// ============================================================
// API 라우트 핸들러
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const query = searchParams.get("query") || "카페";
    const boundaryStr = searchParams.get("boundary") || "";

    if (lat === 0 || lng === 0) {
      return NextResponse.json(
        { success: false, error: "위치 정보(lat, lng)가 필요합니다." },
        { status: 400 }
      );
    }

    const boundary = parseBoundary(boundaryStr) || {
      minLng: lng - 0.008,
      minLat: lat - 0.005,
      maxLng: lng + 0.008,
      maxLat: lat + 0.005,
    };

    const category = query.includes("카페") || query.includes("커피")
      ? "cafe"
      : query.includes("음식점")
        ? "restaurant"
        : "all";

    // 1) 지역명 + OSM 병렬 실행
    const [area, osmResults] = await Promise.all([
      getAreaNames(lat, lng),
      searchOverpassByBoundary(
        boundary.minLat, boundary.minLng,
        boundary.maxLat, boundary.maxLng,
        category
      ),
    ]);

    // 2) 네이버 검색 — 다양한 키워드 조합으로 최대한 많은 결과
    // 동 이름에서 "동" 제거한 약식 이름 (신기동 → 신기)
    const dongShort = area.neighborhood?.replace(/[동읍면리]$/, "") || "";
    // 시 이름에서 "시" 제거 (양산시 → 양산)
    const cityShort = area.city?.replace(/[시군구]$/, "") || "";

    const naverQueries: string[] = [query];

    // 지역명 조합 — "양산신기 카페", "양산 신기동 카페", "신기동 카페"
    if (cityShort && dongShort) {
      naverQueries.push(`${cityShort}${dongShort} ${query}`);
      naverQueries.push(`${area.city} ${area.neighborhood} ${query}`);
    }
    if (area.neighborhood) {
      naverQueries.push(`${area.neighborhood} ${query}`);
    }
    if (area.city) {
      naverQueries.push(`${area.city} ${query}`);
    }
    if (area.district && area.district !== area.neighborhood) {
      naverQueries.push(`${area.district} ${query}`);
    }

    // 카페 카테고리면 추가 키워드
    if (category === "cafe") {
      const subKeywords = ["커피", "디저트", "아이스크림", "베이커리"];
      for (const sub of subKeywords) {
        if (cityShort && dongShort) {
          naverQueries.push(`${cityShort}${dongShort} ${sub}`);
        }
        if (area.city && area.neighborhood) {
          naverQueries.push(`${area.city} ${area.neighborhood} ${sub}`);
        }
      }
      if (area.city) {
        naverQueries.push(`${area.city} 커피`);
      }
    }
    if (category === "restaurant") {
      const subKeywords = ["맛집", "식당", "한식", "중식"];
      for (const sub of subKeywords) {
        if (cityShort && dongShort) {
          naverQueries.push(`${cityShort}${dongShort} ${sub}`);
        }
        if (area.city && area.neighborhood) {
          naverQueries.push(`${area.city} ${area.neighborhood} ${sub}`);
        }
      }
    }

    // 중복 쿼리 제거
    const uniqueQueries = [...new Set(naverQueries)];

    // 네이버 API 호출 — 순차 1개씩, 딜레이 포함 (rate limit 방지)
    const allNaverItems: NaverSearchItem[] = [];
    for (const q of uniqueQueries) {
      const items = await searchNaver(q, 5);
      allNaverItems.push(...items);
      // rate limit 방지 — 50ms 간격
      await new Promise((r) => setTimeout(r, 50));
    }

    // 3) 네이버 결과 → SpotResult 변환 + boundary 필터
    const naverSpots: SpotResult[] = allNaverItems
      .map((item, idx) => {
        const coord = parseNaverCoord(item.mapx, item.mapy);
        const distance = Math.round(calcDistance(lat, lng, coord.lat, coord.lng));
        return {
          id: `naver-${idx}`,
          name: stripHtml(item.title),
          category: detectCategory(item.category),
          description: item.category,
          address: item.roadAddress || item.address,
          telephone: item.telephone,
          lat: coord.lat,
          lng: coord.lng,
          distance,
          walkingTime: Math.max(1, Math.round(distance / 67)),
          naverLink: item.link,
          naverCategory: item.category,
          thumUrl: "",
          businessStatus: "",
          menuInfo: "",
          reviewCount: 0,
        };
      })
      .filter((s) => isInBoundary(s.lat, s.lng, boundary));

    // 4) OSM 결과 → SpotResult 변환
    const osmSpots: SpotResult[] = osmResults.map((el) => {
      const distance = Math.round(calcDistance(lat, lng, el.lat, el.lon));
      const amenity = el.tags.amenity || el.tags.shop || "";
      const cat: "cafe" | "restaurant" =
        amenity === "cafe" || amenity === "coffee" || amenity === "ice_cream"
          ? "cafe"
          : "restaurant";

      const name = el.tags["name:ko"] || el.tags.name;
      const cuisine = el.tags.cuisine || "";
      const phone = el.tags.phone || el.tags["contact:phone"] || "";
      const addr = [
        el.tags["addr:city"],
        el.tags["addr:district"],
        el.tags["addr:street"],
        el.tags["addr:housenumber"],
      ]
        .filter(Boolean)
        .join(" ");

      return {
        id: `osm-${el.id}`,
        name,
        category: cat,
        description: cuisine
          ? `${cat === "cafe" ? "카페" : "음식점"}·${cuisine}`
          : cat === "cafe"
            ? "카페"
            : "음식점",
        address: addr || "",
        telephone: phone,
        lat: el.lat,
        lng: el.lon,
        distance,
        walkingTime: Math.max(1, Math.round(distance / 67)),
        naverLink: "",
        naverCategory: cat === "cafe" ? "카페" : "음식점",
        thumUrl: "",
        businessStatus: "",
        menuInfo: "",
        reviewCount: 0,
      };
    });

    // 5) 병합 + 중복 제거 (네이버 우선)
    const merged: SpotResult[] = [];
    const seenKeys: string[] = [];

    const normalize = (s: string) => s.replace(/\s+/g, "").replace(/[^가-힣a-zA-Z0-9]/g, "").toLowerCase();

    // 최소 4글자 이상이어야 포함 관계로 중복 판단 (짧은 이름 오탐 방지)
    const MIN_DUP_LEN = 4;
    const isDup = (key: string) =>
      seenKeys.some((existing) => {
        if (existing === key) return true;
        if (existing.length < MIN_DUP_LEN && key.length < MIN_DUP_LEN) return existing === key;
        if (existing.length < MIN_DUP_LEN || key.length < MIN_DUP_LEN) return false;
        return existing.includes(key) || key.includes(existing);
      });

    // 같은 좌표(소수점 4자리까지 일치)도 중복으로 취급
    const coordKey = (lat2: number, lng2: number) =>
      `${lat2.toFixed(4)}_${lng2.toFixed(4)}`;
    const seenCoords = new Set<string>();

    for (const spot of naverSpots) {
      const key = normalize(spot.name);
      const ck = coordKey(spot.lat, spot.lng);
      if (key.length === 0) continue;
      if (isDup(key) || seenCoords.has(ck)) continue;
      seenKeys.push(key);
      seenCoords.add(ck);
      merged.push(spot);
    }

    for (const spot of osmSpots) {
      const key = normalize(spot.name);
      const ck = coordKey(spot.lat, spot.lng);
      if (key.length === 0) continue;
      if (isDup(key) || seenCoords.has(ck)) continue;
      seenKeys.push(key);
      seenCoords.add(ck);
      merged.push(spot);
    }

    // 카테고리 필터 (query에 해당하는 카테고리만)
    const filtered = category === "all"
      ? merged
      : merged.filter((s) => s.category === category);

    // 거리순 정렬
    filtered.sort((a, b) => a.distance - b.distance);

    // ID 재정렬
    filtered.forEach((s, i) => { s.id = `spot-${i}`; });

    // 썸네일 이미지 추가
    await enrichWithThumbnails(filtered, 15);

    return NextResponse.json({
      success: true,
      data: filtered,
      meta: {
        areaName: area.full || null,
        query,
        boundary: boundaryStr,
        totalCount: filtered.length,
        naverQueries: uniqueQueries.length,
        osmCount: osmResults.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("근처 스팟 검색 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
