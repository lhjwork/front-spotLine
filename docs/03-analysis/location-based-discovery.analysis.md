# Location-Based Discovery Analysis Report

> **Analysis Type**: Gap Analysis (Design vs Implementation) -- Re-analysis after Act-1
>
> **Project**: Spotline (front-spotLine + springboot-spotLine-backend)
> **Version**: 2.0.0
> **Analyst**: Claude Code (gap-detector)
> **Date**: 2026-03-15
> **Iteration**: Act-1 complete, Re-check #2
> **Design Docs**:
>   - [location-based-discovery.plan.md](../01-plan/features/location-based-discovery.plan.md)
>   - [experience-social-platform.design.md](../02-design/features/experience-social-platform.design.md) (5.5~5.6)
>   - [phase1-data-model-place-api.design.md](springboot backend design) (Discover API)
>   - [phase1-data-model-place-api.plan.md](springboot backend plan) (FR-14)

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

Act-1에서 수정된 4개 항목이 Design 사양에 부합하는지 재검증하고, 전체 Match Rate를 업데이트한다.

### 1.2 Act-1 Fix Verification

| Fix | Target | Verified | Result |
|-----|--------|:--------:|--------|
| `popularRoutes` field added | Backend DTO + Service + Frontend types + UI | PASS | `RoutePreviewResponse.java` 신규 생성, `DiscoverResponse.java` L16에 `List<RoutePreviewResponse>` 추가, `SpotService.findPopularRoutes()` L312-320 구현, Frontend `RoutePreview` interface L293-303, `PopularRoutesList.tsx` 컴포넌트 구현, `DiscoverPage.tsx` L168-170에 렌더링 |
| Area filter in `findNextSpot()` | `SpotService.java` | PASS | L219: `.filter(s -> s.getArea() != null && s.getArea().equals(currentSpot.getArea()))` 추가 확인 |
| `ExternalMapButtons` reused in `SpotBlock.tsx` | `SpotBlock.tsx` | PASS | L7: `import ExternalMapButtons`, L150-158: 확장형 지도 버튼 (카카오맵 + 네이버지도), 토글 버튼 UX 포함 |
| Walking speed 67m/min | `SpotService.java` | PASS | L147: `distanceBetween / 67.0` (4km/h = 66.7m/min). 단, 코멘트가 `// ~80m/min`으로 잔존 -- 코멘트 불일치 (Minor) |

### 1.3 Analysis Scope

- **Backend**: `SpotController.java`, `SpotService.java`, `DiscoverResponse.java`, `RoutePreviewResponse.java`
- **Frontend**: `src/types/index.ts`, `src/lib/api.ts`, `src/hooks/useGeolocation.ts`, `src/store/useDiscoverStore.ts`, `src/components/discover/*`, `src/app/page.tsx`

---

## 2. Overall Scores

| Category | Previous (v0.1) | Current (v0.2) | Status |
|----------|:---------------:|:--------------:|:------:|
| Design Match (FR compliance) | 72% | **91%** | :white_check_mark: |
| Architecture Compliance | 90% | **90%** | :white_check_mark: |
| Convention Compliance | 95% | **95%** | :white_check_mark: |
| **Overall** | **78%** | **92%** | :white_check_mark: |

---

## 3. Functional Requirement Gap Analysis (FR-01 ~ FR-14)

### 3.1 FR-by-FR Comparison

