# explore-map-view Design Document

> **Summary**: 카카오맵 SDK 기반 인터랙티브 지도 탐색 페이지 (`/explore`) 상세 설계
>
> **Project**: front-spotLine (Next.js 16)
> **Version**: 0.1
> **Author**: Claude
> **Date**: 2026-04-13
> **Status**: Draft
> **Planning Doc**: [explore-map-view.plan.md](../../01-plan/features/explore-map-view.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 카카오맵 SDK를 Next.js 16 App Router 환경에서 안정적으로 통합
- 모바일 퍼스트 지도+하단패널 레이아웃으로 직관적 공간 탐색 제공
- 기존 피드 컴포넌트(FeedCategoryChips, FeedAreaTabs)를 재사용하여 일관된 UX 유지
- fetchFeedSpots API를 재사용하여 추가 백엔드 작업 없이 구현

### 1.2 Design Principles

- **컴포넌트 재사용**: 기존 피드 필터 컴포넌트를 그대로 활용하여 코드 중복 방지
- **관심사 분리**: 지도 상태(useExploreStore)와 피드 상태(useFeedStore)를 독립 유지
- **점진적 향상**: SDK 로드 실패 시에도 리스트 폴백으로 기본 기능 보장
- **성능 우선**: SDK 동적 로드, 마커 debounce, 불필요한 리렌더 방지

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│ src/app/explore/page.tsx (서버 컴포넌트)                 │
│   └── <ExplorePage />                                   │
│         ┌──────────────────────────────────────────┐    │
│         │ ExplorePage.tsx (클라이언트 컴포넌트)      │    │
│         │  ├── FeedAreaTabs (재사용)                │    │
│         │  ├── FeedCategoryChips (재사용)           │    │
│         │  ├── ExploreMap                          │    │
│         │  │    ├── ExploreMarker (N개)             │    │
│         │  │    └── ExploreSpotPreview (선택 시)    │    │
│         │  ├── ExploreLocationButton               │    │
│         │  └── ExploreBottomPanel                  │    │
│         └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
1. 페이지 진입
   → useExploreStore 초기화 (center: 성수, zoom: 15)
   → fetchFeedSpots(area, category) 호출
   → spots 배열 → ExploreMap 마커 렌더

2. 필터 변경 (카테고리/지역)
   → useExploreStore 업데이트
   → fetchFeedSpots 재호출 (새 필터)
   → spots 교체 → 마커 리렌더
   → 지역 변경 시 center 이동

3. 마커 클릭
   → useExploreStore.setSelectedSpot(spot)
   → CustomOverlayMap으로 미리보기 표시

4. 현재 위치 버튼
   → useGeolocation().requestLocation()
   → center를 사용자 좌표로 이동

5. 지도 드래그/줌
   → debounce(300ms) → bounds 변경 감지
   → fetchFeedSpots 재호출 (선택적, FR-10)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| ExplorePage | useExploreStore, fetchFeedSpots | 상태 관리 + 데이터 조회 |
| ExploreMap | react-kakao-maps-sdk, useExploreStore | 카카오맵 렌더링 |
| ExploreMarker | CATEGORY_COLORS 상수 | 카테고리별 마커 색상 |
| ExploreSpotPreview | SpotDetailResponse 타입 | Spot 미리보기 카드 |
| ExploreBottomPanel | useExploreStore (spots) | 하단 리스트 |
| ExploreLocationButton | useGeolocation 훅 | 현재 위치 이동 |

---

## 3. Data Model

### 3.1 Store State (useExploreStore)

```typescript
interface ExploreState {
  // 지도 상태
  center: { lat: number; lng: number };
  zoom: number;

  // 필터
  selectedArea: string | null;
  selectedCategory: SpotCategory | null;

  // 데이터
  spots: SpotDetailResponse[];
  isLoading: boolean;

  // 선택 상태
  selectedSpot: SpotDetailResponse | null;

  // 하단 패널
  isPanelExpanded: boolean;

  // Actions
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  setSelectedArea: (area: string | null) => void;
  setSelectedCategory: (category: SpotCategory | null) => void;
  setSpots: (spots: SpotDetailResponse[]) => void;
  setIsLoading: (loading: boolean) => void;
  setSelectedSpot: (spot: SpotDetailResponse | null) => void;
  setIsPanelExpanded: (expanded: boolean) => void;
  clearAll: () => void;
}
```

### 3.2 기존 타입 재사용

- `SpotDetailResponse` — latitude, longitude, category, title, media, crewNote, slug, area 포함 (추가 타입 불필요)
- `SpotCategory` — 10개 카테고리 리터럴 유니온
- `CityInfo` — CITIES 상수에서 area 좌표 매핑

### 3.3 Map Constants

```typescript
// src/constants/explore.ts

export const DEFAULT_CENTER = { lat: 37.5447, lng: 127.0560 }; // 성수
export const DEFAULT_ZOOM = 15;

export const AREA_CENTERS: Record<string, { lat: number; lng: number }> = {
  성수: { lat: 37.5447, lng: 127.0560 },
  을지로: { lat: 37.5660, lng: 126.9910 },
  연남: { lat: 37.5660, lng: 126.9230 },
  홍대: { lat: 37.5563, lng: 126.9236 },
  이태원: { lat: 37.5345, lng: 126.9946 },
  한남: { lat: 37.5340, lng: 127.0000 },
  종로: { lat: 37.5720, lng: 126.9794 },
};

export const CATEGORY_COLORS: Record<SpotCategory, string> = {
  cafe: "#f59e0b",       // amber
  restaurant: "#ef4444", // red
  bar: "#8b5cf6",        // violet
  nature: "#22c55e",     // green
  culture: "#6366f1",    // indigo
  exhibition: "#a855f7", // purple
  walk: "#14b8a6",       // teal
  activity: "#f97316",   // orange
  shopping: "#06b6d4",   // cyan
  other: "#6b7280",      // gray
};
```

---

## 4. API Specification

### 4.1 기존 API 재사용

신규 API 엔드포인트 없음. 기존 `fetchFeedSpots` 재사용:

```typescript
fetchFeedSpots(
  area?: string,      // "성수", "을지로" 등
  category?: string,  // "cafe", "restaurant" 등
  page?: number,      // 0-based, 기본 0
  size?: number,      // 기본 20, 지도용 100으로 조정
  sort?: string,
  keyword?: string
): Promise<PaginatedResponse<SpotDetailResponse>>
```

### 4.2 지도용 호출 전략

| 시점 | area | category | size | 비고 |
|------|------|----------|------|------|
| 초기 로드 | 성수 (기본) | null (전체) | 100 | 첫 화면 |
| 지역 필터 | 선택 지역 | 현재 카테고리 | 100 | center 이동 동반 |
| 카테고리 필터 | 현재 지역 | 선택 카테고리 | 100 | 마커만 필터링 |
| 지도 이동 (FR-10) | — | — | — | Phase 2에서 bounds 기반 조회 추가 |

> **Note**: 현재 API가 bounds(위경도 범위) 필터를 지원하지 않으므로, FR-10은 클라이언트 사이드 필터링으로 우선 구현. 지도에 표시된 spots 중 현재 bounds 안에 있는 것만 하단 패널에 표시.

---

## 5. UI/UX Design

### 5.1 Screen Layout (모바일)

```
┌──────────────────────────────┐
│  ◀  탐색       피드  탐색     │ ← 헤더/네비게이션
├──────────────────────────────┤
│ 전체 │ 성수 │ 을지로 │ 연남..│ ← FeedAreaTabs (재사용)
├──────────────────────────────┤
│ 전체 🏪카페 🍽맛집 🎭문화.. │ ← FeedCategoryChips (재사용)
├──────────────────────────────┤
│                              │
│         카카오맵              │
│    📍  📍                    │ ← ExploreMap + ExploreMarker
│       📍   📍               │
│          📍                  │
│                     [📌]     │ ← ExploreLocationButton
│                              │
├──── ── ── ── ── ── ── ── ──┤ ← 드래그 핸들
│  ┌──────┐ ┌──────┐          │
│  │ Spot │ │ Spot │  ...     │ ← ExploreBottomPanel
│  │ Card │ │ Card │          │   (가로 스크롤 또는 리스트)
│  └──────┘ └──────┘          │
└──────────────────────────────┘
```

### 5.2 마커 클릭 시 미리보기 (ExploreSpotPreview)

```
┌──────────────────────────────┐
│  ┌─────┐                     │
│  │ 사진 │ 카페명              │
│  │     │ 카테고리 · 성수      │
│  │     │ "크루노트 한줄..."   │
│  └─────┘        [상세보기 >] │
└──────────────────────────────┘
       ▼ (말풍선 꼬리)
       📍
```

### 5.3 User Flow

```
/explore 진입
  → 성수 중심 지도 표시 + 전체 Spot 마커
  → [지역탭 클릭] → 해당 지역으로 이동 + Spot 재조회
  → [카테고리 클릭] → 해당 카테고리 마커만 표시
  → [마커 클릭] → 미리보기 카드 팝업
  → [상세보기 클릭] → /spot/[slug] 페이지 이동
  → [위치 버튼] → 현재 위치로 지도 이동
  → [하단 패널 Spot 클릭] → 해당 마커로 이동 + 미리보기 표시
```

### 5.4 Component List

| Component | Location | Responsibility | FR |
|-----------|----------|----------------|----|
| ExplorePage | `src/components/explore/ExplorePage.tsx` | 메인 레이아웃, 데이터 fetch, 상태 연결 | All |
| ExploreMap | `src/components/explore/ExploreMap.tsx` | 카카오맵 Map 컴포넌트 래퍼 | FR-01 |
| ExploreMarker | `src/components/explore/ExploreMarker.tsx` | 개별 Spot 마커 + 색상 | FR-02, FR-03 |
| ExploreSpotPreview | `src/components/explore/ExploreSpotPreview.tsx` | 마커 클릭 미리보기 오버레이 | FR-04, FR-05 |
| ExploreBottomPanel | `src/components/explore/ExploreBottomPanel.tsx` | 하단 Spot 리스트 패널 | FR-09 |
| ExploreLocationButton | `src/components/explore/ExploreLocationButton.tsx` | 현재 위치 FAB 버튼 | FR-08 |
| FeedAreaTabs | `src/components/feed/FeedAreaTabs.tsx` | 지역 필터 (재사용) | FR-07 |
| FeedCategoryChips | `src/components/feed/FeedCategoryChips.tsx` | 카테고리 필터 (재사용) | FR-06 |

---

## 6. Error Handling

### 6.1 에러 시나리오

| 시나리오 | 원인 | 처리 | UX |
|----------|------|------|-----|
| SDK 로드 실패 | 네트워크 오류, API 키 무효 | 에러 메시지 + 리스트 폴백 | "지도를 불러올 수 없습니다" 토스트 |
| API 호출 실패 | 서버 다운, 타임아웃 | 재시도 버튼 표시 | "Spot을 불러올 수 없습니다" |
| 위치 권한 거부 | 사용자 거부 | 기본 중심(성수) 유지 | "위치 권한이 필요합니다" 안내 |
| Spot 없음 | 필터 결과 없음 | 빈 상태 메시지 | "이 지역에 등록된 Spot이 없습니다" |

### 6.2 에러 처리 패턴

```typescript
// fetchFeedSpots 호출 시 try-catch
try {
  const result = await fetchFeedSpots(area, category, 0, 100);
  setSpots(result.content);
} catch {
  // fetchFeedSpots 내부에서 이미 handleApiError 처리됨
  // UI에서 빈 spots + 에러 메시지 표시
  setSpots([]);
}
```

---

## 7. Security Considerations

- [x] 카카오맵 API 키는 `NEXT_PUBLIC_` 접두사로 클라이언트 노출 (공개 키, 도메인 제한으로 보호)
- [x] 사용자 위치 정보는 클라이언트에서만 사용, 서버 전송 없음
- [x] XSS: crewNote 등 사용자 텍스트는 React의 기본 이스케이프 활용
- [x] API 호출: 기존 fetchFeedSpots 사용 (인증 불필요, 공개 데이터)

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Method |
|------|--------|--------|
| 수동 테스트 | 지도 렌더링, 마커 표시 | 브라우저 확인 |
| 수동 테스트 | 필터 동작 | 카테고리/지역 클릭 |
| 수동 테스트 | 미리보기 카드 | 마커 클릭 |
| 수동 테스트 | 현재 위치 | 모바일 브라우저 |
| 빌드 검증 | TypeScript, ESLint | `pnpm type-check && pnpm lint` |

### 8.2 Test Cases

- [ ] 지도가 성수 중심으로 정상 렌더링된다
- [ ] Spot 마커가 올바른 위치에 표시된다
- [ ] 카테고리별 마커 색상이 구분된다
- [ ] 마커 클릭 시 미리보기 카드가 나타난다
- [ ] 미리보기에서 상세보기 클릭 시 `/spot/[slug]`로 이동한다
- [ ] 지역 탭 클릭 시 해당 지역으로 지도가 이동하고 Spot이 갱신된다
- [ ] 카테고리 칩 클릭 시 해당 카테고리 마커만 표시된다
- [ ] 현재 위치 버튼 클릭 시 사용자 위치로 이동한다
- [ ] 하단 패널에 현재 Spot 리스트가 표시된다
- [ ] SDK 로드 실패 시 에러 메시지가 표시된다

---

## 9. Clean Architecture

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | 지도 UI, 마커, 미리보기, 패널 | `src/components/explore/`, `src/app/explore/` |
| **Application** | 탐색 상태 관리 | `src/store/useExploreStore.ts` |
| **Domain** | Spot 타입, 카테고리 타입 | `src/types/index.ts` |
| **Infrastructure** | API 호출, SDK 로드 | `src/lib/api.ts`, `src/lib/kakao-map.ts` |

### 9.2 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| ExplorePage | Presentation | `src/components/explore/ExplorePage.tsx` |
| ExploreMap | Presentation | `src/components/explore/ExploreMap.tsx` |
| ExploreMarker | Presentation | `src/components/explore/ExploreMarker.tsx` |
| ExploreSpotPreview | Presentation | `src/components/explore/ExploreSpotPreview.tsx` |
| ExploreBottomPanel | Presentation | `src/components/explore/ExploreBottomPanel.tsx` |
| ExploreLocationButton | Presentation | `src/components/explore/ExploreLocationButton.tsx` |
| useExploreStore | Application | `src/store/useExploreStore.ts` |
| CATEGORY_COLORS, AREA_CENTERS | Domain | `src/constants/explore.ts` |
| kakao-map SDK loader | Infrastructure | `src/lib/kakao-map.ts` |
| fetchFeedSpots | Infrastructure | `src/lib/api.ts` (기존) |

---

## 10. Coding Convention Reference

### 10.1 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| Component naming | `Explore` 접두사 + PascalCase (`ExploreMap`, `ExploreMarker`) |
| File organization | `src/components/explore/` 디렉토리에 집중 배치 |
| State management | 별도 `useExploreStore` Zustand 스토어 (단일 스토어 원칙은 유지하되, 지도 도메인 분리) |
| Directive | 모든 Explore 컴포넌트에 `"use client"` 필수 |
| Styling | Tailwind CSS 4, `cn()` 유틸리티, 모바일 퍼스트 |
| 지도 라이브러리 | `react-kakao-maps-sdk`의 `Map`, `MapMarker`, `CustomOverlayMap` 사용 |
| 상수 | `src/constants/explore.ts`에 지도 관련 상수 집중 |

### 10.2 Import Order (이 피처)

```typescript
"use client";

// 1. React/Next.js
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// 2. 외부 라이브러리
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";

// 3. 내부 모듈
import { useExploreStore } from "@/store/useExploreStore";
import { fetchFeedSpots } from "@/lib/api";
import { CATEGORY_COLORS, DEFAULT_CENTER } from "@/constants/explore";
import { cn } from "@/lib/utils";

// 4. 타입
import type { SpotDetailResponse, SpotCategory } from "@/types";
```

---

## 11. Implementation Guide

### 11.1 File Structure

```
src/
├── app/explore/
│   └── page.tsx                    — 서버 컴포넌트 래퍼 (NEW)
├── components/explore/
│   ├── ExplorePage.tsx             — 메인 클라이언트 컴포넌트 (NEW)
│   ├── ExploreMap.tsx              — 카카오맵 래퍼 (NEW)
│   ├── ExploreMarker.tsx           — Spot 마커 + 색상 (NEW)
│   ├── ExploreSpotPreview.tsx      — 마커 클릭 미리보기 (NEW)
│   ├── ExploreBottomPanel.tsx      — 하단 Spot 리스트 패널 (NEW)
│   └── ExploreLocationButton.tsx   — 현재 위치 버튼 (NEW)
├── store/
│   └── useExploreStore.ts          — 지도 상태 Zustand 스토어 (NEW)
├── constants/
│   └── explore.ts                  — 지도 상수 (좌표, 색상) (NEW)
└── lib/
    └── kakao-map.ts                — SDK 로드 유틸리티 (NEW)
```

### 11.2 Implementation Order

1. [ ] **인프라 레이어** — `react-kakao-maps-sdk` 설치, `src/lib/kakao-map.ts` SDK 로더
2. [ ] **상수 정의** — `src/constants/explore.ts` (DEFAULT_CENTER, AREA_CENTERS, CATEGORY_COLORS)
3. [ ] **스토어** — `src/store/useExploreStore.ts` (center, zoom, filters, spots, selectedSpot)
4. [ ] **지도 컴포넌트** — `ExploreMap.tsx` (카카오맵 렌더링)
5. [ ] **마커 컴포넌트** — `ExploreMarker.tsx` (카테고리 색상 마커)
6. [ ] **미리보기 컴포넌트** — `ExploreSpotPreview.tsx` (CustomOverlayMap)
7. [ ] **위치 버튼** — `ExploreLocationButton.tsx` (useGeolocation 연동)
8. [ ] **하단 패널** — `ExploreBottomPanel.tsx` (Spot 리스트)
9. [ ] **메인 페이지** — `ExplorePage.tsx` (모든 컴포넌트 통합 + fetchFeedSpots 연동)
10. [ ] **라우트** — `src/app/explore/page.tsx` (서버 컴포넌트 래퍼)
11. [ ] **검증** — `pnpm type-check && pnpm lint && pnpm build`

### 11.3 Key Implementation Details

#### SDK 로드 (kakao-map.ts)

```typescript
// react-kakao-maps-sdk의 Script 컴포넌트 또는 useKakaoLoader 사용
// NEXT_PUBLIC_KAKAO_MAP_API_KEY 환경변수 참조
// autoload: false로 설정하여 필요 시점에 로드
```

#### 마커 색상 (ExploreMarker)

```typescript
// MapMarker의 image prop으로 커스텀 마커 이미지 생성
// SVG data URI로 카테고리 색상 반영한 원형 마커 생성
const markerImage = {
  src: `data:image/svg+xml,...`, // 카테고리 색상 원형 SVG
  size: { width: 28, height: 28 },
};
```

#### 하단 패널 드래그 (ExploreBottomPanel)

```typescript
// CSS + 터치 이벤트로 구현
// 최소 높이: 120px (카드 1줄), 최대: 화면 60%
// 드래그 핸들 바 표시
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-13 | Initial draft | Claude |
