# User SpotLine Experience — Design Document

> **Feature**: user-spotline-experience
> **Plan**: `docs/01-plan/features/user-spotline-experience.plan.md`
> **Date**: 2026-04-05
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | SpotLine 생성이 Admin 전용이라 유저 UGC가 0이고, 콘텐츠 확장이 크루에 의존. Fork/공유 플로우 부재로 "경험 진화" 루프가 끊어져 있다. |
| **Solution** | 유저용 SpotLine Builder + Fork + Share 기능을 front-spotLine에 구현. 기존 72개 Backend API를 그대로 활용하여 Frontend만 추가. |
| **Function/UX Effect** | Builder에서 Spot 검색+DnD 정렬+메타입력 → 저장. 타인 SpotLine을 Fork하여 Spot 교체 후 새 SpotLine 탄생. 공유 시트로 즉시 배포. |
| **Core Value** | 유저 주도 콘텐츠 생산 → SpotLine Fork 체인으로 콘텐츠 기하급수 증식 → "경험의 진화" 차별화 달성. |

---

## 1. Architecture Overview

### 1.1 시스템 경계

```
┌─────────────────────────────────────────────────────────────┐
│ front-spotLine (Next.js 16)                                  │
│                                                              │
│  [New Pages]                   [Modified Components]         │
│  /create-spotline              SpotLineBottomBar             │
│  /spotline/[slug]/edit         BottomNavBar                  │
│                                FeedPage (CTA 추가)           │
│  [New Components]              SpotBottomBar (CTA 추가)      │
│  spotline-builder/*                                          │
│  ShareSheet                    [New Store]                   │
│  AuthGuard                     useSpotLineBuilderStore       │
│                                                              │
├──────────────────────────┬──────────────────────────────────┤
│        API Layer         │  lib/api.ts (함수 4개 추가)       │
│  createSpotLine()        │  updateSpotLine()                │
│  deleteSpotLine()        │  searchSpots()                   │
└──────────────────────────┴──────────────────────────────────┘
                           │
                    ▼ HTTP (apiV2)
┌─────────────────────────────────────────────────────────────┐
│ springboot-spotLine-backend (변경 없음)                       │
│  POST   /api/v2/spotlines                                    │
│  PUT    /api/v2/spotlines/{slug}                             │
│  DELETE /api/v2/spotlines/{slug}                             │
│  GET    /api/v2/spots?area=&category=&keyword=               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 변경 범위 요약

| 영역 | 신규 | 수정 | 삭제 |
|------|------|------|------|
| Pages | 2 (`create-spotline`, `spotline/[slug]/edit`) | 0 | 0 |
| Components | 10 | 4 | 0 |
| Store | 1 (`useSpotLineBuilderStore`) | 0 | 0 |
| API functions | 4 | 0 | 0 |
| Lib utils | 2 (`share.ts`, `geo.ts`) | 0 | 0 |
| Types | 3 interfaces | 0 | 0 |
| Backend | 0 | 0 | 0 |

---

## 2. Data Design

### 2.1 신규 TypeScript Types

```typescript
// src/types/index.ts에 추가

/** Builder에서 관리하는 개별 Spot 상태 */
interface SpotLineBuilderSpot {
  spot: SpotDetailResponse;
  order: number;
  suggestedTime: string | null;    // "14:00"
  stayDuration: number | null;     // 분 단위
  transitionNote: string | null;   // "골목길로 5분"
  walkingTimeToNext: number | null; // 분 (자동 계산)
  distanceToNext: number | null;   // 미터 (자동 계산)
}

/** Builder 전체 상태 */
interface SpotLineBuilderState {
  spots: SpotLineBuilderSpot[];
  title: string;
  description: string;
  theme: SpotLineTheme | null;
  area: string;                    // Spot들에서 자동 추론
  parentSpotLineId: string | null; // Fork 시 원본 ID
  parentInfo: {
    title: string;
    creatorName: string;
    slug: string;
  } | null;
}

