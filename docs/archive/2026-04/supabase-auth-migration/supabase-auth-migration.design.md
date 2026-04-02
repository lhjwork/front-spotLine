# supabase-auth-migration Design

> **Summary**: front-spotLine Instagram OAuth → Supabase Auth 전환 상세 설계
>
> **Project**: Spotline
> **Date**: 2026-04-03
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/supabase-auth-migration.plan.md`

---

## 1. Implementation Order

```
Step 1: 패키지 설치 + 환경변수 설정
Step 2: src/lib/supabase.ts (New) — Supabase 클라이언트
Step 3: src/types/index.ts (Edit) — InstagramUser 제거, 타입 정리
Step 4: src/store/useAuthStore.ts (Rewrite) — Supabase session 기반
Step 5: src/lib/auth.ts (Rewrite) — Supabase 로그인 헬퍼
Step 6: src/lib/api.ts (Edit) — getAuthToken() 수정
Step 7: src/components/auth/AuthInitializer.tsx (Rewrite) — onAuthStateChange
Step 8: src/app/auth/callback/page.tsx (Rewrite) — Supabase OAuth callback
Step 9: src/components/auth/LoginBottomSheet.tsx (Edit) — OAuth 버튼 교체
Step 10: src/components/auth/LoginButton.tsx (Edit) — Supabase 기반 표시
Step 11: 레거시 삭제 (Instagram API routes)
Step 12: 검증 — 11개 인증 API 테스트
```

---

## 2. File-by-File Design

### 2.1 패키지 설치 + 환경변수

```bash
cd front-spotLine
pnpm add @supabase/supabase-js @supabase/ssr
```

`.env.local` 추가:
```
NEXT_PUBLIC_SUPABASE_URL=<admin-spotLine과 동일한 Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<admin-spotLine과 동일한 Anon Key>
```

---

### 2.2 `src/lib/supabase.ts` (New)

브라우저 클라이언트 생성. Next.js App Router 환경에서 `@supabase/ssr` 사용.

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**설계 결정**: 싱글턴이 아닌 팩토리 함수로 생성. `@supabase/ssr`의 `createBrowserClient`는 내부적으로 동일 URL/Key에 대해 싱글턴을 관리하므로 매번 호출해도 안전.

---

### 2.3 `src/types/index.ts` (Edit)

**삭제**:
```typescript
// 삭제할 타입
export interface InstagramUser { ... }
export interface InstagramAuthResponse { ... }
```

**UserProfile 수정** — `instagramId` optional 유지 (기존 DB 호환):
```typescript
export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  bio?: string;
  joinedAt: string;
  instagramId?: string;  // 레거시 호환, 향후 제거
  email?: string;        // Supabase user email
  stats: {
    visited: number;
    liked: number;
    recommended: number;
    spotlines: number;
    followers: number;
    following: number;
  };
}
```

---

### 2.4 `src/store/useAuthStore.ts` (Rewrite)

현재: localStorage에 `{ user, instagramUser, expiresAt }` 저장, Supabase 무관.
변경: Supabase session을 source of truth로 사용. localStorage에는 UserProfile만 캐시.

```typescript
import { create } from "zustand";
import type { UserProfile } from "@/types";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const PROFILE_CACHE_KEY = "spotline_user_profile";

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  setUser: (user: UserProfile) => void;
  logout: () => Promise<void>;
  initFromSupabase: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  session: null,
  isLoading: true,

  setSession: (session) => {
    if (session) {
      const cachedProfile = loadCachedProfile();
      set({
        isAuthenticated: true,
        session,
        user: cachedProfile || sessionToUserProfile(session),
      });
    } else {
      clearCachedProfile();
      set({ isAuthenticated: false, session: null, user: null });
    }
  },

  setUser: (user) => {
    saveCachedProfile(user);
    set({ user });
  },

  logout: async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    clearCachedProfile();
    set({ isAuthenticated: false, session: null, user: null });
  },

  initFromSupabase: async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    get().setSession(session);
    set({ isLoading: false });
  },
}));

// --- Helper functions ---

function sessionToUserProfile(session: Session): UserProfile {
  const user = session.user;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    nickname: meta.full_name || meta.name || user.email?.split("@")[0] || "user",
    avatar: meta.avatar_url || meta.picture || "",
    email: user.email,
    joinedAt: user.created_at,
    stats: { visited: 0, liked: 0, recommended: 0, spotlines: 0, followers: 0, following: 0 },
  };
}

function loadCachedProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveCachedProfile(user: UserProfile): void {
  try { localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(user)); } catch {}
}

