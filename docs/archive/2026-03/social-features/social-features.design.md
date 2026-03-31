# Social Features Design Document

> **Summary**: Spot/Route 좋아요, 저장, 공유 인터랙션 — v2 API 연동 + Optimistic Update + 로그인 게이트
>
> **Project**: front-spotLine (Next.js 16, React 19, Tailwind CSS 4)
> **Date**: 2026-03-27
> **Status**: Draft
> **Planning Doc**: [social-features.plan.md](../../01-plan/features/social-features.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. 기존 `useState` 로컬 상태를 Zustand + v2 API 연동으로 전환
2. Optimistic Update로 즉각적 사용자 피드백 제공
3. 비인증 사용자 → LoginBottomSheet로 자연스러운 로그인 유도
4. Backend API 미구현 시 graceful fallback (로컬 상태 유지)

### 1.2 Design Principles

- **Optimistic First**: API 응답 대기 없이 즉시 UI 반영, 실패 시 롤백
- **Auth Gate**: 좋아요/저장 액션 시점에만 로그인 요구 (browsing은 자유)
- **Graceful Degradation**: API 실패 시 로컬 상태 유지, UX 끊김 없음

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│  SSR (Server Component)                                 │
│  spot/[slug]/page.tsx  ──── likesCount, savesCount      │
│  route/[slug]/page.tsx       (서버에서 렌더링)            │
└──────────────┬──────────────────────────────────────────┘
               │ props
               ▼
┌─────────────────────────────────────────────────────────┐
│  Client Components ("use client")                        │
│                                                          │
│  SpotBottomBar ──┐                                      │
│  RouteBottomBar ─┤── useSocialStore (Zustand)           │
│                  │      │                                │
│                  │      ├── optimistic toggle             │
│                  │      └── API call (async)              │
│                  │                                        │
│                  └── useAuthStore.isAuthenticated?        │
│                        ├── Yes: API call                  │
│                        └── No: LoginBottomSheet           │
└─────────────────────────────────────────────────────────┘
               │
               ▼ POST /api/v2/{spots|routes}/{id}/{like|save}
┌─────────────────────────────────────────────────────────┐
│  Spring Boot v2 Backend (port 4000)                     │
│  → 소셜 상태 저장, 카운트 반환                              │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

**좋아요 플로우:**
```
User tap Heart → isAuthenticated?
  ├─ No → show LoginBottomSheet → login → retry action
  └─ Yes → useSocialStore.toggleLike(type, id)
            ├─ Optimistic: liked = !liked, count ±1 (즉시 UI 반영)
            ├─ POST /api/v2/{type}s/{id}/like
            │   ├─ 200 OK → 서버 count로 갱신
            │   └─ Error → 롤백 (이전 상태) + 토스트
            └─ Return
```

**소셜 상태 초기화 플로우:**
```
Page mount (client hydration)
  → isAuthenticated?
    ├─ Yes → fetchSocialStatus(type, id) → { isLiked, isSaved }
    │         → useSocialStore에 캐싱
    └─ No → defaults (liked: false, saved: false)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| SpotBottomBar | useSocialStore, useAuthStore | 좋아요 토글 + 인증 확인 |
| RouteBottomBar | useSocialStore, useAuthStore | 좋아요/저장 토글 + 인증 확인 |
| LoginBottomSheet | useAuthStore, auth.ts | Instagram OAuth 실행 |
| useSocialStore | api.ts (toggleLike, toggleSave) | API 호출 |
| SavesList | api.ts (fetchMySaves) | 저장 목록 조회 |

---

## 3. Data Model

### 3.1 New Types

```typescript
// src/types/index.ts에 추가

// 소셜 상태 (사용자별, 리소스별)
export interface SocialStatus {
  isLiked: boolean;
  isSaved: boolean;
}

// 소셜 토글 API 응답
export interface SocialToggleResponse {
  liked?: boolean;
  saved?: boolean;
  likesCount: number;
  savesCount: number;
}
```

### 3.2 Existing Types (변경 없음)

- `SpotDetailResponse.likesCount`, `.savesCount` — 이미 존재
- `RouteDetailResponse.likesCount`, `.savesCount` — 이미 존재

---

## 4. API Specification

### 4.1 Endpoint List

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v2/spots/{id}/like` | Spot 좋아요 토글 | Required |
| POST | `/api/v2/spots/{id}/save` | Spot 저장 토글 | Required |
| POST | `/api/v2/routes/{id}/like` | Route 좋아요 토글 | Required |
| POST | `/api/v2/routes/{id}/save` | Route 저장 토글 | Required |
| GET | `/api/v2/spots/{id}/social` | Spot 소셜 상태 조회 | Required |
| GET | `/api/v2/routes/{id}/social` | Route 소셜 상태 조회 | Required |
| GET | `/api/v2/users/me/saves` | 내 저장 목록 | Required |

### 4.2 Toggle API 상세

#### `POST /api/v2/{spots|routes}/{id}/like`

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "liked": true,
  "likesCount": 42
}
```

#### `GET /api/v2/{spots|routes}/{id}/social`

**Response (200):**
```json
{
  "isLiked": true,
  "isSaved": false
}
```

### 4.3 Graceful Fallback 전략

Backend API가 미구현(404/500)일 때:
- `toggleLike`/`toggleSave`: optimistic 상태 유지, 에러 무시 (console.warn만)
- `fetchSocialStatus`: `{ isLiked: false, isSaved: false }` 반환
- `fetchMySaves`: 빈 배열 반환
- 페이지 새로고침 시 서버 상태로 리셋

---

## 5. UI/UX Design

### 5.1 SpotBottomBar (수정)

```
┌────────────────────────────────────────────┐
│  ❤️ 42   |  🔗 공유  |  [🧭 길찾기 ▲]     │
│  (토글)     (기존)       (기존)              │
└────────────────────────────────────────────┘
```

변경점: Heart 버튼이 useSocialStore 연동, 인증 게이트 추가

### 5.2 RouteBottomBar (수정)

```
┌────────────────────────────────────────────┐
│  ❤️ 12   |  🔖 저장  |  🔗 공유  |  [📅]  │
│  (토글)    (신규)      (기존)    (기존)      │
└────────────────────────────────────────────┘
```

변경점: 저장(Bookmark) 버튼 추가, Heart useSocialStore 연동, "내 일정에 추가" 유지

### 5.3 LoginBottomSheet

```
┌────────────────────────────────────────────┐
│                                            │
│  ────────────────── (드래그 핸들)            │
│                                            │
│     로그인하고 좋아요를 남겨보세요              │
│     Spotline에서 좋아한 장소를 저장하세요       │
│                                            │
│  ┌──────────────────────────────────┐      │
│  │  📷  Instagram으로 로그인         │      │
│  └──────────────────────────────────┘      │
│                                            │
│     나중에 할게요                             │
│                                            │
└────────────────────────────────────────────┘
```

- Portal 기반 (`createPortal`) — z-50 overlay
- backdrop click/swipe down으로 닫기
- `message` prop으로 상황별 메시지 ("좋아요를 남겨보세요" / "저장해보세요")

### 5.4 SavesPage (`/saves`)

```
┌────────────────────────────────────────────┐
│  ← 내 저장                                  │
├────────────────────────────────────────────┤
│  [Spot] [Route]  ← 탭 (기본: Spot)          │
├────────────────────────────────────────────┤
│  ┌──────┐  스팟 이름                         │
│  │ img  │  지역 · 카테고리                    │
│  │      │  ❤️ 12  🔖 저장됨                  │
│  └──────┘                                   │
│  ────────────────────────                   │
│  ┌──────┐  스팟 이름                         │
│  │ img  │  지역 · 카테고리                    │
│  └──────┘                                   │
│  ...                                        │
│                                             │
│  (비어있을 때)                                │
│  📌 저장한 장소가 없습니다                      │
│  Spot을 둘러보며 마음에 드는 곳을 저장해보세요    │
└────────────────────────────────────────────┘
```

---

## 6. Detailed Component Specifications

### 6.1 `useSocialStore` (신규)

```typescript
// src/store/useSocialStore.ts