/** Spot 검색 파라미터 */
interface SpotSearchParams {
  keyword?: string;
  area?: string;
  category?: SpotCategory;
  page?: number;
  size?: number;
}
```

### 2.2 API Request/Response 매핑

Backend DTO와 Frontend 타입 매핑:

| Frontend 함수 | Backend Endpoint | Request Body | Response |
|---------------|-----------------|--------------|----------|
| `createSpotLine(req)` | `POST /api/v2/spotlines` | `{ title, theme, area, description?, parentSpotLineId?, spots: [{ spotId, order, suggestedTime?, stayDuration?, walkingTimeToNext?, distanceToNext?, transitionNote? }] }` | `SpotLineDetailResponse` |
| `updateSpotLine(slug, req)` | `PUT /api/v2/spotlines/{slug}` | `{ title?, theme?, area?, description?, spots?: [...] }` | `SpotLineDetailResponse` |
| `deleteSpotLine(slug)` | `DELETE /api/v2/spotlines/{slug}` | - | `void` |
| `searchSpots(params)` | `GET /api/v2/spots` | Query: `keyword, area, category, page, size` | `PaginatedResponse<SpotDetailResponse>` |

**주의**: `updateSpotLine`에서 `spots`를 보내면 기존 전체 교체(orphanRemoval). 부분 수정 불가.

### 2.3 Zustand Store: `useSpotLineBuilderStore`

```typescript
// src/store/useSpotLineBuilderStore.ts

interface SpotLineBuilderStore {
  // State
  spots: SpotLineBuilderSpot[];
  title: string;
  description: string;
  theme: SpotLineTheme | null;
  area: string;
  parentSpotLineId: string | null;
  parentInfo: { title: string; creatorName: string; slug: string } | null;
  isDirty: boolean;
  isSaving: boolean;

  // Actions — Spot 관리
  addSpot: (spot: SpotDetailResponse) => void;
  removeSpot: (spotId: string) => void;
  reorderSpots: (activeId: string, overId: string) => void;
  updateSpotMeta: (spotId: string, meta: Partial<Pick<SpotLineBuilderSpot, 'suggestedTime' | 'stayDuration' | 'transitionNote'>>) => void;

  // Actions — 메타 정보
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setTheme: (theme: SpotLineTheme | null) => void;

  // Actions — Fork
  initFromFork: (spotLine: SpotLineDetailResponse) => void;
  initFromEdit: (spotLine: SpotLineDetailResponse) => void;

  // Actions — 유틸
  recalculateDistances: () => void;  // Haversine 재계산
  inferArea: () => void;             // 최빈 Spot area
  clearAll: () => void;

