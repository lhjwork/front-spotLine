# feed-discovery-v2 Design Document

> **Summary**: 피드 탐색 UX를 고도화하여 콘텐츠 발견성과 체류 시간을 개선하는 v2 업그레이드
>
> **Project**: front-spotLine (Next.js 16)
> **Version**: 0.1.0
> **Author**: Claude
> **Date**: 2026-04-18
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/feed-discovery-v2.plan.md`

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 피드가 POPULAR/NEWEST 2가지 정렬만 제공하여 트렌딩/기간별 인기 콘텐츠 구분 불가, 레이아웃 고정으로 브라우징 개인화 불가 |
| **Solution** | 트렌딩 섹션, 시간 기반 정렬(주간/월간), 레이아웃 토글(그리드/리스트), 카테고리 캐러셀, 무한스크롤 개선, 빈 상태 폴백 |
| **Function/UX Effect** | 트렌딩으로 즉각적 흥미 유발, 다양한 정렬로 탐색 효율 향상, 레이아웃 전환으로 개인화 브라우징 |
| **Core Value** | 콘텐츠 발견성 극대화 → 체류 시간 증가 → Spot/SpotLine 상세 페이지 진입률 향상 |

---

## 1. Overview

### 1.1 Design Objectives

현재 피드 시스템(15개 컴포넌트, Zustand 기반)을 확장하여 6가지 기능 요구사항을 구현한다. 기존 아키텍처 패턴(CSR, IntersectionObserver, URL 동기화)을 유지하면서 새 컴포넌트 4개 추가, 기존 5개 수정.

### 1.2 Design Constraints

- Backend `FeedSort` enum은 현재 `POPULAR | NEWEST`만 지원 — 시간 기반 정렬은 `createdAfter` 파라미터로 프론트엔드에서 기간 필터 적용
- 콘텐츠 규모 200~300 Spot — 트렌딩 섹션 최소 임계값(5개) 미달 시 숨김
- CSR 유지 (SSR 전환 Out of Scope)
- 기존 `FeedRecommendationSection`, `FollowingFeed` 등과 호환 필수

---

## 2. Architecture

### 2.1 Component Architecture

```
FeedPage.tsx (MODIFY)
├── ExploreNavBar
├── Feed Tabs (all / following)
├── FollowingFeed (기존 유지)
└── [feedTab === "all"]
    ├── FeedAreaTabs (기존 유지)
    ├── FeedCategoryChips (기존 유지)
    ├── Partner Filter (기존 유지)
    ├── Search + Sort Row
    │   ├── FeedSearchBar (기존 유지)
    │   └── FeedSortDropdown (MODIFY — FR-02)
    ├── FeedFilterReset (기존 유지)
    ├── FeedLayoutToggle.tsx (NEW — FR-03)
    ├── FeedTrendingSection.tsx (NEW — FR-01)
    ├── FeedRecommendationSection (기존 유지)
    ├── FeedCategoryCuration.tsx (NEW — FR-04)
    ├── FeedSpotLineSection (기존 유지)
    ├── FeedBlogSection (기존 유지)
    └── FeedSpotGrid (MODIFY — FR-03, FR-05)
        ├── SpotPreviewCard (기존) / SpotListCard (NEW sub)
        ├── SpotCardSkeleton (MODIFY — FR-05)
        └── FeedEmptyFallback.tsx (NEW — FR-06)
```

### 2.2 Data Flow

```
URL params ←→ useFeedStore (Zustand) ←→ Components
                    │
                    ├── area, category, sort, keyword (기존)
                    ├── sortPeriod (NEW: "ALL" | "WEEKLY" | "MONTHLY")
                    └── feedLayout (NEW: "grid" | "list")
                          ↕
                    localStorage ("feed-layout")
```

### 2.3 State Changes (useFeedStore.ts)

```typescript
// NEW state additions to FeedState interface
interface FeedState {
  // ... existing fields ...

  // FR-02: Time-based sort period
  sortPeriod: "ALL" | "WEEKLY" | "MONTHLY";
  setSortPeriod: (period: "ALL" | "WEEKLY" | "MONTHLY") => void;

