# Experience Replication Design Document

> **Summary**: Route 복제, 내 일정 관리, 변형 탐색 기능의 상세 설계
>
> **Project**: front-spotLine (Experience Social Platform)
> **Version**: Phase 7
> **Author**: Development Team
> **Date**: 2026-03-27
> **Status**: Draft
> **Planning Doc**: [experience-replication.plan.md](../01-plan/features/experience-replication.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. RouteBottomBar의 "내 일정에 추가" placeholder를 동작하는 복제 플로우로 전환
2. Portal 기반 ReplicateRouteSheet로 날짜 선택 + 즉시 복제
3. `/my-routes` 페이지에서 복제한 Route 관리 (예정/완료 탭)
4. RouteVariations를 인터랙티브하게 전환 (변형 목록 인라인 확장)
5. Backend 미구현 시 localStorage fallback (Phase 6 패턴 동일)

### 1.2 Design Principles

- **기존 패턴 재사용**: LoginBottomSheet(Portal), useSocialStore(Zustand optimistic), saves/page.tsx(페이지 레이아웃)
- **Graceful Fallback**: API 실패 시 localStorage 저장/조회, `console.warn` only
- **모바일 퍼스트**: 바텀시트 + 터치 친화적 날짜 선택

---

## 2. Architecture

### 2.1 Component Diagram

```
RouteBottomBar (수정)
  ├── "내 일정에 추가" onClick → auth gate
  │     ├── 미인증 → LoginBottomSheet (기존)
  │     └── 인증 → ReplicateRouteSheet (신규)
  │           ├── 빠른 날짜 선택 (오늘/내일/이번 주말)
  │           ├── 직접 입력 (native <input type="date">)
  │           └── "나중에 정할게요" (날짜 없이 추가)
  │
  └── 복제 성공 → useMyRoutesStore.addRoute()

/my-routes (신규 페이지)
  ├── MyRoutesList (예정/완료 탭)
  │     └── MyRouteCard × N
  │           ├── D-day 표시
  │           ├── 완주 버튼 → useMyRoutesStore.markComplete()
  │           ├── 삭제 버튼 → useMyRoutesStore.removeRoute()
  │           └── 원본 보기 링크

RouteVariations (수정)
  ├── 변형 수 표시 (기존)
  ├── "변형 보기" 클릭 → 인라인 확장
  │     └── VariationsList (신규)
  │           └── RoutePreview 카드 × N
  └── parentRouteId 있으면 → "원본 보기" 링크
```

### 2.2 Data Flow

```
[복제]
RouteBottomBar → ReplicateRouteSheet → replicateRoute API
  → 성공: useMyRoutesStore.addRoute + 토스트
  → 실패: localStorage 저장 + console.warn + 토스트

[내 일정 조회]
/my-routes mount → fetchMyRoutes API
  → 성공: useMyRoutesStore.setRoutes
  → 실패: localStorage에서 읽기

[완주 마킹]
MyRouteCard → useMyRoutesStore.markComplete → updateMyRouteStatus API
  → 실패: optimistic 상태 유지

[변형 목록]
RouteVariations "변형 보기" → fetchRouteVariations API
  → 성공: 인라인 목록 표시
  → 실패: "변형 목록을 불러올 수 없습니다" 메시지
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| ReplicateRouteSheet | useAuthStore, useMyRoutesStore, replicateRoute API | 복제 실행 |
| RouteBottomBar | ReplicateRouteSheet, LoginBottomSheet | 복제 진입점 |
| MyRoutesList | useMyRoutesStore, useAuthStore | 내 일정 목록 |
| MyRouteCard | useMyRoutesStore | 카드 + 완주/삭제 액션 |
| VariationsList | fetchRouteVariations API | 변형 목록 조회 |
| RouteVariations | VariationsList | 인라인 변형 확장 |

---

## 3. Data Model

### 3.1 Entity Definition

```typescript
// 내 Route (복제된 Route) — types/index.ts에 추가
interface MyRoute {
  id: string;
  routeId: string;         // 원본 Route ID
  routeSlug: string;       // 원본 Route slug (링크용)
  title: string;
  area: string;
  spotsCount: number;
  scheduledDate: string | null;  // ISO 날짜, null = "미정"
  status: "scheduled" | "completed" | "cancelled";
  completedAt: string | null;
  parentRouteId: string;   // = routeId (복제 원본)
  createdAt: string;
}

// 복제 요청
interface ReplicateRouteRequest {
  scheduledDate: string | null;  // null = 나중에 정할게요
}

// 복제 응답
interface ReplicateRouteResponse {
  myRoute: MyRoute;
  replicationsCount: number;  // 원본 Route의 업데이트된 복제 수
}
```

### 3.2 Entity Relationships

```
[RouteDetailResponse] 1 ──── N [MyRoute]  (via routeId)
     │
     └── parentRouteId ──── 1 [RouteDetailResponse]  (변형 원본)
```

### 3.3 localStorage Schema (Backend Fallback)

```typescript
// key: "spotline_my_routes"
interface LocalMyRoutes {
  routes: MyRoute[];
  updatedAt: string;  // ISO timestamp
}
```

---

## 4. API Specification

### 4.1 Endpoint List

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v2/routes/{routeId}/replicate` | Route 복제 | Required |
| GET | `/api/v2/users/me/routes` | 내 Route 목록 | Required |
| PATCH | `/api/v2/users/me/routes/{myRouteId}` | 내 Route 상태 변경 | Required |
| DELETE | `/api/v2/users/me/routes/{myRouteId}` | 내 Route 삭제 | Required |
| GET | `/api/v2/routes/{routeId}/variations` | 변형 Route 목록 | Optional |

### 4.2 Detailed Specification

#### `POST /api/v2/routes/{routeId}/replicate`

**Request:**
```json
{
  "scheduledDate": "2026-04-05"  // or null
}
```

**Response (201 Created):**
```json
{
  "myRoute": {
    "id": "mr_abc123",
    "routeId": "route_xyz",
    "routeSlug": "gangnam-cafe-tour",
    "title": "강남 카페 투어",
    "area": "강남",
    "spotsCount": 4,
    "scheduledDate": "2026-04-05",
    "status": "scheduled",
    "completedAt": null,
    "parentRouteId": "route_xyz",
    "createdAt": "2026-03-27T10:00:00Z"
  },
  "replicationsCount": 42
}
```

**Error Responses:**
- `401 Unauthorized`: 인증 필요
- `404 Not Found`: Route 없음
- `409 Conflict`: 이미 동일 날짜에 복제함

#### `GET /api/v2/users/me/routes?status=scheduled&page=0&size=20`

**Response (200):**
```json
{
  "items": [MyRoute, ...],
  "hasMore": true
}
```

#### `PATCH /api/v2/users/me/routes/{myRouteId}`

**Request:**
```json
{
  "status": "completed"
}
```

**Response (200):**
```json
{
  "id": "mr_abc123",
  "status": "completed",
  "completedAt": "2026-04-05T18:30:00Z"
}
```

#### `GET /api/v2/routes/{routeId}/variations?page=0&size=10`

**Response (200):**
```json
{
  "items": [RoutePreview, ...],
  "hasMore": false
}
```

---

## 5. UI/UX Design

### 5.1 ReplicateRouteSheet (신규)

**패턴**: LoginBottomSheet와 동일한 Portal + `animate-slide-up` 바텀시트

```
┌────────────────────────────────────────────┐
│                                            │
│  ──────────── (드래그 핸들)          [X]    │
│                                            │
│  📅 내 일정에 추가                          │
│                                            │
│  강남 카페 투어                              │
│  강남 · 4곳                                 │
│                                            │
│  언제 가실 예정인가요?                       │
│                                            │
│  ┌────────┐ ┌────────┐ ┌─────────────┐    │
│  │  오늘  │ │  내일  │ │ 이번 주말   │    │
│  └────────┘ └────────┘ └─────────────┘    │
│                                            │
│  ┌──────────────────────────────────┐      │
│  │  📅 다른 날짜 선택               │      │
│  │  (클릭 시 native date input)     │      │
│  └──────────────────────────────────┘      │
│                                            │
│  ┌──────────────────────────────────┐      │
│  │  ✓  추가하기         (purple-600)│      │
│  └──────────────────────────────────┘      │
│                                            │
│     나중에 정할게요 (날짜 없이 추가)          │
│                                            │
└────────────────────────────────────────────┘
```

**Props Interface:**
```typescript
interface ReplicateRouteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  route: {
    id: string;
    slug: string;
    title: string;
    area: string;
    spotsCount: number;
  };
}
```

**동작 명세:**
1. 빠른 선택 버튼: "오늘", "내일", "이번 주말" — 클릭 시 해당 날짜 자동 설정
2. "다른 날짜 선택" — 클릭 시 `<input type="date" min={today}>` 표시
3. "추가하기" — `replicateRoute(routeId, selectedDate)` 호출
4. "나중에 정할게요" — `replicateRoute(routeId, null)` 호출
5. 성공 시: 토스트 "내 일정에 추가되었습니다" + 시트 닫기
6. ESC, backdrop 클릭으로 닫기 (LoginBottomSheet 패턴)

**날짜 헬퍼 함수:**
```typescript
const getQuickDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // 이번 주말 = 다음 토요일
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + (6 - today.getDay()));

  return {
    today: today.toISOString().split("T")[0],
    tomorrow: tomorrow.toISOString().split("T")[0],
    weekend: saturday.toISOString().split("T")[0],
  };
};
```

### 5.2 MyRouteCard (신규)

```
┌────────────────────────────────────────────┐
│                                            │
│  강남 카페 투어                    D-3 🟢   │
│  강남 · 4곳                                │
│  📅 2026.04.05 (토)                       │
│                                            │
│  ┌────────┐ ┌────────┐ ┌──────────────┐  │
│  │ ✓ 완주 │ │ 🗑 삭제│ │ → 원본 보기 │  │
│  └────────┘ └────────┘ └──────────────┘  │
│                                            │
└────────────────────────────────────────────┘
```

**Props Interface:**
```typescript
interface MyRouteCardProps {
  myRoute: MyRoute;
  onMarkComplete: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**D-day 계산:**
```typescript
const getDday = (scheduledDate: string | null): string => {
  if (!scheduledDate) return "미정";
  const diff = Math.ceil(
    (new Date(scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "D-Day";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
};
```

**상태별 D-day 색상:**
- D-day 또는 이전: `text-red-600` (빨강)
- D-1~3: `text-orange-500` (주황)
- D-4 이상: `text-green-600` (초록)
- 미정: `text-gray-400`

### 5.3 내 일정 페이지 (`/my-routes`)

**패턴**: saves/page.tsx와 동일한 서버 컴포넌트 + 클라이언트 리스트

```
┌────────────────────────────────────────────┐
│  ← 내 일정                                 │
├────────────────────────────────────────────┤
│  [예정 (3)]  [완료 (5)]  ← 탭              │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  MyRouteCard                         │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  MyRouteCard                         │  │
│  └──────────────────────────────────────┘  │
│  ...                                       │
│                                            │
│  (비어있을 때)                              │
│  📅 예정된 일정이 없습니다                    │
│  Route를 둘러보며 내 일정에 추가해보세요       │
│  ┌──────────────────────────────────┐      │
│  │  Route 둘러보기  → /feed         │      │
│  └──────────────────────────────────┘      │
│                                            │
└────────────────────────────────────────────┘
```

**탭 구현:**
- 로컬 state로 `activeTab: "scheduled" | "completed"` 관리
- 탭 전환 시 스토어 + API 재조회
- 완료 탭 카드: 완주 버튼 대신 "완주 날짜" 표시

### 5.4 RouteVariations 수정

```
[수정 전 - 정적]
┌──────────────────────────────────────────┐
│  🔀 3개의 변형 Route가 있습니다           │
│  다른 사람들이 이 코스를 변형했어요          │
└──────────────────────────────────────────┘

[수정 후 - 인터랙티브]
┌──────────────────────────────────────────┐
│  🔀 3개의 변형 Route가 있습니다    [보기] │  ← 클릭 가능
│  다른 사람들이 이 코스를 변형했어요          │
│                                          │
│  (확장 시)                                │
│  ┌────────────────────────────────────┐  │
│  │  VariationsList                    │  │
│  │  ┌─ 강남 카페 투어 변형 ─────────┐ │  │
│  │  │  홍대 · 3곳 · 2시간           │ │  │
│  │  └──────────────────────────────┘ │  │
│  │  ┌─ 성수 브런치 코스 ───────────┐ │  │
│  │  │  성수 · 5곳 · 3시간           │ │  │
│  │  └──────────────────────────────┘ │  │
│  └────────────────────────────────────┘  │
│                                          │
│  (parentRouteId 있으면)                    │
│  🔗 원본 Route 보기 → /route/{parentSlug} │
└──────────────────────────────────────────┘
```

**수정된 Props:**
```typescript
interface RouteVariationsProps {
  routeId: string;
  parentRouteId: string | null;
  variationsCount: number;
  parentRouteSlug?: string;  // 추가: 원본 Route 링크용
}
```

---

## 6. Component Detailed Specs

### 6.1 ReplicateRouteSheet.tsx (신규)

**파일**: `src/components/route/ReplicateRouteSheet.tsx`
**패턴**: LoginBottomSheet 복제 + 날짜 선택 추가

```typescript
"use client";

// Imports: useState, useCallback, useEffect, createPortal
// From: X (lucide-react), CalendarPlus
// Store: useMyRoutesStore
// API: replicateRoute from @/lib/api

// State:
//   selectedDate: string | null (ISO)
//   showDateInput: boolean
//   isSubmitting: boolean

// 핵심 로직:
//   handleQuickDate(date: string) → setSelectedDate
//   handleSubmit() → replicateRoute API or localStorage fallback
//   handleSkipDate() → replicateRoute(routeId, null)
```

**localStorage Fallback:**
```typescript
const LOCAL_STORAGE_KEY = "spotline_my_routes";

const saveToLocal = (myRoute: MyRoute) => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  const data: LocalMyRoutes = raw
    ? JSON.parse(raw)
    : { routes: [], updatedAt: "" };
  data.routes.unshift(myRoute);
  data.updatedAt = new Date().toISOString();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

const generateLocalId = () =>
  `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
```

### 6.2 useMyRoutesStore.ts (신규)

**파일**: `src/store/useMyRoutesStore.ts`
**패턴**: useSocialStore와 동일한 Zustand 패턴

```typescript
interface MyRoutesState {
  routes: MyRoute[];
  isLoading: boolean;

  // Actions
  setRoutes: (routes: MyRoute[]) => void;
  addRoute: (route: MyRoute) => void;
  markComplete: (myRouteId: string) => Promise<void>;
  removeRoute: (myRouteId: string) => Promise<void>;
  fetchRoutes: (status?: "scheduled" | "completed") => Promise<void>;
  clearAll: () => void;  // CLAUDE.md 규칙: clearAll 필수
}
```

**Optimistic Pattern (markComplete):**
```typescript
markComplete: async (myRouteId) => {
  const prev = get().routes;

  // 1. Optimistic update
  set((state) => ({
    routes: state.routes.map((r) =>
      r.id === myRouteId
        ? { ...r, status: "completed", completedAt: new Date().toISOString() }
        : r
    ),
  }));

  // 2. API call
  try {
    await updateMyRouteStatus(myRouteId, "completed");
  } catch {
    // 3. API 실패 → optimistic 유지 + localStorage 동기화
    console.warn(`완주 마킹 API 실패 (${myRouteId}) — 로컬 상태 유지`);
    syncToLocalStorage(get().routes);
  }
},
```

**localStorage 동기화:**
- `addRoute` → API 성공 시 응답 저장, 실패 시 로컬 생성 후 localStorage에 저장
- `fetchRoutes` → API 실패 시 localStorage에서 읽기
- `markComplete`, `removeRoute` → 변경 후 항상 localStorage 동기화

### 6.3 RouteBottomBar.tsx 수정사항

**변경 범위**: "내 일정에 추가" 버튼에 onClick 추가 + ReplicateRouteSheet 연동

```typescript
// 추가할 state
const [showReplicate, setShowReplicate] = useState(false);

// 추가할 handler
const handleReplicate = () => {
  if (!isAuthenticated) {
    setLoginMessage("로그인하고 내 일정에 추가해보세요");
    setShowLogin(true);
    return;
  }
  setShowReplicate(true);
};

// 버튼에 onClick 추가 (기존 line 103-108)
<button
  onClick={handleReplicate}  // ← 추가
  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 active:bg-purple-800"
>

// JSX에 ReplicateRouteSheet 추가
<ReplicateRouteSheet
  isOpen={showReplicate}
  onClose={() => setShowReplicate(false)}
  route={{
    id: route.id,
    slug: route.slug,
    title: route.title,
    area: route.area,
    spotsCount: route.spots.length,
  }}
/>
```

### 6.4 RouteVariations.tsx 수정사항

**변경 범위**: 정적 텍스트 → 클릭 가능 + 인라인 VariationsList 확장

```typescript
// "use client" 추가 (기존에 없음)
// 추가할 state
const [expanded, setExpanded] = useState(false);

// variationsCount > 0일 때 "보기" 버튼 표시
// expanded = true일 때 VariationsList 렌더링

// parentRouteId + parentRouteSlug 있으면 Link to /route/{parentRouteSlug}
```

### 6.5 VariationsList.tsx (신규)

**파일**: `src/components/route/VariationsList.tsx`

```typescript
interface VariationsListProps {
  routeId: string;
}

// State: variations (RoutePreview[]), isLoading, error
// mount 시 fetchRouteVariations(routeId) 호출
// 각 항목: Link to /route/{variation.slug}
// 로딩 중: 스켈레톤 2~3개
// 에러 시: "변형 목록을 불러올 수 없습니다" 텍스트
```

### 6.6 API 함수 (api.ts 추가)

```typescript
// ==================== Replication API (v2) ====================

// Route 복제
export const replicateRoute = async (
  routeId: string,
  scheduledDate: string | null
): Promise<ReplicateRouteResponse> => {
  const response = await apiV2.post<ReplicateRouteResponse>(
    `/routes/${routeId}/replicate`,
    { scheduledDate },
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return response.data;
};

// 내 Route 목록
export const fetchMyRoutes = async (
  status?: "scheduled" | "completed",
  page: number = 0
): Promise<{ items: MyRoute[]; hasMore: boolean }> => {
  try {
    const params: Record<string, string | number> = { page };
    if (status) params.status = status;
    const response = await apiV2.get<{ items: MyRoute[]; hasMore: boolean }>(
      "/users/me/routes",
      { params, headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
    );
    return response.data;
  } catch {
    return { items: [], hasMore: false };
  }
};

// 내 Route 상태 변경
export const updateMyRouteStatus = async (
  myRouteId: string,
  status: "completed" | "cancelled"
): Promise<MyRoute> => {
  const response = await apiV2.patch<MyRoute>(
    `/users/me/routes/${myRouteId}`,
    { status },
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return response.data;
};

// 내 Route 삭제
export const deleteMyRoute = async (myRouteId: string): Promise<void> => {
  await apiV2.delete(
    `/users/me/routes/${myRouteId}`,
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
};

// Route 변형 목록
export const fetchRouteVariations = async (
  routeId: string,
  page: number = 0
): Promise<{ items: RoutePreview[]; hasMore: boolean }> => {
  try {
    const response = await apiV2.get<{ items: RoutePreview[]; hasMore: boolean }>(
      `/routes/${routeId}/variations`,
      { params: { page }, timeout: 5000 }
    );
    return response.data;
  } catch {
    return { items: [], hasMore: false };
  }
};
```

---

## 7. Error Handling

### 7.1 Error Strategy (Phase 6 패턴 동일)

| Scenario | Handling | UX |
|----------|----------|----|
| 401 Unauthorized | 토큰 만료 → LoginBottomSheet 표시 | 자동 로그인 유도 |
| 404 Route Not Found | 토스트 에러 | "해당 Route를 찾을 수 없습니다" |
| 409 Duplicate Replicate | 토스트 알림 | "이미 내 일정에 추가된 Route입니다" |
| Network Error (API 미구현) | localStorage fallback + console.warn | 정상 동작처럼 보임 |
| fetchMyRoutes 실패 | localStorage에서 읽기 | 로컬 데이터 표시 |
| fetchRouteVariations 실패 | 빈 배열 반환 | "변형 목록을 불러올 수 없습니다" |

### 7.2 Toast Messages

| Action | Success | Error |
|--------|---------|-------|
| 복제 | "내 일정에 추가되었습니다" | "일정 추가에 실패했습니다" |
| 완주 | "완주했습니다! 🎉" | (optimistic, 표시 안 함) |
| 삭제 | "일정에서 삭제되었습니다" | "삭제에 실패했습니다" |

**토스트 구현**: 기존 `alert()` 대신 간단한 토스트 state 사용 (setTimeout 3초 후 auto-dismiss). 별도 라이브러리 미사용.

---

## 8. Security Considerations

- [x] Auth 토큰 검증: 복제/내 일정 API는 `Authorization: Bearer` 필수
- [x] 인증 게이트: 미인증 시 LoginBottomSheet (기존 패턴)
- [x] localStorage XSS: 민감 정보 미저장 (Route 메타데이터만)
- [x] Rate Limiting: 복제 버튼 isSubmitting 상태로 중복 클릭 방지
- [x] Input Validation: scheduledDate는 오늘 이후만 허용 (`min={today}`)

---

## 9. Implementation Checklist

### Step 1: Types + API Functions
- [ ] `types/index.ts` — `MyRoute`, `ReplicateRouteRequest`, `ReplicateRouteResponse` 추가
- [ ] `lib/api.ts` — `replicateRoute`, `fetchMyRoutes`, `updateMyRouteStatus`, `deleteMyRoute`, `fetchRouteVariations` 추가

### Step 2: Store
- [ ] `store/useMyRoutesStore.ts` — Zustand 스토어 생성 (routes, addRoute, markComplete, removeRoute, fetchRoutes, clearAll)
- [ ] localStorage 동기화 로직 포함

### Step 3: ReplicateRouteSheet
- [ ] `components/route/ReplicateRouteSheet.tsx` — Portal 바텀시트
- [ ] 빠른 날짜 선택 (오늘/내일/이번 주말)
- [ ] native date input 폴백
- [ ] "나중에 정할게요" 옵션
- [ ] 토스트 피드백

### Step 4: RouteBottomBar 수정
- [ ] "내 일정에 추가" onClick 핸들러 추가
- [ ] 인증 게이트 (LoginBottomSheet)
- [ ] ReplicateRouteSheet 연동

### Step 5: 내 일정 페이지
- [ ] `components/route/MyRouteCard.tsx` — D-day, 완주/삭제 버튼
- [ ] `components/route/MyRoutesList.tsx` — 예정/완료 탭 + 무한 스크롤 아님 (단순 목록)
- [ ] `app/my-routes/page.tsx` — 서버 컴포넌트 (metadata + MyRoutesList)

### Step 6: RouteVariations 인터랙션
- [ ] `components/route/VariationsList.tsx` — 변형 카드 목록
- [ ] `components/route/RouteVariations.tsx` 수정 — 인라인 확장 + 원본 링크

---

## 10. File Structure

```
src/
├── app/
│   └── my-routes/
│       └── page.tsx                    ← 신규
│
├── components/
│   └── route/
│       ├── RouteBottomBar.tsx          ← 수정 (onClick + sheet 연동)
│       ├── RouteVariations.tsx         ← 수정 (인터랙티브 + "use client")
│       ├── ReplicateRouteSheet.tsx     ← 신규
│       ├── MyRoutesList.tsx            ← 신규
│       ├── MyRouteCard.tsx             ← 신규
│       └── VariationsList.tsx          ← 신규
│
├── store/
│   └── useMyRoutesStore.ts             ← 신규
│
├── lib/
│   └── api.ts                          ← 수정 (5개 함수 추가)
│
└── types/
    └── index.ts                        ← 수정 (3개 타입 추가)
```

**총 파일**: 10개 (신규 6 + 수정 4)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-27 | Initial draft | Development Team |