  // Computed (get)
  canSave: () => boolean;  // title 존재 + spots >= 2 + theme 존재
  toCreateRequest: () => CreateSpotLineRequest;
  toUpdateRequest: () => UpdateSpotLineRequest;
}
```

**Store 동작 상세**:

| Action | 동작 | 부수 효과 |
|--------|------|-----------|
| `addSpot` | spots 배열 끝에 추가, order 자동 부여 | `recalculateDistances()`, `inferArea()`, 최대 10개 제한 |
| `removeSpot` | spotId로 필터, order 재정렬 | `recalculateDistances()`, `inferArea()` |
| `reorderSpots` | @dnd-kit `arrayMove` 적용, order 재정렬 | `recalculateDistances()` |
| `initFromFork` | 원본 SpotLine의 spots 전체 로딩 + parentInfo 세팅 | area/title 복사, `parentSpotLineId` 설정 |
| `initFromEdit` | 기존 SpotLine 데이터 전체 로딩 (수정 모드) | parentInfo는 null 유지 |
| `recalculateDistances` | 인접 Spot 좌표로 Haversine 거리 + 도보 시간 계산 | 평균 도보 속도 4km/h 적용 |
| `inferArea` | spots의 area 중 최빈값을 area로 설정 | spots 비었으면 "" |

---

## 3. Component Design

### 3.1 신규 컴포넌트 목록

| # | 컴포넌트 | 경로 | 타입 | 역할 |
|---|---------|------|------|------|
| 1 | `SpotLineBuilder` | `components/spotline-builder/SpotLineBuilder.tsx` | Client | Builder 메인 레이아웃 (2패널/탭) |
| 2 | `SpotSearchPanel` | `components/spotline-builder/SpotSearchPanel.tsx` | Client | Spot 검색 + 필터 + 결과 리스트 |
| 3 | `SpotSearchCard` | `components/spotline-builder/SpotSearchCard.tsx` | Client | 검색 결과 개별 Spot 카드 |
| 4 | `SelectedSpotList` | `components/spotline-builder/SelectedSpotList.tsx` | Client | 선택된 Spot DnD 리스트 |
| 5 | `SelectedSpotCard` | `components/spotline-builder/SelectedSpotCard.tsx` | Client | 선택된 개별 Spot (DnD 핸들 + 메타) |
| 6 | `SpotLineMetaForm` | `components/spotline-builder/SpotLineMetaForm.tsx` | Client | 제목, 테마, 설명 입력 폼 |
| 7 | `ForkBadge` | `components/spotline-builder/ForkBadge.tsx` | Client | "OOO에서 영감" 배지 |
| 8 | `ShareSheet` | `components/spotline/ShareSheet.tsx` | Client | 공유 바텀시트 |
| 9 | `AuthGuard` | `components/common/AuthGuard.tsx` | Client | 인증 래퍼 (미인증 → LoginBottomSheet) |
| 10 | `FloatingCreateButton` | `components/common/FloatingCreateButton.tsx` | Client | FAB "만들기" 버튼 |

### 3.2 수정 컴포넌트

| # | 컴포넌트 | 변경 내용 |
|---|---------|----------|
| 1 | `SpotLineBottomBar` | "공유" + "내 버전 만들기" 버튼 추가 |
| 2 | `SpotBottomBar` | "이 Spot으로 코스 만들기" 버튼 추가 |
| 3 | `BottomNavBar` | FloatingCreateButton과 공존 처리 |
| 4 | `FeedPage` | "나만의 SpotLine 만들기" CTA 카드 추가 |

### 3.3 컴포넌트 트리

```
/create-spotline (Page — Client, AuthGuard)
  └── SpotLineBuilder
      ├── [Desktop: 2-column] / [Mobile: Tab switching]
      │
      ├── SpotSearchPanel (좌측 / Tab 1)
      │   ├── <input> 검색 + debounce 300ms
      │   ├── AreaFilter dropdown (지역)
      │   ├── CategoryFilter chips (카테고리)
      │   └── SpotSearchCard[] (무한스크롤)
      │       ├── 이미지 + 제목 + area + category badge
      │       └── [+] 추가 / [추가됨] disabled
      │
      ├── SelectedSpotList (우측 / Tab 2)
      │   ├── DndContext (@dnd-kit/core)
      │   │   └── SortableContext
      │   │       └── SelectedSpotCard[] (SortableItem)
      │   │           ├── ☰ DnD 핸들
      │   │           ├── Spot 정보 (이미지, 제목, area)
      │   │           ├── stayDuration / suggestedTime 입력
      │   │           ├── ↕ 거리·도보시간 (자동)
      │   │           └── ✕ 제거 버튼
      │   └── 빈 상태: "Spot을 검색해서 추가해보세요"
      │
      ├── ForkBadge (fork 모드일 때만)
      │   └── "🔀 {creatorName}의 '{title}'에서 영감을 받았어요"
      │
      ├── SpotLineMetaForm
      │   ├── 제목 input (필수, placeholder: "나만의 코스 이름")
      │   ├── 테마 select (SpotLineTheme)
      │   ├── 지역 display (자동 추론, 수정 가능)
      │   └── 설명 textarea (선택)
      │
      └── 하단 고정 바
          ├── Spot 카운터 "3/10곳"
          └── [SpotLine 저장] 버튼 (canSave 검증)

/spotline/[slug]/edit (Page — Client, AuthGuard + 소유자 검증)
  └── SpotLineBuilder (initFromEdit 모드)
      └── (동일 구조, 저장 시 PUT 호출)