function clearCachedProfile(): void {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    localStorage.removeItem("spotline_auth"); // 레거시 정리
  } catch {}
}
```

**설계 포인트**:
- `session`을 store에 보관 → `getAuthToken()`에서 `session.access_token` 바로 접근
- Supabase `onAuthStateChange`가 session 변경 시 `setSession()` 호출
- 기존 `spotline_auth` localStorage도 `clearCachedProfile()`에서 정리 (레거시 클린업)

---

### 2.5 `src/lib/auth.ts` (Rewrite)

Instagram 헬퍼 → Supabase 헬퍼로 전환.

```typescript
import { createSupabaseBrowserClient } from "@/lib/supabase";

const RETURN_URL_KEY = "spotline_auth_return_url";

/** OAuth 로그인 시작 (Google/Kakao) */
export async function startOAuthLogin(
  provider: "google" | "kakao",
  returnUrl?: string
): Promise<void> {
  sessionStorage.setItem(RETURN_URL_KEY, returnUrl || window.location.href);
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

/** 로그인 후 돌아갈 URL 가져오기 (1회성) */
export function getAndClearReturnUrl(): string {
  const url = sessionStorage.getItem(RETURN_URL_KEY) || "/";
  sessionStorage.removeItem(RETURN_URL_KEY);
  return url;
}
```

**삭제 대상**:
- `startInstagramLogin()` — `startOAuthLogin("google")` 로 대체
- `createUserProfileFromInstagram()` — `sessionToUserProfile()`로 대체 (store 내부)

---

### 2.6 `src/lib/api.ts` (Edit)

`getAuthToken()` 수정 — Supabase session에서 access_token 추출.

```typescript
// 변경 전 (broken)
const getAuthToken = (): string => {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("spotline_auth");
    if (!raw) return "";
    const data = JSON.parse(raw);
    return data.instagramUser?.accessToken || "";
  } catch { return ""; }
};

// 변경 후
const getAuthToken = (): string => {
  // useAuthStore에서 session.access_token 직접 참조
  const session = useAuthStore.getState().session;
  return session?.access_token || "";
};
```

**import 추가**:
```typescript
import { useAuthStore } from "@/store/useAuthStore";
```

**설계 결정**: Zustand store의 `getState()`는 React 외부에서도 호출 가능. 기존 11개 API 함수의 `headers: { Authorization: ... }` 패턴은 그대로 유지 — `getAuthToken()` 내부만 바꾸면 전체 동작.

---

### 2.7 `src/components/auth/AuthInitializer.tsx` (Rewrite)

현재: `initFromStorage()` 1회 호출.
변경: Supabase `onAuthStateChange()` 구독 + 초기 세션 로드.

```typescript
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function AuthInitializer() {
  const initFromSupabase = useAuthStore((s) => s.initFromSupabase);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    initFromSupabase();

    const supabase = createSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [initFromSupabase, setSession]);

  return null;
}
```

---

### 2.8 `src/app/auth/callback/page.tsx` (Rewrite)

Supabase OAuth callback 처리. Supabase는 `#access_token=...` 형태의 URL fragment로 토큰을 전달하며, `@supabase/ssr`이 자동으로 처리.

```typescript
"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getAndClearReturnUrl } from "@/lib/auth";

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Supabase가 URL hash에서 세션을 자동 교환
    supabase.auth.getSession().then(({ data: { session }, error: err }) => {
      if (err || !session) {
        setError(err?.message || "인증 처리 중 오류가 발생했습니다.");
        return;
      }
      // 세션 확보 성공 → return URL로 이동
      const returnUrl = getAndClearReturnUrl();
      window.location.href = returnUrl;
    });
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mb-2 text-lg font-semibold text-gray-900">로그인 실패</h1>
          <p className="mb-6 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <p className="text-sm text-gray-500">로그인 처리 중...</p>
      </div>
    </div>
  );
}
```

---

### 2.9 `src/components/auth/LoginBottomSheet.tsx` (Edit)

Instagram 버튼 → Google + Kakao OAuth 버튼으로 교체.

**변경 내용**:
- `import { startInstagramLogin }` → `import { startOAuthLogin }`
- Instagram 버튼 제거
- Google 로그인 버튼 추가 (흰색 배경 + Google 로고)
- Kakao 로그인 버튼 추가 (노란 배경 + Kakao 로고)

```tsx
{/* 변경 전: Instagram Login Button */}
<button onClick={() => startInstagramLogin()} className="...gradient...">
  Instagram으로 로그인
</button>

{/* 변경 후: Google + Kakao */}
<button
  onClick={() => startOAuthLogin("google")}
  className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-white py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
>
  <GoogleIcon />
  Google로 계속하기
</button>

<button
  onClick={() => startOAuthLogin("kakao")}
  className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#FEE500] py-3.5 text-sm font-semibold text-[#191919] transition-colors hover:bg-[#FDD800]"
>
  <KakaoIcon />
  카카오로 계속하기
</button>
```