interface SocialItem {
  liked: boolean;
  saved: boolean;
  likesCount: number;
  savesCount: number;
}

interface SocialState {
  // Map key: "{type}:{id}" (e.g., "spot:abc123")
  items: Record<string, SocialItem>;

  // Actions
  initSocialStatus: (type: "spot" | "route", id: string, status: SocialStatus, likesCount: number, savesCount: number) => void;
  toggleLike: (type: "spot" | "route", id: string) => Promise<void>;
  toggleSave: (type: "spot" | "route", id: string) => Promise<void>;
  getItem: (type: "spot" | "route", id: string) => SocialItem | undefined;
}
```

**Optimistic Update 구현:**
```
toggleLike(type, id):
  1. key = `${type}:${id}`
  2. prev = items[key]
  3. optimistic: set liked = !prev.liked, likesCount ±1
  4. try: response = await api.toggleLike(type, id)
  5. success: set likesCount = response.likesCount
  6. catch: rollback to prev state, console.warn
```

### 6.2 `LoginBottomSheet` (신규)

```typescript
// src/components/auth/LoginBottomSheet.tsx
interface LoginBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;  // "로그인하고 좋아요를 남겨보세요"
}
```

- `"use client"` 컴포넌트
- `createPortal` → `document.body`에 렌더링
- 닫기: backdrop click, "나중에 할게요" 버튼, Escape 키
- Instagram 로그인 버튼: `startInstagramLogin()` 호출
- 로그인 성공 후 바텀시트 자동 닫힘 (`useAuthStore.isAuthenticated` 감지)

### 6.3 `SpotBottomBar` (수정)

```typescript
// 변경 요약
// Before: useState(false) 로컬 토글
// After: useSocialStore + useAuthStore 연동