/spotline/[slug] (기존 Page — 수정)
  └── SpotLineBottomBar (수정)
      ├── ❤️ 좋아요
      ├── 🔖 저장
      ├── 📤 공유 → ShareSheet
      │   ├── 링크 복사 (navigator.clipboard)
      │   ├── 카카오톡 공유 (Kakao.Share.sendDefault)
      │   └── 네이티브 공유 (navigator.share)
      ├── 🔀 내 버전 → /create-spotline?fork={slug}
      └── 📋 일정 → ReplicateSpotLineSheet (기존)
```

### 3.4 주요 컴포넌트 상세

#### SpotLineBuilder.tsx

```
Props: { mode: "create" | "fork" | "edit"; forkSlug?: string; editSlug?: string }

Responsibilities:
- 데스크톱(md+): 2-column grid (좌: SpotSearchPanel, 우: SelectedSpotList + MetaForm)
- 모바일(<md): 탭 전환 ("Spot 검색" / "내 코스 N")
- 모드별 초기화:
  - create: store.clearAll()
  - fork: fetch spotLine by forkSlug → store.initFromFork()
  - edit: fetch spotLine by editSlug → store.initFromEdit()
- 저장 핸들러: create/fork → createSpotLine(), edit → updateSpotLine()
- 저장 후 router.push(`/spotline/${newSlug}`)

Layout (Desktop):
┌────────────────────┬──────────────────────┐
│  SpotSearchPanel   │  ForkBadge           │
│  (w-[400px])       │  SelectedSpotList    │
│                    │  SpotLineMetaForm    │
│                    │  [저장 바]            │
└────────────────────┴──────────────────────┘

Layout (Mobile):
┌────────────────────────┐
│  [Spot 검색] [내 코스 3] │  ← 탭
│  ─────────────────────  │
│  (active tab content)   │
│                         │
│  [SpotLine 저장 (3곳)]  │  ← 하단 고정
└─────────────────────────┘
```

#### SpotSearchPanel.tsx

```
Props: none (store에서 spots 상태 사용)

State (로컬):
- keyword: string (debounce 300ms)
- area: string | null
- category: SpotCategory | null
- searchResults: SpotDetailResponse[]
- page: number
- hasMore: boolean
- isLoading: boolean

Behavior:
- keyword/area/category 변경 시 page=0으로 리셋, searchSpots() 호출
- 무한 스크롤: IntersectionObserver로 하단 감지 → nextPage
- 이미 추가된 Spot은 카드에서 "추가됨" 표시 + 클릭 비활성
- 검색 API: GET /api/v2/spots?keyword=&area=&category=&page=&size=20

Area Options (드롭다운):
- 전체, 성수, 연남/연희, 한남/이태원, 홍대/합정, 망원/상수, 을지로/종로, 여의도, 강남/신사, 잠실/송파, 기타

Category Chips:
- SpotCategory 전체 값 (getCategoryLabel 활용)
```

#### SelectedSpotCard.tsx

```
Props: { builderSpot: SpotLineBuilderSpot; index: number; isLast: boolean }

Structure:
┌──────────────────────────────────────────┐
│  ☰  ① 카페 어니언                    ✕   │
│     📍 성수 · ☕ 카페                      │
│     ⏱ [60]분  🕐 [14:00]                 │
│     🗒 [골목길 인테리어가 멋진 곳]          │
├──────────────────────────────────────────┤
│  ↕ 도보 5분 · 350m                        │  ← isLast가 아닐 때만
└──────────────────────────────────────────┘

DnD:
- @dnd-kit/sortable useSortable hook
- 드래그 핸들: ☰ 아이콘 (GripVertical)
- 터치: PointerSensor (activationConstraint: distance: 8)
```

#### ShareSheet.tsx

```
Props: { isOpen: boolean; onClose: () => void; spotLine: SpotLineDetailResponse }

Layout: BottomSheet (기존 패턴 — createPortal + backdrop)

Options:
1. 📋 링크 복사 → navigator.clipboard.writeText(url) → toast "링크가 복사되었어요"
2. 💬 카카오톡 공유 → Kakao.Share.sendDefault({ objectType: "feed", content: {...} })
3. 📤 공유하기 → navigator.share({ title, text, url }) (지원 시)

URL: https://spotline.kr/spotline/{slug}

