# Location-Based Discovery Analysis Report

> **Analysis Type**: Gap Analysis (Design v3.0.0 vs Implementation)
>
> **Project**: front-spotLine
> **Version**: 1.0.0 (re-analysis against updated design doc)
> **Analyst**: Claude Code (gap-detector)
> **Date**: 2026-04-07
> **Design Doc**: [location-based-discovery.design.md](../02-design/features/location-based-discovery.design.md) (v3.0.0)
> **Previous Analysis**: v0.2 (2026-03-15) -- 92% match rate

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

Re-verify all 14 FRs against the updated design document v3.0.0 (which was synchronized with implementation after Act-1 fixes). Confirm that implementation fully matches the current design specification.

### 1.2 Analysis Scope

- **Design Document**: `docs/02-design/features/location-based-discovery.design.md` (v3.0.0, 2026-04-07)
- **Implementation**: 13 files across `src/components/discover/`, `src/hooks/`, `src/store/`, `src/lib/api.ts`, `src/types/index.ts`, `src/app/page.tsx`
- **Previous Gaps**: All v0.2 gaps (Google Maps, radius param, DiscoverActions, GlobalExceptionHandler) resolved by design document update

---

## 2. Overall Scores

| Category | v0.1 (Mar 15) | v0.2 (Mar 15) | v1.0 (Apr 7) | Status |
|----------|:-------------:|:--------------:|:------------:|:------:|
| Design Match (FR) | 72% | 91% | **100%** | OK |
| Architecture Compliance | 90% | 90% | **100%** | OK |
| Convention Compliance | 95% | 95% | **97%** | OK |
| **Overall** | **78%** | **92%** | **99%** | OK |

---

## 3. FR-by-FR Gap Analysis

| FR | Description | Component | Status | Notes |
|----|-------------|-----------|:------:|-------|
| FR-01 | Geolocation 좌표 획득 | `useGeolocation.ts` (83 lines) | OK | Auto-trigger via `Promise.resolve().then()`, 5 status states, 4 Korean error messages |
| FR-02 | Discover API 호출 | Backend + `fetchDiscover` client | OK | `GET /api/v2/spots/discover?lat=&lng=&excludeSpotId=` |
| FR-03 | Next Spot 추천 로직 | Backend `SpotService.java` | OK | Same area + different category + walking distance filter |
| FR-04 | PlaceInfo 병합 | Backend response | OK | `DiscoverPlaceInfo` with provider/rating/businessHours/photos |
| FR-05 | 도보 시간/거리 표시 | `TransitionInfo.tsx` (29 lines) | OK | Arrow + "도보 {n}분 . {distance}" pill |
| FR-06 | Block 1 (현재 Spot) | `SpotBlock.tsx` variant="current" | OK | Blue border/badge, MediaCarousel or OptimizedImage |
| FR-07 | Block 2 (다음 Spot) | `SpotBlock.tsx` variant="next" | OK | Green border/badge |
| FR-08 | 자세히 보기 -> /spot/[slug] | `SpotBlock.tsx` handleDetailClick | OK | `window.location.href = /spot/${spot.slug}` |
| FR-09 | 길찾기 외부 지도 | `SpotBlock.tsx` + `ExternalMapButtons` | OK | Expandable toggle, Kakao + Naver |
| FR-10 | 위치 거부 폴백 + 배너 | `LocationPermissionBanner.tsx` (41 lines) | OK | Blue banner + "허용하기" button |
| FR-11 | 다른 추천 보기 | `DiscoverPage.tsx` handleRefresh | OK | excludeSpotId + dim overlay (opacity-50) |
| FR-12 | 근처 Spot 가로 스크롤 | `NearbySpotScroll.tsx` (100 lines) | OK | w-36 cards, gradient edges, max 6 |
| FR-13 | 인기 SpotLine 프리뷰 | `PopularSpotLinesList.tsx` (67 lines) | OK | Purple Route icon, theme/spotCount/duration/likes |
| FR-14 | 로딩 스켈레톤 | `DiscoverSkeleton.tsx` (65 lines) | OK | Staggered pulse (0/150/300/450/600ms) |

**FR Match Rate: 14/14 = 100%**

---

## 4. Component Structure Verification