export default function SpotBottomBar({ spot }: SpotBottomBarProps) {
  // 1. useSocialStore에서 소셜 상태 가져오기
  const item = useSocialStore(s => s.getItem("spot", spot.id));
  const toggleLike = useSocialStore(s => s.toggleLike);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  // 2. 로그인 바텀시트 상태
  const [showLogin, setShowLogin] = useState(false);

  // 3. liked/likesCount 계산
  const liked = item?.liked ?? false;
  const likesCount = item?.likesCount ?? spot.likesCount;

  // 4. 좋아요 핸들러
  const handleLike = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    toggleLike("spot", spot.id);
  };

  // ... 기존 handleShare, showMap 로직 유지
}
```

### 6.4 `RouteBottomBar` (수정)

```typescript
// 변경 요약
// Before: useState(false) 로컬 토글, 저장 버튼 없음
// After: useSocialStore 연동, Bookmark 저장 버튼 추가

export default function RouteBottomBar({ route }: RouteBottomBarProps) {
  const item = useSocialStore(s => s.getItem("route", route.id));
  const toggleLike = useSocialStore(s => s.toggleLike);
  const toggleSave = useSocialStore(s => s.toggleSave);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  const liked = item?.liked ?? false;
  const saved = item?.saved ?? false;
  const likesCount = item?.likesCount ?? route.likesCount;

  const handleLike = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 좋아요를 남겨보세요");
      setShowLogin(true);
      return;
    }
    toggleLike("route", route.id);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 이 코스를 저장해보세요");
      setShowLogin(true);
      return;
    }
    toggleSave("route", route.id);
  };

  // 버튼 레이아웃: [Heart] [Bookmark] [Share] [CalendarPlus]
}
```

### 6.5 `SocialHydrator` (클라이언트 hydration 컴포넌트)

Plan에서 `SocialActions`로 명명했으나, 실제 역할은 소셜 상태 초기화(hydration)이므로 `SocialHydrator`로 명칭 변경.

```typescript
// src/components/social/SocialHydrator.tsx
"use client";

interface SocialHydratorProps {
  type: "spot" | "route";
  id: string;
  likesCount: number;
  savesCount: number;
}

// page.tsx (서버 컴포넌트)에서 렌더링
// 클라이언트에서 mount 시:
//   1. useSocialStore.initSocialStatus(type, id, { isLiked: false, isSaved: false }, likesCount, savesCount)
//   2. isAuthenticated → fetchSocialStatus(type, id) → initSocialStatus 갱신
// 렌더링: null (invisible)
```

### 6.6 `SavesList` (신규)

```typescript
// src/components/social/SavesList.tsx
"use client";

interface SavesListProps {
  // No props — 내부에서 useAuthStore + API 호출
}

// 기능:
// - Spot/Route 탭 전환
// - fetchMySaves(type, page) 호출
// - 비로그인 시 로그인 유도 메시지
// - 빈 상태 UI
// - SpotCard/RouteCard 재사용 (또는 간단한 리스트 아이템)
```

### 6.7 `saves/page.tsx` (신규)

```typescript
// src/app/saves/page.tsx
// 서버 컴포넌트 — 메타데이터 + SavesList 클라이언트 컴포넌트 렌더링

export const metadata: Metadata = {
  title: "내 저장 | Spotline",
};

export default function SavesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header>← 내 저장</header>
      <SavesList />
    </main>
  );
}
```

---

## 7. API Functions

### 7.1 `api.ts` 추가 함수

```typescript
// src/lib/api.ts에 추가

// 좋아요 토글
export const toggleLike = async (
  type: "spot" | "route",
  id: string
): Promise<SocialToggleResponse> => {
  const response = await apiV2.post<SocialToggleResponse>(
    `/${type}s/${id}/like`,
    {},
    { headers: { Authorization: `Bearer ${getAuthToken()}` } }
  );
  return response.data;
};

// 저장 토글
export const toggleSave = async (
  type: "spot" | "route",
  id: string
): Promise<SocialToggleResponse> => {
  const response = await apiV2.post<SocialToggleResponse>(
    `/${type}s/${id}/save`,
    {},
    { headers: { Authorization: `Bearer ${getAuthToken()}` } }
  );
  return response.data;
};

