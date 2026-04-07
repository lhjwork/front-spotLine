# Location-Based Discovery Design Document

> **Feature**: Location-Based Discovery (2-Block Landing)
> **Plan Reference**: `docs/01-plan/features/location-based-discovery.plan.md`
> **Version**: 3.0.0
> **Date**: 2026-04-07
> **Status**: Verified (All Components Implemented)

---

## 1. Architecture Overview

### 1.1 Component Tree

```
src/app/page.tsx (CSR, "use client")
└── Layout (showFooter)
    └── DiscoverPage
        ├── ExploreNavBar (activeTab="discover")
        ├── LocationPermissionBanner (conditional: denied)
        ├── LocationHeader (area, locationGranted)
        ├── SpotBlock (variant="current")
        ├── TransitionInfo (distance, walkingTime)
        ├── SpotBlock (variant="next")
        ├── RefreshButton ("다른 추천 보기")
        ├── NearbySpotScroll (horizontal scroll)
        ├── PopularSpotLinesList (vertical list)
        └── Link → /feed
```

### 1.2 Data Flow

```
[Browser Geolocation API]
    ↓ useGeolocation() hook
    ↓ coordinates + status
[DiscoverPage]
    ↓ fetchDiscover(lat, lng, excludeSpotId?)
    ↓ useDiscoverStore (Zustand)
[API Response: DiscoverResponse]
    ↓ distribute to child components
[SpotBlock, TransitionInfo, NearbySpotScroll, PopularSpotLinesList]
```

### 1.3 State Management

```
useGeolocation (hook state)
├── coordinates: { lat, lng } | null
├── status: "idle" | "requesting" | "granted" | "denied" | "unavailable"
├── error: string | null
├── accuracy: number | null
└── requestLocation(): void

useDiscoverStore (Zustand)
├── data: DiscoverResponse | null
├── isLoading: boolean
├── error: string | null
├── setData() / setIsLoading() / setError()
├── clearAll() / clearError()
```

---

## 2. Component Specifications

### 2.1 DiscoverPage (`src/components/discover/DiscoverPage.tsx`)

| Aspect | Detail |
|--------|--------|
| File | `src/components/discover/DiscoverPage.tsx` (195 lines) |
| Directive | `"use client"` |
| Status | ✅ Implemented |
| Hooks | useGeolocation, useDiscoverStore, useState, useCallback, useEffect |
| Flow | Status check → loadDiscover → render blocks |
| Refresh | excludeSpotId = current spot ID → new pair |
| States | idle/requesting → skeleton, loading → skeleton, error → retry, data → render |

### 2.2 useGeolocation (`src/hooks/useGeolocation.ts`)

| Aspect | Detail |
|--------|--------|
| File | `src/hooks/useGeolocation.ts` (83 lines) |
| Status | ✅ Implemented |
| Init | Auto-triggers on first client render via Promise.resolve().then() |
| Options | enableHighAccuracy: false, timeout: 10s, maximumAge: 5min |
| Error mapping | code 1 → "denied", code 2/3 → "unavailable" |
| Korean messages | 4 error messages for each scenario |

### 2.3 useDiscoverStore (`src/store/useDiscoverStore.ts`)

| Aspect | Detail |
|--------|--------|
| File | `src/store/useDiscoverStore.ts` (29 lines) |
| Status | ✅ Implemented |
| Pattern | Zustand create with simple getter/setter |
| Actions | setData, setIsLoading, setError, clearAll, clearError |

### 2.4 SpotBlock (`src/components/discover/SpotBlock.tsx`)

| Aspect | Detail |
|--------|--------|
| File | `src/components/discover/SpotBlock.tsx` (170 lines) |
| Status | ✅ Implemented |
| Props | spot, placeInfo, variant ("current"/"next"), distanceLabel |
| Features | MediaCarousel OR OptimizedImage, category label, rating, crewNote, business hours |
| Actions | "자세히 보기" → /spot/[slug], expandable ExternalMapButtons (카카오/네이버/구글) |
| Styling | current = blue border/badge, next = green border/badge |
| Animation | fadeInUp 0.4s ease-out |