카카오톡 공유 데이터:
- objectType: "feed"
- content.title: spotLine.title
- content.description: spotLine.description || `${spotLine.area} · ${spotLine.spots.length}곳`
- content.imageUrl: 첫 Spot 이미지
- content.link.webUrl: URL
- content.link.mobileWebUrl: URL
```

#### AuthGuard.tsx

```
Props: { children: ReactNode; message?: string }

기존 패턴과 달리 페이지 레벨 래퍼로 사용.

Behavior:
- useAuthStore에서 isAuthenticated, isLoading 확인
- isLoading → 스피너
- !isAuthenticated → LoginBottomSheet 자동 표시
  - onClose → router.back()
  - message: props.message || "로그인하고 나만의 코스를 만들어보세요"
- isAuthenticated → children 렌더
- returnUrl: 현재 경로를 sessionStorage에 저장 (로그인 후 복귀)
```

---

## 4. Page Design

### 4.1 /create-spotline

```
파일: src/app/create-spotline/page.tsx
타입: Client Component ("use client")
인증: AuthGuard 래핑

URL 파라미터:
- ?fork={slug}  — Fork 모드 (원본 SpotLine slug)
- (없으면)      — 새로 만들기 모드
- ?spot={slug}  — Spot에서 진입 (해당 Spot 프리로딩)

로직:
1. searchParams에서 fork / spot 파라미터 확인
2. fork 있으면: mode="fork", SpotLine fetch → initFromFork
3. spot 있으면: mode="create", Spot fetch → addSpot
4. 아니면: mode="create", clearAll
5. SpotLineBuilder 렌더

메타:
- title: "나만의 SpotLine 만들기 | Spotline"
- noindex (검색엔진에 노출 불필요)
```

### 4.2 /spotline/[slug]/edit

```
파일: src/app/spotline/[slug]/edit/page.tsx
타입: Client Component ("use client")
인증: AuthGuard + 소유자 검증

로직:
1. slug로 SpotLine fetch
2. creatorId !== 현재 유저 → 403 or redirect
3. mode="edit" → initFromEdit
4. SpotLineBuilder 렌더
5. 저장 → updateSpotLine(slug, request)
6. 저장 후 → /spotline/{slug} 이동

메타:
- title: "SpotLine 수정 | Spotline"
- noindex
```

---

## 5. API Integration

### 5.1 신규 API 함수 (`src/lib/api.ts` 추가)

```typescript
// ─── SpotLine Builder API ───

export async function createSpotLine(
  request: CreateSpotLineRequest
): Promise<SpotLineDetailResponse> {
  const { data } = await apiV2.post("/spotlines", request, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 10000, // 생성은 여러 Spot 처리로 시간 소요
  });
  return data;
}

export async function updateSpotLine(
  slug: string,
  request: UpdateSpotLineRequest
): Promise<SpotLineDetailResponse> {
  const { data } = await apiV2.put(`/spotlines/${slug}`, request, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 10000,
  });
  return data;
}

