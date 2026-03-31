# Design: Experience Feed — 피드 + 탐색 UI

| Item | Detail |
|------|--------|
| Feature | experience-feed |
| Plan Reference | `docs/01-plan/features/experience-feed.plan.md` |
| Created | 2026-03-27 |
| Status | Design |

---

## 1. Implementation Checklist

### Step 1: Infrastructure (타입 + API + 상수)

| # | Item | File | Type | Description |
|---|------|------|------|-------------|
| 1-1 | PaginatedResponse 타입 | `src/types/index.ts` | modify | Spring Boot Page 응답 매핑 제네릭 타입 |
| 1-2 | CityInfo 타입 | `src/types/index.ts` | modify | 도시 정적 데이터 인터페이스 |
| 1-3 | ThemeInfo 타입 | `src/types/index.ts` | modify | 테마 정적 데이터 인터페이스 |
| 1-4 | fetchFeedSpots API | `src/lib/api.ts` | modify | `GET /spots?area&category&page&size` → `PaginatedResponse<SpotDetailResponse>` |
| 1-5 | fetchFeedRoutes API | `src/lib/api.ts` | modify | `GET /routes/popular?area&theme&page&size` → `PaginatedResponse<RoutePreview>` |
| 1-6 | cities 상수 | `src/constants/cities.ts` | new | 서울 주요 7개 지역 CityInfo[] |
| 1-7 | themes 상수 | `src/constants/themes.ts` | new | 7개 RouteTheme ThemeInfo[] |

### Step 2: Feed 페이지 (CSR)

| # | Item | File | Type | Description |
|---|------|------|------|-------------|
| 2-1 | useFeedStore | `src/store/useFeedStore.ts` | new | area/category 필터 + spots/routes 페이지네이션 상태 |
| 2-2 | FeedPage | `src/components/feed/FeedPage.tsx` | new | Feed 메인 컨테이너 (client). 필터 + 목록 조합 |
| 2-3 | FeedAreaTabs | `src/components/feed/FeedAreaTabs.tsx` | new | 지역 탭 수평 스크롤. cities 상수 기반 |
| 2-4 | FeedCategoryChips | `src/components/feed/FeedCategoryChips.tsx` | new | 카테고리 칩 필터. SpotCategory 기반 |
| 2-5 | FeedRouteSection | `src/components/feed/FeedRouteSection.tsx` | new | 인기 Route 목록. RoutePreviewCard 재사용 |
| 2-6 | FeedSpotGrid | `src/components/feed/FeedSpotGrid.tsx` | new | Spot 2열 그리드 + IntersectionObserver 무한스크롤 |
| 2-7 | FeedSkeleton | `src/components/feed/FeedSkeleton.tsx` | new | 로딩 스켈레톤 UI |
| 2-8 | Feed page.tsx | `src/app/feed/page.tsx` | new | Feed 라우트. Layout + FeedPage 렌더링 |

### Step 3: City 페이지 (SSR + ISR)

| # | Item | File | Type | Description |
|---|------|------|------|-------------|
| 3-1 | CityHero | `src/components/city/CityHero.tsx` | new | 도시명 + 설명 Hero 섹션 (server) |
| 3-2 | CityRoutes | `src/components/city/CityRoutes.tsx` | new | 인기 Route 목록 (server). RoutePreviewCard 재사용 |
| 3-3 | CitySpots | `src/components/city/CitySpots.tsx` | new | Spot 2열 그리드 (server). SpotPreviewCard 재사용 |
| 3-4 | CityNavigation | `src/components/city/CityNavigation.tsx` | new | 다른 도시 링크 목록 (server) |
| 3-5 | City page.tsx | `src/app/city/[name]/page.tsx` | new | SSR + ISR(3600s). generateMetadata + generateStaticParams |
| 3-6 | City not-found.tsx | `src/app/city/[name]/not-found.tsx` | new | 404 페이지 |

### Step 4: Theme 페이지 (SSR + ISR)

| # | Item | File | Type | Description |
|---|------|------|------|-------------|
| 4-1 | ThemeHero | `src/components/theme/ThemeHero.tsx` | new | 테마명 + 색상 + 아이콘 Hero (server) |
| 4-2 | ThemeRoutes | `src/components/theme/ThemeRoutes.tsx` | new | 테마별 Route 목록 (server) |
| 4-3 | ThemeNavigation | `src/components/theme/ThemeNavigation.tsx` | new | 다른 테마 링크 (server) |
| 4-4 | Theme page.tsx | `src/app/theme/[name]/page.tsx` | new | SSR + ISR(3600s). generateMetadata + generateStaticParams |
| 4-5 | Theme not-found.tsx | `src/app/theme/[name]/not-found.tsx` | new | 404 페이지 |