### 2.5 TransitionInfo (`src/components/discover/TransitionInfo.tsx`)

| Aspect | Detail |
|--------|--------|
| File | `src/components/discover/TransitionInfo.tsx` (30 lines) |
| Status | ✅ Implemented |
| Props | distanceMeters, walkingTimeMinutes |
| Display | Arrow ↓ + "도보 {n}분 · {distance}" pill |

### 2.6 LocationHeader (`src/components/discover/LocationHeader.tsx`)

| Aspect | Detail |
|--------|--------|
| File | `src/components/discover/LocationHeader.tsx` (33 lines) |
| Status | ✅ Implemented |
| Props | area, locationGranted |
| Display | Navigation icon + "{area} 근처" / "현재 위치 근처" / "인기 Spot" |

### 2.7 LocationPermissionBanner (`src/components/discover/LocationPermissionBanner.tsx`)

| Aspect | Detail |
|--------|--------|
| File | `src/components/discover/LocationPermissionBanner.tsx` (41 lines) |
| Status | ✅ Implemented |
| Props | onRequestLocation |
| Display | Blue banner with icon + message + "허용하기" button |
| Condition | Shows when data.locationGranted=false && status="denied" |

### 2.8 NearbySpotScroll (`src/components/discover/NearbySpotScroll.tsx`)

| Aspect | Detail |
|--------|--------|
| File | `src/components/discover/NearbySpotScroll.tsx` (100 lines) |
| Status | ✅ Implemented |
| Props | spots (DiscoverSpot[]) |
| Display | "근처 다른 Spot" header + horizontal scroll cards (w-36) |
| Features | Scroll gradient edges (left/right), category label, image/placeholder |
| Navigation | Click → /spot/[slug] |

### 2.9 PopularSpotLinesList (`src/components/discover/PopularSpotLinesList.tsx`)

| Aspect | Detail |
|--------|--------|
| File | `src/components/discover/PopularSpotLinesList.tsx` (67 lines) |
| Status | ✅ Implemented |
| Props | spotLines (SpotLinePreview[]) |
| Display | "이 지역 인기 SpotLine" header + vertical list |
| Item | Purple Route icon + title + theme/spotCount/duration + likes |
| Navigation | Click → /spotline/[slug] |

### 2.10 DiscoverSkeleton (`src/components/discover/DiscoverSkeleton.tsx`)

| Aspect | Detail |
|--------|--------|
| File | `src/components/discover/DiscoverSkeleton.tsx` (65 lines) |
| Status | ✅ Implemented |
| Display | NavBar skeleton + LocationHeader + CurrentSpot (blue) + Transition + NextSpot (green) |
| Animation | Staggered pulse with animationDelay (0/150/300/450/600ms) |

---

## 3. API Integration

### 3.1 Discover API

```
GET /api/v2/spots/discover?lat={lat}&lng={lng}&radius={radius}&excludeSpotId={id}
```

| Field | Type | Description |
|-------|------|-------------|
| `currentSpot` | `DiscoverCurrentSpot \| null` | Nearest spot with placeInfo, distanceFromUser |
| `nextSpot` | `DiscoverNextSpot \| null` | Recommended next spot with walkingTime |
| `nearbySpots` | `DiscoverSpot[]` | Up to 6 nearby spots |
| `popularSpotLines` | `SpotLinePreview[]` | Up to 3 popular spotlines in area |
| `area` | `string \| null` | Area name (e.g. "강남") |
| `locationGranted` | `boolean` | Whether location was provided |

**Frontend function**: `fetchDiscover()` in `src/lib/api.ts` (line 291)

---

## 4. UX Flow States