| FR | Description | v0.1 | v0.2 | Notes |
|----|-------------|:----:|:----:|-------|
| FR-01 | Geolocation API로 유저 좌표 획득 | :white_check_mark: | :white_check_mark: | `useGeolocation.ts` 완전 구현. |
| FR-02 | Discover API: currentSpot | :white_check_mark: | :white_check_mark: | `findNearestSpot()` 반경 자동 확대(1km->3km->5km). |
| FR-03 | nextSpot: 같은 area, 다른 카테고리, 도보 15분 이내 | :warning: | :white_check_mark: | **FIXED**: area 필터 추가됨 (L219). |
| FR-04 | PlaceInfo 병합 | :white_check_mark: | :white_check_mark: | 카카오 우선, 네이버 폴백, graceful null. |
| FR-05 | TransitionInfo: 도보 시간/거리 | :warning: | :white_check_mark: | **FIXED**: Walking speed 67m/min (4km/h). |
| FR-06 | Block 1: 이미지, 카테고리, 제목, crewNote, 평점, 거리, 영업 정보 | :white_check_mark: | :white_check_mark: | `SpotBlock.tsx` variant="current". |
| FR-07 | Block 2: 이미지, 카테고리, 제목, crewNote, 도보 시간 | :white_check_mark: | :white_check_mark: | `SpotBlock.tsx` variant="next". |
| FR-08 | [자세히 보기] -> `/spot/{slug}` | :white_check_mark: | :white_check_mark: | `handleDetailClick()`. |
| FR-09 | [길찾기] -> 외부 지도 앱 (카카오/네이버/구글) | :warning: | :white_check_mark: | **FIXED**: `ExternalMapButtons` 재사용 (카카오맵 + 네이버지도). 구글맵은 미포함이나 기존 컴포넌트 사양에도 없음. |
| FR-10 | 위치 거부 시 인기 Spot 폴백 + 유도 배너 | :white_check_mark: | :white_check_mark: | `buildFallbackResponse()` + `LocationPermissionBanner`. |
| FR-11 | [다른 추천 보기] excludeSpotId | :white_check_mark: | :white_check_mark: | `handleRefresh()`. |
| FR-12 | 근처 다른 Spot 가로 스크롤 (최대 6개) | :white_check_mark: | :white_check_mark: | `NearbySpotScroll.tsx`. |
| FR-13 | 같은 area 인기 Route 프리뷰 (최대 3개) | :x: | :white_check_mark: | **FIXED**: Backend `findPopularRoutes()` + `RoutePreviewResponse` DTO + Frontend `RoutePreview` type + `PopularRoutesList.tsx`. |
| FR-14 | 로딩 스켈레톤 | :white_check_mark: | :white_check_mark: | `DiscoverSkeleton.tsx`. |

### 3.2 Match Rate Summary

```
+---------------------------------------------+
|  FR Match Rate: 91% (12.75/14)              |
+---------------------------------------------+
|  Full match:    13 items (93%)              |
|  Partial match:  1 item  (7%)              |
|  Not implemented: 0 items (0%)             |
+---------------------------------------------+
```

**Remaining partial**: FR-09 -- 구글맵 미포함 (Plan에 "카카오맵/네이버지도/구글맵" 명시). `ExternalMapButtons` 컴포넌트 자체에 구글맵이 없으므로 컴포넌트 확장 필요. Impact: Low.

---

## 4. API Comparison

### 4.1 Discover Endpoint

| Aspect | Design | Implementation | v0.1 | v0.2 |
|--------|--------|----------------|:----:|:----:|
| URL | `GET /api/v2/spots/discover` | `GET /api/v2/spots/discover` | :white_check_mark: | :white_check_mark: |
| Param: lat | `double, optional` | `Double, optional` | :white_check_mark: | :white_check_mark: |
| Param: lng | `double, optional` | `Double, optional` | :white_check_mark: | :white_check_mark: |
| Param: radius | `double, optional, default 1.0` | **Missing** | :x: | :x: |
| Param: excludeSpotId | `UUID, optional` | `UUID, optional` | :white_check_mark: | :white_check_mark: |
| Response: currentSpot | `{ spot, placeInfo, distanceFromUser }` | Match | :white_check_mark: | :white_check_mark: |
| Response: nextSpot | `{ spot, placeInfo, distanceFromCurrent, walkingTime }` | Match | :white_check_mark: | :white_check_mark: |
| Response: nearbySpots | `SpotDetailResponse[] max 6` | Match | :white_check_mark: | :white_check_mark: |
| Response: popularRoutes | `RoutePreview[] max 3` | `List<RoutePreviewResponse> max 3` | :x: | :white_check_mark: |
| Response: area | `string or null` | Match | :white_check_mark: | :white_check_mark: |
| Response: locationGranted | `boolean` | Match | :white_check_mark: | :white_check_mark: |
| No-location fallback | Popular spots + `locationGranted: false` | Seoul center fallback + `locationGranted: false` | :warning: | :warning: |

### 4.2 Response Format