### Step 5: Navigation 연결

| # | Item | File | Type | Description |
|---|------|------|------|-------------|
| 5-1 | ExploreNavBar | `src/components/shared/ExploreNavBar.tsx` | new | Discover/Feed/City/Theme 네비게이션 바 |
| 5-2 | Discover 연결 | `src/components/discover/DiscoverPage.tsx` | modify | ExploreNavBar 추가 + 도시/테마 빠른 링크 |

**총 파일: 22개** (new 19 + modify 3)

---

## 2. Detailed Specifications

### 2.1 Types (`src/types/index.ts` 추가)

```typescript
// Spring Boot Page 응답 매핑
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       // current page (0-indexed)
  size: number;
  last: boolean;
  first: boolean;
}

// City 정적 데이터
export interface CityInfo {
  slug: string;         // "seongsu" (URL용)
  name: string;         // "성수" (한글 표시용)
  description: string;  // SEO description
  area: string;         // API 쿼리 파라미터 값 (= name)
}

// Theme 정적 데이터
export interface ThemeInfo {
  slug: string;         // "date" (URL용 = RouteTheme 값)
  name: string;         // "데이트" (한글 표시용)
  description: string;  // SEO description
  theme: RouteTheme;    // API 쿼리 파라미터 값
  colorClass: string;   // "bg-pink-100 text-pink-700"
  iconName: string;     // lucide icon name
}
```

### 2.2 Constants

#### `src/constants/cities.ts`

```typescript
import type { CityInfo } from "@/types";

export const CITIES: CityInfo[] = [
  { slug: "seongsu", name: "성수", area: "성수", description: "성수의 인기 카페, 맛집, 문화 공간을 만나보세요" },
  { slug: "euljiro", name: "을지로", area: "을지로", description: "을지로의 레트로 감성 카페와 맛집을 탐색하세요" },
  { slug: "yeonnam", name: "연남", area: "연남", description: "연남동의 감성 카페와 숨은 맛집을 발견하세요" },
  { slug: "hongdae", name: "홍대", area: "홍대", description: "홍대의 활기찬 문화와 다양한 맛집을 즐겨보세요" },
  { slug: "itaewon", name: "이태원", area: "이태원", description: "이태원의 글로벌 맛집과 독특한 문화를 경험하세요" },
  { slug: "hannam", name: "한남", area: "한남", description: "한남동의 세련된 카페와 갤러리를 둘러보세요" },
  { slug: "jongno", name: "종로", area: "종로", description: "종로의 전통과 현대가 어우러진 경험을 만나보세요" },
];

export const findCityBySlug = (slug: string): CityInfo | undefined =>
  CITIES.find((c) => c.slug === slug);
```

#### `src/constants/themes.ts`

```typescript
import type { ThemeInfo, RouteTheme } from "@/types";

export const THEMES: ThemeInfo[] = [
  { slug: "date", name: "데이트", theme: "date" as RouteTheme, description: "특별한 데이트를 위한 추천 코스", colorClass: "bg-pink-100 text-pink-700", iconName: "Heart" },
  { slug: "travel", name: "여행", theme: "travel" as RouteTheme, description: "서울 여행자를 위한 추천 코스", colorClass: "bg-blue-100 text-blue-700", iconName: "Plane" },
  { slug: "walk", name: "산책", theme: "walk" as RouteTheme, description: "여유로운 산책을 위한 추천 코스", colorClass: "bg-green-100 text-green-700", iconName: "Footprints" },
  { slug: "hangout", name: "놀거리", theme: "hangout" as RouteTheme, description: "친구와 함께 즐기는 놀거리 코스", colorClass: "bg-yellow-100 text-yellow-700", iconName: "Sparkles" },
  { slug: "food-tour", name: "맛집 투어", theme: "food-tour" as RouteTheme, description: "미식가를 위한 맛집 투어 코스", colorClass: "bg-red-100 text-red-700", iconName: "UtensilsCrossed" },
  { slug: "cafe-tour", name: "카페 투어", theme: "cafe-tour" as RouteTheme, description: "분위기 좋은 카페 투어 코스", colorClass: "bg-amber-100 text-amber-700", iconName: "Coffee" },
  { slug: "culture", name: "문화", theme: "culture" as RouteTheme, description: "전시, 공연, 문화 체험 코스", colorClass: "bg-purple-100 text-purple-700", iconName: "Palette" },
];

export const findThemeBySlug = (slug: string): ThemeInfo | undefined =>
  THEMES.find((t) => t.slug === slug);
```