  // FR-03: Layout preference
  feedLayout: "grid" | "list";
  setFeedLayout: (layout: "grid" | "list") => void;
}
```

`setSortPeriod` setter는 `setSort`와 동일하게 spots/page/hasMore를 리셋한다. `setFeedLayout`은 데이터 리셋 없이 레이아웃만 변경.

---

## 3. Data Model

### 3.1 Type Additions (src/types/index.ts)

```typescript
// FR-02: Extend FeedSort (프론트엔드 전용, 백엔드 전송 시 POPULAR로 변환)
export type FeedSortPeriod = "ALL" | "WEEKLY" | "MONTHLY";

// FR-03: Feed layout preference
export type FeedLayout = "grid" | "list";

// FR-01: Trending item (기존 SpotDetailResponse 재사용)
// 별도 타입 불필요 — SpotDetailResponse의 createdAt + viewsCount로 트렌딩 판단

// FR-04: Category curation section
export interface CategoryCurationItem {
  category: SpotCategory;
  label: string;
  spots: SpotDetailResponse[];
}
```

### 3.2 Existing Types Used

| Type | Usage |
|------|-------|
| `SpotDetailResponse` | FR-01 트렌딩, FR-04 캐러셀, FR-06 폴백 |
| `SpotCategory` | FR-04 카테고리 필터링 |
| `FeedSort` | FR-02 기존 정렬 (POPULAR/NEWEST) |
| `PaginatedResponse<T>` | API 응답 래퍼 |

---

## 4. API Specifications

### 4.1 Existing API Modifications

#### fetchFeedSpots (MODIFY)

```typescript
// 현재 시그니처
fetchFeedSpots(area?, category?, page, size, sort?, keyword?, partner?)

// 변경: createdAfter 파라미터 추가
fetchFeedSpots(area?, category?, page, size, sort?, keyword?, partner?, createdAfter?)
```

`createdAfter`는 ISO 문자열. 프론트엔드에서 `sortPeriod`에 따라 계산:
- `ALL`: `createdAfter` 미전송 (기존 동작)
- `WEEKLY`: `new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()`
- `MONTHLY`: `new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()`

Backend `/api/v2/spots` 엔드포인트가 `createdAfter` query param을 지원하지 않을 경우, 프론트엔드에서 받은 데이터를 `createdAt` 기준으로 필터링하는 폴백 적용.

#### fetchFeedSpotLines (기존 유지)

트렌딩 섹션에서 `/spotlines/popular` API를 그대로 활용. 추가 파라미터 없음.

### 4.2 New API Calls

없음. 모든 데이터는 기존 `fetchFeedSpots` + `fetchFeedSpotLines` API로 충족.
- FR-01 트렌딩: `fetchFeedSpots(undefined, undefined, 0, 10, "POPULAR")` + 프론트엔드에서 최근 7일 필터
- FR-04 카테고리 캐러셀: `fetchFeedSpots(area, category, 0, 5, "POPULAR")` 카테고리별 호출
- FR-06 빈 상태 폴백: `fetchFeedSpots(undefined, undefined, 0, 4, "POPULAR")` 전체 인기

---

## 5. UI/UX Design

### 5.1 FR-01: FeedTrendingSection

```
┌─────────────────────────────────────────────┐
│ 🔥 지금 뜨는 Spot                            │
│                                             │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│ │ S1 │ │ S2 │ │ S3 │ │ S4 │ │ S5 │  ← 수평 │
│ │    │ │    │ │    │ │    │ │    │   스크롤  │
│ │name│ │name│ │name│ │name│ │name│         │
│ └────┘ └────┘ └────┘ └────┘ └────┘         │
└─────────────────────────────────────────────┘
```

- **위치**: `FeedFilterReset` 아래, `FeedRecommendationSection` 위
- **데이터**: 최근 7일 내 생성된 Spot 중 viewsCount 상위 10개
- **UI**: 수평 스크롤 캐러셀, 카드 크기 `w-36 h-48`
- **최소 임계값**: 5개 미만이면 섹션 전체 숨김
- **캐러셀 카드**: 이미지 + 카테고리 뱃지 + title + area

### 5.2 FR-02: FeedSortDropdown 확장

```
┌──────────────────────┐
│  인기순        ▼     │
├──────────────────────┤
│  ● 인기순 (전체)     │
│  ○ 주간 인기         │
│  ○ 월간 인기         │
│  ○ 최신순            │
└──────────────────────┘
```

- **기존 옵션**: 인기순(POPULAR), 최신순(NEWEST)
- **추가 옵션**: 주간 인기(POPULAR + WEEKLY), 월간 인기(POPULAR + MONTHLY)
- **구현**: sort는 기존 `FeedSort` 유지, 별도 `sortPeriod` 상태로 기간 필터 관리
- **드롭다운 라벨**: 기간 선택 시 "주간 인기", "월간 인기"로 표시

### 5.3 FR-03: FeedLayoutToggle

```
┌─────────────────────────────────────┐
│  [Grid] [List]     인기순 ▼        │
└─────────────────────────────────────┘