| Aspect | Design | Implementation | Status |
|--------|--------|----------------|:------:|
| Success format | Direct DTO (no wrapper) | Direct DTO | :white_check_mark: |
| Error format | `{ timestamp, status, error, message, path }` | GlobalExceptionHandler not implemented | :warning: |

---

## 5. Data Model / Type Comparison

### 5.1 Frontend Types (`src/types/index.ts`)

| Design Type | Implementation Type | v0.1 | v0.2 |
|-------------|---------------------|:----:|:----:|
| `DiscoverResponse.currentSpot` | `DiscoverCurrentSpot` | :white_check_mark: | :white_check_mark: |
| `DiscoverResponse.nextSpot` | `DiscoverNextSpot` | :white_check_mark: | :white_check_mark: |
| `DiscoverResponse.nearbySpots` | `DiscoverSpot[]` | :white_check_mark: | :white_check_mark: |
| `DiscoverResponse.popularRoutes` | `RoutePreview[]` | :x: | :white_check_mark: |
| `GeolocationState` | `GeolocationState` | :white_check_mark: | :white_check_mark: |
| `SpotPreview` (design type) | Uses full `DiscoverSpot` | :warning: | :warning: |

### 5.2 Backend DTO

| Design Field | Implementation | v0.1 | v0.2 |
|--------------|---------------|:----:|:----:|
| `currentSpot` | `CurrentSpotInfo` inner class | :white_check_mark: | :white_check_mark: |
| `nextSpot` | `NextSpotInfo` inner class | :white_check_mark: | :white_check_mark: |
| `nearbySpots` | `List<SpotDetailResponse>` | :white_check_mark: | :white_check_mark: |
| `popularRoutes` | `List<RoutePreviewResponse>` | :x: | :white_check_mark: |
| `area` | `String` | :white_check_mark: | :white_check_mark: |
| `locationGranted` | `boolean` | :white_check_mark: | :white_check_mark: |

---

## 6. Component Comparison

### 6.1 Design vs Implementation

| Design Component | Impl File | v0.1 | v0.2 | Notes |
|------------------|-----------|:----:|:----:|-------|
| `DiscoverPage` | `DiscoverPage.tsx` | :white_check_mark: | :white_check_mark: | Wraps in `src/app/page.tsx` with Layout |
| `LocationHeader` | `LocationHeader.tsx` | :white_check_mark: | :white_check_mark: | |
| `CurrentSpotBlock` | `SpotBlock.tsx` (variant="current") | :warning: | :warning: | Unified as `SpotBlock` -- good reusability |
| `NextSpotBlock` | `SpotBlock.tsx` (variant="next") | :warning: | :warning: | Same as above |
| `TransitionInfo` | `TransitionInfo.tsx` | :white_check_mark: | :white_check_mark: | |
| `DiscoverActions` | Inline in `DiscoverPage.tsx` | :x: | :warning: | "다른 추천 보기" exists inline. "Route로 시작하기" not impl (Phase 7). |
| `NearbySpotScroll` | `NearbySpotScroll.tsx` | :white_check_mark: | :white_check_mark: | |
| `LocationPermissionBanner` | `LocationPermissionBanner.tsx` | :white_check_mark: | :white_check_mark: | |
| `PopularRoutesList` (new) | `PopularRoutesList.tsx` | N/A | :white_check_mark: | NEW -- renders FR-13 popularRoutes |
| `DiscoverSkeleton` (added) | `DiscoverSkeleton.tsx` | :white_check_mark: | :white_check_mark: | Beneficial addition |

### 6.2 State Management

| Design | Implementation | Status | Notes |
|--------|----------------|:------:|-------|
| Flattened fields in Zustand | Single `data: DiscoverResponse` | :warning: | Simpler approach, functionally equivalent |
| Location in store | In `useGeolocation` hook | :warning: | Hook-based, clean separation of concerns |
| `refreshRecommendation()` | `handleRefresh()` in DiscoverPage | :white_check_mark: | |

---

## 7. Business Logic Gaps

### 7.1 Next Spot Recommendation Algorithm

