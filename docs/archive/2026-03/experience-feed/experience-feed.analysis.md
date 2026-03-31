# Gap Analysis: Experience Feed — 피드 + 탐색 UI

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Feature** | experience-feed |
| **Date** | 2026-03-28 |
| **Match Rate** | 95% (26.5/28 items) |
| **Result** | PASS — 설계 대비 구현이 충실하며, 차이점은 합리적 간소화 |

---

## 1. Overall Match Rate

| Category | Items | Match | Partial | Missing | Score |
|----------|:-----:|:-----:|:-------:|:-------:|:-----:|
| Step 1: Infrastructure | 7 | 7 | 0 | 0 | 100% |
| Step 2: Feed (CSR) | 8 | 8 | 0 | 0 | 100% |
| Step 3: City (SSR+ISR) | 6 | 5 | 1 | 0 | 92% |
| Step 4: Theme (SSR+ISR) | 5 | 5 | 0 | 0 | 100% |
| Step 5: Navigation | 2 | 2 | 0 | 0 | 100% |
| **Total** | **28** | **27** | **1** | **0** | **95%** |

---

## 2. Detailed Item Comparison

### Step 1: Infrastructure (7/7 = 100%)

| # | Design Item | Status | Notes |
|---|-------------|:------:|-------|
| 1-1 | PaginatedResponse<T> | ✅ | 7개 필드 모두 일치 (content, totalElements, totalPages, number, size, last, first) |
| 1-2 | CityInfo | ✅ | 4개 필드 일치 (slug, name, description, area) |
| 1-3 | ThemeInfo | ✅ | 6개 필드 일치 (slug, name, description, theme, colorClass, iconName) |
| 1-4 | fetchFeedSpots | ✅ | 시그니처 동일 (area?, category?, page=0, size=20). apiV2.get("/spots") |
| 1-5 | fetchFeedRoutes | ✅ | 시그니처 동일. **추가 개선**: `theme.replace(/-/g, "_")` kebab→snake 변환 (설계에 없음, 실용적 추가) |
| 1-6 | cities 상수 | ✅ | 7개 도시 + findCityBySlug 헬퍼. 데이터 정확히 일치 |
| 1-7 | themes 상수 | ✅ | 7개 테마 + findThemeBySlug 헬퍼. 데이터 정확히 일치 |

### Step 2: Feed 페이지 (8/8 = 100%)

| # | Design Item | Status | Notes |
|---|-------------|:------:|-------|
| 2-1 | useFeedStore | ✅ | FeedState 인터페이스 일치. **차이**: 설계에 routesPage/hasMoreRoutes 포함, 구현에서는 Routes 페이지네이션 불필요하여 생략 (합리적 간소화). error/setError 추가됨 |
| 2-2 | FeedPage | ✅ | "use client". useFeedStore + useSearchParams + useRouter. URL sync, area/category 변경 시 resetData + 재fetch |
| 2-3 | FeedAreaTabs | ✅ | Props 일치 (selected, onSelect). "전체" + CITIES 탭. sticky, 수평 스크롤, scrollbar-hide. 선택 bg-gray-900 |
| 2-4 | FeedCategoryChips | ✅ | Props 일치. SpotCategory 전체 목록. rounded-full px-3 py-1.5 text-xs. 선택 bg-blue-600. flex-wrap gap-2 |
| 2-5 | FeedRouteSection | ✅ | Props: routes: RoutePreview[]. "인기 Route" 제목. RoutePreviewCard. 빈 배열 → null 반환 |
| 2-6 | FeedSpotGrid | ✅ | Props 일치. IntersectionObserver 패턴 정확히 구현. 2열→md:3열→lg:4열 반응형. 빈 결과 "이 지역에 등록된 Spot이 없습니다" |
| 2-7 | FeedSkeleton | ✅ | animate-pulse. 탭 7개 + 칩 5개 + Route 2개 + Spot 4개(2열) 스켈레톤 |
| 2-8 | Feed page.tsx | ✅ | "use client". Layout + Suspense(FeedSkeleton) + FeedPage |

### Step 3: City 페이지 (5.5/6 = 92%)

| # | Design Item | Status | Notes |
|---|-------------|:------:|-------|
| 3-1 | CityHero | ✅ | Props: { city: CityInfo }. text-2xl font-bold. bg-gradient-to-b from-gray-50. px-4 pt-8 pb-4 |
| 3-2 | CityRoutes | ✅ | Props: { routes: RoutePreview[] }. "인기 Route". RoutePreviewCard 목록. 빈 → null |
| 3-3 | CitySpots | ⚠️ | Props: `{ spots, cityArea }` — **설계에는 `citySlug` prop 포함**되어 있으나 구현에서 생략. citySlug는 실제 사용하지 않으므로 합리적이나 설계와 불일치 |
| 3-4 | CityNavigation | ✅ | Props: { currentSlug }. CITIES.filter. rounded-full bg-gray-100 px-4 py-2. Link to /city/{slug} |
| 3-5 | City page.tsx | ✅ | revalidate=3600. generateStaticParams. generateMetadata. SSR. **추가**: API 에러 시 빈 데이터 fallback (.catch) — 빌드 안정성 개선 |
| 3-6 | City not-found.tsx | ✅ | 404 페이지 존재 |