### 2.3 API Functions (`src/lib/api.ts` 추가)

```typescript
// Feed: Paginated Spot 목록
export const fetchFeedSpots = async (
  area?: string,
  category?: string,
  page = 0,
  size = 20
): Promise<PaginatedResponse<SpotDetailResponse>> => {
  try {
    const params: Record<string, string | number> = { page, size };
    if (area) params.area = area;
    if (category) params.category = category;
    const response = await apiV2.get<PaginatedResponse<SpotDetailResponse>>("/spots", { params, timeout: 5000 });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Spot 목록을 불러올 수 없습니다");
  }
};

// Feed: Paginated Route 목록
export const fetchFeedRoutes = async (
  area?: string,
  theme?: string,
  page = 0,
  size = 10
): Promise<PaginatedResponse<RoutePreview>> => {
  try {
    const params: Record<string, string | number> = { page, size };
    if (area) params.area = area;
    if (theme) params.theme = theme;
    const response = await apiV2.get<PaginatedResponse<RoutePreview>>("/routes/popular", { params, timeout: 5000 });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Route 목록을 불러올 수 없습니다");
  }
};
```

Import 추가: `PaginatedResponse`

### 2.4 Feed Store (`src/store/useFeedStore.ts`)

```typescript
import { create } from "zustand";
import type { SpotDetailResponse, RoutePreview, SpotCategory } from "@/types";

interface FeedState {
  // Filters
  area: string | null;
  category: SpotCategory | null;
  setArea: (area: string | null) => void;
  setCategory: (category: SpotCategory | null) => void;

  // Spots data
  spots: SpotDetailResponse[];
  spotsPage: number;
  hasMoreSpots: boolean;
  appendSpots: (spots: SpotDetailResponse[], hasMore: boolean) => void;

  // Routes data
  routes: RoutePreview[];
  routesPage: number;
  hasMoreRoutes: boolean;
  setRoutes: (routes: RoutePreview[], hasMore: boolean) => void;

  // Loading
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Reset on filter change
  resetData: () => void;

  // Increment page
  nextSpotsPage: () => void;
}
```

**Key behaviors**:
- `setArea()` / `setCategory()` 호출 시 `resetData()`도 함께 호출
- `appendSpots()`: 기존 배열에 새 데이터 추가 (무한 스크롤)
- `nextSpotsPage()`: spotsPage + 1

### 2.5 Feed 컴포넌트 상세

#### FeedPage.tsx (client)
```
"use client"
- useFeedStore에서 area, category, spots, routes 구독
- 마운트 시 fetchFeedRoutes + fetchFeedSpots 호출
- area/category 변경 시 resetData + 재fetch
- URL search params 동기화: useSearchParams + useRouter
  /feed?area=성수&category=cafe
```

#### FeedAreaTabs.tsx (client)
```
Props: { selected: string | null, onSelect: (area: string | null) => void }
- "전체" + CITIES.map(c => c.name) 탭 목록
- 수평 스크롤: overflow-x-auto, scrollbar-hide
- 선택 탭: bg-gray-900 text-white
- 미선택 탭: bg-gray-100 text-gray-600
- sticky: top-0 z-10 bg-white
```

#### FeedCategoryChips.tsx (client)
```
Props: { selected: SpotCategory | null, onSelect: (cat: SpotCategory | null) => void }
- "전체" + SpotCategory 목록
- categoryLabels 맵핑 (SpotPreviewCard의 것과 동일)
- 칩 스타일: rounded-full px-3 py-1.5 text-xs
- 선택: bg-blue-600 text-white
- flex flex-wrap gap-2
```

#### FeedRouteSection.tsx (server-compatible)
```
Props: { routes: RoutePreview[] }
- 제목: "인기 Route"
- RoutePreviewCard 목록 (vertical stack)
- routes.length === 0이면 null 반환
```

#### FeedSpotGrid.tsx (client)
```
Props: { spots: SpotDetailResponse[], hasMore: boolean, onLoadMore: () => void, isLoading: boolean }
- 제목: "인기 Spot"
- 2열 그리드: grid grid-cols-2 gap-3
- SpotPreviewCard 사용
- IntersectionObserver: 마지막 카드에 ref 부착 → onLoadMore 호출
- 로딩 시 하단 spinner 표시
```

