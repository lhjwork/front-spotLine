# Plan: Experience Replication — Route 복제, 변형, 내 일정 관리

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | RouteBottomBar의 "내 일정에 추가" 버튼에 onClick 핸들러가 없고, RouteVariations는 정보 표시만 하며 인터랙션 불가. 사용자가 마음에 드는 Route를 자신의 일정으로 가져갈 방법이 없다. |
| **Solution** | Route 복제 바텀시트로 날짜 선택 + Spot 커스터마이징 → 내 Route 생성. 내 일정 페이지(`/my-routes`)에서 복제한 Route 관리. RouteVariations를 인터랙티브하게 전환. |
| **Function UX Effect** | "내 일정에 추가" 탭 → 바텀시트에서 날짜 선택 → 즉시 내 Route 생성. 내 일정 페이지에서 예정/완료 Route 관리. 원본 Route의 변형 목록 탐색 가능. |
| **Core Value** | 콘텐츠 소비 → 행동 전환의 핵심 루프. Route 복제 수는 크루 콘텐츠의 실질적 가치 지표. 사용자가 "보기만 하는" 서비스에서 "실제로 따라하는" 서비스로 전환. |

| Item | Detail |
|------|--------|
| Feature | Experience Replication (Phase 7) |
| Created | 2026-03-27 |
| Status | Planning |
| Level | Dynamic |
| Depends On | Phase 6 (Social Features) — 97% archived |

---

## 1. Background & Context

### 1.1 현재 상태 (AS-IS)

**UI 존재하나 미동작:**
- `RouteBottomBar.tsx` — "내 일정에 추가" 버튼 존재, **onClick 없음** (placeholder)
- `RouteVariations.tsx` — 변형 정보 표시만 (정적 텍스트, 클릭 불가)
- `RouteHeader.tsx` — `replicationsCount`, `completionsCount` 표시 (display only)

**타입 시스템 준비 완료:**
- `RouteDetailResponse.replicationsCount` — 복제 횟수
- `RouteDetailResponse.completionsCount` — 완주 횟수
- `RouteDetailResponse.parentSpotLineId` — 부모 Route (변형 추적)
- `RouteDetailResponse.variationsCount` — 변형 수

**인증 + 소셜 인프라 완료 (Phase 6):**
- `useAuthStore` — 로그인/로그아웃 + Instagram OAuth
- `useSocialStore` — 좋아요/저장 optimistic update
- `LoginBottomSheet` — 로그인 유도 (재사용 가능)

**미구현:**
- Route 복제 API 함수 + 바텀시트 UI
- 내 일정 페이지 (`/my-routes`)
- Spot 커스터마이징 (순서 변경, 제거, 추가)
- 완주 마킹
- RouteVariations 인터랙션 (변형 목록 탐색)

### 1.2 Backend API 현황

**현재 v2 API:**
```
GET /api/v2/routes/{slug}     ← replicationsCount, parentSpotLineId, variationsCount 포함
```

**Phase 7에 필요한 신규 API** (Backend 구현 필요):
```
POST /api/v2/routes/{id}/replicate    ← Route 복제 (parentSpotLineId 설정)
GET  /api/v2/routes/{id}/variations   ← 변형 Route 목록
GET  /api/v2/users/me/routes          ← 내 Route 목록 (복제한 것들)
PATCH /api/v2/users/me/routes/{id}    ← Route 상태 변경 (예정→완료)
```

**전략**: Phase 6과 동일 — 프론트에서 API 함수 구현하되 실패 시 graceful fallback.

---

## 2. Scope

### 2.1 In Scope

| # | Item | Description |
|---|------|-------------|
| 1 | **Route 복제 바텀시트** | "내 일정에 추가" → ReplicateRouteSheet (날짜 선택 + 확인) |
| 2 | **복제 API 연동** | `replicateRoute(spotLineId, scheduledDate)` → v2 API POST |
| 3 | **내 일정 페이지** | `/my-routes` — 복제한 Route 목록 (예정/완료 탭) |
| 4 | **완주 마킹** | 내 일정에서 Route 완주 표시 (체크 버튼) |
| 5 | **RouteVariations 인터랙션** | 변형 목록 페이지 연결 + 원본 Route 링크 |
| 6 | **내 일정 스토어** | `useMyRoutesStore` — 복제된 Route 상태 관리 |