**GoogleIcon / KakaoIcon**: 인라인 SVG 컴포넌트로 같은 파일 내에 정의.

---

### 2.10 `src/components/auth/LoginButton.tsx` (Edit)

**변경 내용**:
- `import { startInstagramLogin }` → `import { startOAuthLogin }`
- `instagramUser` 참조 제거
- 로그인 버튼 스타일: Instagram gradient → 심플 회색 (Provider 선택은 LoginBottomSheet에서)
- 드롭다운 "Instagram 연동됨" → "Google/Kakao 연동됨" 또는 이메일 표시
- 로그인 미인증 시: LoginBottomSheet를 여는 방식으로 변경

```typescript
// 변경 전
const instagramUser = useAuthStore((s) => s.instagramUser);
// ...
<p className="text-xs text-gray-500">Instagram 연동됨</p>

// 변경 후
const user = useAuthStore((s) => s.user);
// ...
<p className="text-xs text-gray-500">{user?.email || "로그인됨"}</p>
```

미인증 버튼: LoginBottomSheet를 열도록 state + 컴포넌트 추가.

```tsx
// 변경 후 (미인증)
const [showLogin, setShowLogin] = useState(false);
// ...
<button onClick={() => setShowLogin(true)} className="...">
  로그인
</button>
<LoginBottomSheet isOpen={showLogin} onClose={() => setShowLogin(false)} />
```

---

### 2.11 레거시 삭제

**삭제 파일**:
- `src/app/api/auth/instagram/route.ts`
- `src/app/api/auth/instagram/callback/route.ts`

**타입 삭제** (`src/types/index.ts`):
- `InstagramUser` interface
- `InstagramAuthResponse` interface

**Store 정리**:
- `useAuthStore`에서 `instagramUser` 필드 완전 제거 (Step 4에서 이미 완료)

---

## 3. Data Flow

### 3.1 로그인 플로우

```
1. 사용자 → LoginBottomSheet "Google로 계속하기" 클릭
2. startOAuthLogin("google") 호출
   → sessionStorage에 returnUrl 저장
   → supabase.auth.signInWithOAuth({ provider: "google" })
   → Supabase가 Google OAuth 페이지로 리다이렉트
3. Google 로그인 완료 → Supabase가 /auth/callback#access_token=... 로 리다이렉트
4. AuthCallbackPage → supabase.auth.getSession() → 세션 확보
5. onAuthStateChange 이벤트 발생 → AuthInitializer가 수신
6. setSession(session) → useAuthStore 업데이트
   → isAuthenticated = true
   → session.access_token 보관
   → UserProfile 생성 (user_metadata에서)
7. AuthCallbackPage → returnUrl로 이동
```

### 3.2 인증 API 호출 플로우

```
1. 사용자 → 좋아요 버튼 클릭
2. toggleLike("spot", id) 호출
3. headers: { Authorization: `Bearer ${getAuthToken()}` }
4. getAuthToken() → useAuthStore.getState().session?.access_token
5. 백엔드 수신 → JwtAuthenticationFilter
   → resolveToken() → Bearer 파싱
   → jwtTokenProvider.validateToken() → HMAC 검증 (SUPABASE_JWT_SECRET)
   → claims에서 userId, email, role 추출
   → SecurityContext 설정
6. Controller → authUtil.requireUserId() → 성공 → 비즈니스 로직 실행
```

### 3.3 세션 갱신 플로우

```
1. Supabase JS 클라이언트가 자동으로 토큰 갱신 관리
   → access_token 만료 (기본 1시간) 전에 자동 refresh
2. onAuthStateChange에서 TOKEN_REFRESHED 이벤트 수신
3. setSession(newSession) → store에 새 access_token 반영
4. 다음 API 호출부터 새 토큰 사용 (사용자 인지 없이)
```

---

## 4. 컴포넌트 임팩트 분석

### 4.1 직접 수정 파일 (12개)