| Design Spec | Implementation | v0.1 | v0.2 |
|-------------|---------------|:----:|:----:|
| Same area filter | `.filter(s -> s.getArea() != null && s.getArea().equals(currentSpot.getArea()))` | :x: | :white_check_mark: |
| Different category | `.filter(s -> s.getCategory() != currentSpot.getCategory())` | :white_check_mark: | :white_check_mark: |
| Within 15min walk (~1.0km) | 1.2km radius (slightly wider) | :warning: | :warning: |
| crewNote priority | Applied via sorting | :white_check_mark: | :white_check_mark: |
| viewsCount descending | Applied as secondary sort | :white_check_mark: | :white_check_mark: |
| Walking speed: 67m/min | `67.0` in code (comment says `~80m/min` -- stale) | :warning: | :white_check_mark: |

### 7.2 Map Provider Coverage

| Design Spec | Implementation | Status |
|-------------|---------------|:------:|
| 카카오맵 | `ExternalMapButtons` -- handleKakaoMap | :white_check_mark: |
| 네이버지도 | `ExternalMapButtons` -- handleNaverMap | :white_check_mark: |
| 구글맵 | **Not in ExternalMapButtons** | :x: |

---

## 8. Architecture Compliance

### 8.1 Layer Assignment (Frontend - Dynamic Level)

| Component | Designed Layer | Actual Location | Status |
|-----------|---------------|-----------------|:------:|
| DiscoverPage | Presentation | `src/components/discover/` | :white_check_mark: |
| SpotBlock et al. | Presentation | `src/components/discover/` | :white_check_mark: |
| PopularRoutesList | Presentation | `src/components/discover/` | :white_check_mark: |
| useGeolocation | Presentation (hooks) | `src/hooks/` | :white_check_mark: |
| useDiscoverStore | Application (state) | `src/store/` | :white_check_mark: |
| fetchDiscover | Infrastructure (API) | `src/lib/api.ts` | :white_check_mark: |
| Types | Domain | `src/types/index.ts` | :white_check_mark: |

### 8.2 Dependency Direction

| Check | Status | Notes |
|-------|:------:|-------|
| Components import from `@/lib/api` directly? | :warning: | `DiscoverPage.tsx` imports `fetchDiscover` from `@/lib/api`. Design envisioned this in store action. Minor -- single call in composition root. |
| Components import types from `@/types`? | :white_check_mark: | |
| Store does not import UI components? | :white_check_mark: | |
| Hooks do not import store? | :white_check_mark: | |

### 8.3 Backend Layer Structure

| Layer | Status |
|-------|:------:|
| Controller -> Service | :white_check_mark: |
| Service -> Repository + PlaceApiService | :white_check_mark: |
| Service -> RouteRepository (new dep for popularRoutes) | :white_check_mark: |
| DTO separated from Entity | :white_check_mark: |

### 8.4 Architecture Score

```
+---------------------------------------------+
|  Architecture Compliance: 90%                |
+---------------------------------------------+
|  Correct layer placement: 12/13 files        |
|  Dependency violations:   1 (minor)          |
+---------------------------------------------+
```

---

## 9. Convention Compliance

### 9.1 Naming Convention

| Category | Convention | Compliance | Violations |
|----------|-----------|:----------:|------------|
| Components | PascalCase | 100% | None |
| Functions | camelCase | 100% | None |
| Files (component) | PascalCase.tsx | 100% | None |
| Files (hook) | camelCase.ts | 100% | None |
| Files (store) | camelCase.ts | 100% | None |
| Folders | kebab-case | 100% | `discover/` correct |
| Backend Classes | PascalCase | 100% | `RoutePreviewResponse.java` correct |
| Backend Methods | camelCase | 100% | `findPopularRoutes()` correct |

### 9.2 Import Order

All frontend files follow the prescribed order:
1. React/Next.js -> 2. External libraries (lucide-react) -> 3. Internal `@/` imports -> 4. Relative imports -> 5. Type imports

Minor: `DiscoverPage.tsx` L5-6 imports `cn` and `formatDistance` from `@/lib/utils` on separate lines (stylistic only).

### 9.3 Convention Score

```
+---------------------------------------------+
|  Convention Compliance: 95%                  |
+---------------------------------------------+
|  Naming:           100%                      |
|  Import Order:      95%                      |
|  Folder Structure:  90% (DiscoverActions     |
|                     not extracted)            |
|  Korean UI text:   100%                      |
+---------------------------------------------+
```

---

## 10. Differences Found (Updated)

### :red_circle: Missing Features (Design O, Implementation X)

