# Plan: Experience Feed — 피드 + 탐색 UI

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | Spot/Route 상세 페이지(Phase 3)는 존재하지만, 사용자가 콘텐츠를 탐색할 수 있는 피드/목록 페이지가 없다. Discover 랜딩은 위치 기반 1~2개 Spot만 보여줘 콘텐츠 노출이 극히 제한적이다. 도시/테마별 SEO 랜딩 페이지도 없어 검색 유입 채널이 부족하다. |
| **Solution** | 메인 피드(`/feed`), 도시별 페이지(`/city/[name]`), 테마별 페이지(`/theme/[name]`)를 구현한다. 기존 Backend API(`GET /spots?area&category`, `GET /routes/popular?area&theme`)를 활용하여 프론트엔드만 구현한다. |
| **Function UX Effect** | 사용자가 지역/카테고리/테마로 Spot과 Route를 탐색하고, 무한 스크롤로 콘텐츠를 소비한다. 도시/테마 페이지는 SSR로 SEO 크롤링 가능하다. Discover 랜딩에서 피드/도시/테마로의 자연스러운 네비게이션이 제공된다. |
| **Core Value** | Cold Start 전략의 두 번째 축: 크루가 큐레이션한 200~300 Spot과 15~20 Route를 사용자에게 효과적으로 노출하여 SEO 유입과 체류 시간을 극대화한다. |

| Item | Detail |
|------|--------|
| Feature | Experience Feed (Phase 4 of Experience Social Platform) |
| Created | 2026-03-27 |
| Status | Planning |
| Level | Dynamic |
| Depends On | Phase 3 (Spot/Route SSR 상세 페이지) — Archived, 92% |

---

## 1. Background & Context

### 1.1 현재 상태 (AS-IS)

Phase 3 완료로 다음이 구현됨:
- **Discover Landing** (`/`) — 위치 기반 currentSpot + nextSpot + nearbySpots + popularRoutes
- **Spot 상세** (`/spot/[slug]`) — SSR, SEO, Place API 병합
- **Route 상세** (`/route/[slug]`) — SSR, SEO, 타임라인
- **Shared 컴포넌트** — SpotPreviewCard, SpotMiniCard, RoutePreviewCard, TagList

**한계**:
- Discover는 현재 위치 기반 1~2개 Spot만 노출 → 콘텐츠 발견 병목
- 목록/피드 형태의 탐색 UI 없음
- 도시별(`/city/성수`) 검색 SEO 랜딩 없음
- 테마별(`/theme/date`) 검색 SEO 랜딩 없음

### 1.2 Backend API 현황

이미 구현된 API (Spring Boot):
```
GET /api/v2/spots?area=&category=&page=0&size=20     ← Paginated Spot 목록
GET /api/v2/routes/popular?area=&theme=&page=0&size=20 ← Paginated Route 목록
GET /api/v2/spots/discover?lat=&lng=                    ← Discover (기존)
GET /api/v2/spots/nearby?lat=&lng=&radius=              ← Nearby Spots
```

**중요**: 이 Plan은 **프론트엔드만** 구현한다. Backend API는 이미 충분하다.

---

## 2. Scope

### 2.1 In Scope

| # | Item | Description |
|---|------|-------------|
| 1 | **Feed 페이지** (`/feed`) | Spot + Route 통합 피드. area/category/theme 필터. 무한 스크롤 (cursor 기반 페이지네이션). CSR. |
| 2 | **City 페이지** (`/city/[name]`) | 도시별 인기 Spot + Route. SSR + ISR. SEO 메타데이터. |
| 3 | **Theme 페이지** (`/theme/[name]`) | 테마별 인기 Route + 관련 Spot. SSR + ISR. SEO 메타데이터. |
| 4 | **Feed 네비게이션** | Discover 랜딩에서 피드/도시/테마로 이동하는 탐색 바 |
| 5 | **Feed API 함수** | `fetchFeed()`, `fetchCityData()`, `fetchThemeData()` — 기존 Backend API 조합 |
| 6 | **Feed 타입** | FeedResponse, CityPageData, ThemePageData 등 |
| 7 | **Feed Store** | `useFeedStore` — 필터 상태, 무한 스크롤 커서 관리 |

### 2.2 Out of Scope

