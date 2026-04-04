# Plan: Social Features — 좋아요, 저장, 공유 인터랙션

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | Spot/Route 상세 페이지의 좋아요/공유 버튼이 로컬 상태(`useState`)만 사용하며 Backend 연동 없음. 사용자가 좋아요한 Spot/Route를 다시 찾을 방법이 없고, 저장 기능이 없어 나중에 방문할 Route를 기록할 수 없다. |
| **Solution** | v2 API 연동으로 좋아요/저장 기능을 실제 동작하게 구현. Zustand 소셜 스토어로 사용자별 인터랙션 상태 관리. 로그인 게이트로 비인증 사용자에게 로그인 유도. |
| **Function UX Effect** | 좋아요 탭 시 즉시 카운트 반영(optimistic update), 저장한 Route는 "내 저장" 목록에서 확인 가능, 공유 시 Web Share API + 딥링크 복사. 로그인 전에도 UI 인터랙션 가능하되 저장은 로그인 필요. |
| **Core Value** | 콘텐츠 인게이지먼트 데이터 수집 시작. 좋아요/저장 수는 Feed 랭킹과 추천 알고리즘의 핵심 시그널. 크루 콘텐츠의 가치를 정량화하는 첫 단계. |

| Item | Detail |
|------|--------|
| Feature | Social Features (Phase 6) |
| Created | 2026-03-27 |
| Status | Planning |
| Level | Dynamic |
| Depends On | Phase 3 (Spot/Route SSR) — 92%, Phase 4 (Feed) — 95%, Phase 5 (QR) — 96% |

---

## 1. Background & Context

### 1.1 현재 상태 (AS-IS)

**UI 구현 완료 (Backend 미연동)**:
- `SpotBottomBar.tsx` — 좋아요(Heart) 버튼, 공유 버튼, 길찾기 버튼
  - 좋아요: `useState(false)` → 로컬 토글만, API 호출 없음
  - 카운트: `spot.likesCount` 서버값 표시 + 로컬 +1/-1
  - 공유: Web Share API + clipboard fallback (동작함)
- `RouteBottomBar.tsx` — 동일 패턴 (좋아요, 공유)

**인증 시스템 구현 완료**:
- Instagram OAuth (`/api/auth/instagram`)
- `useAuthStore` — 로그인/로그아웃, localStorage 세션 (만료 체크)
- `UserProfile` 타입 — `id`, `nickname`, `avatar`, `stats`
- `AuthInitializer`, `LoginButton` 컴포넌트 존재

**Backend 타입 준비 완료**:
- `SpotDetailResponse.likesCount`, `savesCount`, `viewsCount`
- `RouteDetailResponse.likesCount`, `savesCount`, `replicationsCount`

**미구현**:
- 좋아요/저장 POST API 호출
- 사용자별 좋아요/저장 상태 조회 (isLiked, isSaved)
- 소셜 상태 관리 Zustand 스토어
- 저장 목록 페이지
- 로그인 유도 모달/시트

### 1.2 Backend API 현황

**현재 v2 API**:
```
GET /api/v2/spots/{slug}     ← likesCount, savesCount 포함
GET /api/v2/routes/{slug}    ← likesCount, savesCount 포함
```

**Phase 6에 필요한 신규 API** (Backend 구현 필요):
```
POST /api/v2/spots/{id}/like        ← 좋아요 토글
POST /api/v2/spots/{id}/save        ← 저장 토글
POST /api/v2/routes/{id}/like       ← 좋아요 토글
POST /api/v2/routes/{id}/save       ← 저장 토글
GET  /api/v2/users/me/likes         ← 내가 좋아요한 목록
GET  /api/v2/users/me/saves         ← 내가 저장한 목록
GET  /api/v2/spots/{id}/social      ← { isLiked, isSaved } (로그인 시)
GET  /api/v2/routes/{id}/social     ← { isLiked, isSaved } (로그인 시)
```

**전략**: Backend API 미구현 상태이므로, 프론트엔드에서 API 호출 함수를 구현하되 실패 시 로컬 상태로 graceful fallback. 실제 Backend 구현 시 자동 연동.

---

## 2. Scope

### 2.1 In Scope

| # | Item | Description |
|---|------|-------------|
| 1 | **좋아요 API 연동** | SpotBottomBar, RouteBottomBar의 좋아요 버튼 → v2 API POST + optimistic update |
| 2 | **저장 API 연동** | Route 저장 버튼 추가 (RouteBottomBar에 Bookmark 아이콘) |
| 3 | **소셜 상태 스토어** | `useSocialStore` — 좋아요/저장 상태 캐싱, optimistic update |
| 4 | **사용자 소셜 상태 조회** | Spot/Route 페이지 로드 시 isLiked/isSaved 상태 조회 |
| 5 | **로그인 유도 바텀시트** | 비인증 사용자가 좋아요/저장 시 로그인 유도 |
| 6 | **저장 목록 페이지** | `/saves` — 저장한 Spot/Route 목록 (탭 구분) |
| 7 | **API 함수 추가** | `toggleLike`, `toggleSave`, `fetchSocialStatus`, `fetchMyLikes`, `fetchMySaves` |