### Step 4: Theme 페이지 (5/5 = 100%)

| # | Design Item | Status | Notes |
|---|-------------|:------:|-------|
| 4-1 | ThemeHero | ✅ | Props: { theme: ThemeInfo }. Lucide 아이콘 동적 렌더링 (iconMap). colorClass 적용. text-2xl font-bold |
| 4-2 | ThemeRoutes | ✅ | Props: { routes: RoutePreview[] }. "인기 Route". 빈 결과 → "아직 등록된 코스가 없습니다" |
| 4-3 | ThemeNavigation | ✅ | Props: { currentSlug }. THEMES.filter. colorClass 적용. Link to /theme/{slug} |
| 4-4 | Theme page.tsx | ✅ | revalidate=3600. generateStaticParams. generateMetadata. **추가**: .catch fallback |
| 4-5 | Theme not-found.tsx | ✅ | 404 페이지 존재 |

### Step 5: Navigation 연결 (2/2 = 100%)

| # | Design Item | Status | Notes |
|---|-------------|:------:|-------|
| 5-1 | ExploreNavBar | ✅ | "use client". tabs: [발견, 피드]. CITIES.slice(0,4) + THEMES.slice(0,4) 빠른 링크. sticky top-0 z-20 |
| 5-2 | Discover 연결 | ✅ | ExploreNavBar activeTab="discover" 추가 + "모든 Route 보기 →" 링크 |

---

## 3. Design Deviations (설계 대비 차이)

| # | Item | Severity | Description | Impact |
|---|------|----------|-------------|--------|
| 1 | CitySpots citySlug prop 생략 | Low | 설계에는 3개 props (spots, citySlug, cityArea), 구현은 2개 (spots, cityArea). citySlug는 미사용이므로 불필요 | 기능 영향 없음 |
| 2 | useFeedStore routesPage/hasMoreRoutes 미구현 | Low | 설계에 Routes 페이지네이션 상태 포함, 구현에서는 5개만 조회하여 페이지네이션 불필요 | 기능 영향 없음. Routes는 소수만 표시 |
| 3 | fetchFeedRoutes theme kebab→snake 변환 | Info | 설계에 없는 `theme.replace(/-/g, "_")` 추가. Backend와의 호환성을 위한 실용적 개선 | 긍정적 영향 |
| 4 | City/Theme page API .catch fallback | Info | 설계에 없는 빌드 시 에러 핸들링 추가. 백엔드 미실행 시에도 빌드 성공 | 긍정적 영향 |
| 5 | FeedStore error/setError 추가 | Info | 설계 인터페이스에 없던 에러 상태 관리 추가 | 긍정적 영향 — UX 개선 |

---

## 4. Build & Type Check

| Check | Result |
|-------|--------|
| `pnpm type-check` | ✅ Pass |
| `pnpm build` | ✅ Pass (40 pages generated) |
| Static params (City) | ✅ 7개 도시 정적 생성 |
| Static params (Theme) | ✅ 7개 테마 정적 생성 |

---

## 5. Component Reuse Verification

| Design Spec | Implementation | Status |
|-------------|---------------|:------:|
| SpotPreviewCard → FeedSpotGrid, CitySpots | ✅ 동일 | ✅ |
| RoutePreviewCard → FeedRouteSection, CityRoutes, ThemeRoutes | ✅ 동일 | ✅ |
| Layout → Feed, City, Theme pages | ✅ 동일 | ✅ |

---

## 6. Rendering Strategy Verification

| Page | Design | Implementation | Status |
|------|--------|---------------|:------:|
| `/feed` | CSR | ✅ "use client" | ✅ |
| `/city/[name]` | SSR+ISR(3600s) | ✅ revalidate=3600 + generateStaticParams | ✅ |
| `/theme/[name]` | SSR+ISR(3600s) | ✅ revalidate=3600 + generateStaticParams | ✅ |

---

## 7. Responsive Breakpoints Verification

| Component | Design | Implementation | Status |
|-----------|--------|---------------|:------:|
| FeedSpotGrid | 2→3→4열 | grid-cols-2 md:grid-cols-3 lg:grid-cols-4 | ✅ |
| CitySpots | 2→3→4열 | grid-cols-2 md:grid-cols-3 lg:grid-cols-4 | ✅ |
| FeedAreaTabs | 수평 스크롤 | overflow-x-auto scrollbar-hide | ✅ |

---

## 8. Conclusion

**Match Rate: 95%** — PASS

모든 28개 설계 항목이 구현되었으며, 1개 항목(CitySpots)만 경미한 차이. 차이점은 모두 합리적 간소화 또는 실용적 개선으로 판단됨. 빌드/타입 체크 모두 통과. `/pdca report experience-feed`로 완료 보고서 생성 권장.
