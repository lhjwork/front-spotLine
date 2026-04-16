# Landing Page Redesign Design Document

> **Summary**: 서버 컴포넌트 기반 SSR 랜딩 페이지 — Hero, 인기 SpotLine, 도시/테마 탐색, 서비스 소개, 최신 Spot, CTA 6개 섹션 구현 설계
>
> **Project**: Spotline (front-spotLine)
> **Version**: 0.1.0
> **Author**: AI
> **Date**: 2026-04-16
> **Status**: Draft
> **Planning Doc**: [landing-page-redesign.plan.md](../../01-plan/features/landing-page-redesign.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 서버 컴포넌트(RSC) 기반 SSR로 SEO 크롤링 가능한 랜딩 페이지 구현
- 위치 권한 없이 즉시 콘텐츠 노출 — 첫 방문 전환율 극대화
- 기존 API (`fetchPopularSpotLines`, `fetchFeedSpots`) 재활용으로 개발 비용 최소화
- 기존 DiscoverPage를 `/discover`로 분리하여 역할 명확화

### 1.2 Design Principles

- **Server-First**: 모든 데이터 fetch는 서버 컴포넌트에서 수행, 클라이언트 번들 최소화
- **Progressive Enhancement**: 데이터 fetch 실패 시 정적 폴백 콘텐츠 표시
- **Reuse Existing**: 기존 `SpotLinePreviewCard`, `SpotPreviewCard` 컴포넌트 최대 활용
- **Mobile First**: 360px 기본 → md(768px) → lg(1024px) 반응형

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  / (page.tsx) — Server Component                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ HeroSection (Server)                                │    │
│  │  - 서비스 메시지 + 2개 CTA 버튼                      │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ PopularSpotLinesSection (Server)                    │    │
│  │  - fetchPopularSpotLines() → SpotLinePreviewCard[]  │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ CityThemeSection (Server)                           │    │
│  │  - 정적 데이터: 5개 도시 + 7개 테마 칩               │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ServiceIntroSection (Server)                        │    │
│  │  - 정적: QR → Spot → SpotLine 3단계 설명            │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ LatestSpotsSection (Server)                         │    │
│  │  - fetchFeedSpots(sort:'latest') → SpotPreviewCard[]│    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ LandingCTA (Server)                                 │    │
│  │  - 하단 CTA 메시지 + 버튼                            │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ OnboardingWrapper (Client — "use client")           │    │
│  │  - 첫 방문 시에만 OnboardingOverlay 표시             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  /discover (page.tsx) — Client Component                    │
│  - 기존 DiscoverPage 이동 (변경 없음)                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
Server Component (page.tsx)
    ├── fetchPopularSpotLines(limit=6)  →  Backend API  →  SpotLinePreview[]
    ├── fetchFeedSpots(sort='latest', size=6)  →  Backend API  →  PaginatedResponse<SpotDetailResponse>
    └── 정적 데이터 (도시, 테마, 서비스 소개)  →  상수 정의

    ↓ Props 전달

Section Components (서버 컴포넌트)
    ├── PopularSpotLinesSection → SpotLinePreviewCard (기존 컴포넌트 재사용)
    └── LatestSpotsSection → SpotPreviewCard (기존 컴포넌트 재사용)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| PopularSpotLinesSection | `fetchPopularSpotLines()` | 인기 SpotLine 데이터 |
| LatestSpotsSection | `fetchFeedSpots()` | 최신 Spot 데이터 |
| SpotLinePreviewCard | `SpotLinePreview` 타입 | 카드 UI 렌더링 |
| SpotPreviewCard | `SpotDetailResponse` 타입 | 카드 UI 렌더링 |
| OnboardingWrapper | `isFirstVisit()` | 첫 방문 감지 |
| ExploreNavBar | - | 탭 업데이트 (발견→내 주변) |

---

## 3. Data Model

### 3.1 기존 타입 활용 (신규 타입 없음)

```typescript
// 기존 타입 — src/types/index.ts
interface SpotLinePreview {
  id: string;
  slug: string;
  title: string;
  theme: string;
  area: string;
  totalDuration: number;
  totalDistance: number;
  spotCount: number;
  likesCount: number;
  coverImageUrl?: string;
}

interface SpotDetailResponse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: SpotCategory;
  source: string;
  crewNote: string | null;
  address: string;
  latitude: number;
  longitude: number;
  area: string;
  tags: string[];
  media: string[];
  mediaItems: SpotMediaItem[];
  likesCount: number;
  savesCount: number;
  visitedCount: number;
  viewsCount: number;
  placeInfo: DiscoverPlaceInfo | null;
  partner: SpotPartnerInfo | null;
}
```

### 3.2 정적 데이터 상수

```typescript
// src/constants/landing.ts (신규)

export const LANDING_CITIES = [
  { id: "gangnam", label: "강남", emoji: "🏙️" },
  { id: "hongdae", label: "홍대", emoji: "🎨" },
  { id: "seongsu", label: "성수", emoji: "☕" },
  { id: "itaewon", label: "이태원", emoji: "🌍" },
  { id: "jongno", label: "종로", emoji: "🏛️" },
] as const;

export const LANDING_THEMES: { id: SpotLineTheme; label: string; emoji: string }[] = [
  { id: "date", label: "데이트", emoji: "💑" },
  { id: "travel", label: "여행", emoji: "✈️" },
  { id: "walk", label: "산책", emoji: "🚶" },
  { id: "hangout", label: "놀거리", emoji: "🎉" },
  { id: "food-tour", label: "맛집 투어", emoji: "🍽️" },
  { id: "cafe-tour", label: "카페 투어", emoji: "☕" },
  { id: "culture", label: "문화", emoji: "🎭" },
];

export const SERVICE_STEPS = [
  {
    step: 1,
    title: "QR 스캔",
    description: "매장의 QR 코드를 스캔하면 그 장소의 Spot 정보가 나타나요",
    icon: "qr-code",
  },
  {
    step: 2,
    title: "Spot 발견",
    description: "다음에 가기 좋은 장소를 추천받고, 새로운 Spot을 발견하세요",
    icon: "map-pin",
  },
  {
    step: 3,
    title: "SpotLine 따라가기",
    description: "여러 Spot을 연결한 SpotLine을 따라 완벽한 코스를 경험하세요",
    icon: "route",
  },
] as const;
```

---

## 4. API Specification

### 4.1 사용할 기존 API

| Method | Endpoint | Function | 용도 |
|--------|----------|----------|------|
| GET | `/api/v2/spotlines/popular?limit=6` | `fetchPopularSpotLines(undefined, 6)` | 인기 SpotLine 6개 |
| GET | `/api/v2/spots?sort=latest&size=6` | `fetchFeedSpots(undefined, undefined, 0, 6, 'latest')` | 최신 Spot 6개 |

### 4.2 서버 컴포넌트 Data Fetching

```typescript
// src/app/page.tsx 내부
async function getPopularSpotLines(): Promise<SpotLinePreview[]> {
  try {
    return await fetchPopularSpotLines(undefined, 6);
  } catch {
    return []; // 폴백: 빈 배열 → 섹션 숨김 또는 정적 콘텐츠 표시
  }
}

async function getLatestSpots(): Promise<SpotDetailResponse[]> {
  try {
    const response = await fetchFeedSpots(undefined, undefined, 0, 6, 'latest');
    return response.content;
  } catch {
    return []; // 폴백: 빈 배열
  }
}
```

**주의**: 기존 `api.ts`의 Axios 인스턴스가 서버 컴포넌트에서 동작하는지 확인 필요. `NEXT_PUBLIC_API_BASE_URL` 환경 변수가 서버 사이드에서도 접근 가능(`NEXT_PUBLIC_` 접두사).

---

## 5. UI/UX Design

### 5.1 전체 페이지 레이아웃

```
┌────────────────────────────────────────────────────────┐
│  Header (기존 Layout 컴포넌트)                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ HERO SECTION                                     │  │
│  │                                                  │  │
│  │  "다음 장소, Spotline이 추천해요"                  │  │
│  │  "지금 있는 장소에서 다음에 가기 좋은 곳을          │  │
│  │   발견하세요"                                     │  │
│  │                                                  │  │
│  │  [SpotLine 둘러보기]  [데모 체험하기]              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ─ 지금 인기 있는 SpotLine ──────────────────────────  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│  │Card│ │Card│ │Card│ │Card│ │Card│ │Card│ ← scroll  │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘          │
│                                                        │
│  ─ 어디로 떠나볼까요? ──────────────────────────────── │
│  도시: [강남] [홍대] [성수] [이태원] [종로]            │
│  테마: [데이트] [여행] [산책] [놀거리] [맛집] [카페] [문화]│
│                                                        │
│  ─ Spotline은 이렇게 사용해요 ─────────────────────── │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │ QR 스캔  │  │Spot 발견│  │SpotLine │              │
│  │   📱    │  │   📍    │  │ 따라가기 │              │
│  └─────────┘  └─────────┘  └─────────┘              │
│                                                        │
│  ─ 새로 추가된 Spot ────────────────────────────────── │
│  ┌────┐ ┌────┐ ┌────┐                                │
│  │Spot│ │Spot│ │Spot│                                │
│  └────┘ └────┘ └────┘                                │
│  ┌────┐ ┌────┐ ┌────┐                                │
│  │Spot│ │Spot│ │Spot│                                │
│  └────┘ └────┘ └────┘                                │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ "나만의 SpotLine을 만들어보세요"                   │  │
│  │              [시작하기]                            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
├────────────────────────────────────────────────────────┤
│  Footer (기존 Layout 컴포넌트)                           │
└────────────────────────────────────────────────────────┘
```

### 5.2 User Flow

```
사용자 검색엔진/직접 방문
    ↓
/ (랜딩 페이지) — SSR, 즉시 콘텐츠 표시
    ├── "SpotLine 둘러보기" → /feed
    ├── "데모 체험하기" → /qr/demo_cafe_001
    ├── SpotLine 카드 클릭 → /spotline/[slug]
    ├── 도시 칩 클릭 → /feed?area={city}
    ├── 테마 칩 클릭 → /feed?theme={theme}
    ├── Spot 카드 클릭 → /spot/[slug]
    └── "시작하기" → /feed

(첫 방문 시) OnboardingOverlay 표시 → 완료 후 랜딩 콘텐츠 노출
```

### 5.3 Component List

| Component | Location | Type | Responsibility |
|-----------|----------|------|----------------|
| `page.tsx` | `src/app/page.tsx` | Server | 데이터 fetch + 섹션 조합 |
| `HeroSection` | `src/components/landing/HeroSection.tsx` | Server | Hero 영역 (메시지 + CTA) |
| `PopularSpotLinesSection` | `src/components/landing/PopularSpotLinesSection.tsx` | Server | 인기 SpotLine 가로 스크롤 |
| `CityThemeSection` | `src/components/landing/CityThemeSection.tsx` | Server | 도시/테마 칩 그리드 |
| `ServiceIntroSection` | `src/components/landing/ServiceIntroSection.tsx` | Server | 서비스 3단계 소개 |
| `LatestSpotsSection` | `src/components/landing/LatestSpotsSection.tsx` | Server | 최신 Spot 그리드 |
| `LandingCTA` | `src/components/landing/LandingCTA.tsx` | Server | 하단 CTA |
| `OnboardingWrapper` | `src/components/landing/OnboardingWrapper.tsx` | Client | 온보딩 오버레이 래퍼 |
| `SpotLinePreviewCard` | `src/components/shared/SpotLinePreviewCard.tsx` | 기존 | SpotLine 카드 (재사용) |
| `SpotPreviewCard` | `src/components/shared/SpotPreviewCard.tsx` | 기존 | Spot 카드 (재사용) |

### 5.4 섹션별 상세 디자인

#### Section 1: HeroSection

```
모바일 (360px):
┌──────────────────────────────┐
│  py-16 px-4 text-center      │
│                              │
│  h1: text-3xl font-bold      │
│  "다음 장소,                  │
│   Spotline이 추천해요"        │
│                              │
│  p: text-lg text-gray-600    │
│  "지금 있는 장소에서           │
│   다음에 가기 좋은 곳을        │
│   발견하세요"                 │
│                              │
│  flex flex-col gap-3          │
│  [SpotLine 둘러보기] (primary)│
│  [데모 체험하기] (outline)    │
│                              │
│  배경: bg-gradient-to-b       │
│  from-blue-50 to-white       │
└──────────────────────────────┘

데스크톱 (lg:):
- max-w-2xl mx-auto, py-24
- 버튼 flex-row 정렬
```

- CTA 1: `<Link href="/feed">` — `bg-blue-600 text-white px-6 py-3 rounded-lg`
- CTA 2: `<Link href="/qr/demo_cafe_001">` — `border border-blue-600 text-blue-600 px-6 py-3 rounded-lg`

#### Section 2: PopularSpotLinesSection

```
┌──────────────────────────────────────────┐
│  h2: "지금 인기 있는 SpotLine"             │
│  Link: "전체 보기 →" href="/feed"          │
│                                          │
│  overflow-x-auto flex gap-4 snap-x       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ Card │ │ Card │ │ Card │ │ Card │ →  │
│  └──────┘ └──────┘ └──────┘ └──────┘    │
│  (SpotLinePreviewCard 재사용)             │
│  snap-center, min-w-[280px]              │
└──────────────────────────────────────────┘
```

- Props: `spotLines: SpotLinePreview[]`
- 데이터 없으면 섹션 전체 숨김 (`spotLines.length === 0 → return null`)
- 가로 스크롤: `overflow-x-auto`, `scrollbar-hide`, `snap-x snap-mandatory`
- 각 카드: `snap-center`, `min-w-[280px]`, `flex-shrink-0`

#### Section 3: CityThemeSection

```
┌──────────────────────────────────────────┐
│  h2: "어디로 떠나볼까요?"                  │
│                                          │
│  h3: "도시"                               │
│  flex flex-wrap gap-2                    │
│  [🏙️ 강남] [🎨 홍대] [☕ 성수]            │
│  [🌍 이태원] [🏛️ 종로]                    │
│                                          │
│  h3: "테마"                               │
│  flex flex-wrap gap-2                    │
│  [💑 데이트] [✈️ 여행] [🚶 산책]           │
│  [🎉 놀거리] [🍽️ 맛집] [☕ 카페] [🎭 문화] │
└──────────────────────────────────────────┘
```

- 도시 칩: `<Link href="/feed?area={id}">` — `px-4 py-2 rounded-full bg-gray-100 hover:bg-blue-50`
- 테마 칩: `<Link href="/feed?theme={id}">` — 동일 스타일
- 정적 데이터 → `LANDING_CITIES`, `LANDING_THEMES` 상수 사용

#### Section 4: ServiceIntroSection

```
┌──────────────────────────────────────────┐
│  h2: "Spotline은 이렇게 사용해요"          │
│                                          │
│  grid grid-cols-1 md:grid-cols-3 gap-6   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 📱       │ │ 📍       │ │ 🗺️       │ │
│  │ QR 스캔  │ │Spot 발견 │ │SpotLine  │ │
│  │          │ │          │ │따라가기   │ │
│  │ 설명...  │ │ 설명...  │ │ 설명...  │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│                                          │
│  text-center per card                    │
│  bg-gray-50 rounded-xl p-6              │
└──────────────────────────────────────────┘
```

- 정적 콘텐츠, `SERVICE_STEPS` 상수 기반
- 아이콘: 이모지 또는 SVG inline (외부 라이브러리 없음)
- 카드: `bg-gray-50 rounded-xl p-6 text-center`

#### Section 5: LatestSpotsSection

```
┌──────────────────────────────────────────┐
│  h2: "새로 추가된 Spot"                    │
│  Link: "전체 보기 →" href="/feed"          │
│                                          │
│  grid grid-cols-2 md:grid-cols-3 gap-4   │
│  ┌────┐ ┌────┐ ┌────┐                   │
│  │Spot│ │Spot│ │Spot│                   │
│  └────┘ └────┘ └────┘                   │
│  ┌────┐ ┌────┐ ┌────┐                   │
│  │Spot│ │Spot│ │Spot│                   │
│  └────┘ └────┘ └────┘                   │
│  (SpotPreviewCard 재사용)                 │
└──────────────────────────────────────────┘
```

- Props: `spots: SpotDetailResponse[]`
- 데이터 없으면 섹션 숨김
- 그리드: `grid grid-cols-2 md:grid-cols-3 gap-4`

#### Section 6: LandingCTA

```
┌──────────────────────────────────────────┐
│  bg-blue-600 text-white py-16 text-center│
│                                          │
│  h2: "나만의 SpotLine을 만들어보세요"      │
│  p: "좋아하는 장소를 연결해 나만의 코스를   │
│      만들고 공유하세요"                    │
│                                          │
│  [시작하기] — bg-white text-blue-600      │
└──────────────────────────────────────────┘
```

- CTA 버튼: `<Link href="/feed">` — `bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold`

---

## 6. Error Handling

### 6.1 SSR Data Fetch 실패 처리

| 시나리오 | 처리 | 사용자 경험 |
|----------|------|------------|
| `fetchPopularSpotLines` 실패 | try/catch → 빈 배열 반환 | 인기 SpotLine 섹션 숨김 |
| `fetchFeedSpots` 실패 | try/catch → 빈 배열 반환 | 최신 Spot 섹션 숨김 |
| 두 API 모두 실패 | 정적 섹션만 표시 (Hero, 도시/테마, 서비스 소개, CTA) | 여전히 유용한 페이지 |
| 전체 페이지 에러 | Next.js `error.tsx` 활용 | 에러 페이지 + 재시도 버튼 |

### 6.2 접근 방식

- **Graceful Degradation**: API 실패 시 동적 섹션만 숨기고, 정적 섹션 4개는 항상 표시
- 별도 에러 페이지 불필요 — 섹션별 독립 에러 처리로 충분
- 에러 로깅: `console.error`로 서버 로그에 기록

---

## 7. Security Considerations

- [x] XSS 방지: React의 기본 이스케이프 + 사용자 입력 없음 (읽기 전용 페이지)
- [x] 인증 불필요: 공개 랜딩 페이지, 로그인 없이 접근
- [ ] Rate Limiting: 서버 컴포넌트 fetch에 캐싱 적용 (Next.js `fetch` 캐시 또는 `revalidate`)
- [x] 민감 데이터 없음: 공개 콘텐츠만 표시
- [ ] `revalidate` 설정으로 API 호출 빈도 제한 (권장: 300초 = 5분)

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Method |
|------|--------|--------|
| 빌드 검증 | `pnpm build` 성공 | CLI |
| 린트 | Zero lint errors | `pnpm lint` |
| 반응형 | 360px, 768px, 1024px | 브라우저 DevTools |
| SEO | 메타데이터, 구조화 데이터 | Lighthouse |
| 링크 | 모든 CTA/칩/카드 링크 정상 | 수동 테스트 |

### 8.2 Test Cases

- [ ] 랜딩 페이지가 SSR로 렌더링되고 소스에서 콘텐츠 확인 가능
- [ ] 인기 SpotLine 카드 클릭 시 `/spotline/[slug]`로 이동
- [ ] 도시/테마 칩 클릭 시 `/feed?area=` 또는 `/feed?theme=`로 이동
- [ ] API 실패 시 정적 섹션만 정상 표시 (에러 없음)
- [ ] `/discover`에서 기존 DiscoverPage 정상 작동
- [ ] 모바일(360px)에서 가로 스크롤 SpotLine 카드 정상 동작
- [ ] 첫 방문 시 OnboardingOverlay 표시

---

## 9. Clean Architecture

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | 랜딩 섹션 컴포넌트, 페이지 | `src/components/landing/`, `src/app/page.tsx` |
| **Domain** | 기존 타입 (SpotLinePreview, SpotDetailResponse) | `src/types/index.ts` |
| **Infrastructure** | API 호출 (fetchPopularSpotLines, fetchFeedSpots) | `src/lib/api.ts` |

### 9.2 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| HeroSection | Presentation | `src/components/landing/HeroSection.tsx` |
| PopularSpotLinesSection | Presentation | `src/components/landing/PopularSpotLinesSection.tsx` |
| CityThemeSection | Presentation | `src/components/landing/CityThemeSection.tsx` |
| ServiceIntroSection | Presentation | `src/components/landing/ServiceIntroSection.tsx` |
| LatestSpotsSection | Presentation | `src/components/landing/LatestSpotsSection.tsx` |
| LandingCTA | Presentation | `src/components/landing/LandingCTA.tsx` |
| OnboardingWrapper | Presentation | `src/components/landing/OnboardingWrapper.tsx` |
| LANDING_CITIES, LANDING_THEMES | Domain (상수) | `src/constants/landing.ts` |
| fetchPopularSpotLines | Infrastructure | `src/lib/api.ts` (기존) |
| fetchFeedSpots | Infrastructure | `src/lib/api.ts` (기존) |

---

## 10. Coding Convention Reference

### 10.1 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| Component naming | `PascalCase` — `HeroSection`, `PopularSpotLinesSection` |
| File organization | `src/components/landing/` 디렉토리 |
| State management | 서버 컴포넌트 — Zustand 사용 안 함 (OnboardingWrapper만 클라이언트) |
| Styling | Tailwind CSS 4, 모바일 퍼스트, `cn()` 유틸리티 |
| 이미지 | `OptimizedImage` 컴포넌트 사용 |
| 경로 별칭 | `@/*` 사용 |
| UI 언어 | 한국어 |

---

## 11. Implementation Guide

### 11.1 File Structure

```
src/
├── app/
│   ├── page.tsx                              — (수정) SSR 랜딩 페이지
│   └── discover/
│       └── page.tsx                          — (신규) 기존 DiscoverPage 이동
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx                   — (신규)
│   │   ├── PopularSpotLinesSection.tsx        — (신규)
│   │   ├── CityThemeSection.tsx               — (신규)
│   │   ├── ServiceIntroSection.tsx            — (신규)
│   │   ├── LatestSpotsSection.tsx             — (신규)
│   │   ├── LandingCTA.tsx                     — (신규)
│   │   └── OnboardingWrapper.tsx              — (신규)
│   └── shared/
│       └── ExploreNavBar.tsx                  — (수정) "발견" 탭 → "내 주변" + /discover
├── constants/
│   └── landing.ts                            — (신규) 도시/테마/서비스 소개 상수
└── lib/
    └── api.ts                                — (수정 불필요)
```

### 11.2 Implementation Order

1. [ ] **상수 정의** — `src/constants/landing.ts` (도시, 테마, 서비스 소개)
2. [ ] **DiscoverPage 이동** — `src/app/discover/page.tsx` 생성, 기존 로직 이동
3. [ ] **ExploreNavBar 수정** — "발견" 탭을 "내 주변"으로 변경, href를 `/discover`로
4. [ ] **랜딩 섹션 컴포넌트** (순서대로):
   - 4a. HeroSection
   - 4b. PopularSpotLinesSection
   - 4c. CityThemeSection
   - 4d. ServiceIntroSection
   - 4e. LatestSpotsSection
   - 4f. LandingCTA
5. [ ] **OnboardingWrapper** — 클라이언트 컴포넌트로 온보딩 로직 분리
6. [ ] **page.tsx 재작성** — 서버 컴포넌트로 전환, 데이터 fetch + 섹션 조합
7. [ ] **SEO 메타데이터** — `metadata` export 추가 (title, description, OpenGraph)
8. [ ] **빌드/린트 검증** — `pnpm build && pnpm lint`

### 11.3 ExploreNavBar 변경 사항

```typescript
// 현재
{ label: "발견", href: "/", tab: "discover" }

// 변경
{ label: "내 주변", href: "/discover", tab: "discover" }
```

### 11.4 SEO 메타데이터

```typescript
// src/app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spotline — 다음 장소, Spotline이 추천해요",
  description: "지금 있는 장소에서 다음에 가기 좋은 곳을 발견하세요. 인기 SpotLine, 도시별 코스, 테마별 추천까지.",
  openGraph: {
    title: "Spotline — 다음 장소, Spotline이 추천해요",
    description: "지금 있는 장소에서 다음에 가기 좋은 곳을 발견하세요.",
    type: "website",
  },
};
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-16 | Initial draft | AI |