### 2.2 Out of Scope

| Item | Reason |
|------|--------|
| 팔로우 시스템 | 크리에이터 콘텐츠 확보 후 (Phase 8 이후) |
| 댓글 시스템 | 초기에는 좋아요/저장만으로 인게이지먼트 측정 |
| 유저 프로필 페이지 | Phase 7 (Experience Replication)에서 구현 |
| 알림 시스템 | 별도 feature |
| 피드 랭킹 반영 | Backend에서 처리, 프론트 변경 불필요 |

---

## 3. Core Changes

### 3.1 Optimistic Update 패턴

```
사용자 탭 → 즉시 UI 반영 (카운트 ±1, 아이콘 색상 변경)
  → API POST 비동기 호출
  → 성공: 서버 카운트로 갱신
  → 실패: 롤백 (이전 상태 복원) + 토스트 에러
```

**핵심**: 사용자 체감 반응성. API 응답 대기 없이 즉시 피드백.

### 3.2 인증 게이트

```
좋아요/저장 버튼 클릭
  → isAuthenticated?
    → Yes: API 호출
    → No: LoginBottomSheet 표시 ("로그인하고 좋아요를 남겨보세요")
```

**로그인 후**: 현재 페이지로 돌아와서 마지막 액션 자동 실행 (returnUrl + pending action).

### 3.3 소셜 상태 로딩

```
Spot/Route 페이지 진입 (SSR)
  → 서버에서 likesCount, savesCount 렌더링 (기존)
  → 클라이언트에서 hydration 후:
    → isAuthenticated?
      → Yes: fetchSocialStatus(id) → isLiked, isSaved 반영
      → No: 기본 false
```

---

## 4. Data Flow

### 4.1 좋아요 플로우

```
SpotBottomBar (좋아요 버튼 탭)
  → useSocialStore.toggleLike("spot", spotId)
  → optimistic: liked = !liked, count ±1
  → POST /api/v2/spots/{id}/like (Authorization: Bearer token)
  → 성공: 서버 count 반영
  → 실패: 롤백 + 에러 토스트
```

### 4.2 저장 플로우

```
RouteBottomBar (저장 버튼 탭)
  → useSocialStore.toggleSave("route", spotLineId)
  → optimistic: saved = !saved, count ±1
  → POST /api/v2/routes/{id}/save (Authorization: Bearer token)
  → 성공: 서버 count 반영
  → 실패: 롤백 + 에러 토스트
```

---

## 5. New/Modified Components

### 5.1 New Components

| Component | File | Description |
|-----------|------|-------------|
| LoginBottomSheet | `src/components/auth/LoginBottomSheet.tsx` | 로그인 유도 바텀시트 (Instagram 로그인 버튼) |
| SocialActions | `src/components/social/SocialActions.tsx` | 좋아요+저장+공유 통합 액션 바 (Spot/Route 공용) |
| SavesPage | `src/app/saves/page.tsx` | 저장 목록 페이지 (Spot/Route 탭) |
| SavesList | `src/components/social/SavesList.tsx` | 저장 목록 클라이언트 컴포넌트 |

### 5.2 New Stores/Libs

| File | Description |
|------|-------------|
| `src/store/useSocialStore.ts` | 좋아요/저장 상태 관리 (optimistic update) |

### 5.3 Modified Components/Pages

| File | Change |
|------|--------|
| `src/components/spot/SpotBottomBar.tsx` | useState → useSocialStore, 로그인 게이트 추가 |
| `src/components/route/RouteBottomBar.tsx` | useState → useSocialStore, 저장 버튼 추가, 로그인 게이트 |
| `src/app/spot/[slug]/page.tsx` | SocialActions hydration (클라이언트 소셜 상태 로딩) |
| `src/app/route/[slug]/page.tsx` | SocialActions hydration |
| `src/lib/api.ts` | `toggleLike`, `toggleSave`, `fetchSocialStatus`, `fetchMyLikes`, `fetchMySaves` |
| `src/types/index.ts` | `SocialStatus`, `SocialToggleResponse` 타입 추가 |

### 5.4 Preserved (No Change)

| File | Reason |
|------|--------|
| Feed/City/Theme 페이지 | likesCount 서버 렌더링은 기존 유지 |
| SpotHero, SpotCrewNote 등 | 소셜 기능과 무관 |
| 인증 시스템 (auth.ts, useAuthStore) | 기존 코드 활용, 수정 불필요 |

---

## 6. New Types

```typescript
// 소셜 상태 (사용자별)
interface SocialStatus {
  isLiked: boolean;
  isSaved: boolean;
}

// 토글 API 응답
interface SocialToggleResponse {
  liked?: boolean;     // 현재 상태
  saved?: boolean;     // 현재 상태
  likesCount: number;  // 서버 최신 카운트
  savesCount: number;
}
```