#### FeedSkeleton.tsx
```
- FeedAreaTabs 스켈레톤 (회색 박스 7개 수평)
- FeedCategoryChips 스켈레톤 (회색 칩 5개)
- RoutePreviewCard 스켈레톤 × 2
- SpotPreviewCard 스켈레톤 × 4 (2열)
- animate-pulse 통일
```

### 2.6 City 컴포넌트 상세

#### City page.tsx (server)
```typescript
// SSR + ISR
export const revalidate = 3600; // 1시간

export async function generateStaticParams() {
  return CITIES.map((city) => ({ name: city.slug }));
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const city = findCityBySlug(params.name);
  if (!city) return {};
  return {
    title: `${city.name} 인기 경험 · 카페, 맛집, 문화 | Spotline`,
    description: city.description,
    openGraph: {
      title: `${city.name} 탐색 | Spotline`,
      description: city.description,
    },
  };
}

export default async function CityPage({ params }) {
  const city = findCityBySlug(params.name);
  if (!city) notFound();

  const [spotsResult, routesResult] = await Promise.all([
    fetchFeedSpots(city.area, undefined, 0, 12),
    fetchFeedRoutes(city.area, undefined, 0, 5),
  ]);

  return (
    <Layout>
      <CityHero city={city} />
      <CityRoutes routes={routesResult.content} />
      <CitySpots spots={spotsResult.content} citySlug={city.slug} cityArea={city.area} />
      <CityNavigation currentSlug={city.slug} />
    </Layout>
  );
}
```

#### CityHero.tsx (server)
```
Props: { city: CityInfo }
- 도시명 큰 글씨 (text-2xl font-bold)
- description (text-gray-500)
- 배경: bg-gradient-to-b from-gray-50
- 패딩: px-4 pt-8 pb-4
```

#### CityRoutes.tsx (server)
```
Props: { routes: RoutePreview[] }
- 섹션 제목: "인기 Route" (text-lg font-bold)
- RoutePreviewCard 목록
- 빈 경우: 표시 안 함
```

#### CitySpots.tsx (server)
```
Props: { spots: SpotDetailResponse[], citySlug: string, cityArea: string }
- 섹션 제목: "인기 Spot"
- 2열 그리드: SpotPreviewCard
- 하단: "더 보기" Link → /feed?area={cityArea}
```

#### CityNavigation.tsx (server)
```
Props: { currentSlug: string }
- 섹션 제목: "다른 도시 탐색"
- CITIES.filter(c => c.slug !== currentSlug)
- 수평 스크롤 칩: Link to /city/{slug}
- 스타일: rounded-full bg-gray-100 px-4 py-2
```

### 2.7 Theme 컴포넌트 상세

#### Theme page.tsx (server)
```typescript
export const revalidate = 3600;

export async function generateStaticParams() {
  return THEMES.map((t) => ({ name: t.slug }));
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const theme = findThemeBySlug(params.name);
  if (!theme) return {};
  return {
    title: `${theme.name} 추천 코스 | Spotline`,
    description: theme.description,
    openGraph: {
      title: `${theme.name} 코스 | Spotline`,
      description: theme.description,
    },
  };
}

export default async function ThemePage({ params }) {
  const theme = findThemeBySlug(params.name);
  if (!theme) notFound();

  const routesResult = await fetchFeedRoutes(undefined, theme.theme, 0, 10);

  return (
    <Layout>
      <ThemeHero theme={theme} />
      <ThemeRoutes routes={routesResult.content} />
      <ThemeNavigation currentSlug={theme.slug} />
    </Layout>
  );
}
```

#### ThemeHero.tsx (server)
```
Props: { theme: ThemeInfo }
- 테마명 큰 글씨 + description
- 배경색: theme.colorClass 기반 그라데이션
- Lucide 아이콘 동적 렌더링: iconName → 컴포넌트 매핑
```

#### ThemeRoutes.tsx (server)
```
Props: { routes: RoutePreview[] }
- RoutePreviewCard 목록
- 빈 경우: "아직 등록된 코스가 없습니다" 메시지
```

#### ThemeNavigation.tsx (server)
```
Props: { currentSlug: string }
- THEMES.filter(t => t.slug !== currentSlug)
- 칩에 colorClass 적용
- Link to /theme/{slug}
```

### 2.8 ExploreNavBar.tsx (shared)