### 2.2 Out of Scope

| Item | Reason |
|------|--------|
| Spot 순서 변경/삭제/추가 (커스터마이징) | v1은 원본 그대로 복제. Spot 편집은 Phase 7.5 이후 |
| Route 직접 생성 (빈 상태에서) | 크루만 Route 생성 가능 (현재 정책) |
| 캘린더 뷰 (달력 형태) | 리스트 뷰 우선, 캘린더는 추후 |
| 알림 (D-day 리마인더) | 별도 feature |
| Route 공유 링크 커스텀 | 기존 공유 기능으로 충분 |

---

## 3. Core Changes

### 3.1 Route 복제 플로우

```
사용자가 Route 상세 페이지에서 "내 일정에 추가" 탭
  → isAuthenticated?
    → No: LoginBottomSheet 표시
    → Yes: ReplicateRouteSheet 열림
      → 날짜 선택 (DatePicker)
      → "추가하기" 확인
      → POST /api/v2/routes/{id}/replicate { scheduledDate }
      → 성공: 토스트 "내 일정에 추가되었습니다" + 내 일정 링크
      → 실패: 에러 토스트
```

### 3.2 내 일정 구조

```
/my-routes 페이지
  ├─ [예정] 탭 — scheduledDate >= today, status = "scheduled"
  │   ├─ Route 카드 (제목, 지역, Spot 수, D-day 표시)
  │   └─ 완주 버튼, 삭제 버튼
  │
  └─ [완료] 탭 — status = "completed"
      ├─ Route 카드 (제목, 지역, 완주 날짜)
      └─ 원본 Route 링크
```

### 3.3 변형 탐색 플로우

```
RouteVariations 컴포넌트 (Route 상세 페이지 내)
  → "변형 보기" 클릭
  → /route/{slug}/variations 페이지 (또는 인라인 드로어)
  → 변형 Route 목록 (카드 리스트)
  → 각 카드 클릭 → 해당 Route 상세 페이지
```

---

## 4. Data Flow

### 4.1 복제 플로우

```
RouteBottomBar ("내 일정에 추가" 탭)
  → ReplicateRouteSheet 열림
  → 날짜 선택
  → "추가하기" 클릭
  → POST /api/v2/routes/{id}/replicate
    Body: { scheduledDate: "2026-04-05" }
    Authorization: Bearer {token}
  → 성공: { id, slug, parentSpotLineId, scheduledDate, status }
  → useMyRoutesStore.addRoute(response)
  → 토스트 + 시트 닫기
```

### 4.2 내 일정 목록 조회

```
/my-routes 페이지 mount
  → isAuthenticated?
    → No: 로그인 유도
    → Yes: fetchMyRoutes(status, page)
      → GET /api/v2/users/me/routes?status=scheduled&page=0
      → useMyRoutesStore.setRoutes(data)
```

---

## 5. New/Modified Components

### 5.1 New Components

| Component | File | Description |
|-----------|------|-------------|
| ReplicateRouteSheet | `src/components/route/ReplicateRouteSheet.tsx` | 복제 바텀시트 (날짜 선택 + 확인) |
| MyRoutesList | `src/components/route/MyRoutesList.tsx` | 내 일정 목록 (예정/완료 탭) |
| MyRouteCard | `src/components/route/MyRouteCard.tsx` | 내 일정 카드 (D-day, 완주 버튼) |
| VariationsList | `src/components/route/VariationsList.tsx` | 변형 Route 목록 |

### 5.2 New Pages

| Page | File | Description |
|------|------|-------------|
| 내 일정 | `src/app/my-routes/page.tsx` | 내 Route 목록 서버 컴포넌트 |

### 5.3 New Stores/Libs

| File | Description |
|------|-------------|
| `src/store/useMyRoutesStore.ts` | 내 일정 상태 관리 (routes, addRoute, markComplete, remove) |