| Item | Reason |
|------|--------|
| 개인화 추천 알고리즘 | Phase 6 Social Features 이후 |
| 팔로잉 피드 | 팔로우 기능 미구현 (Phase 6) |
| 검색 기능 (텍스트 검색) | 별도 feature로 분리 |
| Backend API 수정 | 기존 API로 충분 |
| 유저 생성 콘텐츠 (UGC) | Phase 6+ |

---

## 3. Core Pages

### 3.1 Feed 페이지 (`/feed`)

**렌더링**: CSR (클라이언트) — 필터/무한스크롤이 핵심

**레이아웃**:
```
┌─────────────────────────────────┐
│ ← 피드                          │  Header
├─────────────────────────────────┤
│ [전체] [성수] [을지로] [연남]    │  Area 탭 (수평 스크롤)
│ [홍대] [이태원] [한남]           │
├─────────────────────────────────┤
│ [전체] [카페] [맛집] [문화]     │  Category 칩 필터
│ [자연] [산책] [바] [액티비티]    │
├─────────────────────────────────┤
│ 📍 인기 Route                   │  Section: Routes
│ ┌───────────────────────────┐   │
│ │ RoutePreviewCard          │   │
│ │ "성수 데이트 코스"         │   │
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ RoutePreviewCard          │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ 📌 인기 Spot                    │  Section: Spots
│ ┌────────┐ ┌────────┐          │
│ │SpotCard│ │SpotCard│  ← 2열   │
│ └────────┘ └────────┘          │
│ ┌────────┐ ┌────────┐          │
│ │SpotCard│ │SpotCard│          │
│ └────────┘ └────────┘          │
│          ...                    │
│    [더 보기] ← 무한 스크롤      │
└─────────────────────────────────┘
```

**필터 동작**:
- Area 탭 선택 → Spot/Route 모두 해당 지역 필터
- Category 칩 선택 → Spot만 카테고리 필터 (Route는 theme 기준)
- 필터 변경 시 목록 리셋 + 새 데이터 fetch
- URL 쿼리 파라미터 반영: `/feed?area=성수&category=cafe`

### 3.2 City 페이지 (`/city/[name]`)

**렌더링**: SSR + ISR (revalidate: 3600) — SEO 핵심

**URL 예시**: `/city/seongsu`, `/city/euljiro`, `/city/yeonnam`

**레이아웃**:
```
┌─────────────────────────────────┐
│ 성수 탐색                        │  Hero: 도시명 + 설명
│ "성수의 인기 경험을 만나보세요"   │
├─────────────────────────────────┤
│ 🔥 인기 Route                   │  Section 1: 인기 Route (최대 5개)
│ [RoutePreviewCard] ...          │
├─────────────────────────────────┤
│ ☕ 카페  🍽️ 맛집  🎨 문화       │  Category 탭
├─────────────────────────────────┤
│ 인기 Spot                       │  Section 2: 카테고리별 Spot
│ [SpotPreviewCard] 2열 그리드    │
│ ...                             │
│ [더 보기 → /feed?area=성수]     │
├─────────────────────────────────┤
│ 🏙️ 다른 도시 탐색               │  Section 3: 다른 도시 링크
│ [을지로] [연남] [홍대] [이태원]  │
└─────────────────────────────────┘
```

**SEO 메타데이터**:
```
title: "성수 인기 경험 · 카페, 맛집, 문화 | Spotline"
description: "성수에서 가장 인기있는 Spot과 Route를 만나보세요. 카페, 맛집, 문화 공간 큐레이션."
og:image: 도시 대표 이미지 (추후 Spot 썸네일 중 하나)
```

### 3.3 Theme 페이지 (`/theme/[name]`)

**렌더링**: SSR + ISR (revalidate: 3600) — SEO 핵심

**URL 예시**: `/theme/date`, `/theme/cafe-tour`, `/theme/walk`

**레이아웃**:
```
┌─────────────────────────────────┐
│ 🩷 데이트 코스                   │  Hero: 테마명 + 색상 + 아이콘
│ "특별한 데이트를 위한 Route"     │
├─────────────────────────────────┤
│ 인기 Route                      │  Section 1: 테마별 Route
│ [RoutePreviewCard]              │
│ [RoutePreviewCard]              │
│ ...                             │
├─────────────────────────────────┤
│ 📍 관련 Spot                    │  Section 2: 이 테마 Route에 자주 포함되는 Spot
│ [SpotPreviewCard] 2열           │
├─────────────────────────────────┤
│ 🏷️ 다른 테마                    │  Section 3: 다른 테마 링크
│ [여행] [산책] [맛집투어] [문화]  │
└─────────────────────────────────┘
```