```
Props: { activeTab?: "discover" | "feed" }
- 위치: Discover 랜딩 및 Feed 페이지 상단
- 탭: [발견] [피드]
- 하단에 도시/테마 빠른 링크 행
  도시: CITIES 상위 4개 칩 → /city/{slug}
  테마: THEMES 상위 4개 칩 → /theme/{slug}
- sticky: top-0 z-20
```

### 2.9 Discover 수정

`DiscoverPage.tsx`에 추가:
- `<ExploreNavBar activeTab="discover" />` — 컴포넌트 상단
- 기존 popularRoutes 섹션 하단에 "모든 Route 보기 →" 링크 (`/feed`)

---

## 3. Rendering Strategy

| Page | Type | revalidate | generateStaticParams | generateMetadata |
|------|------|-----------|---------------------|-----------------|
| `/feed` | CSR | - | - | static title only |
| `/city/[name]` | SSR+ISR | 3600 | CITIES.map | dynamic per city |
| `/theme/[name]` | SSR+ISR | 3600 | THEMES.map | dynamic per theme |

---

## 4. IntersectionObserver Pattern (Feed 무한스크롤)

```typescript
// FeedSpotGrid 내부
const observerRef = useRef<IntersectionObserver | null>(null);
const lastCardRef = useCallback((node: HTMLDivElement | null) => {
  if (isLoading) return;
  if (observerRef.current) observerRef.current.disconnect();
  observerRef.current = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore) {
      onLoadMore();
    }
  });
  if (node) observerRef.current.observe(node);
}, [isLoading, hasMore, onLoadMore]);
```

---

## 5. URL Search Params Sync (Feed)

```typescript
// FeedPage 내부
const searchParams = useSearchParams();
const router = useRouter();

// Init from URL
useEffect(() => {
  const urlArea = searchParams.get("area");
  const urlCategory = searchParams.get("category");
  if (urlArea) setArea(urlArea);
  if (urlCategory) setCategory(urlCategory as SpotCategory);
}, []);

// Sync to URL on filter change
useEffect(() => {
  const params = new URLSearchParams();
  if (area) params.set("area", area);
  if (category) params.set("category", category);
  const query = params.toString();
  router.replace(`/feed${query ? `?${query}` : ""}`, { scroll: false });
}, [area, category]);
```

---

## 6. Component Reuse Map

| Existing Component | Used In |
|-------------------|---------|
| `SpotPreviewCard` | FeedSpotGrid, CitySpots |
| `RoutePreviewCard` | FeedRouteSection, CityRoutes, ThemeRoutes |
| `Layout` | Feed page, City page, Theme page |
| `OptimizedImage` | (via SpotPreviewCard) |
| `TagList` | (미사용 — Feed에서는 카드 내부 태그만) |

---

## 7. Responsive Breakpoints

| Component | Mobile (default) | Tablet (md:) | Desktop (lg:) |
|-----------|-----------------|-------------|--------------|
| FeedSpotGrid | 2열 | 3열 | 4열 |
| FeedAreaTabs | 수평 스크롤 | 수평 스크롤 | flex-wrap |
| CitySpots | 2열 | 3열 | 4열 |
| RoutePreviewCard | full-width | full-width | max-w-2xl |

---

## 8. Error & Empty States

| Scenario | UI |
|----------|-----|
| API 에러 (Feed) | "Spot을 불러올 수 없습니다" + 다시 시도 버튼 |
| 빈 결과 (Feed) | "이 지역에 등록된 Spot이 없습니다" |
| 빈 Route (City) | Route 섹션 숨김 |
| 빈 Route (Theme) | "아직 등록된 코스가 없습니다" 메시지 |
| 잘못된 City slug | not-found.tsx → "존재하지 않는 도시입니다" |
| 잘못된 Theme slug | not-found.tsx → "존재하지 않는 테마입니다" |

---

## 9. Implementation Order (Summary)

```
Step 1: Infrastructure   → types, api, constants (1-1 ~ 1-7)
Step 2: Feed             → store, FeedPage, 5 sub-components, page.tsx (2-1 ~ 2-8)
Step 3: City             → 4 components + page.tsx + not-found.tsx (3-1 ~ 3-6)
Step 4: Theme            → 3 components + page.tsx + not-found.tsx (4-1 ~ 4-5)
Step 5: Navigation       → ExploreNavBar + DiscoverPage 수정 (5-1 ~ 5-2)
```

Each step should pass `pnpm type-check` and `pnpm build` before proceeding.