### 5.4 Modified Components

| File | Change |
|------|--------|
| `src/components/route/RouteBottomBar.tsx` | "내 일정에 추가" onClick 핸들러 + 인증 게이트 + ReplicateRouteSheet 연동 |
| `src/components/route/RouteVariations.tsx` | 클릭 가능 + 변형 목록 링크 추가 |
| `src/lib/api.ts` | `replicateRoute`, `fetchMyRoutes`, `updateMyRouteStatus`, `fetchRouteVariations` 추가 |
| `src/types/index.ts` | `MyRoute`, `ReplicateRouteRequest`, `ReplicateRouteResponse` 타입 추가 |

### 5.5 Preserved (No Change)

| File | Reason |
|------|--------|
| RouteHeader.tsx | replicationsCount 이미 표시 중, 변경 불필요 |
| RouteTimeline, RouteMapPreview | 복제 기능과 무관 |
| useSocialStore, LoginBottomSheet | 기존 코드 재사용 |

---

## 6. New Types

```typescript
// 내 Route (복제된 Route)
interface MyRoute {
  id: string;
  spotLineId: string;         // 원본 Route ID
  routeSlug: string;       // 원본 Route slug (링크용)
  title: string;
  area: string;
  spotsCount: number;
  scheduledDate: string;   // ISO 날짜
  status: "scheduled" | "completed" | "cancelled";
  completedAt: string | null;
  parentSpotLineId: string;   // = spotLineId (복제 원본)
  createdAt: string;
}

// 복제 요청
interface ReplicateRouteRequest {
  scheduledDate: string;   // ISO 날짜
}

// 복제 응답
interface ReplicateRouteResponse {
  myRoute: MyRoute;
  replicationsCount: number;  // 원본 Route의 업데이트된 복제 수
}
```

---

## 7. File Structure

```
src/
├── app/
│   ├── my-routes/
│   │   └── page.tsx                    ← 신규: 내 일정 페이지
│   └── route/[slug]/
│       └── page.tsx                    ← 수정 불필요 (RouteVariations 이미 렌더링)
│
├── components/
│   └── route/
│       ├── RouteBottomBar.tsx          ← 수정: onClick + ReplicateRouteSheet
│       ├── RouteVariations.tsx         ← 수정: 인터랙티브 + 링크
│       ├── ReplicateRouteSheet.tsx     ← 신규: 복제 바텀시트
│       ├── MyRoutesList.tsx            ← 신규: 내 일정 목록
│       ├── MyRouteCard.tsx             ← 신규: 내 일정 카드
│       └── VariationsList.tsx          ← 신규: 변형 목록
│
├── store/
│   └── useMyRoutesStore.ts             ← 신규: 내 일정 스토어
│
├── lib/
│   └── api.ts                          ← 수정: 복제 API 함수 추가
│
└── types/
    └── index.ts                        ← 수정: MyRoute 등 타입 추가
```

**총 예상 파일**: 10개 (신규 6 + 수정 4)

---

## 8. Implementation Order

| Step | Files | Description |
|------|-------|-------------|
| **Step 1** | `types/index.ts`, `api.ts` | 타입 추가 + 복제/내 일정 API 함수 |
| **Step 2** | `useMyRoutesStore.ts` | 내 일정 Zustand 스토어 |
| **Step 3** | `ReplicateRouteSheet.tsx` | 복제 바텀시트 (날짜 선택 + 확인) |
| **Step 4** | `RouteBottomBar.tsx` | "내 일정에 추가" onClick + 인증 게이트 + 시트 연동 |
| **Step 5** | `MyRouteCard.tsx`, `MyRoutesList.tsx`, `my-routes/page.tsx` | 내 일정 페이지 |
| **Step 6** | `VariationsList.tsx`, `RouteVariations.tsx` | 변형 목록 인터랙션 |

---

## 9. API Functions