**테마 컬러링**: RoutePreviewCard에서 사용하는 themeColors 재사용
```
date: pink, travel: blue, walk: green, hangout: yellow,
food-tour: red, cafe-tour: amber, culture: purple
```

---

## 4. Data Flow

### 4.1 Feed 페이지 데이터

```
Feed 페이지 (CSR)
  ↓
useFeedStore (Zustand)
  ├── area: string | null
  ├── category: SpotCategory | null
  ├── spots: SpotDetailResponse[]
  ├── routes: RoutePreview[]
  ├── spotsPage: number
  ├── routesPage: number
  ├── hasMoreSpots: boolean
  ├── hasMoreRoutes: boolean
  └── isLoading: boolean
  ↓
fetchFeedSpots(area, category, page) → GET /api/v2/spots?area=&category=&page=&size=20
fetchFeedRoutes(area, theme, page)   → GET /api/v2/routes/popular?area=&theme=&page=&size=10
```

### 4.2 City 페이지 데이터

```
City 페이지 (SSR)
  ↓
Server Component에서 직접 fetch (병렬):
  Promise.all([
    fetchFeedSpots(area=cityName, page=0, size=12),
    fetchFeedRoutes(area=cityName, page=0, size=5),
  ])
```

### 4.3 Theme 페이지 데이터

```
Theme 페이지 (SSR)
  ↓
Server Component에서 직접 fetch:
  fetchFeedRoutes(theme=themeName, page=0, size=10)
  // 관련 Spot은 Route의 spot들에서 추출하거나 별도 API 미사용
```

---

## 5. New Types

```typescript
// Feed API 응답 (기존 Backend Page 응답 활용)
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       // current page (0-indexed)
  size: number;
  last: boolean;
  first: boolean;
}

// City 페이지 정적 데이터
interface CityInfo {
  slug: string;         // "seongsu"
  name: string;         // "성수"
  description: string;  // "성수의 인기 경험을 만나보세요"
  area: string;         // "성수" (API 쿼리용)
}

// Theme 페이지 정적 데이터
interface ThemeInfo {
  slug: string;         // "date"
  name: string;         // "데이트"
  description: string;
  theme: RouteTheme;    // API 쿼리용
  color: string;        // tailwind 색상 클래스
  icon: string;         // lucide 아이콘명
}
```

---

## 6. New API Functions

```typescript
// 기존 Backend API를 조합하는 프론트 API 함수
fetchFeedSpots(area?, category?, page = 0, size = 20)
  → GET /api/v2/spots?area=&category=&page=&size=

fetchFeedRoutes(area?, theme?, page = 0, size = 10)
  → GET /api/v2/routes/popular?area=&theme=&page=&size=
```

---

## 7. File Structure

```
src/
├── app/
│   ├── feed/
│   │   └── page.tsx                ← Feed 메인 (CSR)
│   ├── city/
│   │   └── [name]/
│   │       ├── page.tsx            ← City 페이지 (SSR)
│   │       └── not-found.tsx
│   └── theme/
│       └── [name]/
│           ├── page.tsx            ← Theme 페이지 (SSR)
│           └── not-found.tsx
│
├── components/
│   ├── feed/
│   │   ├── FeedPage.tsx            ← Feed 메인 컴포넌트 (client)
│   │   ├── FeedAreaTabs.tsx        ← 지역 탭 (수평 스크롤)
│   │   ├── FeedCategoryChips.tsx   ← 카테고리 필터 칩
│   │   ├── FeedRouteSection.tsx    ← Route 목록 섹션
│   │   ├── FeedSpotGrid.tsx        ← Spot 2열 그리드 + 무한스크롤
│   │   └── FeedSkeleton.tsx        ← 로딩 스켈레톤
│   │
│   ├── city/
│   │   ├── CityHero.tsx            ← 도시 Hero 섹션
│   │   ├── CityRoutes.tsx          ← 인기 Route 섹션
│   │   ├── CitySpots.tsx           ← 카테고리별 Spot 그리드
│   │   └── CityNavigation.tsx      ← 다른 도시 링크
│   │
│   ├── theme/
│   │   ├── ThemeHero.tsx           ← 테마 Hero (색상 + 아이콘)
│   │   ├── ThemeRoutes.tsx         ← 테마별 Route 목록
│   │   └── ThemeNavigation.tsx     ← 다른 테마 링크
│   │
│   └── shared/
│       └── ExploreNavBar.tsx       ← Discover→Feed/City/Theme 네비게이션 바
│
├── store/
│   └── useFeedStore.ts             ← Feed 상태 (필터, 페이지네이션)
│
├── lib/
│   └── api.ts                      ← fetchFeedSpots, fetchFeedRoutes 추가
│
├── types/
│   └── index.ts                    ← PaginatedResponse, CityInfo, ThemeInfo 추가
│
└── constants/
    ├── cities.ts                   ← 도시 목록 정적 데이터
    └── themes.ts                   ← 테마 목록 정적 데이터
```