export async function deleteSpotLine(slug: string): Promise<void> {
  await apiV2.delete(`/spotlines/${slug}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
}

export async function searchSpots(
  params: SpotSearchParams
): Promise<PaginatedResponse<SpotDetailResponse>> {
  const { data } = await apiV2.get("/spots", {
    params: {
      keyword: params.keyword || undefined,
      area: params.area || undefined,
      category: params.category || undefined,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
    timeout: 5000,
  });
  return data;
}
```

### 5.2 Request Body 구성 (Store → API)

```typescript
// useSpotLineBuilderStore.toCreateRequest()
toCreateRequest(): CreateSpotLineRequest {
  return {
    title: this.title,
    description: this.description || undefined,
    theme: this.theme,   // Backend는 대문자 enum: "DATE" | "TRAVEL" 등
    area: this.area,
    parentSpotLineId: this.parentSpotLineId || undefined,
    spots: this.spots.map((s, i) => ({
      spotId: s.spot.id,
      order: i + 1,
      suggestedTime: s.suggestedTime || undefined,
      stayDuration: s.stayDuration || undefined,
      walkingTimeToNext: s.walkingTimeToNext || undefined,
      distanceToNext: s.distanceToNext || undefined,
      transitionNote: s.transitionNote || undefined,
    })),
  };
}
```

**Theme 변환**: Frontend `SpotLineTheme` (소문자 kebab: `"food-tour"`) → Backend Enum (대문자: `"FOOD_TOUR"`). 변환 유틸 필요:

```typescript
// lib/utils.ts에 추가
const themeToBackend: Record<SpotLineTheme, string> = {
  "date": "DATE", "travel": "TRAVEL", "walk": "WALK",
  "hangout": "HANGOUT", "food-tour": "FOOD_TOUR",
  "cafe-tour": "CAFE_TOUR", "culture": "CULTURE",
};
```

---

## 6. Utility Modules

### 6.1 `src/lib/geo.ts` (신규)

```typescript
/**
 * Haversine formula로 두 좌표 간 거리 계산
 * @returns 미터 단위
 */
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number;

/**
 * 거리 → 도보 시간 변환 (4km/h 기준)
 * @returns 분 단위 (올림)
 */
export function estimateWalkingTime(distanceMeters: number): number;

/**
 * Builder spots 배열의 인접 Spot 간 거리/시간 일괄 계산
 */
export function calculateSpotDistances(
  spots: SpotLineBuilderSpot[]
): SpotLineBuilderSpot[];
```

Admin의 `geo.ts` 참고 가능. Haversine 공식 동일.

### 6.2 `src/lib/share.ts` (신규)

```typescript
/**
 * 클립보드에 URL 복사
 * @returns true if success
 */
export async function copyToClipboard(url: string): Promise<boolean>;

/**
 * Web Share API 호출 (모바일)
 */
export async function nativeShare(data: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean>;

/**
 * 카카오톡 공유 (Kakao JS SDK)
 * Kakao SDK가 로드되어 있어야 함
 */
export function shareToKakao(data: {
  title: string;
  description: string;
  imageUrl?: string;
  webUrl: string;
}): void;

/**
 * Web Share API 지원 여부
 */
export function isNativeShareSupported(): boolean;
```

Kakao SDK 로드: `<Script src="https://t1.kakaocdn.net/kakao_js_sdk/..." />` (layout 또는 ShareSheet 내부 dynamic import).

---

## 7. State Flow

### 7.1 SpotLine 생성 플로우

```
[진입] /create-spotline
  │
  ▼
AuthGuard 인증 확인
  │ (미인증 → LoginBottomSheet → 로그인 후 복귀)
  ▼
store.clearAll()
  │
  ▼
SpotSearchPanel: keyword/area/category 변경
  │  → searchSpots(params) → results 표시
  ▼
SpotSearchCard 클릭 → store.addSpot(spot)
  │  → recalculateDistances() + inferArea()
  │  → SelectedSpotList UI 업데이트
  ▼
SelectedSpotList: DnD 순서 변경
  │  → store.reorderSpots() → recalculateDistances()
  ▼
SpotLineMetaForm: title/theme/description 입력
  │  → store.setTitle/setTheme/setDescription
  ▼
[SpotLine 저장] 클릭
  │  → store.canSave() 검증 (title + spots >= 2 + theme)
  │  → store.isSaving = true
  │  → createSpotLine(store.toCreateRequest())
  │  → 성공: router.push(`/spotline/${response.slug}`)
  │  → 실패: toast 에러 메시지, isSaving = false
  ▼
/spotline/{slug} 상세 페이지 (생성 완료)
```

### 7.2 Fork 플로우

```
[진입] SpotLine 상세 → "내 버전 만들기" 클릭
  │
  ▼
router.push(`/create-spotline?fork=${slug}`)
  │
  ▼
AuthGuard 인증 확인
  │
  ▼
fetchSpotLineDetail(forkSlug)
  │  → store.initFromFork(spotLine)
  │  → spots 전체 프리로딩 + parentSpotLineId 세팅
  │  → ForkBadge 표시
  ▼
유저가 Spot 추가/교체/삭제/순서 변경
  ▼
[SpotLine 저장]
  │  → createSpotLine({...request, parentSpotLineId: 원본ID})
  │  → 원본의 variationsCount 자동 증가 (Backend에서 처리)
  ▼
/spotline/{newSlug} 상세 (Fork 완료)
```

### 7.3 수정 플로우

```
[진입] 프로필 → 내 SpotLine → 수정
  │
  ▼
router.push(`/spotline/${slug}/edit`)
  │
  ▼
AuthGuard + 소유자 검증
  │  (creatorId !== userId → router.back() + 에러 toast)
  ▼
fetchSpotLineDetail(slug)
  │  → store.initFromEdit(spotLine)
  ▼
유저가 수정
  ▼
[저장]
  │  → updateSpotLine(slug, store.toUpdateRequest())
  ▼
/spotline/{slug} 상세 (수정 완료)
```

---

## 8. UI/UX Specifications

### 8.1 반응형 브레이크포인트

| 뷰포트 | Builder 레이아웃 | 컨텐츠 너비 |
|--------|-----------------|------------|
| < 768px (모바일) | 탭 전환 (검색/내 코스) | 전체 너비 px-4 |
| >= 768px (데스크톱) | 2-column (좌 400px / 우 flex-1) | max-w-4xl mx-auto |

### 8.2 색상 시스템

기존 패턴 준수:

| 용도 | 색상 | 비고 |
|------|------|------|
| SpotLine 관련 CTA | `purple-600` | 기존 SpotLine 브랜드 컬러 |
| Builder 저장 버튼 | `bg-purple-600 text-white` | |
| Fork 배지 | `bg-purple-50 text-purple-700 border border-purple-200` | |
| Spot 추가 버튼 | `bg-blue-600 text-white` | 일반 액션 |
| 제거 버튼 | `text-gray-400 hover:text-red-500` | X 아이콘 |
| DnD 드래그 중 | `ring-2 ring-purple-300 shadow-lg` | |
| 탭 활성 | `text-purple-600 border-b-2 border-purple-600` | |
| 탭 비활성 | `text-gray-500` | |

### 8.3 빈 상태

| 상황 | 메시지 | 비주얼 |
|------|--------|--------|
| Builder 초기 (Spot 0개) | "Spot을 검색해서 추가해보세요" | 📍 아이콘 + 안내 텍스트 |
| 검색 결과 없음 | "검색 결과가 없어요. 다른 키워드로 검색해보세요" | 🔍 아이콘 |
| 내 SpotLine 없음 | "아직 만든 코스가 없어요. 첫 SpotLine을 만들어보세요!" | + CTA 버튼 |

### 8.4 유효성 검증

| 필드 | 규칙 | 에러 메시지 |
|------|------|------------|
| title | 필수, 2~50자 | "코스 이름을 입력해주세요" / "2자 이상 입력해주세요" |
| theme | 필수 | "테마를 선택해주세요" |
| spots | 최소 2개, 최대 10개 | "최소 2곳 이상 추가해주세요" / "최대 10곳까지 추가할 수 있어요" |
| description | 선택, 최대 200자 | "200자 이내로 작성해주세요" |

### 8.5 로딩/에러 상태

| 상태 | UI |
|------|-----|
| Spot 검색 중 | SpotSearchCard 스켈레톤 3개 (animate-pulse) |
| SpotLine 저장 중 | 저장 버튼 disabled + 스피너 + "저장 중..." |
| Fork 원본 로딩 중 | Builder 전체 스켈레톤 |
| 저장 실패 | toast "저장에 실패했어요. 다시 시도해주세요" |
| 네트워크 오류 | toast "네트워크 오류가 발생했어요" |

---

## 9. Dependencies

### 9.1 신규 패키지

| 패키지 | 용도 | 비고 |
|--------|------|------|
| `@dnd-kit/core` | DnD 컨텍스트 | Admin에서 이미 사용 중, front-spotLine에 설치 필요 |
| `@dnd-kit/sortable` | 정렬 가능 리스트 | |
| `@dnd-kit/utilities` | CSS transform 유틸 | |

### 9.2 기존 패키지 활용

| 패키지 | 용도 |
|--------|------|
| `zustand` | Builder store |
| `axios` | API 호출 |
| `clsx` + `tailwind-merge` | 조건부 클래스 |
| `lucide-react` | 아이콘 (GripVertical, X, Plus, Search, Share2, Copy, MessageCircle) |

### 9.3 외부 SDK

| SDK | 용도 | 로드 방식 |
|-----|------|----------|
| Kakao JS SDK | 카카오톡 공유 | `<Script>` 태그, ShareSheet 렌더 시 초기화 |

---

## 10. Implementation Order

| Step | Scope | 파일 | 의존성 | Priority |
|------|-------|------|--------|----------|
| **1** | Types + Store | `types/index.ts`, `store/useSpotLineBuilderStore.ts`, `lib/geo.ts` | 없음 | High |
| **2** | API 함수 | `lib/api.ts` (4함수 추가) | Step 1 | High |
| **3** | Builder 코어 | `SpotLineBuilder.tsx`, `SpotSearchPanel.tsx`, `SpotSearchCard.tsx` | Step 1, 2 | High |
| **4** | DnD 리스트 | `SelectedSpotList.tsx`, `SelectedSpotCard.tsx` (@dnd-kit 설치) | Step 3 | High |
| **5** | 메타 + 저장 | `SpotLineMetaForm.tsx`, `/create-spotline/page.tsx`, `AuthGuard.tsx` | Step 4 | High |
| **6** | Fork 플로우 | `ForkBadge.tsx`, fork 쿼리 파라미터 처리 | Step 5 | High |
| **7** | 수정 기능 | `/spotline/[slug]/edit/page.tsx` | Step 5 | High |
| **8** | 공유 기능 | `ShareSheet.tsx`, `lib/share.ts`, Kakao SDK | Step 5 | High |
| **9** | BottomBar 리뉴얼 | `SpotLineBottomBar.tsx` 수정, `SpotBottomBar.tsx` 수정 | Step 8 | High |
| **10** | 진입점 + FAB | `FloatingCreateButton.tsx`, `FeedPage` CTA, `BottomNavBar` 수정 | Step 9 | Medium |
| **11** | 내 SpotLine 관리 | 프로필 탭 연동, 삭제 기능 | Step 7 | Medium |
| **12** | 모바일 최적화 | 탭 전환 UX, 터치 DnD 세밀 튜닝, SafeArea | Step 10 | Medium |

---

## 11. Edge Cases & Error Handling

| 시나리오 | 처리 |
|---------|------|
| 같은 Spot 중복 추가 | addSpot에서 이미 존재하면 무시 + toast "이미 추가된 Spot이에요" |
| 11번째 Spot 추가 시도 | addSpot에서 10개 초과 시 무시 + toast "최대 10곳까지 추가할 수 있어요" |
| Fork 원본이 삭제됨 | fetchSpotLineDetail 404 → "원본 코스를 찾을 수 없어요" + /create-spotline (빈 Builder) 전환 |
| 수정 중 다른 유저가 삭제 | updateSpotLine 404 → "이 코스가 삭제되었어요" + /profile/me 이동 |
| 저장 중 네트워크 끊김 | catch → toast + isSaving false, 재시도 가능 |
| 브라우저 뒤로가기 (미저장) | beforeunload 이벤트 + isDirty 확인 → "저장하지 않은 변경사항이 있어요" 경고 |
| 카카오 SDK 로드 실패 | ShareSheet에서 카카오 옵션 숨김, 링크 복사 + 네이티브만 표시 |
| Spot 검색 API 느림 (>5s) | 타임아웃 → "검색에 시간이 걸리고 있어요" + 재시도 링크 |

---

## 12. Performance Considerations

| 항목 | 전략 |
|------|------|
| Builder 초기 로드 | dynamic import로 @dnd-kit lazy load, SpotSearchPanel은 즉시 렌더 |
| Spot 검색 debounce | 300ms debounce, 이전 요청 AbortController로 취소 |
| 이미지 | SpotSearchCard에 OptimizedImage 사용 (lazy loading + 폴백) |
| 무한 스크롤 | IntersectionObserver, page size 20 |
| DnD 성능 | restrictToVerticalAxis modifier, transform.translate3d (GPU) |
| 거리 계산 | Spot 추가/제거/순서변경 시에만 계산 (O(n) Haversine) |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-05 | Initial design document | Claude |