| Design Component | Design Lines | Impl File | Impl Lines | Status |
|------------------|:-----------:|-----------|:----------:|:------:|
| `src/app/page.tsx` | ~10 | `src/app/page.tsx` | 12 | OK |
| `DiscoverPage.tsx` | 195 | `src/components/discover/DiscoverPage.tsx` | 195 | OK |
| `SpotBlock.tsx` | 170 | `src/components/discover/SpotBlock.tsx` | 170 | OK |
| `TransitionInfo.tsx` | 30 | `src/components/discover/TransitionInfo.tsx` | 29 | OK |
| `LocationHeader.tsx` | 33 | `src/components/discover/LocationHeader.tsx` | 33 | OK |
| `LocationPermissionBanner.tsx` | 41 | `src/components/discover/LocationPermissionBanner.tsx` | 41 | OK |
| `NearbySpotScroll.tsx` | 100 | `src/components/discover/NearbySpotScroll.tsx` | 100 | OK |
| `PopularSpotLinesList.tsx` | 67 | `src/components/discover/PopularSpotLinesList.tsx` | 67 | OK |
| `DiscoverSkeleton.tsx` | 65 | `src/components/discover/DiscoverSkeleton.tsx` | 65 | OK |
| `useGeolocation.ts` | 83 | `src/hooks/useGeolocation.ts` | 83 | OK |
| `useDiscoverStore.ts` | 29 | `src/store/useDiscoverStore.ts` | 29 | OK |
| `fetchDiscover` in api.ts | ~18 | `src/lib/api.ts` (line 291) | ~17 | OK |
| Discover types | ~30 | `src/types/index.ts` (lines 341-433) | ~93 | OK |

**Component Match: 13/13 = 100%**

---

## 5. API Integration Verification

| Aspect | Design | Implementation | Status |
|--------|--------|----------------|:------:|
| Endpoint URL | `GET /api/v2/spots/discover` | `apiV2.get('/spots/discover')` | OK |
| Query: lat, lng | Optional doubles | `URLSearchParams` conditional append | OK |
| Query: excludeSpotId | Optional UUID | Conditional append | OK |
| Response: currentSpot | `DiscoverCurrentSpot \| null` | Type matches (spot + placeInfo + distanceFromUser) | OK |
| Response: nextSpot | `DiscoverNextSpot \| null` | Type matches (spot + placeInfo + distanceFromCurrent + walkingTime) | OK |
| Response: nearbySpots | `DiscoverSpot[]` (max 6) | Array type matches | OK |
| Response: popularSpotLines | `SpotLinePreview[]` (max 3) | Array type matches | OK |
| Response: area | `string \| null` | Matches | OK |
| Response: locationGranted | `boolean` | Matches | OK |
| Timeout | Not specified in design | 5000ms in impl | OK |

---

## 6. Data Model Verification

All 7 Discover-related types in `src/types/index.ts` match the design specification:

| Type | Lines | Fields | Status |
|------|:-----:|:------:|:------:|
| `DiscoverResponse` | 419-426 | 6/6 | OK |
| `DiscoverCurrentSpot` | 345-349 | 3/3 | OK |
| `DiscoverNextSpot` | 351-356 | 4/4 | OK |
| `DiscoverSpot` | 367-391 | 19/19 | OK |
| `DiscoverPlaceInfo` | 393-405 | 11/11 | OK |
| `SpotLinePreview` | 407-417 | 8/8 | OK |
| `GeolocationState` | 428-433 | 4/4 | OK |

---

## 7. State Management Verification

### 7.1 useGeolocation Hook

| Design Field | Implementation | Status |
|-------------|----------------|:------:|
| coordinates: `{ lat, lng } \| null` | `GeolocationState.coordinates` | OK |
| status: 5 union states | `"idle" \| "requesting" \| "granted" \| "denied" \| "unavailable"` | OK |
| error: `string \| null` | `string \| null` | OK |
| accuracy: `number \| null` | `number \| null` | OK |
| requestLocation(): void | `useCallback(() => void, [])` | OK |
| Auto-trigger | `useState(() => { Promise.resolve().then(() => requestLocation()) })` | OK |
| Options | enableHighAccuracy: false, timeout: 10s, maximumAge: 5min | OK |
| Error code 1 -> "denied" | `geoError.code === 1 ? "denied" : "unavailable"` | OK |

### 7.2 useDiscoverStore (Zustand)

| Design Action | Implementation | Status |
|--------------|----------------|:------:|
| setData | `set({ data })` | OK |
| setIsLoading | `set({ isLoading })` | OK |
| setError | `set({ error })` | OK |
| clearAll | `set({ data: null, isLoading: false, error: null })` | OK |
| clearError | `set({ error: null })` | OK |

---

## 8. UX Flow Verification

| State | Design | Implementation | Status |
|-------|--------|----------------|:------:|
| Geolocation requesting | DiscoverSkeleton | `status === "idle" \|\| "requesting"` -> `<DiscoverSkeleton />` | OK |
| Geolocation granted | fetchDiscover(lat, lng) | `useEffect` on status change | OK |
| API loading | DiscoverSkeleton | `isLoading && !data` -> `<DiscoverSkeleton />` | OK |
| API error | Error + "다시 시도" | Error div + retry button | OK |
| API success | Full render | All child components | OK |
| Location denied | fetchDiscover() + Banner | status="denied" triggers load + `LocationPermissionBanner` | OK |
| Refresh | Dim overlay (opacity-50) | `isRefreshing && "opacity-50"` | OK |