| # | File | 변경 유형 | 난이도 |
|---|------|-----------|--------|
| 1 | `src/lib/supabase.ts` | New | Low |
| 2 | `src/types/index.ts` | Edit (타입 삭제/추가) | Low |
| 3 | `src/store/useAuthStore.ts` | Rewrite | Medium |
| 4 | `src/lib/auth.ts` | Rewrite | Low |
| 5 | `src/lib/api.ts` | Edit (getAuthToken 3줄) | Low |
| 6 | `src/components/auth/AuthInitializer.tsx` | Rewrite | Low |
| 7 | `src/app/auth/callback/page.tsx` | Rewrite | Low |
| 8 | `src/components/auth/LoginBottomSheet.tsx` | Edit (버튼 교체) | Medium |
| 9 | `src/components/auth/LoginButton.tsx` | Edit (Instagram 참조 제거) | Medium |
| 10 | `src/app/api/auth/instagram/route.ts` | Delete | - |
| 11 | `src/app/api/auth/instagram/callback/route.ts` | Delete | - |
| 12 | `.env.local` | Edit (환경변수 추가) | Low |

### 4.2 간접 영향 파일 (변경 불필요)

아래 파일들은 `useAuthStore`의 `isAuthenticated`, `user`만 참조하므로 store 인터페이스가 유지되면 변경 불필요:

| File | 참조 |
|------|------|
| `src/components/social/SavesList.tsx` | `isAuthenticated` |
| `src/components/social/SocialHydrator.tsx` | `isAuthenticated` |
| `src/components/spot/SpotBottomBar.tsx` | `isAuthenticated` |
| `src/components/route/RouteBottomBar.tsx` | `isAuthenticated` |
| `src/components/route/MyRoutesList.tsx` | `isAuthenticated` |
| `src/components/profile/FollowListSheet.tsx` | `isAuthenticated`, `user` |
| `src/app/profile/[userId]/ProfileClient.tsx` | `user`, `isAuthenticated` |
| `src/app/profile/me/page.tsx` | `user`, `isAuthenticated` |

**핵심**: `useAuthStore`에서 `isAuthenticated`, `user`, `logout` 인터페이스를 유지하면 이 파일들은 수정 없이 동작.

단, `instagramUser`를 직접 참조하는 파일:
- `LoginButton.tsx` — `instagramUser?.username` → `user?.nickname`으로 변경 (Step 10에서 처리)

---

## 5. 환경 설정 체크리스트

### 5.1 Supabase Dashboard (사전 작업 — 코드 전)

- [ ] Authentication > Providers > Google 활성화
  - Google Cloud Console에서 OAuth Client 생성
  - Authorized redirect URI: `https://<supabase-project>.supabase.co/auth/v1/callback`
- [ ] Authentication > Providers > Kakao 활성화
  - Kakao Developers에서 앱 등록
  - REST API Key를 Supabase에 입력
- [ ] Authentication > URL Configuration
  - Site URL: `http://localhost:3003` (개발)
  - Redirect URLs: `http://localhost:3003/auth/callback`

### 5.2 환경변수 확인

```bash
# front-spotLine/.env.local — admin-spotLine과 동일한 값 사용
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# springboot-spotLine-backend/.env — 이미 설정됨
SUPABASE_JWT_SECRET=<Supabase Dashboard의 JWT Secret과 동일>
```

---

## 6. 검증 계획

### 6.1 수동 테스트 시나리오

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Google 로그인 → 좋아요 클릭 | 200 OK, likesCount +1 |
| 2 | Kakao 로그인 → 저장 클릭 | 200 OK, savesCount +1 |
| 3 | 로그인 → /saves 페이지 | 저장 목록 정상 로드 |
| 4 | 로그인 → 팔로우 클릭 | 200 OK, followersCount +1 |
| 5 | 로그인 → Route 복제 | 200 OK, myRoute 생성 |
| 6 | 로그아웃 → 좋아요 클릭 | LoginBottomSheet 표시 |
| 7 | 1시간 방치 → API 호출 | 토큰 자동 갱신, 200 OK |
| 8 | 새 탭 열기 → 로그인 상태 | 유지됨 (Supabase 세션) |

### 6.2 API 전수 테스트 (11개)

| API | Function | Auth Required |
|-----|----------|:---:|
| `POST /{type}s/{id}/like` | `toggleLike` | ✅ |
| `POST /{type}s/{id}/save` | `toggleSave` | ✅ |
| `GET /{type}s/{id}/social` | `fetchSocialStatus` | ✅ |
| `POST /routes/{id}/replicate` | `replicateRoute` | ✅ |
| `GET /users/me/routes` | `fetchMyRoutes` | ✅ |
| `PATCH /users/me/routes/{id}` | `updateMyRouteStatus` | ✅ |
| `DELETE /users/me/routes/{id}` | `deleteMyRoute` | ✅ |
| `POST /users/{id}/follow` | `followUser` | ✅ |
| `DELETE /users/{id}/follow` | `unfollowUser` | ✅ |
| `GET /users/{id}/follow-status` | `fetchFollowStatus` | ✅ |
| `GET /users/me/saves` | `fetchMySaves` | ✅ |