```typescript
// Route 복제
replicateRoute(spotLineId: string, scheduledDate: string): Promise<ReplicateRouteResponse>

// 내 Route 목록
fetchMyRoutes(status?: "scheduled" | "completed", page?: number): Promise<{ items: MyRoute[]; hasMore: boolean }>

// 내 Route 상태 변경 (완주/취소)
updateMyRouteStatus(myRouteId: string, status: "completed" | "cancelled"): Promise<MyRoute>

// 내 Route 삭제
deleteMyRoute(myRouteId: string): Promise<void>

// Route 변형 목록
fetchRouteVariations(spotLineId: string, page?: number): Promise<{ items: RoutePreview[]; hasMore: boolean }>
```

**인증 헤더**: 모든 API는 `Authorization: Bearer {token}` 필요.

**에러 처리 (Phase 6과 동일):**
- 401: 토큰 만료 → 로그아웃 + LoginBottomSheet
- 404/500 (미구현): graceful fallback + console.warn
- 네트워크 오류: 토스트 에러

---

## 10. UI/UX Specifications

### 10.1 ReplicateRouteSheet

```
┌────────────────────────────────────────────┐
│                                            │
│  ────────────────── (드래그 핸들)            │
│                                            │
│  📅 내 일정에 추가                           │
│                                            │
│  [Route 이름]                              │
│  [지역] · [Spot 수]곳                       │
│                                            │
│  언제 가실 예정인가요?                        │
│  ┌──────────────────────────────────┐      │
│  │  < 2026년 4월        >           │      │
│  │  [날짜 그리드]                    │      │
│  └──────────────────────────────────┘      │
│                                            │
│  ┌──────────────────────────────────┐      │
│  │  📅  추가하기                     │      │
│  └──────────────────────────────────┘      │
│                                            │
│     나중에 정할게요 (날짜 없이 추가)           │
│                                            │
└────────────────────────────────────────────┘
```

### 10.2 MyRouteCard

```
┌────────────────────────────────────────────┐
│  [Route 이름]                    D-3 🟢    │
│  [지역] · [Spot 수]곳                       │
│  📅 2026.04.05 (토)                        │
│                                            │
│  [✓ 완주]  [🗑 삭제]  [→ 원본 보기]          │
└────────────────────────────────────────────┘
```

### 10.3 내 일정 페이지 (`/my-routes`)

```
┌────────────────────────────────────────────┐
│  ← 내 일정                                  │
├────────────────────────────────────────────┤
│  [예정 (3)] [완료 (5)]  ← 탭               │
├────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  │
│  │  MyRouteCard                         │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  MyRouteCard                         │  │
│  └──────────────────────────────────────┘  │
│  ...                                       │
│                                            │
│  (비어있을 때)                               │
│  📅 예정된 일정이 없습니다                     │
│  Route를 둘러보며 내 일정에 추가해보세요        │
└────────────────────────────────────────────┘
```

---

## 11. Discussion Points

### 11.1 날짜 선택 UI

- **옵션 A**: 네이티브 `<input type="date">` — 간단하지만 디자인 제한
- **옵션 B**: 커스텀 DatePicker (월별 그리드) — UX 우수, 구현 비용 높음
- **옵션 C**: 간단한 "오늘/내일/이번 주말/직접 입력" 빠른 선택
- **결정**: 옵션 C 우선 — 빠른 선택 + 네이티브 input 폴백. 커스텀 DatePicker는 추후.

### 11.2 날짜 없이 복제

- "나중에 정할게요" 옵션 → `scheduledDate = null`
- 내 일정에 "미정" 상태로 추가
- 나중에 날짜 설정 가능

### 11.3 Backend API 미구현 전략

- Phase 6과 동일 패턴
- `replicateRoute` 실패 시 로컬 localStorage에 저장
- `fetchMyRoutes` 실패 시 localStorage에서 읽기
- Backend 구현 시 자동 연동 + localStorage 마이그레이션

### 11.4 Variations 페이지 전략

- 별도 페이지 (`/route/[slug]/variations`) 대신 **인라인 확장** 우선
- RouteVariations 컴포넌트 내에서 "더 보기" 클릭 → 아래로 목록 펼침
- 변형이 5개 이상이면 "전체 보기" 링크로 별도 페이지

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-27 | Initial draft | Development Team |