---

## 7. File Structure

```
src/
├── app/
│   ├── saves/
│   │   └── page.tsx                  ← 신규: 저장 목록 페이지
│   ├── spot/[slug]/
│   │   └── page.tsx                  ← 수정: 소셜 상태 hydration
│   └── route/[slug]/
│       └── page.tsx                  ← 수정: 소셜 상태 hydration
│
├── components/
│   ├── auth/
│   │   └── LoginBottomSheet.tsx      ← 신규: 로그인 유도 바텀시트
│   ├── social/
│   │   ├── SocialActions.tsx         ← 신규: 통합 액션 바
│   │   └── SavesList.tsx             ← 신규: 저장 목록
│   ├── spot/
│   │   └── SpotBottomBar.tsx         ← 수정: useSocialStore 연동
│   └── route/
│       └── RouteBottomBar.tsx        ← 수정: useSocialStore + 저장 버튼
│
├── store/
│   └── useSocialStore.ts             ← 신규: 소셜 상태 관리
│
├── lib/
│   └── api.ts                        ← 수정: 소셜 API 함수 추가
│
└── types/
    └── index.ts                      ← 수정: SocialStatus, SocialToggleResponse
```

**총 예상 파일**: 11개 (신규 5 + 수정 6)

---

## 8. Implementation Order

| Step | Files | Description |
|------|-------|-------------|
| **Step 1** | `types/index.ts`, `api.ts` | 타입 추가 + 소셜 API 함수 (toggleLike, toggleSave, fetchSocialStatus 등) |
| **Step 2** | `useSocialStore.ts` | 소셜 상태 Zustand 스토어 (optimistic update 로직) |
| **Step 3** | `LoginBottomSheet.tsx` | 로그인 유도 바텀시트 |
| **Step 4** | `SpotBottomBar.tsx`, `RouteBottomBar.tsx` | 기존 BottomBar → useSocialStore 연동 + 로그인 게이트 |
| **Step 5** | `SocialActions.tsx` | Spot/Route 공용 소셜 액션 (선택: BottomBar 리팩토링 or 별도 컴포넌트) |
| **Step 6** | `spot/[slug]/page.tsx`, `route/[slug]/page.tsx` | 소셜 상태 hydration (클라이언트) |
| **Step 7** | `SavesList.tsx`, `saves/page.tsx` | 저장 목록 페이지 |

---

## 9. API Functions

```typescript
// 좋아요 토글
toggleLike(type: "spot" | "route", id: string): Promise<SocialToggleResponse>

// 저장 토글
toggleSave(type: "spot" | "route", id: string): Promise<SocialToggleResponse>

// 소셜 상태 조회 (로그인 사용자)
fetchSocialStatus(type: "spot" | "route", id: string): Promise<SocialStatus>

// 내 좋아요 목록
fetchMyLikes(type: "spot" | "route", page: number): Promise<PaginatedResponse<SpotDetailResponse | RoutePreview>>

// 내 저장 목록
fetchMySaves(type: "spot" | "route", page: number): Promise<PaginatedResponse<SpotDetailResponse | RoutePreview>>
```

**인증 헤더**: 모든 소셜 API는 `Authorization: Bearer {token}` 필요. `useAuthStore`에서 토큰 가져와 요청 헤더에 추가.

**에러 처리**:
- 401: 토큰 만료 → 로그아웃 + 로그인 유도
- 404: 리소스 없음 → 무시
- 네트워크 오류: optimistic 롤백 + 에러 토스트

---

## 10. Discussion Points

### 10.1 Backend API 미구현 전략
- 프론트엔드에서 API 함수를 미리 구현
- try/catch에서 실패 시 로컬 `localStorage`에 저장 (오프라인 큐)
- Backend 구현 시 자동 연동 (엔드포인트 규약만 맞추면 됨)
- **결정**: API 실패 시 optimistic 상태 유지 + 에러 로깅. 페이지 새로고침 시 서버 상태로 리셋.

### 10.2 SocialActions vs BottomBar 수정
- **옵션 A**: 기존 SpotBottomBar/RouteBottomBar 수정 (최소 변경)
- **옵션 B**: SocialActions 공통 컴포넌트로 추출 + BottomBar에서 사용
- **결정**: 옵션 A 우선 — BottomBar 내부 로직만 변경. 중복이 심해지면 Step 5에서 SocialActions 추출.

### 10.3 비로그인 사용자 경험
- 좋아요 카운트는 모든 사용자에게 표시 (서버 렌더링)
- 좋아요/저장 탭 시 LoginBottomSheet 표시
- 로그인 후 자동으로 이전 액션 재실행 (UX 연속성)
- **결정**: 로그인 없이 좋아요 허용하지 않음 (데이터 품질 우선)