// 소셜 상태 조회 (로그인 사용자)
export const fetchSocialStatus = async (
  type: "spot" | "route",
  id: string
): Promise<SocialStatus> => {
  try {
    const response = await apiV2.get<SocialStatus>(
      `/${type}s/${id}/social`,
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    );
    return response.data;
  } catch {
    return { isLiked: false, isSaved: false };
  }
};

// 내 저장 목록
export const fetchMySaves = async (
  type: "spot" | "route",
  page: number = 1
): Promise<{ items: (SpotDetailResponse | RoutePreview)[]; hasMore: boolean }> => {
  try {
    const response = await apiV2.get(
      `/users/me/saves?type=${type}&page=${page}`,
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    );
    return response.data;
  } catch {
    return { items: [], hasMore: false };
  }
};

// Auth 토큰 헬퍼
const getAuthToken = (): string => {
  // useAuthStore에서 직접 가져올 수 없으므로 (non-React context)
  // localStorage에서 직접 읽기
  try {
    const raw = localStorage.getItem("spotline_auth");
    if (!raw) return "";
    const data = JSON.parse(raw);
    return data.instagramUser?.accessToken || "";
  } catch {
    return "";
  }
};
```

---

## 8. Error Handling

| Scenario | Handling |
|----------|----------|
| API 401 (토큰 만료) | `useAuthStore.logout()` → LoginBottomSheet 표시 |
| API 404/500 (미구현) | Optimistic 상태 유지, `console.warn` |
| 네트워크 오류 | Optimistic 롤백 + `console.warn` |
| 비로그인 좋아요/저장 | LoginBottomSheet 표시 |

---

## 9. Implementation Checklist

### Step 1: 타입 + API 함수 (기반)

- [ ] `src/types/index.ts` — `SocialStatus`, `SocialToggleResponse` 인터페이스 추가
- [ ] `src/lib/api.ts` — `toggleLike`, `toggleSave`, `fetchSocialStatus`, `fetchMySaves`, `getAuthToken` 추가

### Step 2: 소셜 상태 스토어

- [ ] `src/store/useSocialStore.ts` — Zustand 스토어 생성 (items Map, initSocialStatus, toggleLike, toggleSave, getItem)

### Step 3: 로그인 바텀시트

- [ ] `src/components/auth/LoginBottomSheet.tsx` — Portal 기반 바텀시트 (isOpen, onClose, message props)

### Step 4: BottomBar 수정

- [ ] `src/components/spot/SpotBottomBar.tsx` — useSocialStore 연동, 로그인 게이트 추가
- [ ] `src/components/route/RouteBottomBar.tsx` — useSocialStore 연동, Bookmark 저장 버튼 추가, 로그인 게이트

### Step 5: 소셜 Hydration

- [ ] `src/components/social/SocialHydrator.tsx` — 클라이언트 hydration (소셜 상태 초기화)
- [ ] `src/app/spot/[slug]/page.tsx` — `<SocialHydrator>` 추가
- [ ] `src/app/route/[slug]/page.tsx` — `<SocialHydrator>` 추가

### Step 6: 저장 목록 페이지

- [ ] `src/components/social/SavesList.tsx` — 저장 목록 클라이언트 컴포넌트
- [ ] `src/app/saves/page.tsx` — 저장 목록 페이지

**총 파일: 11개 (신규 5 + 수정 6)**

| # | File | Action | Step |
|---|------|--------|------|
| 1 | `src/types/index.ts` | 수정 | 1 |
| 2 | `src/lib/api.ts` | 수정 | 1 |
| 3 | `src/store/useSocialStore.ts` | 신규 | 2 |
| 4 | `src/components/auth/LoginBottomSheet.tsx` | 신규 | 3 |
| 5 | `src/components/spot/SpotBottomBar.tsx` | 수정 | 4 |
| 6 | `src/components/route/RouteBottomBar.tsx` | 수정 | 4 |
| 7 | `src/components/social/SocialHydrator.tsx` | 신규 | 5 |
| 8 | `src/app/spot/[slug]/page.tsx` | 수정 | 5 |
| 9 | `src/app/route/[slug]/page.tsx` | 수정 | 5 |
| 10 | `src/components/social/SavesList.tsx` | 신규 | 6 |
| 11 | `src/app/saves/page.tsx` | 신규 | 6 |

---

## 10. Conventions Applied

| Item | Convention |
|------|-----------|
| Component naming | PascalCase (`LoginBottomSheet`, `SocialHydrator`, `SavesList`) |
| Store naming | camelCase with `use` prefix (`useSocialStore`) |
| State management | Zustand selector pattern (`useSocialStore(s => s.getItem(...))`) |
| Styling | Tailwind CSS 4, `cn()` 유틸, 모바일 퍼스트 |
| Import order | React → External → Internal → Types |
| UI 텍스트 | 한국어 |
| 코드 | 영어 |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-03-27 | Initial draft |