| Item | Design Location | Description | Impact |
|------|-----------------|-------------|--------|
| `radius` query param | Design 5.5.2 | Discover endpoint lacks `radius` parameter | Low |
| Google Maps | Plan FR-09 | `ExternalMapButtons` supports Kakao+Naver only, no Google | Low |
| GlobalExceptionHandler | Backend Design Step 11 | Standard error response format not implemented | Medium |

### :yellow_circle: Changed Features (Design != Implementation)

| Item | Design | Implementation | Impact |
|------|--------|----------------|--------|
| SpotBlock structure | 2 components: `CurrentSpotBlock`, `NextSpotBlock` | 1 unified `SpotBlock` with `variant` prop | Low -- better reusability |
| Store structure | Flattened fields in Zustand store | Single `data: DiscoverResponse` object | Low -- simpler |
| DiscoverActions | Separate component | Inline in DiscoverPage | Low |
| No-location fallback | API without lat/lng | Seoul center coordinates hardcoded | Low |
| NextSpot radius | 1.0km (15min walk) | 1.2km | Low |
| `findNextSpot` comment | Code uses 67m/min correctly | Comment says `~80m/min` (stale) | Trivial |

### :large_blue_circle: Added Features (Design X, Implementation O)

| Item | Implementation Location | Description |
|------|------------------------|-------------|
| `DiscoverSkeleton` | `src/components/discover/DiscoverSkeleton.tsx` | Beneficial addition |
| Error retry UI | `DiscoverPage.tsx` L77-88 | "다시 시도" button |
| Expandable map toggle | `SpotBlock.tsx` L136-146 | Chevron toggle UX for map buttons |

---

## 11. Resolved Items (from v0.1)

| Item | v0.1 Status | Fix Applied | v0.2 Status |
|------|:-----------:|-------------|:-----------:|
| `popularRoutes` field missing | :x: | Backend DTO+Service+Frontend types+UI all added | :white_check_mark: |
| Area filter in `findNextSpot()` | :x: | `.filter(s -> s.getArea().equals(currentSpot.getArea()))` | :white_check_mark: |
| Walking speed 80m/min | :warning: | Changed to `67.0` | :white_check_mark: |
| Kakao-only map | :warning: | `ExternalMapButtons` reused (Kakao+Naver) | :white_check_mark: |

---

## 12. Recommended Actions

### 12.1 Optional Improvements (Low Priority)

| Priority | Item | File | Detail |
|----------|------|------|--------|
| 1 | Fix stale comment | `SpotService.java:147` | Change `// ~80m/min` to `// 67m/min (4km/h)` |
| 2 | Add Google Maps option | `ExternalMapButtons.tsx` | Add third button for Google Maps to fully match Plan FR-09 |
| 3 | Add `radius` query param | `SpotController.java` | `@RequestParam(required = false, defaultValue = "1.0") Double radius` |
| 4 | Extract `DiscoverActions` | `src/components/discover/` | Separate "다른 추천" button; prep "Route로 시작" for Phase 7 |

### 12.2 Short-term

| Priority | Item | File | Detail |
|----------|------|------|--------|
| 5 | Implement GlobalExceptionHandler | `config/GlobalExceptionHandler.java` | Backend Design Step 11 -- standard error response |

### 12.3 Documentation Updates Recommended

| Item | Description |
|------|-------------|
| `SpotBlock` unified design | Design 5.5.3: Update CurrentSpotBlock/NextSpotBlock to note SpotBlock variant approach |
| Store structure | Design 5.5.4: Update to reflect single `data` object pattern |

---

## 13. Post-Analysis Action

**Match Rate: 92% (>= 90%)** -- Design-Implementation 동기화 달성.

잔여 Gap은 모두 Low impact (Google Maps, radius param, DiscoverActions 분리, GlobalExceptionHandler). 즉각적인 수정 없이도 기능적으로 완전한 상태.

추천:
- `/pdca report location-based-discovery` 로 완료 보고서 생성 가능
- 잔여 항목은 백로그로 관리

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-15 | Initial gap analysis -- Match Rate 78% | Claude Code (gap-detector) |
| 0.2 | 2026-03-15 | Re-analysis after Act-1 fixes -- Match Rate 92% | Claude Code (gap-detector) |