```
[Page Load]
    ├── (Geolocation requesting) → DiscoverSkeleton
    ├── (Geolocation granted) → fetchDiscover(lat, lng)
    │   ├── (Loading) → DiscoverSkeleton
    │   ├── (Error) → Error message + "다시 시도"
    │   └── (Success) → Full render
    ├── (Geolocation denied) → fetchDiscover() (no coords)
    │   └── LocationPermissionBanner + Popular spots fallback
    └── (Geolocation unavailable) → fetchDiscover() (no coords)
        └── Popular spots fallback

[다른 추천 보기] → fetchDiscover(lat, lng, currentSpotId)
    └── Dim overlay (opacity-50) during refresh
```

---

## 5. FR Mapping (Plan → Implementation)

| FR | Description | Component | Status |
|----|-------------|-----------|--------|
| FR-01 | Geolocation 좌표 획득 | `useGeolocation.ts` | ✅ |
| FR-02 | Discover API | Backend `SpotController.java` | ✅ |
| FR-03 | Next Spot 추천 로직 | Backend `SpotService.java` | ✅ |
| FR-04 | PlaceInfo 병합 | Backend response | ✅ |
| FR-05 | 도보 시간/거리 표시 | `TransitionInfo.tsx` | ✅ |
| FR-06 | Block 1 (현재 Spot) | `SpotBlock.tsx` variant="current" | ✅ |
| FR-07 | Block 2 (다음 Spot) | `SpotBlock.tsx` variant="next" | ✅ |
| FR-08 | 자세히 보기 → /spot/[slug] | `SpotBlock.tsx` handleDetailClick | ✅ |
| FR-09 | 길찾기 외부 지도 | `SpotBlock.tsx` + `ExternalMapButtons` | ✅ |
| FR-10 | 위치 거부 폴백 + 배너 | `LocationPermissionBanner.tsx` + API fallback | ✅ |
| FR-11 | 다른 추천 보기 | `DiscoverPage.tsx` handleRefresh | ✅ |
| FR-12 | 근처 Spot 가로 스크롤 | `NearbySpotScroll.tsx` | ✅ |
| FR-13 | 인기 SpotLine 프리뷰 | `PopularSpotLinesList.tsx` | ✅ |
| FR-14 | 로딩 스켈레톤 | `DiscoverSkeleton.tsx` | ✅ |

**Match Rate: 14/14 = 100%**

---

## 6. Known Minor Issues

| Issue | Location | Severity |
|-------|----------|----------|
| "모든 Route 보기" text should be "모든 SpotLine 보기" | `DiscoverPage.tsx:190` | Low (text rename missed) |

---

## 7. File Inventory

| File | Lines | Role |
|------|-------|------|
| `src/app/page.tsx` | ~10 | Page entry, imports DiscoverPage |
| `src/components/discover/DiscoverPage.tsx` | 195 | Main orchestrator |
| `src/components/discover/SpotBlock.tsx` | 170 | Current/Next spot card |
| `src/components/discover/NearbySpotScroll.tsx` | 100 | Horizontal nearby spots |
| `src/components/discover/PopularSpotLinesList.tsx` | 67 | Vertical spotline list |
| `src/components/discover/DiscoverSkeleton.tsx` | 65 | Loading skeleton |
| `src/components/discover/LocationPermissionBanner.tsx` | 41 | Permission prompt |
| `src/components/discover/LocationHeader.tsx` | 33 | Area/location display |
| `src/components/discover/TransitionInfo.tsx` | 30 | Walking distance pill |
| `src/hooks/useGeolocation.ts` | 83 | Browser geolocation hook |
| `src/store/useDiscoverStore.ts` | 29 | Zustand discover state |
| `src/lib/api.ts` (fetchDiscover) | ~18 | API client function |
| `src/types/index.ts` (Discover types) | ~30 | Type definitions |

**Total**: ~871 lines across 13 files

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 3.0 | 2026-04-07 | Verified design — all 14 FRs implemented, 100% match | Claude Code |