Grid View (기존):          List View (신규):
┌────┐ ┌────┐             ┌─────────────────────┐
│    │ │    │             │ [IMG] Title          │
│    │ │    │             │       Area · Categ   │
│name│ │name│             │       ♡ 12  👁 340   │
└────┘ └────┘             └─────────────────────┘
┌────┐ ┌────┐             ┌─────────────────────┐
│    │ │    │             │ [IMG] Title          │
```

- **위치**: Sort 드롭다운 왼쪽 (Search + Sort 행)
- **토글 UI**: 아이콘 버튼 2개 (Grid/List), 선택 상태 배경색 구분
- **localStorage 저장**: 키 `"feed-layout"`, 값 `"grid" | "list"`, 기본값 `"grid"`
- **전환 애니메이션**: `transition-all duration-200` (깜빡임 방지)

### 5.4 FR-04: FeedCategoryCuration

```
┌─────────────────────────────────────────────┐
│ ☕ 카페                                      │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│ │ S1 │ │ S2 │ │ S3 │ │ S4 │ │ S5 │  ← 수평 │
│ └────┘ └────┘ └────┘ └────┘ └────┘   스크롤 │
│                                             │
│ 🍽️ 맛집                                     │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                │
│ │ S1 │ │ S2 │ │ S3 │ │ S4 │                │
│ └────┘ └────┘ └────┘ └────┘                │
└─────────────────────────────────────────────┘
```

- **위치**: `FeedRecommendationSection` 아래, `FeedSpotLineSection` 위
- **카테고리**: 상위 4개 — CAFE, RESTAURANT, CULTURE, ACTIVITY
- **데이터**: 각 카테고리별 `fetchFeedSpots(area, category, 0, 5, "POPULAR")` 호출
- **최소 임계값**: 카테고리당 3개 미만이면 해당 카테고리 행 숨김
- **캐러셀**: FR-01과 동일한 수평 스크롤 카드 패턴

### 5.5 FR-05: 무한스크롤 UX 개선

```
┌─────────────────────────────────────────────┐
│ [Spot Cards...]                              │
│                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │ Skeleton │ │ Skeleton │ │ Skeleton │      │
│ │          │ │          │ │          │      │
│ └──────────┘ └──────────┘ └──────────┘      │
│                                              │
│      ← IntersectionObserver trigger →        │
└─────────────────────────────────────────────┘
```

- **스켈레톤 개수**: 2개 → 3개로 증가 (현재 그리드 열 수와 매치)
- **중복 요청 방지**: 기존 `isLoading` 가드 유지 + `useRef`로 마지막 요청 파라미터 캐싱
- **스크롤 복원**: `sessionStorage`에 스크롤 위치 저장, 뒤로가기 시 복원
- **레이아웃 전환 시**: 스크롤 위치 유지 (데이터 리셋 없음)

### 5.6 FR-06: FeedEmptyFallback

```
┌─────────────────────────────────────────────┐
│                                              │
│        검색 결과가 없습니다                     │
│                                              │
│  이런 Spot은 어떠세요?                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│  │ S1 │ │ S2 │ │ S3 │ │ S4 │               │
│  └────┘ └────┘ └────┘ └────┘               │
│                                              │
│     [ 전체 보기 ]  [ 필터 초기화 ]             │
└─────────────────────────────────────────────┘
```

- **기존 `EmptyFeed` 교체**: 더 풍부한 빈 상태 UX
- **폴백 데이터**: `fetchFeedSpots(undefined, undefined, 0, 4, "POPULAR")` — 전체 인기 Spot 4개
- **버튼**: "전체 보기" (area/category 리셋), "필터 초기화" (전체 리셋)
- **메시지**: keyword 있을 때 "'{keyword}' 검색 결과가 없습니다", 없을 때 "이 지역에 등록된 Spot이 없습니다"

---

## 6. Error Handling

| Scenario | Strategy |
|----------|----------|
| 트렌딩 API 실패 | 섹션 숨김 (non-critical, catch 후 빈 배열) |
| 카테고리 캐러셀 API 실패 | 해당 카테고리 행만 숨김 |
| 빈 상태 폴백 API 실패 | 폴백 추천 없이 기존 EmptyFeed 텍스트만 표시 |
| localStorage 접근 실패 | try-catch, 기본값 "grid" 사용 |
| sortPeriod + Backend 미지원 | `createdAfter` param 무시되면 기존 POPULAR 결과 그대로 표시 (graceful degradation) |

---

## 7. Security Considerations

- 신규 API 엔드포인트 없음 — 기존 보안 정책 유지
- localStorage 접근: 레이아웃 선호도만 저장 (비민감 데이터)
- `createdAfter` 파라미터: ISO 문자열만 전송, 서버 사이드 검증 의존

---

## 8. Test Plan

| Test Case | Type | Expected |
|-----------|------|----------|
| 트렌딩 섹션 5개 이상일 때 표시 | Manual | 수평 스크롤 캐러셀 렌더링 |
| 트렌딩 섹션 5개 미만일 때 숨김 | Manual | 섹션 미렌더링 |
| 주간/월간 인기 정렬 선택 | Manual | 드롭다운 라벨 변경, 데이터 리로드 |
| 레이아웃 토글 Grid ↔ List | Manual | 레이아웃 전환, 깜빡임 없음 |
| 레이아웃 선호도 새로고침 후 유지 | Manual | localStorage에서 복원 |
| 카테고리 캐러셀 렌더링 | Manual | 4개 카테고리 수평 스크롤 |
| 무한스크롤 스켈레톤 3개 표시 | Manual | 로딩 중 SpotCardSkeleton 3개 |
| 빈 상태 폴백 추천 표시 | Manual | 인기 Spot 4개 추천 카드 |
| 필터 초기화 버튼 동작 | Manual | 전체 필터 리셋 |
| `pnpm type-check` 통과 | CI | 타입 에러 없음 |
| `pnpm lint` 통과 | CI | 린트 에러 없음 |
| `pnpm build` 통과 | CI | 빌드 성공 |

---

## 9. Clean Architecture Alignment

### 9.1 Layer Mapping

| Layer | Files | Responsibility |
|-------|-------|----------------|
| **Presentation** | FeedTrendingSection, FeedCategoryCuration, FeedLayoutToggle, FeedEmptyFallback, FeedSpotGrid (MODIFY), FeedSortDropdown (MODIFY) | UI 렌더링, 사용자 인터랙션 |
| **State** | useFeedStore.ts (MODIFY) | sortPeriod, feedLayout 상태 관리 |
| **API** | api.ts (MODIFY) | createdAfter 파라미터 추가 |
| **Types** | types/index.ts (MODIFY) | FeedSortPeriod, FeedLayout, CategoryCurationItem |

### 9.2 Dependency Rules

- 컴포넌트 → useFeedStore (단방향)
- 컴포넌트 → api.ts (데이터 로딩)
- useFeedStore ← types/index.ts (타입 참조)
- FeedPage.tsx가 모든 섹션 컴포넌트 조합 (Composition Root)

---

## 10. Coding Conventions

| Convention | Application |
|------------|-------------|
| `"use client"` | 모든 새 컴포넌트 (인터랙티브) |
| Props 인터페이스 | `FeedTrendingSectionProps`, `FeedLayoutToggleProps` 등 |
| `cn()` 유틸리티 | 조건부 클래스, 레이아웃 전환 스타일 |
| 한국어 UI 텍스트 | "지금 뜨는 Spot", "주간 인기", "검색 결과가 없습니다" 등 |
| 영어 코드 | 변수명, 타입명, 주석 모두 영어 |
| `@/*` 경로 별칭 | 모든 임포트 |
| 모바일 퍼스트 | 기본 1열 → md:2열 → lg:3-4열 |
| fire-and-forget | 트렌딩/캐러셀 API 실패 시 무시 |

---

## 11. Implementation Guide

### 11.1 Implementation Order

| # | Item | Type | Dependencies | Priority |
|---|------|------|-------------|----------|
| 1 | `FeedSortPeriod`, `FeedLayout`, `CategoryCurationItem` 타입 추가 | MODIFY types/index.ts | None | High |
| 2 | `sortPeriod`, `feedLayout` 상태 추가 | MODIFY useFeedStore.ts | #1 | High |
| 3 | `fetchFeedSpots`에 `createdAfter` 파라미터 추가 | MODIFY api.ts | None | High |
| 4 | `FeedSortDropdown` 주간/월간 옵션 추가 | MODIFY FeedSortDropdown.tsx | #1, #2 | High |
| 5 | `FeedLayoutToggle` 컴포넌트 생성 | NEW | #2 | Medium |
| 6 | `FeedSpotGrid` 레이아웃 토글 + 스켈레톤 3개 적용 | MODIFY FeedSpotGrid.tsx | #5 | Medium |
| 7 | `FeedTrendingSection` 컴포넌트 생성 | NEW | #3 | High |
| 8 | `FeedCategoryCuration` 컴포넌트 생성 | NEW | #3 | Medium |
| 9 | `FeedEmptyFallback` 컴포넌트 생성 | NEW | #3 | Low |
| 10 | `FeedPage` 통합 — 새 컴포넌트 배치, sortPeriod 연동 | MODIFY FeedPage.tsx | #4~#9 | High |
| 11 | `FeedSkeleton` 스켈레톤 업데이트 | MODIFY FeedSkeleton.tsx | None | Low |

### 11.2 File Summary

| File | Action | Changes |
|------|--------|---------|
| `src/types/index.ts` | MODIFY | `FeedSortPeriod`, `FeedLayout`, `CategoryCurationItem` 타입 추가 |
| `src/store/useFeedStore.ts` | MODIFY | `sortPeriod`, `feedLayout` 상태 + setter 추가, `resetFilters`에 포함 |
| `src/lib/api.ts` | MODIFY | `fetchFeedSpots` 시그니처에 `createdAfter?: string` 추가 |
| `src/components/feed/FeedSortDropdown.tsx` | MODIFY | 4개 옵션으로 확장, `sortPeriod` 연동 |
| `src/components/feed/FeedLayoutToggle.tsx` | NEW | Grid/List 토글 버튼, localStorage 연동 |
| `src/components/feed/FeedSpotGrid.tsx` | MODIFY | `feedLayout` prop으로 grid/list 렌더링 분기, 스켈레톤 3개 |
| `src/components/feed/FeedTrendingSection.tsx` | NEW | 최근 7일 인기 Spot 수평 캐러셀 |
| `src/components/feed/FeedCategoryCuration.tsx` | NEW | 카테고리별 인기 Spot 캐러셀 |
| `src/components/feed/FeedEmptyFallback.tsx` | NEW | 빈 상태 폴백 추천 + 리셋 버튼 |
| `src/components/feed/FeedPage.tsx` | MODIFY | 새 컴포넌트 통합, sortPeriod → createdAfter 변환 |
| `src/components/feed/FeedSkeleton.tsx` | MODIFY | 트렌딩 스켈레톤 행 추가 |

### 11.3 Estimated Scope

- **NEW**: 4 files (~400 LOC)
- **MODIFY**: 7 files (~200 LOC changes)
- **Total**: ~600 LOC

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-18 | Initial design | Claude |