**총 예상 파일**: 18~20개 (페이지 4 + 컴포넌트 11 + 상수 2 + 스토어 1 + 타입/API 수정)

---

## 8. Implementation Order

| Step | Files | Description |
|------|-------|-------------|
| **Step 1** | types, api, constants | 타입 추가 + API 함수 + 도시/테마 상수 |
| **Step 2** | Feed 페이지 + 컴포넌트 | FeedPage, FeedAreaTabs, FeedCategoryChips, FeedRouteSection, FeedSpotGrid, FeedSkeleton, useFeedStore |
| **Step 3** | City 페이지 + 컴포넌트 | CityHero, CityRoutes, CitySpots, CityNavigation, city/[name]/page.tsx |
| **Step 4** | Theme 페이지 + 컴포넌트 | ThemeHero, ThemeRoutes, ThemeNavigation, theme/[name]/page.tsx |
| **Step 5** | 네비게이션 연결 | ExploreNavBar, Discover 랜딩에 피드/도시/테마 링크 추가 |

---

## 9. SSR Strategy

| Page | Rendering | Revalidation | Reason |
|------|-----------|-------------|--------|
| `/feed` | CSR | - | 필터/무한스크롤 인터랙션 중심 |
| `/city/[name]` | SSR + ISR | 3600s (1h) | SEO + 성능 |
| `/theme/[name]` | SSR + ISR | 3600s (1h) | SEO + 성능 |

City/Theme 페이지는 `generateStaticParams()`로 빌드 타임 사전 생성 가능 (도시/테마 목록이 정적이므로).

---

## 10. Reusable Components

Phase 3에서 구현된 재사용 컴포넌트:
- `SpotPreviewCard` — Spot 카드 (이미지 + crewNote + 통계)
- `SpotMiniCard` — Spot 컴팩트 카드
- `RoutePreviewCard` — Route 카드 (테마 배지 + 시간/거리)
- `TagList` — 태그 목록
- `OptimizedImage` — 이미지 최적화

---

## 11. SEO Targets

| 키워드 패턴 | 페이지 | 예시 |
|-------------|--------|------|
| "{지역} 카페 추천" | `/city/[name]` | "성수 카페 추천" |
| "{지역} 데이트 코스" | `/city/[name]` | "을지로 데이트 코스" |
| "{테마} 추천 코스" | `/theme/[name]` | "데이트 추천 코스" |
| "{지역} 맛집 투어" | `/city/[name]` | "연남 맛집 투어" |

---

## 12. Discussion Points

### 12.1 도시 목록 관리
- 초기: 정적 상수 (서울 주요 5~7개 지역)
- 향후: DB에서 관리 (콘텐츠 있는 지역만 노출)

### 12.2 무한 스크롤 vs 페이지네이션
- Feed: 무한 스크롤 (모바일 UX 최적화)
- City/Theme: 초기 로드 + "더 보기 → /feed?area=" 링크

### 12.3 Discover 랜딩과의 관계
- Discover(`/`)는 위치 기반 즉석 발견 (기존 유지)
- Feed(`/feed`)는 목록 기반 탐색 (신규)
- 두 페이지를 ExploreNavBar로 연결