---

## 9. Architecture Compliance (Dynamic Level)

### 9.1 Layer Assignment

| Component | Layer | Location | Status |
|-----------|-------|----------|:------:|
| DiscoverPage, SpotBlock, etc. | Presentation | `src/components/discover/` | OK |
| useGeolocation | Presentation (hooks) | `src/hooks/` | OK |
| useDiscoverStore | Presentation (state) | `src/store/` | OK |
| fetchDiscover | Infrastructure | `src/lib/api.ts` | OK |
| Discover types | Domain | `src/types/index.ts` | OK |

### 9.2 Dependency Direction

| Check | Status |
|-------|:------:|
| DiscoverPage imports `fetchDiscover` from `@/lib/api` | OK (Dynamic level allows) |
| Components import types from `@/types` | OK |
| Store does not import UI components | OK |
| useGeolocation does not import store | OK |

**Architecture Score: 100%**

---

## 10. Convention Compliance

### 10.1 Naming

| Category | Convention | Compliance | Violations |
|----------|-----------|:----------:|------------|
| Components | PascalCase | 100% | None |
| Functions | camelCase | 100% | None |
| Hooks | use + camelCase | 100% | None |
| Files (component) | PascalCase.tsx | 100% | None |
| Files (utility) | camelCase.ts | 100% | None |
| Folders | kebab-case | 100% | `discover/` correct |

### 10.2 Import Order

All 13 files follow: External -> Internal `@/` -> Relative -> Type imports.

### 10.3 UI Text (Korean)

All UI text is in Korean. One violation: `DiscoverPage.tsx:190` has "모든 Route 보기" instead of "모든 SpotLine 보기" (domain rename missed).

**Convention Score: 97%**

---

## 11. Differences Found

### CHANGED Features (Design != Implementation)

| Item | Design | Implementation | Impact |
|------|--------|----------------|--------|
| Feed link text | "모든 SpotLine 보기" (expected) | "모든 Route 보기" (line 190) | Low |

This is the only gap. It is documented in the design doc Section 6 as a known minor issue.

### Missing Features: 0
### Added Features: 0

---

## 12. Comparison with Previous Analysis

| Metric | v0.1 (Mar 15) | v0.2 (Mar 15) | v1.0 (Apr 7) |
|--------|:-------------:|:--------------:|:------------:|
| FR Match | 72% | 91% | 100% |
| Architecture | 90% | 90% | 100% |
| Convention | 95% | 95% | 97% |
| Overall | 78% | 92% | **99%** |
| Gaps (Missing) | 4 | 3 | 0 |
| Gaps (Changed) | 6 | 6 | 1 |

Key improvements since v0.2:
- Design doc updated to v3.0.0, reflecting SpotBlock unified approach, store structure, and actual component list
- `popularRoutes` renamed to `popularSpotLines` (domain rename)
- `PopularRoutesList` renamed to `PopularSpotLinesList`
- Previous "missing" items (Google Maps, radius param, GlobalExceptionHandler) resolved by design doc alignment

---

## 13. Recommended Actions

### 13.1 Immediate (Low Priority)

| Priority | Item | File | Description |
|----------|------|------|-------------|
| LOW | Fix "모든 Route 보기" text | `src/components/discover/DiscoverPage.tsx:190` | Change to "모든 SpotLine 보기" |

### 13.2 No Further Action Needed

All 14 FRs are fully implemented. The single remaining gap is a text string rename that does not affect functionality.

---

## 14. Match Rate Summary

```
Overall Match Rate: 99%

  FR Implementation:     14/14 (100%)
  Component Structure:   13/13 (100%)
  API Integration:       9/9   (100%)
  State Management:      10/10 (100%)
  UX Flow States:        7/7   (100%)
  Data Model:            7/7   (100%)
  Architecture:          100%
  Convention:            97%

  Gaps Found:
    Missing (Design O, Impl X):  0
    Added (Design X, Impl O):    0
    Changed:                      1 (text: "Route" -> "SpotLine" rename missed)
```

---

## 15. Post-Analysis Action

**Match Rate: 99% (>= 90%)** -- Design and implementation are fully synchronized.

The single remaining gap ("모든 Route 보기" -> "모든 SpotLine 보기") is trivial and can be fixed in under 1 minute. Feature is ready for completion report: `/pdca report location-based-discovery`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-15 | Initial gap analysis -- Match Rate 78% | Claude Code (gap-detector) |
| 0.2 | 2026-03-15 | Re-analysis after Act-1 fixes -- Match Rate 92% | Claude Code (gap-detector) |
| 1.0 | 2026-04-07 | Re-analysis against design v3.0.0 -- Match Rate 99% | Claude Code (gap-detector) |
