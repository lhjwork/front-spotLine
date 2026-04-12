# Spot Detail Enhancement Design Document

> **Summary**: Spot 상세 페이지에 실시간 영업 상태, 요일별 영업시간, 메뉴/가격, 편의시설, 카카오맵 미리보기를 추가
>
> **Project**: front-spotLine + springboot-spotLine-backend
> **Author**: AI Assistant
> **Date**: 2026-04-11
> **Status**: Draft
> **Planning Doc**: [spot-detail-enhancement.plan.md](../../01-plan/features/spot-detail-enhancement.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 카카오 Place API의 미활용 데이터(요일별 영업시간, 메뉴, 편의시설)를 PlaceInfo에 추가
- 프론트엔드에서 실시간 영업 상태 배지, 메뉴 섹션, 지도 미리보기 구현
- 기존 placeInfo null 시 graceful degradation 100% 유지
- SEO 구조화 데이터(JSON-LD) 강화

### 1.2 Design Principles

- **Backward Compatible**: 기존 PlaceInfo 필드 변경 없음, 신규 필드만 추가 (null safe)
- **Progressive Enhancement**: 데이터 있으면 표시, 없으면 숨김
- **Mobile First**: 모든 신규 UI 모바일 최적화

---

## 2. Backend Changes (springboot-spotLine-backend)

### Item 1: PlaceInfo DTO 확장

**File**: `src/main/java/com/spotline/api/infrastructure/place/PlaceInfo.java`

현재:
```java
@Data @Builder
public class PlaceInfo {
    private String provider, placeId, name, address, phone, category;
    private String businessHours;
    private Double rating;
    private Integer reviewCount;
    private List<String> photos;
    private String url;
}
```

추가 필드:
```java
    // NEW: 요일별 영업시간
    private List<DailyHour> dailyHours;

    // NEW: 메뉴 목록
    private List<MenuItem> menuItems;

    // NEW: 편의시설
    private List<String> facilities;

    @Data @Builder
    public static class DailyHour {
        private String day;      // "월", "화", ... "일"
        private String timeSE;   // "10:00~22:00"
    }

    @Data @Builder
    public static class MenuItem {
        private String name;     // "아메리카노"
        private String price;    // "5,000"
        private String photo;    // nullable
    }
```

### Item 2: PlaceApiService 카카오 파싱 확장

**File**: `src/main/java/com/spotline/api/infrastructure/place/PlaceApiService.java`

`fetchKakaoDetail()` 메서드에서 추가 파싱:

**요일별 영업시간** — `basicInfo.openHour.periodList[0].timeList[]`:
```java
// 기존: timeSE 하나만 추출
// 변경: timeList 전체를 DailyHour 리스트로 변환
List<PlaceInfo.DailyHour> dailyHours = new ArrayList<>();
if (openHour.containsKey("periodList")) {
    List<Map<String, Object>> periods = (List<Map<String, Object>>) openHour.get("periodList");
    if (!periods.isEmpty() && periods.get(0).containsKey("timeList")) {
        List<Map<String, Object>> times = (List<Map<String, Object>>) periods.get(0).get("timeList");
        for (Map<String, Object> time : times) {
            dailyHours.add(PlaceInfo.DailyHour.builder()
                .day(String.valueOf(time.getOrDefault("timeName", "")))
                .timeSE(String.valueOf(time.getOrDefault("timeSE", "")))
                .build());
        }
    }
}
```

**메뉴** — `menuInfo.menuList[]`:
```java
List<PlaceInfo.MenuItem> menuItems = Collections.emptyList();
if (result.containsKey("menuInfo") && result.get("menuInfo") instanceof Map) {
    Map<String, Object> menuInfo = (Map<String, Object>) result.get("menuInfo");
    if (menuInfo.containsKey("menuList")) {
        List<Map<String, Object>> menuList = (List<Map<String, Object>>) menuInfo.get("menuList");
        menuItems = menuList.stream()
            .limit(10)
            .map(m -> PlaceInfo.MenuItem.builder()
                .name(String.valueOf(m.getOrDefault("menu", "")))
                .price(String.valueOf(m.getOrDefault("price", "")))
                .photo(m.containsKey("img") ? String.valueOf(m.get("img")) : null)
                .build())
            .toList();
    }
}
```

**편의시설** — `basicInfo.facilityInfo`:
```java
List<String> facilities = Collections.emptyList();
if (basicInfo.containsKey("facilityInfo")) {
    Map<String, Object> facilityInfo = (Map<String, Object>) basicInfo.get("facilityInfo");
    facilities = facilityInfo.entrySet().stream()
        .filter(e -> "Y".equals(String.valueOf(e.getValue())))
        .map(e -> e.getKey())  // "parking", "wifi", "pet" 등
        .toList();
}
```

빌더에 추가:
```java
.dailyHours(dailyHours.isEmpty() ? null : dailyHours)
.menuItems(menuItems.isEmpty() ? null : menuItems)
.facilities(facilities.isEmpty() ? null : facilities)
```

---

## 3. Frontend Changes (front-spotLine)

### Item 3: 타입 확장

**File**: `src/types/index.ts`

```typescript
export interface DiscoverPlaceInfo {
  // ... 기존 필드 유지 ...
  provider: string;
  placeId: string;
  name: string;
  address: string;
  phone: string | null;
  category: string | null;
  businessHours: string | null;
  rating: number | null;
  reviewCount: number | null;
  photos: string[] | null;
  url: string | null;
  // NEW
  dailyHours: PlaceDailyHour[] | null;
  menuItems: PlaceMenuItem[] | null;
  facilities: string[] | null;
}

// NEW
export interface PlaceDailyHour {
  day: string;    // "월", "화", ... "일"
  timeSE: string; // "10:00~22:00"
}

// NEW
export interface PlaceMenuItem {
  name: string;
  price: string;
  photo: string | null;
}
```

### Item 4: 영업 상태 배지 — SpotBusinessStatus.tsx (NEW)

**File**: `src/components/spot/SpotBusinessStatus.tsx`

```typescript
"use client";
import { cn } from "@/lib/utils";
import type { PlaceDailyHour } from "@/types";

interface SpotBusinessStatusProps {
  dailyHours: PlaceDailyHour[];
  businessHours: string | null;
}

// 요일 매핑: JS getDay() → 한국어
const DAY_MAP = ["일", "월", "화", "수", "목", "금", "토"];

function getBusinessStatus(dailyHours: PlaceDailyHour[], businessHours: string | null) {
  const now = new Date();
  const todayName = DAY_MAP[now.getDay()];
  const todayHour = dailyHours.find(h => h.day.includes(todayName));

  if (!todayHour?.timeSE) {
    // dailyHours에 오늘이 없으면 businessHours fallback
    if (!businessHours) return { status: "unknown" as const };
    // businessHours 단일 문자열 파싱 시도
    return parseTimeRange(businessHours, now);
  }

  return parseTimeRange(todayHour.timeSE, now);
}

function parseTimeRange(timeSE: string, now: Date) {
  const match = timeSE.match(/(\d{1,2}):(\d{2})~(\d{1,2}):(\d{2})/);
  if (!match) return { status: "unknown" as const };

  const [, oh, om, ch, cm] = match.map(Number);
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;

  if (currentMin < openMin) return { status: "closed" as const, text: `${oh}:${String(om).padStart(2, "0")}에 오픈` };
  if (currentMin >= closeMin) return { status: "closed" as const, text: "영업 종료" };
  if (closeMin - currentMin <= 60) return { status: "closing" as const, text: `${ch}:${String(cm).padStart(2, "0")}에 마감` };
  return { status: "open" as const, text: `${ch}:${String(cm).padStart(2, "0")}에 마감` };
}
```

렌더링:
- `open` → 초록 배지 "영업 중"
- `closing` → 주황 배지 "곧 마감"
- `closed` → 빨간 배지 "영업 종료"
- `unknown` → 표시 안 함

### Item 5: 요일별 영업시간 UI — SpotPlaceInfo.tsx (MODIFY)

**File**: `src/components/spot/SpotPlaceInfo.tsx`

기존 `businessHours` 단일 라인을 아코디언으로 교체:

```tsx
{/* 영업시간 섹션 */}
{(placeInfo.dailyHours || placeInfo.businessHours) && (
  <div className="flex items-start gap-2.5">
    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
    <div className="flex-1">
      {placeInfo.dailyHours ? (
        <DailyHoursAccordion dailyHours={placeInfo.dailyHours} />
      ) : (
        <span className="text-sm text-gray-600">{placeInfo.businessHours}</span>
      )}
    </div>
  </div>
)}
```

**DailyHoursAccordion** (같은 파일 또는 별도):
- 기본: 접힌 상태, 오늘 요일 시간만 표시 + "전체 보기" 버튼
- 펼치면: 전체 7일 리스트, 오늘 강조 (font-semibold + 파란 점)
- `"use client"` 필요 (useState)

### Item 6: 메뉴 섹션 — SpotMenu.tsx (NEW)

**File**: `src/components/spot/SpotMenu.tsx`

```typescript
interface SpotMenuProps {
  menuItems: PlaceMenuItem[];
  placeUrl: string | null;
}
```

UI:
- 제목: "메뉴" + 아이템 수
- 리스트: 메뉴명 (left) + 가격 (right), 최대 5개 표시
- photo 있으면 왼쪽에 작은 썸네일 (32x32 rounded)
- "더보기" 버튼 → placeUrl 링크 (카카오맵에서 전체 메뉴 확인)
- 스타일: `rounded-2xl border border-gray-100 bg-white p-4` (SpotPlaceInfo와 동일)

### Item 7: 카카오맵 미리보기 — SpotMapPreview.tsx (NEW)

**File**: `src/components/spot/SpotMapPreview.tsx`

```typescript
interface SpotMapPreviewProps {
  latitude: number;
  longitude: number;
  title: string;
  kakaoPlaceId: string | null;
}
```

구현:
- 카카오 Static Map API: `https://dapi.kakao.com/v2/maps/staticmap?center=${lng},${lat}&level=3&size=640x200&markers=...`
- API 키: `NEXT_PUBLIC_KAKAO_MAP_API_KEY` (기존 환경변수 사용)
- 클릭 시: kakaoPlaceId 있으면 `https://place.map.kakao.com/{id}`, 없으면 `https://map.kakao.com/?q=${title}`
- Lazy loading: `loading="lazy"` attribute
- 에러 시 숨김 (onError → display: none)

### Item 8: 편의시설 배지 — SpotFacilities.tsx (NEW)

**File**: `src/components/spot/SpotFacilities.tsx`

```typescript
interface SpotFacilitiesProps {
  facilities: string[];
}
```

시설 → 아이콘 매핑 (Lucide):
```typescript
const FACILITY_MAP: Record<string, { icon: LucideIcon; label: string }> = {
  parking: { icon: Car, label: "주차" },
  wifi: { icon: Wifi, label: "와이파이" },
  pet: { icon: Dog, label: "반려동물" },
  delivery: { icon: Truck, label: "배달" },
  takeout: { icon: Package, label: "포장" },
  reservation: { icon: Calendar, label: "예약" },
  smokingroom: { icon: Cigarette, label: "흡연실" },
  nursery: { icon: Baby, label: "수유실" },
};
```

UI: 수평 스크롤 배지 리스트 (`flex gap-2 overflow-x-auto`)

### Item 9: SEO 구조화 데이터 확장

**File**: `src/lib/seo/jsonld.ts`

`generateSpotJsonLd()` 함수에 추가:

```typescript
// 기존 openingHours 대체 → openingHoursSpecification
if (spot.placeInfo?.dailyHours) {
  const dayMap: Record<string, string> = {
    "월": "Monday", "화": "Tuesday", "수": "Wednesday",
    "목": "Thursday", "금": "Friday", "토": "Saturday", "일": "Sunday",
  };
  jsonLd.openingHoursSpecification = spot.placeInfo.dailyHours
    .filter(h => h.timeSE)
    .map(h => {
      const match = h.timeSE.match(/(\d{1,2}:\d{2})~(\d{1,2}:\d{2})/);
      return match ? {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: dayMap[h.day] || h.day,
        opens: match[1],
        closes: match[2],
      } : null;
    }).filter(Boolean);
}

// 메뉴
if (spot.placeInfo?.menuItems?.length) {
  jsonLd.hasMenu = {
    "@type": "Menu",
    hasMenuSection: {
      "@type": "MenuSection",
      hasMenuItem: spot.placeInfo.menuItems.slice(0, 5).map(m => ({
        "@type": "MenuItem",
        name: m.name,
        ...(m.price && { offers: { "@type": "Offer", price: m.price.replace(/[^0-9]/g, ""), priceCurrency: "KRW" } }),
      })),
    },
  };
}
```

### Item 10: Spot 상세 페이지 통합

**File**: `src/app/spot/[slug]/page.tsx`

신규 import 및 배치:

```tsx
import SpotBusinessStatus from "@/components/spot/SpotBusinessStatus";
import SpotMenu from "@/components/spot/SpotMenu";
import SpotMapPreview from "@/components/spot/SpotMapPreview";
import SpotFacilities from "@/components/spot/SpotFacilities";
```

컴포넌트 배치 순서 (기존 + 신규):
```
SpotHero (기존)
  └─ SpotBusinessStatus (NEW — Hero 내부, 카테고리 배지 옆)
QrBanner / QrAnalytics (기존, QR 모드)
SpotCrewNote (기존)
PartnerBenefit (기존)
SpotPlaceInfo (기존, 영업시간 아코디언으로 개선)
SpotFacilities (NEW — PlaceInfo 아래)
SpotMenu (NEW — 편의시설 아래)
SpotMapPreview (NEW — 메뉴 아래)
SpotImageGallery (기존)
SpotSpotLines (기존)
SpotNearby (기존)
CommentSection (기존)
AreaCta (기존)
```

---

## 4. Implementation Order

### 4.1 Implementation Checklist

| # | Item | Repo | Files | Estimated Changes |
|:-:|------|------|-------|-------------------|
| 1 | PlaceInfo DTO 확장 | backend | `PlaceInfo.java` | +30 lines (inner classes + fields) |
| 2 | PlaceApiService 파싱 확장 | backend | `PlaceApiService.java` | +40 lines (3개 파싱 블록) |
| 3 | Frontend 타입 확장 | front | `types/index.ts` | +15 lines (2 interfaces + 3 fields) |
| 4 | SpotBusinessStatus 컴포넌트 | front | `SpotBusinessStatus.tsx` (NEW) | ~60 lines |
| 5 | SpotPlaceInfo 영업시간 개선 | front | `SpotPlaceInfo.tsx` (MODIFY) | +40 lines (아코디언) |
| 6 | SpotMenu 컴포넌트 | front | `SpotMenu.tsx` (NEW) | ~50 lines |
| 7 | SpotMapPreview 컴포넌트 | front | `SpotMapPreview.tsx` (NEW) | ~30 lines |
| 8 | SpotFacilities 컴포넌트 | front | `SpotFacilities.tsx` (NEW) | ~40 lines |
| 9 | SEO JSON-LD 확장 | front | `lib/seo/jsonld.ts` (MODIFY) | +25 lines |
| 10 | 페이지 통합 | front | `app/spot/[slug]/page.tsx` (MODIFY) | +15 lines (imports + JSX) |

### 4.2 Execution Strategy

1. **Items 1-2**: Backend 먼저 (API 응답에 신규 필드 추가)
2. **Item 3**: Frontend 타입 정의
3. **Items 4-8**: 각 컴포넌트 독립 구현 (병렬 가능)
4. **Item 9**: SEO 확장
5. **Item 10**: 페이지 통합 + 전체 검증

---

## 5. Risk Mitigation

| Risk | Strategy |
|------|----------|
| 카카오 API에 menuInfo 없는 매장 | `menuItems` null → SpotMenu 미표시 |
| 카카오 API에 facilityInfo 없는 매장 | `facilities` null → SpotFacilities 미표시 |
| 요일별 시간 파싱 실패 | `dailyHours` null → 기존 `businessHours` 문자열 표시 (fallback) |
| Static Map API 키 제한/에러 | `onError`로 이미지 숨김, 주소 텍스트만 유지 |
| 영업 상태 시간대 오류 | `new Date()` 기반 — 한국 사용자 대상이므로 KST 가정 OK |

---

## 6. Success Criteria

- [ ] Backend: `PlaceInfo`에 dailyHours, menuItems, facilities 추가
- [ ] Backend: `./gradlew build` 성공
- [ ] Frontend: SpotBusinessStatus 정상 표시 (open/closed/closing)
- [ ] Frontend: DailyHours 아코디언 동작
- [ ] Frontend: SpotMenu 렌더링 (데이터 있을 때만)
- [ ] Frontend: SpotMapPreview 이미지 로드
- [ ] Frontend: SpotFacilities 배지 표시
- [ ] Frontend: `pnpm build` 성공
- [ ] SEO: JSON-LD에 openingHoursSpecification 포함
- [ ] placeInfo null Spot에서 에러 없음

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-11 | Initial draft | AI Assistant |
